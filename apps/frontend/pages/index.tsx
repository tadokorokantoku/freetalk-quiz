import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useGame } from '@/contexts/GameContext';
import MarkdownRenderer from '@/components/MarkdownRenderer';

const PLAYER_NAME_KEY = 'freetalk-quiz-player-name';

export default function Home() {
  const [playerName, setPlayerName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [showPatchNotes, setShowPatchNotes] = useState(false);
  const [patchNotesContent, setPatchNotesContent] = useState<string>('');
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

  const handleShowPatchNotes = async () => {
    try {
      const response = await fetch('/patch-notes-v2.1.0.md');
      const content = await response.text();
      setPatchNotesContent(content);
      setShowPatchNotes(true);
    } catch (error) {
      console.error('パッチノートの読み込みに失敗しました:', error);
      setShowPatchNotes(true); // フォールバック用の空コンテンツで表示
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex flex-col items-center justify-center p-4 relative">
      <button
        onClick={handleShowPatchNotes}
        className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors"
        title="パッチノート"
      >
        📝
      </button>
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
      
      {/* パッチノートモーダル */}
      {showPatchNotes && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-800">パッチノート</h2>
                <button
                  onClick={() => setShowPatchNotes(false)}
                  className="text-gray-500 hover:text-gray-700 text-xl font-bold"
                >
                  ×
                </button>
              </div>
              
              {patchNotesContent ? (
                <MarkdownRenderer content={patchNotesContent} />
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">パッチノートを読み込み中...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}