/**
 * Express server with REST API and WebSocket support
 */

import express from 'express';
import cors from 'cors';
import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import dotenv from 'dotenv';
import Database from './database.js';
import { GeminiService } from './services/gemini.js';
import { BehavioralAnalytics } from './services/analytics.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database
const db = new Database(process.env.DB_PATH || './data/journal.db');

// Initialize services
const geminiService = new GeminiService(process.env.GEMINI_API_KEY);
const analytics = new BehavioralAnalytics(db);

// Create HTTP server for WebSocket
const server = createServer(app);

// WebSocket server for real-time AI reasoning logs
const wss = new WebSocketServer({ server });

// Broadcast function to send logs to all connected clients
function broadcastLog(message) {
    const logMessage = JSON.stringify({
        type: 'ai_trace',
        timestamp: Date.now(),
        message: message,
    });

    wss.clients.forEach((client) => {
        if (client.readyState === 1) { // WebSocket.OPEN
            client.send(logMessage);
        }
    });
}

// Helper to log and broadcast
function logAndBroadcast(message) {
    console.log(message);
    broadcastLog(message);
}

// WebSocket connection handler
wss.on('connection', (ws) => {
    console.log('[WS] Client connected');

    ws.on('close', () => {
        console.log('[WS] Client disconnected');
    });

    ws.on('error', (error) => {
        console.error('[WS] Error:', error);
    });
});

// ==================== ROUTES ====================

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
});

// POST /api/events - Log behavioral events
app.post('/api/events', async (req, res) => {
    try {
        const {
            session_id,
            event_name,
            page,
            timestamp,
            time_of_day,
            day_of_week,
            duration_ms,
            keystrokes,
            backspaces,
            pauses,
            mood_icon,
            prompt_id,
            entry_length,
            entry_abrupt_end,
            properties,
        } = req.body;

        // Validate required fields
        if (!session_id || !event_name || !timestamp) {
            return res.status(400).json({
                error: 'Missing required fields: session_id, event_name, timestamp',
            });
        }

        // Handle pauses array
        const pausesStr = pauses ? JSON.stringify(pauses) : null;

        // Handle properties object
        const propertiesStr = properties ? JSON.stringify(properties) : null;

        // Insert event
        await db.run(
            `INSERT INTO events (
        session_id, event_name, page, timestamp, time_of_day, day_of_week,
        duration_ms, keystrokes, backspaces, pauses, mood_icon, prompt_id,
        entry_length, entry_abrupt_end, properties
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                session_id,
                event_name,
                page || null,
                timestamp,
                time_of_day || null,
                day_of_week || null,
                duration_ms || null,
                keystrokes || null,
                backspaces || null,
                pausesStr,
                mood_icon || null,
                prompt_id || null,
                entry_length || null,
                entry_abrupt_end ? 1 : 0,
                propertiesStr,
            ]
        );

        // Log session lifecycle events
        if (event_name === 'app_opened') {
            logAndBroadcast(`[SESSION] App opened at ${new Date(timestamp).toLocaleTimeString()}`);

            // Create or update session
            await db.run(
                `INSERT OR REPLACE INTO sessions (id, started_at) VALUES (?, ?)`,
                [session_id, timestamp]
            );
        } else if (event_name === 'app_closed') {
            logAndBroadcast(`[SESSION] App closed at ${new Date(timestamp).toLocaleTimeString()} (duration: ${Math.round((duration_ms || 0) / 1000 / 60)} minutes)`);

            // Update session end time
            await db.run(
                `UPDATE sessions SET ended_at = ?, duration_ms = ? WHERE id = ?`,
                [timestamp, duration_ms, session_id]
            );
        }

        // Log behavioral events
        if (event_name === 'journal_entry_started') {
            logAndBroadcast(`[BEHAVIOR] Journal entry started`);
        } else if (event_name === 'journal_entry_submitted') {
            if (backspaces > 30 && duration_ms < 120000) {
                logAndBroadcast(`[BEHAVIOR] High backspace rate detected (${backspaces} deletions in ${Math.round(duration_ms / 1000)}s)`);
            }
            if (entry_abrupt_end) {
                logAndBroadcast(`[BEHAVIOR] Entry shows abrupt ending pattern`);
            }
        }

        res.json({ success: true, message: 'Event logged' });
    } catch (error) {
        console.error('[API] Error logging event:', error);
        res.status(500).json({ error: 'Failed to log event', details: error.message });
    }
});

// POST /api/gemini - Get AI insights and prompts
app.post('/api/gemini', async (req, res) => {
    try {
        const { behavior_summary, recent_entry_excerpt, session_id, type } = req.body;

        // If behavior summary not provided, aggregate it
        let summary = behavior_summary;
        let excerpt = recent_entry_excerpt;

        if (!summary) {
            summary = await analytics.aggregate(session_id);
        }

        if (!excerpt) {
            excerpt = await analytics.getRecentEntryExcerpt(session_id);
        }

        let result;

        if (type === 'prompt') {
            // Generate prompt only
            const prompt = await geminiService.generatePrompt(summary, excerpt);
            result = {
                suggested_prompt: prompt,
                trace_logs: [`Generated prompt: "${prompt}"`],
            };
        } else if (type === 'continuation') {
            // Generate context-aware continuation prompt
            const prompt = await geminiService.generateContinuationPrompt(summary, excerpt);
            result = {
                suggested_prompt: prompt,
                trace_logs: [`Generated continuation prompt: "${prompt}"`],
            };
        } else {
            // Full analysis
            result = await geminiService.analyzePatterns(summary, excerpt);

            // Broadcast trace logs
            if (result.trace_logs) {
                result.trace_logs.forEach(log => {
                    broadcastLog(`[GEMINI] ${log}`);
                });
            }

            // Save insights to database
            await db.run(
                `INSERT INTO insights (session_id, timestamp, insights, suggested_prompt, follow_up_recommended, confidence, trace_logs) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [
                    session_id || null,
                    Date.now(),
                    JSON.stringify(result.insights),
                    result.suggested_prompt,
                    result.follow_up_recommended ? 1 : 0,
                    result.confidence,
                    JSON.stringify(result.trace_logs || []),
                ]
            );
        }

        res.json(result);
    } catch (error) {
        console.error('[API] Error calling Gemini:', error);
        res.status(500).json({
            error: 'Failed to get AI insights',
            details: error.message,
        });
    }
});

