# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

FreeTalk Quiz is a Japanese quiz application where players guess speakers based on hint words from conversation data. Built with Next.js frontend and Cloudflare Workers backend, supporting both solo and multiplayer modes.

## Development Commands

### Root Level Commands
- `npm run dev` - Start Cloudflare Workers development server
- `npm run build:all` - Build both frontend and worker
- `npm run deploy` - Deploy to Cloudflare (builds first)
- `npm run install:all` - Install dependencies for all packages

### Frontend Development (apps/frontend/)
- `npm run dev` - Start Next.js development server
- `npm run build` - Build Next.js application (static export)
- `npm run lint` - Run ESLint
- `npm run deploy` - Deploy to Cloudflare Pages

### Worker Development (apps/worker/)
- `wrangler dev` - Start local Cloudflare Workers development
- `wrangler deploy` - Deploy worker to Cloudflare

## Architecture

### Monorepo Structure
- `apps/frontend/` - Next.js TypeScript application with static export
- `apps/worker/` - Cloudflare Workers with Durable Objects
- `data/` - Quiz data and Python processing scripts

### Key Technologies
- **Frontend**: Next.js 14.2.5, TypeScript, Tailwind CSS, React Context API
- **Backend**: Cloudflare Workers, Durable Objects, WebSocket
- **State Management**: React Context for frontend, Durable Objects for multiplayer persistence

### Game Architecture
- **Solo Mode**: Local state management, auto-progression through hints
- **Multiplayer Mode**: Real-time WebSocket communication via Durable Objects
- **Data Layer**: Static JSON file (`data/freetalk.json`) with speaker/text/hints

### Important Files
- `apps/frontend/contexts/GameContext.tsx` - Global game state management
- `apps/worker/src/QuizRoom.ts` - Multiplayer game logic and WebSocket handling
- `apps/frontend/types/index.ts` - TypeScript type definitions
- `apps/frontend/utils/data.ts` - Data access utilities
- `data/freetalk.json` - Quiz data source

### WebSocket Communication
The frontend connects to the worker's WebSocket endpoint for real-time multiplayer functionality. Room-based games use Durable Objects for persistence.

### Development Notes
- Next.js is configured for static export (`output: 'export'`)
- No testing framework currently configured
- ESLint configured for code quality
- Uses npm for package management (though pnpm-lock.yaml exists)