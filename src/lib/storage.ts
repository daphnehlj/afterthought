/**
 * Local storage management for app state
 */

export interface JournalEntry {
  id: string;
  content: string;
  timestamp: number;
  date: string; // YYYY-MM-DD
  mood?: string;
  prompt?: string;
  behavioralData?: {
    sessionDuration: number;
    keystrokes: number;
    backspaces: number;
    pauses: number[];
    abruptEnd: boolean;
  };
}

export interface MoodRecord {
  date: string; // YYYY-MM-DD
  mood: string;
  timestamp: number;
}

export interface UserSettings {
  dailyPrompts: boolean;
  shareWithTherapist: boolean;
  voiceInput: boolean;
  dailyReminder: boolean;
}

class StorageService {
  private readonly ENTRIES_KEY = "afterthought_entries";
  private readonly MOODS_KEY = "afterthought_moods";
  private readonly SETTINGS_KEY = "afterthought_settings";
  private readonly INSIGHTS_KEY = "afterthought_insights";

  // Journal Entries
  saveEntry(entry: JournalEntry): void {
    const entries = this.getEntries();
    entries.push(entry);
    localStorage.setItem(this.ENTRIES_KEY, JSON.stringify(entries));
  }

  getEntries(): JournalEntry[] {
    try {
      const stored = localStorage.getItem(this.ENTRIES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  getEntriesByDate(date: string): JournalEntry[] {
    return this.getEntries().filter(e => e.date === date);
  }

  getEntry(id: string): JournalEntry | undefined {
    return this.getEntries().find(e => e.id === id);
  }

  // Mood Records
  saveMood(date: string, mood: string): void {
    const moods = this.getMoods();
    const existing = moods.findIndex(m => m.date === date);
    const moodRecord: MoodRecord = { date, mood, timestamp: Date.now() };

    if (existing >= 0) {
      moods[existing] = moodRecord;
    } else {
      moods.push(moodRecord);
    }

    localStorage.setItem(this.MOODS_KEY, JSON.stringify(moods));
  }

  getMoods(): MoodRecord[] {
    try {
      const stored = localStorage.getItem(this.MOODS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  getMoodByDate(date: string): string | undefined {
    const mood = this.getMoods().find(m => m.date === date);
    return mood?.mood;
  }

  // Settings
  getSettings(): UserSettings {
    try {
      const stored = localStorage.getItem(this.SETTINGS_KEY);
      return stored ? JSON.parse(stored) : {
        dailyPrompts: true,
        shareWithTherapist: false,
        voiceInput: true,
        dailyReminder: false,
      };
    } catch {
      return {
        dailyPrompts: true,
        shareWithTherapist: false,
        voiceInput: true,
        dailyReminder: false,
      };
    }
  }

  saveSettings(settings: UserSettings): void {
    localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings));
  }

  // Insights (shared/private state)
  saveInsights(insights: any[]): void {
    localStorage.setItem(this.INSIGHTS_KEY, JSON.stringify(insights));
  }

  getInsights(): any[] {
    try {
      const stored = localStorage.getItem(this.INSIGHTS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  // Session summaries
  saveSessionSummary(sessionId: string, summary: any): void {
    const key = `afterthought_session_${sessionId}`;
    localStorage.setItem(key, JSON.stringify(summary));
  }

  getSessionSummary(sessionId: string): any | null {
    try {
      const key = `afterthought_session_${sessionId}`;
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }
}

export const storageService = new StorageService();

