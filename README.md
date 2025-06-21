# FreeTalk Quiz Game

A real-time multiplayer quiz game built with Next.js and Cloudflare Durable Objects.

## Features

- Up to 4 players per room
- Real-time multiplayer with WebSocket
- Word hints revealed progressively (every 2 seconds)
- Early buzzer system with scoring
- Speaker identification based on talk data

## Setup

### Frontend (Next.js)

1. Install dependencies:
```bash
npm install
```

2. Run development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Backend (Cloudflare Worker)

1. Navigate to worker directory:
```bash
cd worker
npm install
```

2. Run development server:
```bash
npm run dev
```

The worker will be available at `http://localhost:8787`

## Usage

1. Enter your player name on the home page
2. Create a new room or join an existing room with room ID
3. Wait for other players to join (minimum 2 players)
4. Game will start automatically when ready
5. Watch word hints appear progressively
6. Click on the speaker you think matches the hints
7. First correct answer gets points!

## Project Structure

```
├── pages/           # Next.js pages
├── components/      # React components
├── contexts/        # React context providers
├── utils/           # Utility functions
├── types/           # TypeScript type definitions
├── styles/          # CSS styles
├── talksData/       # Quiz data (freetalk.json)
└── worker/          # Cloudflare Worker + Durable Objects
    ├── src/
    │   ├── index.ts      # Worker entry point
    │   ├── QuizRoom.ts   # Durable Object class
    │   ├── types.ts      # Type definitions
    │   └── utils.ts      # Data utilities
    └── wrangler.toml     # Cloudflare configuration
```

## Technologies Used

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Cloudflare Workers, Durable Objects
- **Real-time**: WebSocket
- **Data**: Static JSON file (freetalk.json)