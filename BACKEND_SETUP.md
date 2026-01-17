# Backend Implementation Summary

## ✅ What Was Built

A complete backend server that extends the existing React frontend with:

### 1. **Persistent Storage (SQLite)**
- `events` table - All behavioral events from frontend
- `sessions` table - User session tracking
- `insights` table - Gemini AI insights per session
- Automatic database initialization and schema creation

### 2. **REST API Endpoints**
- `POST /api/events` - Log behavioral events
- `POST /api/gemini` - Get AI insights and prompts (secure API key handling)
- `GET /api/summaries/:sessionId` - Retrieve insights for a session
- `GET /api/events/:sessionId` - Retrieve events for a session

### 3. **WebSocket Server**
- Real-time AI reasoning trace logs
- Broadcasts to all connected frontend clients
- Automatic reconnection handling

### 4. **Behavioral Analytics**
- Aggregates events into behavior summaries
- Calculates: session lengths, write times, prompt skip rates, backspaces, abrupt endings, recurring topics, emotional volatility, avoidance signals

### 5. **Secure Gemini Integration**
- API key stored server-side only (never exposed to frontend)
- Terminal logging for hackathon judges
- Non-clinical language validation
- Trace logs for AI reasoning

### 6. **Frontend Integration**
- Updated `eventTracking.ts` to POST events to backend
- Updated `gemini.ts` to use backend API instead of direct calls
- Created `apiClient.ts` for backend communication
- WebSocket client for real-time logs

## 🚀 Quick Start

### Backend Setup

```bash
cd backend
npm install

# Create .env file
echo "GEMINI_API_KEY=your_key_here" > .env
echo "PORT=4000" >> .env
echo "DB_PATH=./data/journal.db" >> .env

# Start server
npm run dev
```

### Frontend Setup

```bash
# In project root, create .env.local
echo "VITE_API_URL=http://localhost:4000" > .env.local

# Start frontend (in separate terminal)
npm run dev
```

## 📊 Data Flow

1. **User Action** → Frontend tracks event
2. **Frontend** → POSTs event to `/api/events`
3. **Backend** → Stores in SQLite database
4. **Frontend** → Requests AI insights from `/api/gemini`
5. **Backend** → Aggregates behavior, calls Gemini API
6. **Backend** → Logs AI reasoning to terminal + WebSocket
7. **Backend** → Returns insights to frontend
8. **Frontend** → Updates UI (prompts, follow-up buttons, etc.)

## 🔒 Security Features

- Gemini API key never exposed to frontend
- All API calls go through backend
- CORS enabled for local development
- SQLite database file-based (easy to backup)

## 🎯 Hackathon Demo Features

- **Real-time AI reasoning traces** - Judges can see AI decision-making in terminal
- **Persistent behavioral analytics** - Events stored across sessions
- **Amplitude-style feedback loop** - Events → Aggregation → AI → UX changes
- **WebSocket streaming** - Real-time logs to frontend console

## 📁 File Structure

```
backend/
├── server.js              # Express server + WebSocket
├── database.js            # SQLite setup and schema
├── services/
│   ├── gemini.js         # Secure Gemini API integration
│   └── analytics.js      # Behavioral aggregation
├── package.json
├── .env.example
└── README.md

src/lib/
├── apiClient.ts          # Backend API client
├── eventTracking.ts      # Updated to use backend
└── gemini.ts             # Updated to use backend
```

## 🐛 Troubleshooting

**Backend won't start:**
- Check that `.env` file exists with `GEMINI_API_KEY`
- Ensure port 4000 is not in use
- Check `npm install` completed successfully

**Frontend can't connect:**
- Verify backend is running on port 4000
- Check `VITE_API_URL` in `.env.local`
- Check browser console for CORS errors

**WebSocket not connecting:**
- Backend WebSocket runs on same port as HTTP server
- Check browser console for connection errors
- Verify WebSocket URL format (ws://localhost:4000)

## 📝 Notes

- Database is created automatically on first run
- All events are persisted to SQLite
- Backend logs all AI reasoning to terminal (for judges)
- Frontend falls back to localStorage if backend unavailable

