import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useGame } from '@/contexts/GameContext';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { RoomSelector } from '@/components/RoomSelector';
import { HiRefresh } from "react-icons/hi";

const PLAYER_NAME_KEY = 'freetalk-quiz-player-name';

export default function Home() {
  const [playerName, setPlayerName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [showPatchNotes, setShowPatchNotes] = useState(false);
  const [patchNotesContent, setPatchNotesContent] = useState<string>('');
  const [showBlockingModal, setShowBlockingModal] = useState(false);
  const [showRoomSelector, setShowRoomSelector] = useState(false);
  const roomSelectorRef = useRef<{ refreshRooms: () => void }>(null);
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
    
    if (playerName === 'やぐ') {
      setShowBlockingModal(true);
      return;
    }
    
    localStorage.setItem(PLAYER_NAME_KEY, playerName);
    setShowRoomSelector(true);
  };

  const handleRoomCreated = (roomId: string) => {
    joinRoom(roomId, playerName);
    router.push(`/room/${roomId}`);
  };

  const handleRoomJoined = (roomId: string) => {
    joinRoom(roomId, playerName);
    router.push(`/room/${roomId}`);
  };

  const handleJoinRoom = () => {
    if (!playerName.trim() || !roomId.trim()) return;
    
    if (playerName === 'やぐ') {
      setShowBlockingModal(true);
      return;
    }
    
    localStorage.setItem(PLAYER_NAME_KEY, playerName);
    joinRoom(roomId, playerName);
    router.push(`/room/${roomId}`);
  };

  const handleSoloMode = () => {
    if (!playerName.trim()) return;
    
    if (playerName === 'やぐ') {
      setShowBlockingModal(true);
      return;
    }
    
    localStorage.setItem(PLAYER_NAME_KEY, playerName);
    router.push(`/solo?name=${encodeURIComponent(playerName)}`);
  };

  const handleShowPatchNotes = async () => {
    try {
      const response = await fetch('/notes/patch-notes-v2.2.0.md');
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
            マルチプレイヤー
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
              ルームID（直接入力）
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
      
      {/* ルーム選択モーダル */}
      {showRoomSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-gray-800">ルーム選択</h2>
                  <button
                    onClick={() => roomSelectorRef.current?.refreshRooms()}
                    className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                    title="ルーム一覧を更新"
                  >
                    <HiRefresh className="w-6 h-6" />
                  </button>
                </div>
                <button
                  onClick={() => setShowRoomSelector(false)}
                  className="text-gray-500 hover:text-gray-700 text-xl font-bold"
                >
                  ×
                </button>
              </div>
              
              <div className="max-h-[70vh] overflow-y-auto">
                <RoomSelector
                  ref={roomSelectorRef}
                  onJoinRoom={handleRoomJoined}
                  onCreateRoom={handleRoomCreated}
                />
              </div>
            </div>
          </div>
        </div>
      )}
      
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

      {/* ブロッキングモーダル */}
      {showBlockingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-black rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6 text-center">
              <img src="/murder.jpeg" alt="judgement" className="w-72 h-72 mx-auto mb-4" />
              <div className="text-red-600  text-2xl font-bold mb-4">
                立ち去れ、罪人よ
              </div>
              <button
                onClick={() => setShowBlockingModal(false)}
                className="bg-white text-red-600 font-medium py-2 px-4 rounded-md hover:bg-gray-100 transition-colors"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}