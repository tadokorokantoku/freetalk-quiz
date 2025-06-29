export interface Env {
  ASSETS: Fetcher;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
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