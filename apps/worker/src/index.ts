import { QuizRoom } from './QuizRoom';

export interface Env {
  QUIZ_ROOMS: DurableObjectNamespace;
}

export { QuizRoom };

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    
    if (url.pathname.startsWith('/ws/')) {
      const roomId = url.pathname.split('/')[2];
      
      if (!roomId) {
        return new Response('Room ID required', { status: 400 });
      }

      const id = env.QUIZ_ROOMS.idFromName(roomId);
      const room = env.QUIZ_ROOMS.get(id);
      
      return room.fetch(request);
    }

    return new Response('Not found', { status: 404 });
  },
};