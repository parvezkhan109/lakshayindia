# Luck India

Manual-result quiz gaming platform.

## Structure
- `backend/` Node.js + Express + SQLite (better-sqlite3)
- `frontend/` React (Vite) + Tailwind + shadcn/ui

## Backend (dev)
1. Copy env:
   - `cp backend/.env.example backend/.env`
2. Install deps:
   - `cd backend && npm install`
3. Run:
   - `npm run dev`
4. Test:
   - `curl http://localhost:4000/health`

Seeded admin user:
- role: `ADMIN`
- username: `admin`
- password: `admin123`

## Frontend (dev)
1. Install deps:
   - `cd frontend && npm install`
2. Run:
   - `npm run dev`

Frontend calls the backend via a Vite dev proxy on `/api` (to `http://localhost:4000`).
