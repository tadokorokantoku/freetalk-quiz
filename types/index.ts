export interface FreetalkData {
  id: string;
  date: string;
  speaker: string;
  text: string;
  words: string[];
}

export interface Player {
  id: string;
  name: string;
  score: number;
}

export interface GameState {
  roomId: string;
  players: Player[];
  currentQuestion: FreetalkData | null;
  currentWordIndex: number;
  gamePhase: 'waiting' | 'question' | 'answering' | 'result';
  answers: { playerId: string; answer: string; timestamp: number }[];
  correctAnswer: string | null;
}

export interface WebSocketMessage {
  type: 'join' | 'start' | 'answer' | 'next-word' | 'game-state' | 'player-joined' | 'player-left';
  payload: any;
}