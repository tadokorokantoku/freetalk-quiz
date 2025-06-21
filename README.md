# FreeTalk Quiz

A quiz application built with Next.js frontend and Cloudflare Workers backend.

## Project Structure

```
my-app/
├─ apps/
│  ├─ frontend/     # Next.js application
│  └─ worker/       # Cloudflare Durable Object Worker
├─ data/            # JSON sample data
└─ wrangler.toml    # Worker configuration file
```

## Features

- **Solo Mode**: Single-player quiz mode
- **Multiplayer Mode**: Real-time multiplayer quiz with WebSocket
- **Dynamic Speaker Detection**: Automatically detects all speakers from data
- **Responsive Design**: Works on desktop and mobile devices

## Development

### Frontend (Next.js)

```bash
cd apps/frontend
npm install
npm run dev
```

### Worker (Cloudflare Workers)

```bash
# From root directory
npx wrangler dev
```

## Usage

### Solo Mode
1. Enter your player name on the home page
2. Click "ソロモード" to start single-player quiz
3. Answer questions based on hint words
4. Track your score and accuracy

### Multiplayer Mode
1. Enter your player name on the home page
2. Create a new room or join an existing room with room ID
3. Wait for other players to join
4. Game starts automatically when ready
5. First correct answer gets points!

## Deployment

### Frontend
Deploy the `apps/frontend` directory to your preferred hosting platform (Vercel, Netlify, etc.)

### Worker
Deploy using Wrangler:
```bash
npx wrangler deploy
```

## Technologies Used

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Cloudflare Workers, Durable Objects
- **Real-time**: WebSocket
- **Data**: Static JSON file (freetalk.json)