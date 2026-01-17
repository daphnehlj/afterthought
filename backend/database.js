/**
 * SQLite database setup and schema
 */

import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class Database {
    constructor(dbPath = './data/journal.db') {
        // Ensure data directory exists
        const dataDir = path.dirname(dbPath);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        this.db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error('[DB] Error opening database:', err);
            } else {
                console.log('[DB] Connected to SQLite database');
            }
        });

        this.init();
    }

    async init() {
        // Create events table
        await this.run(`
      CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT NOT NULL,
        event_name TEXT NOT NULL,
        page TEXT,
        timestamp INTEGER NOT NULL,
        time_of_day TEXT,
        day_of_week TEXT,
        duration_ms INTEGER,
        keystrokes INTEGER,
        backspaces INTEGER,
        pauses TEXT,
        mood_icon TEXT,
        prompt_id TEXT,
        entry_length INTEGER,
        entry_abrupt_end BOOLEAN,
        properties TEXT
      )
    `);

        // Create sessions table
        await this.run(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        started_at INTEGER NOT NULL,
        ended_at INTEGER,
        duration_ms INTEGER
      )
    `);

        // Create insights table
        await this.run(`
      CREATE TABLE IF NOT EXISTS insights (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT,
        timestamp INTEGER NOT NULL,
        insights TEXT NOT NULL,
        suggested_prompt TEXT,
        follow_up_recommended BOOLEAN,
        confidence TEXT,
        trace_logs TEXT
      )
    `);

        // Create indexes for performance
        await this.run(`
      CREATE INDEX IF NOT EXISTS idx_events_session ON events(session_id)
    `);
        await this.run(`
      CREATE INDEX IF NOT EXISTS idx_events_timestamp ON events(timestamp)
    `);
        await this.run(`
      CREATE INDEX IF NOT EXISTS idx_insights_session ON insights(session_id)
    `);

        console.log('[DB] Database schema initialized');
    }

    run(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function (err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ lastID: this.lastID, changes: this.changes });
                }
            });
        });
    }

    get(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.get(sql, params, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    all(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    close() {
        return new Promise((resolve, reject) => {
            this.db.close((err) => {
                if (err) {
                    reject(err);
                } else {
                    console.log('[DB] Database connection closed');
                    resolve();
                }
            });
        });
    }
}

export default Database;

