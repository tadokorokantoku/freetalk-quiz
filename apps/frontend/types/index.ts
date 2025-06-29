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
  penaltyWordsCount?: number; // ペナルティ中の場合の必要単語数（0または未定義なら制限なし）
}

export interface GameState {
  roomId: string;
  players: Player[];
  currentQuestion: FreetalkData | null;
  currentWordIndex: number;
  gamePhase: 'waiting' | 'question' | 'answering' | 'result' | 'countdown' | 'finished';
  answers: { playerId: string; answer: string; timestamp: number }[];
  correctAnswer: string | null;
  countdown?: number;
  hardMode?: boolean;
}

export interface WebSocketMessage {
  type: 'join' | 'start' | 'answer' | 'next-word' | 'game-state' | 'player-joined' | 'player-left' | 'toggle-hard-mode' | 'player-id';
  payload: any;
}

export interface RoomInfo {
  id: string;
  name: string;
  playerCount: number;
  lastActivity: number;
  status: 'waiting' | 'playing' | 'finished';
  createdAt: number;
}