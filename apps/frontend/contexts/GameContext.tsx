import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { GameState, WebSocketMessage, Player } from '@/types';

interface GameContextType {
  gameState: GameState;
  socket: WebSocket | null;
  sendMessage: (message: WebSocketMessage) => void;
  joinRoom: (roomId: string, playerName: string) => void;
  submitAnswer: (answer: string) => void;
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
    const ws = new WebSocket(`ws://localhost:8787/ws/${roomId}`);
    
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

  return (
    <GameContext.Provider value={{
      gameState,
      socket,
      sendMessage,
      joinRoom,
      submitAnswer
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