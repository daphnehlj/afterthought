# Afterthought Backend

Backend server for the Afterthought journaling app with persistent storage, behavioral analytics, and secure Gemini API integration.

## Setup

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment:**
   Create a `.env` file in the `backend` directory:
   ```env
   GEMINI_API_KEY=your_api_key_here
   PORT=4000
   DB_PATH=./data/journal.db
   ```
   
   Get your Gemini API key from: https://makersuite.google.com/app/apikey

3. **Run the server:**
   ```bash
   npm run dev
   ```
   
   Or for production:
   ```bash
   npm start
   ```

The server will start on `http://localhost:4000` (or the port specified in `.env`).

## API Endpoints

### POST /api/events
Log behavioral events from the frontend.

**Request body:**
```json
{
  "session_id": "session_123",
  "event_name": "mood_selected",
  "page": "home",
  "timestamp": 1234567890,
  "mood_icon": "😊",
  ...
}
```

### POST /api/gemini
Get AI insights and prompts based on behavioral data.

**Request body:**
```json
{
  "behavior_summary": { ... },
  "recent_entry_excerpt": "...",
  "session_id": "session_123",
  "type": "prompt" | "analysis"
}
```

**Response:**
```json
{
  "insights": [...],
  "suggested_prompt": "...",
  "follow_up_recommended": true,
  "confidence": "medium",
  "trace_logs": [...]
}
```

### GET /api/summaries/:sessionId
Get all insights for a session.

### GET /api/events/:sessionId
Get all events for a session.

## WebSocket

The server also runs a WebSocket server on the same port for real-time AI reasoning logs. Connect to `ws://localhost:4000` to receive trace logs.

## Database

SQLite database is automatically created at `./data/journal.db` (or path specified in `.env`).

**Tables:**
- `events` - All behavioral events
- `sessions` - User session tracking
- `insights` - Gemini AI insights per session

## Frontend Integration

The frontend should set `VITE_API_URL=http://localhost:4000` in its `.env.local` file to connect to this backend.

