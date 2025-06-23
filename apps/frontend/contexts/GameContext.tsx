import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { GameState, WebSocketMessage, Player } from '@/types';

interface GameContextType {
  gameState: GameState;
  socket: WebSocket | null;
  sendMessage: (message: WebSocketMessage) => void;
  joinRoom: (roomId: string, playerName: string) => void;
  submitAnswer: (answer: string) => void;
  startGame: () => void;
  toggleHardMode: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

type GameAction = 
  | { type: 'SET_GAME_STATE'; payload: GameState }
  | { type: 'SET_SOCKET'; payload: WebSocket | null }
  | { type: 'ADD_PLAYER'; payload: Player }
  | { type: 'UPDATE_SCORE'; payload: { playerId: string; score: number } };

const initialState: GameState = {
  roomId: '',
  players: [],
  currentQuestion: null,
  currentWordIndex: 0,
  gamePhase: 'waiting',
  answers: [],
  correctAnswer: null,
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_GAME_STATE':
      return action.payload;
    case 'ADD_PLAYER':
      return {
        ...state,
        players: [...state.players, action.payload],
      };
    case 'UPDATE_SCORE':
      return {
        ...state,
        players: state.players.map(player =>
          player.id === action.payload.playerId
            ? { ...player, score: action.payload.score }
            : player
        ),
      };
    default:
      return state;
  }
}

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [gameState, dispatch] = useReducer(gameReducer, initialState);
  const [socket, setSocket] = React.useState<WebSocket | null>(null);

  const sendMessage = (message: WebSocketMessage) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    }
  };

  const joinRoom = (roomId: string, playerName: string) => {
    // 本番環境では現在のホストからWebSocket URLを動的に生成
    const getWebSocketUrl = () => {
      if (typeof window !== 'undefined') {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        
        // 本番環境（CloudflarePages）の場合
        if (host.includes('.pages.dev') || process.env.NODE_ENV === 'production') {
          return `wss://freetalk-quiz.katsuki104.workers.dev`;
        }
        
        // 開発環境の場合
        console.log('NEXT_PUBLIC_WS_URL', process.env.NEXT_PUBLIC_WS_URL);
        return process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8787';
      }
      return 'ws://localhost:8787';
    };
    
    const wsUrl = getWebSocketUrl();
    const ws = new WebSocket(`${wsUrl}/ws/${roomId}`);
    
    ws.onopen = () => {
      setSocket(ws);
      ws.send(JSON.stringify({
        type: 'join',
        payload: { playerName, roomId }
      }));
    };

    ws.onmessage = (event) => {
      const message: WebSocketMessage = JSON.parse(event.data);
      
      switch (message.type) {
        case 'game-state':
          console.log('ゲーム状態更新:', message.payload);
          dispatch({ type: 'SET_GAME_STATE', payload: message.payload });
          break;
        case 'player-joined':
          dispatch({ type: 'ADD_PLAYER', payload: message.payload });
          break;
      }
    };

    ws.onclose = () => {
      setSocket(null);
    };
    
    setSocket(ws);
  };

  const submitAnswer = (answer: string) => {
    sendMessage({
      type: 'answer',
      payload: { answer, timestamp: Date.now() }
    });
  };

  const startGame = () => {
    sendMessage({
      type: 'start',
      payload: {}
    });
  };

  const toggleHardMode = () => {
    sendMessage({
      type: 'toggle-hard-mode',
      payload: {}
    });
  };

  return (
    <GameContext.Provider value={{
      gameState,
      socket,
      sendMessage,
      joinRoom,
      submitAnswer,
      startGame,
      toggleHardMode
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}