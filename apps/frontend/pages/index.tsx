import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useGame } from '@/contexts/GameContext';

const PLAYER_NAME_KEY = 'freetalk-quiz-player-name';

export default function Home() {
  const [playerName, setPlayerName] = useState('');
  const [roomId, setRoomId] = useState('');
  const router = useRouter();
  const { joinRoom } = useGame();

  useEffect(() => {
    const savedPlayerName = localStorage.getItem(PLAYER_NAME_KEY);
    if (savedPlayerName) {
      setPlayerName(savedPlayerName);
    }
  }, []);

  const handleCreateRoom = async () => {
    if (!playerName.trim()) return;
    
    localStorage.setItem(PLAYER_NAME_KEY, playerName);
    const newRoomId = Math.random().toString(36).substring(2, 8);
    joinRoom(newRoomId, playerName);
    router.push(`/room/${newRoomId}`);
  };

  const handleJoinRoom = () => {
    if (!playerName.trim() || !roomId.trim()) return;
    
    localStorage.setItem(PLAYER_NAME_KEY, playerName);
    joinRoom(roomId, playerName);
    router.push(`/room/${roomId}`);
  };

  const handleSoloMode = () => {
    if (!playerName.trim()) return;
    
    localStorage.setItem(PLAYER_NAME_KEY, playerName);
    router.push(`/solo?name=${encodeURIComponent(playerName)}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex flex-col items-center justify-center p-4">
      <div className="text-center mb-4">
        <img src="/logo.png" alt="FreeTalk Quiz" className="mx-auto h-32 w-auto" />
      </div>
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        
        
        <div className="space-y-6">
          <div>
            <label htmlFor="playerName" className="block text-sm font-medium text-gray-700 mb-2">
              プレイヤー名
            </label>
            <input
              id="playerName"
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="名前を入力してください"
            />
          </div>

          <button
            onClick={handleSoloMode}
            disabled={!playerName.trim()}
            className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 text-white font-medium py-3 px-4 rounded-md transition-colors"
          >
            ソロモード
          </button>

          <button
            onClick={handleCreateRoom}
            disabled={!playerName.trim()}
            className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-medium py-3 px-4 rounded-md transition-colors"
          >
            ルーム作成
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">または</span>
            </div>
          </div>

          <div>
            <label htmlFor="roomId" className="block text-sm font-medium text-gray-700 mb-2">
              ルームID
            </label>
            <input
              id="roomId"
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ルームIDを入力してください"
            />
          </div>

          <button
            onClick={handleJoinRoom}
            disabled={!playerName.trim() || !roomId.trim()}
            className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-medium py-3 px-4 rounded-md transition-colors"
          >
            ルームに参加
          </button>
        </div>
      </div>
    </div>
  );
}