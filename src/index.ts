import { QuizRoom } from './QuizRoom';

export interface Env {
  QUIZ_ROOMS: DurableObjectNamespace;
  ASSETS: Fetcher;
}

export { QuizRoom };

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    
    // WebSocket API routes
    if (url.pathname.startsWith('/ws/')) {
      const roomId = url.pathname.split('/')[2];
      
      if (!roomId) {
        return new Response('Room ID required', { status: 400 });
      }

      const id = env.QUIZ_ROOMS.idFromName(roomId);
      const room = env.QUIZ_ROOMS.get(id);
      
      return room.fetch(request);
    }

    // API routes
    if (url.pathname.startsWith('/api/')) {
      // Handle API requests here if needed
      return new Response('API endpoint', { status: 200 });
    }

    // Serve static files from Next.js build
    try {
      const response = await env.ASSETS.fetch(request);
      if (response.status === 404) {
        // For SPA routing, return index.html for non-API routes
        const indexRequest = new Request(new URL('/', request.url), request);
        return env.ASSETS.fetch(indexRequest);
      }
      return response;
    } catch (error) {
      return new Response('Error serving static files', { status: 500 });
    }
  },
};