// GET /api/summaries/:sessionId - Get insights for a session
app.get('/api/summaries/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const insights = await db.all(
            `SELECT * FROM insights WHERE session_id = ? ORDER BY timestamp DESC`,
            [sessionId]
        );

        res.json({
            session_id: sessionId,
            insights: insights.map(i => ({
                ...i,
                insights: JSON.parse(i.insights),
                trace_logs: JSON.parse(i.trace_logs || '[]'),
            })),
        });
    } catch (error) {
        console.error('[API] Error fetching summaries:', error);
        res.status(500).json({ error: 'Failed to fetch summaries' });
    }
});

// GET /api/events/:sessionId - Get events for a session
app.get('/api/events/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const events = await db.all(
            `SELECT * FROM events WHERE session_id = ? ORDER BY timestamp`,
            [sessionId]
        );

        res.json({
            session_id: sessionId,
            events: events.map(e => ({
                ...e,
                pauses: e.pauses ? JSON.parse(e.pauses) : null,
                properties: e.properties ? JSON.parse(e.properties) : null,
            })),
        });
    } catch (error) {
        console.error('[API] Error fetching events:', error);
        res.status(500).json({ error: 'Failed to fetch events' });
    }
});

// Start server
server.listen(PORT, () => {
    console.log(`\n🚀 Backend server running on http://localhost:${PORT}`);
    console.log(`📊 WebSocket server ready for real-time logs`);
    console.log(`🔑 Gemini API: ${process.env.GEMINI_API_KEY ? '✅ Configured' : '❌ Missing (set GEMINI_API_KEY in .env)'}\n`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n[SHUTDOWN] Closing database connection...');
    await db.close();
    process.exit(0);
});

