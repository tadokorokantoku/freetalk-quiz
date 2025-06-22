import { FreetalkData, GameState, Player, WebSocketMessage } from './types';
import { getRandomQuestion } from './utils';

export class QuizRoom {
  private state: DurableObjectState;
  private gameState: GameState;
  private sessions: Map<WebSocket, { playerId: string; playerName: string }>;
  private wordTimer: number | null;
  private usedQuestionIds: Set<string>;

  constructor(state: DurableObjectState) {
    this.state = state;
    this.sessions = new Map();
    this.wordTimer = null;
    this.usedQuestionIds = new Set();
    this.gameState = {
      roomId: '',
      players: [],
      currentQuestion: null,
      currentWordIndex: 0,
      gamePhase: 'waiting',
      answers: [],
      correctAnswer: null,
      countdown: undefined,
    };
  }

  async fetch(request: Request): Promise<Response> {
    const webSocketPair = new WebSocketPair();
    const [client, server] = Object.values(webSocketPair);

    server.accept();
    
    server.addEventListener('message', async (event) => {
      try {
        const message: WebSocketMessage = JSON.parse(event.data as string);
        await this.handleMessage(server, message);
      } catch (error) {
        console.error('Error handling message:', error);
      }
    });

    server.addEventListener('close', () => {
      this.handleDisconnect(server);
    });

    return new Response(null, {
      status: 101,
      webSocket: client,
    });
  }

  private async handleMessage(websocket: WebSocket, message: WebSocketMessage) {
    switch (message.type) {
      case 'join':
        await this.handleJoin(websocket, message.payload);
        break;
      case 'answer':
        await this.handleAnswer(websocket, message.payload);
        break;
      case 'start':
        await this.startGame();
        break;
    }
  }

  private async handleJoin(websocket: WebSocket, payload: { playerName: string; roomId: string }) {
    const playerId = crypto.randomUUID();
    const player: Player = {
      id: playerId,
      name: payload.playerName,
      score: 0,
    };

    this.gameState.roomId = payload.roomId;
    this.gameState.players.push(player);
    this.sessions.set(websocket, { playerId, playerName: payload.playerName });

    this.broadcast({
      type: 'player-joined',
      payload: player,
    });

    this.sendToClient(websocket, {
      type: 'game-state',
      payload: this.gameState,
    });

  }

  private async handleAnswer(websocket: WebSocket, payload: { answer: string; timestamp: number }) {
    const session = this.sessions.get(websocket);
    if (!session || this.gameState.gamePhase !== 'answering') return;

    const existingAnswer = this.gameState.answers.find(a => a.playerId === session.playerId);
    if (existingAnswer) return;

    this.gameState.answers.push({
      playerId: session.playerId,
      answer: payload.answer,
      timestamp: payload.timestamp,
    });

    if (this.gameState.answers.length === this.gameState.players.length) {
      await this.endQuestion();
    }
  }

  private async startGame() {
    if (this.gameState.gamePhase !== 'waiting' && this.gameState.gamePhase !== 'countdown') return;

    console.log('ゲーム開始時のプレイヤースコア:', this.gameState.players.map(p => `${p.name}: ${p.score}点`));
    
    this.gameState.gamePhase = 'answering';
    this.gameState.currentQuestion = getRandomQuestion(this.usedQuestionIds);
    this.usedQuestionIds.add(this.gameState.currentQuestion.id);
    this.gameState.currentWordIndex = 0;
    this.gameState.answers = [];
    this.gameState.correctAnswer = null;
    this.gameState.countdown = undefined;

    this.broadcast({
      type: 'game-state',
      payload: this.gameState,
    });

    this.startWordReveal();
  }

  private startWordReveal() {
    if (!this.gameState.currentQuestion) return;

    const revealNextWord = () => {
      if (this.gameState.currentWordIndex < this.gameState.currentQuestion!.words.length - 1) {
        this.gameState.currentWordIndex++;
        this.broadcast({
          type: 'game-state',
          payload: this.gameState,
        });
        
        this.wordTimer = setTimeout(revealNextWord, 4000) as any;
      } else {
        setTimeout(() => {
          if (this.gameState.gamePhase === 'answering') {
            this.endQuestion();
          }
        }, 10000);
      }
    };

    this.wordTimer = setTimeout(revealNextWord, 4000) as any;
  }

  private async endQuestion() {
    if (this.wordTimer) {
      clearTimeout(this.wordTimer);
      this.wordTimer = null;
    }

    this.gameState.gamePhase = 'result';
    this.gameState.correctAnswer = this.gameState.currentQuestion!.speaker;

    const correctAnswers = this.gameState.answers.filter(
      answer => answer.answer === this.gameState.correctAnswer
    );
    
    if (correctAnswers.length > 0) {
      // 正解者を回答時間順にソート（早い順）
      const sortedCorrectAnswers = correctAnswers.sort((a, b) => a.timestamp - b.timestamp);
      
      // 順位に応じたポイントを計算・付与
      sortedCorrectAnswers.forEach((answer, index) => {
        const playerIndex = this.gameState.players.findIndex(p => p.id === answer.playerId);
        if (playerIndex !== -1) {
          // 順位別ポイント: 1位=40点, 2位=30点, 3位=20点, 4位=10点
          const points = Math.max(50 - (index + 1) * 10, 10);
          console.log(`プレイヤー ${this.gameState.players[playerIndex].name}: ${index + 1}位 -> +${points}点`);
          this.gameState.players[playerIndex].score += points;
          console.log(`プレイヤー ${this.gameState.players[playerIndex].name}: 合計スコア ${this.gameState.players[playerIndex].score}点`);
        }
      });
    }

    this.broadcast({
      type: 'game-state',
      payload: this.gameState,
    });

    // 100点到達者がいるかチェック
    const winner = this.gameState.players.find(p => p.score >= 100);
    if (winner) {
      this.endGame();
      return;
    }

    // 3秒後にカウントダウン開始
    setTimeout(() => {
      this.startCountdown();
    }, 3000);
  }

  private endGame() {
    this.gameState.gamePhase = 'finished';
    
    // プレイヤーを得点順にソート
    this.gameState.players.sort((a, b) => b.score - a.score);
    
    // 使用済み問題IDをリセット
    this.usedQuestionIds.clear();
    
    this.broadcast({
      type: 'game-state',
      payload: this.gameState,
    });
  }

  private startCountdown() {
    this.gameState.gamePhase = 'countdown';
    this.gameState.countdown = 5;
    
    this.broadcast({
      type: 'game-state',
      payload: this.gameState,
    });

    const countdownInterval = setInterval(() => {
      this.gameState.countdown! -= 1;
      
      if (this.gameState.countdown! <= 0) {
        clearInterval(countdownInterval);
        this.startGame();
      } else {
        this.broadcast({
          type: 'game-state',
          payload: this.gameState,
        });
      }
    }, 1000);
  }

  private handleDisconnect(websocket: WebSocket) {
    const session = this.sessions.get(websocket);
    if (session) {
      this.gameState.players = this.gameState.players.filter(p => p.id !== session.playerId);
      this.sessions.delete(websocket);
      
      this.broadcast({
        type: 'player-left',
        payload: { playerId: session.playerId },
      });
    }
  }

  private broadcast(message: WebSocketMessage) {
    for (const [websocket] of this.sessions) {
      this.sendToClient(websocket, message);
    }
  }

  private sendToClient(websocket: WebSocket, message: WebSocketMessage) {
    try {
      websocket.send(JSON.stringify(message));
    } catch (error) {
      console.error('Error sending message to client:', error);
    }
  }
}