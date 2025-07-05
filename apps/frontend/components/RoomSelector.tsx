import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { RoomInfo } from '../types';

interface RoomSelectorProps {
  onJoinRoom: (roomId: string) => void;
  onCreateRoom: (roomName: string) => void;
}

interface RoomSelectorRef {
  refreshRooms: () => void;
}

export const RoomSelector = forwardRef<RoomSelectorRef, RoomSelectorProps>(({ onJoinRoom, onCreateRoom }, ref) => {
  const [rooms, setRooms] = useState<RoomInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newRoomName, setNewRoomName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  const getBackendUrl = () => {
    if (typeof window !== 'undefined') {
      const host = window.location.host;
      if (host.includes('.pages.dev') || process.env.NODE_ENV === 'production') {
        return 'https://freetalk-quiz-backend.katsuki104.workers.dev';
      }
    }
    return process.env.NEXT_PUBLIC_WS_URL?.replace('ws://', 'http://').replace('wss://', 'https://') || 'http://localhost:8787';
  };

  const fetchRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/rooms`);
      
      if (!response.ok) {
        throw new Error('ルーム一覧の取得に失敗しました');
      }
      
      const roomsData: RoomInfo[] = await response.json();
      setRooms(roomsData);
    } catch (err) {
      console.error('Failed to fetch rooms:', err);
      setError('ルーム一覧の取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) {
      alert('ルーム名を入力してください');
      return;
    }

    try {
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          roomName: newRoomName.trim()
        })
      });

      if (!response.ok) {
        throw new Error('ルーム作成に失敗しました');
      }

      const newRoom: RoomInfo = await response.json();
      onCreateRoom(newRoom.id);
    } catch (err) {
      console.error('Failed to create room:', err);
      alert('ルーム作成に失敗しました');
    }
  };

  const formatTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (minutes < 1) return '1分未満前';
    if (minutes < 60) return `${minutes}分前`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}時間前`;
    
    const days = Math.floor(hours / 24);
    return `${days}日前`;
  };

  const getStatusText = (status: RoomInfo['status']) => {
    switch (status) {
      case 'waiting': return '待機中';
      case 'playing': return 'プレイ中';
      case 'finished': return '終了';
      default: return status;
    }
  };

  const getStatusColor = (status: RoomInfo['status']) => {
    switch (status) {
      case 'waiting': return 'text-green-600';
      case 'playing': return 'text-yellow-600';
      case 'finished': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  useImperativeHandle(ref, () => ({
    refreshRooms: fetchRooms
  }));

  useEffect(() => {
    fetchRooms();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 min-h-[400px]">
      <div className="mb-6 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-700">ルーム一覧</h3>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          新しいルームを作成
        </button>
      </div>

      {showCreateForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex gap-2">
            <input
              type="text"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              placeholder="ルーム名を入力"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onKeyPress={(e) => e.key === 'Enter' && handleCreateRoom()}
            />
            <button
              onClick={handleCreateRoom}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              作成
            </button>
            <button
              onClick={() => setShowCreateForm(false)}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              キャンセル
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="text-lg">ルーム一覧を読み込み中...</div>
        </div>
      ) : (
        <>
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
              <button
                onClick={fetchRooms}
                className="ml-2 text-red-800 underline hover:no-underline"
              >
                再試行
              </button>
            </div>
          )}

          {rooms.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-lg text-gray-600 mb-4">現在アクティブなルームはありません</div>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
              >
                最初のルームを作成する
              </button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {rooms.map((room) => (
                <div
                  key={room.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow"
                >
                  <div className="mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {room.name}
                    </h3>
                    <p className="text-sm text-gray-600">ID: {room.id}</p>
                  </div>
                  
                  <div className="mb-3 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>プレイヤー数:</span>
                      <span className="font-medium">{room.playerCount}人</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>状態:</span>
                      <span className={`font-medium ${getStatusColor(room.status)}`}>
                        {getStatusText(room.status)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>最終アクティビティ:</span>
                      <span className="text-gray-600">{formatTime(room.lastActivity)}</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => onJoinRoom(room.id)}
                    disabled={room.status === 'finished'}
                    className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                      room.status === 'finished'
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                  >
                    {room.status === 'finished' ? '終了済み' : 'ルームに参加'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
});

RoomSelector.displayName = 'RoomSelector';