export interface RoomInfo {
  id: string;
  name: string;
  playerCount: number;
  lastActivity: number;
  status: 'waiting' | 'playing' | 'finished';
  createdAt: number;
}

export class RoomManager implements DurableObject {
  private storage: DurableObjectStorage;
  private rooms: Map<string, RoomInfo> = new Map();

  constructor(state: DurableObjectState, env: Env) {
    this.storage = state.storage;
    
    // 初期化時にストレージからルーム情報を読み込み
    this.initializeRooms();
  }

  private async initializeRooms(): Promise<void> {
    const roomsData = await this.storage.get<Record<string, RoomInfo>>('rooms') || {};
    this.rooms = new Map(Object.entries(roomsData));
  }

  private async persistRooms(): Promise<void> {
    const roomsObject = Object.fromEntries(this.rooms);
    await this.storage.put('rooms', roomsObject);
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
      if (request.method === 'GET') {
        // アクティブなルーム一覧を取得
        const activeRooms = this.getActiveRooms();
        return new Response(JSON.stringify(activeRooms), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (request.method === 'POST') {
        const { action, roomId, roomName, playerCount, status } = await request.json();

        switch (action) {
          case 'create':
            return await this.createRoom(roomName || 'New Room', corsHeaders);
          
          case 'update':
            return await this.updateRoom(roomId, { playerCount, status, lastActivity: Date.now() }, corsHeaders);
          
          case 'delete':
            return await this.deleteRoom(roomId, corsHeaders);
          
          default:
            return new Response('Invalid action', { status: 400, headers: corsHeaders });
        }
      }

      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    } catch (error) {
      console.error('RoomManager error:', error);
      return new Response('Internal server error', { status: 500, headers: corsHeaders });
    }
  }

  private getActiveRooms(): RoomInfo[] {
    const now = Date.now();
    const INACTIVE_THRESHOLD = 5 * 60 * 1000; // 5分

    const activeRooms = Array.from(this.rooms.values())
      .filter(room => {
        // 非アクティブ時間でフィルタリング
        const isActive = now - room.lastActivity < INACTIVE_THRESHOLD;
        // 終了済みのルームは除外
        const isNotFinished = room.status !== 'finished';
        return isActive && isNotFinished;
      })
      .sort((a, b) => b.lastActivity - a.lastActivity); // 最新のアクティビティ順

    return activeRooms;
  }

  private async createRoom(roomName: string, corsHeaders: Record<string, string>): Promise<Response> {
    const roomId = this.generateRoomId();
    const now = Date.now();
    
    const newRoom: RoomInfo = {
      id: roomId,
      name: roomName,
      playerCount: 0,
      lastActivity: now,
      status: 'waiting',
      createdAt: now
    };

    this.rooms.set(roomId, newRoom);
    await this.persistRooms();

    return new Response(JSON.stringify(newRoom), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  private async updateRoom(roomId: string, updates: Partial<RoomInfo>, corsHeaders: Record<string, string>): Promise<Response> {
    const room = this.rooms.get(roomId);
    if (!room) {
      return new Response('Room not found', { status: 404, headers: corsHeaders });
    }

    // ルーム情報を更新
    const updatedRoom = { ...room, ...updates };
    this.rooms.set(roomId, updatedRoom);
    await this.persistRooms();

    return new Response(JSON.stringify(updatedRoom), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  private async deleteRoom(roomId: string, corsHeaders: Record<string, string>): Promise<Response> {
    const deleted = this.rooms.delete(roomId);
    if (deleted) {
      await this.persistRooms();
    }

    return new Response(JSON.stringify({ success: deleted }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  private generateRoomId(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  // 定期的なクリーンアップ（必要に応じて呼び出し）
  async cleanupInactiveRooms(): Promise<void> {
    const now = Date.now();
    const CLEANUP_THRESHOLD = 24 * 60 * 60 * 1000; // 24時間

    let hasChanges = false;
    for (const [roomId, room] of this.rooms) {
      if (now - room.lastActivity > CLEANUP_THRESHOLD) {
        this.rooms.delete(roomId);
        hasChanges = true;
      }
    }

    if (hasChanges) {
      await this.persistRooms();
    }
  }
}

interface Env {
  QUIZ_ROOMS: DurableObjectNamespace;
  ROOM_MANAGER: DurableObjectNamespace;
}