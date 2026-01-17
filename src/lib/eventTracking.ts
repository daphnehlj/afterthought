/**
 * Amplitude-style event tracking system
 * Tracks behavioral events for AI-powered interpretation
 * Sends events to backend API for persistent storage
 */

import { ApiClient } from "./apiClient";

export type Page = "home" | "calendar" | "writing" | "reflections" | "profile";
export type TimeOfDay = "morning" | "afternoon" | "evening" | "late_night";

export interface EventProperties {
  page?: Page;
  time_of_day?: TimeOfDay;
  day_of_week?: string;
  session_id?: string;
  duration_ms?: number;
  keystrokes?: number;
  backspaces?: number;
  pauses_ms?: number[];
  mood_icon?: string;
  prompt_id?: string;
  entry_length?: number;
  entry_abrupt_end?: boolean;
  [key: string]: any;
}

export interface TrackedEvent {
  event_name: string;
  timestamp: number;
  properties: EventProperties;
}

class EventTracker {
  private events: TrackedEvent[] = [];
  private sessionId: string;
  private sessionStartTime: number;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.sessionStartTime = Date.now();
    this.loadEvents();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getTimeOfDay(): TimeOfDay {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "morning";
    if (hour >= 12 && hour < 17) return "afternoon";
    if (hour >= 17 && hour < 22) return "evening";
    return "late_night";
  }

  private getDayOfWeek(): string {
    return new Date().toLocaleDateString("en-US", { weekday: "long" });
  }

  async track(eventName: string, properties: EventProperties = {}): Promise<void> {
    const timestamp = Date.now();
    const timeOfDay = this.getTimeOfDay();
    const dayOfWeek = this.getDayOfWeek();

    const event: TrackedEvent = {
      event_name: eventName,
      timestamp,
      properties: {
        ...properties,
        session_id: this.sessionId,
        time_of_day: timeOfDay,
        day_of_week: dayOfWeek,
      },
    };

    this.events.push(event);
    this.saveEvents();

    // Log to terminal for debugging
    console.log(`[EVENT] ${eventName}`, event.properties);

    // Send to backend API (non-blocking, with fallback)
    try {
      await ApiClient.postEvent({
        session_id: this.sessionId,
        event_name: eventName,
        page: properties.page,
        timestamp,
        time_of_day: timeOfDay,
        day_of_week: dayOfWeek,
        duration_ms: properties.duration_ms,
        keystrokes: properties.keystrokes,
        backspaces: properties.backspaces,
        pauses: properties.pauses_ms,
        mood_icon: properties.mood_icon,
        prompt_id: properties.prompt_id,
        entry_length: properties.entry_length,
        entry_abrupt_end: properties.entry_abrupt_end,
        properties: properties,
      });
    } catch (error) {
      // Backend unavailable - continue with localStorage only
      console.warn('[EVENT] Backend unavailable, using localStorage only');
    }
  }

  getEvents(): TrackedEvent[] {
    return [...this.events];
  }

  getEventsByType(eventName: string): TrackedEvent[] {
    return this.events.filter(e => e.event_name === eventName);
  }

  getSessionDuration(): number {
    return Date.now() - this.sessionStartTime;
  }

  getSessionId(): string {
    return this.sessionId;
  }

  async endSession(): Promise<void> {
    const duration = this.getSessionDuration();
    await this.track("app_closed", { duration_ms: duration });
    console.log(`[SESSION] App closed at ${new Date().toLocaleTimeString()} (duration: ${Math.round(duration / 1000 / 60)} minutes)`);
  }

  private saveEvents(): void {
    try {
      localStorage.setItem("afterthought_events", JSON.stringify(this.events));
    } catch (error) {
      console.warn("Failed to save events to localStorage:", error);
    }
  }

  private loadEvents(): void {
    try {
      const stored = localStorage.getItem("afterthought_events");
      if (stored) {
        this.events = JSON.parse(stored);
      }
    } catch (error) {
      console.warn("Failed to load events from localStorage:", error);
    }
  }

  clearEvents(): void {
    this.events = [];
    localStorage.removeItem("afterthought_events");
  }
}

// Singleton instance
export const eventTracker = new EventTracker();

// Track app lifecycle
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    eventTracker.endSession();
  });

  // Track app opened
  eventTracker.track("app_opened", { page: "home" });
  console.log(`[SESSION] App opened at ${new Date().toLocaleTimeString()}`);

  // Connect to WebSocket for real-time AI logs
  ApiClient.connectWebSocket((message) => {
    // Logs are already printed by ApiClient, but we can add UI updates here if needed
  });
}

