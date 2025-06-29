import { QuizRoom } from './QuizRoom';

export interface Env {
  QUIZ_ROOMS: DurableObjectNamespace;
}

export { QuizRoom };

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    
    // CORS headers for cross-origin requests
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers: corsHeaders });
    }
    
    // WebSocket routes
    if (url.pathname.startsWith('/ws/')) {
      const roomId = url.pathname.split('/')[2];
      
      if (!roomId) {
        return new Response('Room ID required', { status: 400, headers: corsHeaders });
      }

      const id = env.QUIZ_ROOMS.idFromName(roomId);
      const room = env.QUIZ_ROOMS.get(id);
      
      return room.fetch(request);
    }

    // API routes (for future expansion)
    if (url.pathname.startsWith('/api/')) {
      return new Response('API endpoint', { status: 200, headers: corsHeaders });
    }

    return new Response('Not found', { status: 404, headers: corsHeaders });
  },
};