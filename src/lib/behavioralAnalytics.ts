/**
 * Behavioral analytics aggregation layer
 * Converts raw events into summaries for Gemini AI
 */

import { eventTracker, TrackedEvent } from "./eventTracking";
import { storageService, JournalEntry } from "./storage";

export interface BehaviorSummary {
  avg_session_length: number;
  most_common_write_time: string;
  skipped_prompt_rate: number;
  avg_backspaces_per_entry: number;
  abrupt_end_rate: number;
  recurring_topics: string[];
  emotional_volatility: "low" | "moderate" | "high" | "increasing";
  avoidance_signals: string[];
}

export class BehavioralAnalytics {
  aggregate(): BehaviorSummary {
    const events = eventTracker.getEvents();
    const entries = storageService.getEntries();

    console.log("\n[BEHAVIOR] ========================================");
    console.log("[BEHAVIOR] Aggregating behavioral data...");
    console.log(`[BEHAVIOR] Total events: ${events.length}`);
    console.log(`[BEHAVIOR] Total entries: ${entries.length}`);

    // Calculate average session length
    const sessionEvents = events.filter(e => e.event_name === "app_closed");
    const avgSessionLength = sessionEvents.length > 0
      ? sessionEvents.reduce((sum, e) => sum + (e.properties.duration_ms || 0), 0) / sessionEvents.length
      : 0;

    // Most common write time
    const writeEvents = events.filter(e => e.event_name === "journal_entry_started");
    const timeOfDayCounts: Record<string, number> = {};
    writeEvents.forEach(e => {
      const time = e.properties.time_of_day || "unknown";
      timeOfDayCounts[time] = (timeOfDayCounts[time] || 0) + 1;
    });
    const mostCommonWriteTime = Object.entries(timeOfDayCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || "unknown";

    // Skipped prompt rate
    const promptViewed = events.filter(e => e.event_name === "prompt_viewed").length;
    const promptSkipped = events.filter(e => e.event_name === "prompt_skipped").length;
    const skippedPromptRate = promptViewed > 0 ? promptSkipped / promptViewed : 0;

    // Average backspaces per entry
    const submittedEntries = entries.filter(e => e.behavioralData);
    const avgBackspaces = submittedEntries.length > 0
      ? submittedEntries.reduce((sum, e) => sum + (e.behavioralData?.backspaces || 0), 0) / submittedEntries.length
      : 0;

    // Abrupt end rate
    const abruptEnds = submittedEntries.filter(e => e.behavioralData?.abruptEnd).length;
    const abruptEndRate = submittedEntries.length > 0 ? abruptEnds / submittedEntries.length : 0;

    // Recurring topics (simplified - would use NLP in production)
    const recentEntries = entries.slice(-10);
    const topics: string[] = [];
    // Simple keyword extraction (in production, use proper NLP)
    recentEntries.forEach(entry => {
      const content = entry.content.toLowerCase();
      if (content.includes("work") || content.includes("job")) topics.push("work");
      if (content.includes("family") || content.includes("parent")) topics.push("family");
      if (content.includes("friend") || content.includes("social")) topics.push("social");
      if (content.includes("sleep") || content.includes("tired")) topics.push("sleep");
      if (content.includes("anxious") || content.includes("worry")) topics.push("anxiety");
    });
    const recurringTopics = [...new Set(topics)];

    // Emotional volatility (based on mood changes)
    const moods = storageService.getMoods();
    const recentMoods = moods.slice(-7);
    const moodChanges = recentMoods.length > 1
      ? recentMoods.slice(1).filter((m, i) => m.mood !== recentMoods[i].mood).length
      : 0;
    let emotionalVolatility: "low" | "moderate" | "high" | "increasing" = "low";
    if (moodChanges >= 5) emotionalVolatility = "high";
    else if (moodChanges >= 3) emotionalVolatility = "moderate";
    else if (moodChanges > recentMoods.length - 2) emotionalVolatility = "increasing";

    // Avoidance signals
    const avoidanceSignals: string[] = [];
    if (skippedPromptRate > 0.5) avoidanceSignals.push("high_prompt_skip_rate");
    if (abruptEndRate > 0.3) avoidanceSignals.push("frequent_abrupt_endings");
    const longPauses = submittedEntries.filter(e =>
      e.behavioralData?.pauses.some(p => p > 10000) || false
    ).length;
    if (longPauses > submittedEntries.length * 0.4) avoidanceSignals.push("frequent_long_pauses");

    const summary = {
      avg_session_length: avgSessionLength,
      most_common_write_time: mostCommonWriteTime,
      skipped_prompt_rate: skippedPromptRate,
      avg_backspaces_per_entry: avgBackspaces,
      abrupt_end_rate: abruptEndRate,
      recurring_topics: recurringTopics,
      emotional_volatility: emotionalVolatility,
      avoidance_signals: avoidanceSignals,
    };

    console.log("[BEHAVIOR] Aggregation complete:");
    console.log(`[BEHAVIOR]   Avg session length: ${Math.round(avgSessionLength / 1000 / 60)} minutes`);
    console.log(`[BEHAVIOR]   Most common write time: ${mostCommonWriteTime}`);
    console.log(`[BEHAVIOR]   Skipped prompt rate: ${(skippedPromptRate * 100).toFixed(1)}%`);
    console.log(`[BEHAVIOR]   Avg backspaces per entry: ${avgBackspaces.toFixed(1)}`);
    console.log(`[BEHAVIOR]   Abrupt end rate: ${(abruptEndRate * 100).toFixed(1)}%`);
    console.log(`[BEHAVIOR]   Recurring topics: ${recurringTopics.join(", ") || "none"}`);
    console.log(`[BEHAVIOR]   Emotional volatility: ${emotionalVolatility}`);
    console.log(`[BEHAVIOR]   Avoidance signals: ${avoidanceSignals.join(", ") || "none"}`);
    console.log("[BEHAVIOR] ========================================\n");

    return summary;
  }

  getRecentEntryExcerpt(maxLength: number = 200): string | null {
    const entries = storageService.getEntries();
    if (entries.length === 0) {
      console.log("[BEHAVIOR] No recent entries available");
      return null;
    }

    const latest = entries[entries.length - 1];
    const excerpt = latest.content.length > maxLength
      ? latest.content.substring(0, maxLength) + "..."
      : latest.content;

    // Check for abrupt ending in excerpt
    if (latest.behavioralData?.abruptEnd) {
      console.log(`[BEHAVIOR] Recent entry shows abrupt ending pattern`);
    }

    return excerpt;
  }

  aggregatePerSession(sessionId: string): BehaviorSummary {
    const events = eventTracker.getEvents().filter(e => e.properties.session_id === sessionId);
    const entries = storageService.getEntries(); // Filter by session if needed

    return this.aggregateFromEvents(events, entries);
  }

  aggregatePerDay(date: string): BehaviorSummary {
    const events = eventTracker.getEvents();
    const entries = storageService.getEntriesByDate(date);

    // Filter events by date (approximate)
    const dayEvents = events.filter(e => {
      const eventDate = new Date(e.timestamp).toISOString().split('T')[0];
      return eventDate === date;
    });

    return this.aggregateFromEvents(dayEvents, entries);
  }

  private aggregateFromEvents(events: TrackedEvent[], entries: JournalEntry[]): BehaviorSummary {
    // Calculate average session length
    const sessionEvents = events.filter(e => e.event_name === "app_closed");
    const avgSessionLength = sessionEvents.length > 0
      ? sessionEvents.reduce((sum, e) => sum + (e.properties.duration_ms || 0), 0) / sessionEvents.length
      : 0;

    // Most common write time
    const writeEvents = events.filter(e => e.event_name === "journal_entry_started");
    const timeOfDayCounts: Record<string, number> = {};
    writeEvents.forEach(e => {
      const time = e.properties.time_of_day || "unknown";
      timeOfDayCounts[time] = (timeOfDayCounts[time] || 0) + 1;
    });
    const mostCommonWriteTime = Object.entries(timeOfDayCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || "unknown";

    // Skipped prompt rate
    const promptViewed = events.filter(e => e.event_name === "prompt_viewed").length;
    const promptSkipped = events.filter(e => e.event_name === "prompt_skipped").length;
    const skippedPromptRate = promptViewed > 0 ? promptSkipped / promptViewed : 0;

    // Average backspaces per entry
    const submittedEntries = entries.filter(e => e.behavioralData);
    const avgBackspaces = submittedEntries.length > 0
      ? submittedEntries.reduce((sum, e) => sum + (e.behavioralData?.backspaces || 0), 0) / submittedEntries.length
      : 0;

    // Abrupt end rate
    const abruptEnds = submittedEntries.filter(e => e.behavioralData?.abruptEnd).length;
    const abruptEndRate = submittedEntries.length > 0 ? abruptEnds / submittedEntries.length : 0;

    // Recurring topics
    const recentEntries = entries.slice(-10);
    const topics: string[] = [];
    recentEntries.forEach(entry => {
      const content = entry.content.toLowerCase();
      if (content.includes("work") || content.includes("job")) topics.push("work");
      if (content.includes("family") || content.includes("parent")) topics.push("family");
      if (content.includes("friend") || content.includes("social")) topics.push("social");
      if (content.includes("sleep") || content.includes("tired")) topics.push("sleep");
      if (content.includes("anxious") || content.includes("worry")) topics.push("anxiety");
    });
    const recurringTopics = [...new Set(topics)];

    // Emotional volatility
    const moods = storageService.getMoods();
    const recentMoods = moods.slice(-7);
    const moodChanges = recentMoods.length > 1
      ? recentMoods.slice(1).filter((m, i) => m.mood !== recentMoods[i].mood).length
      : 0;
    let emotionalVolatility: "low" | "moderate" | "high" | "increasing" = "low";
    if (moodChanges >= 5) emotionalVolatility = "high";
    else if (moodChanges >= 3) emotionalVolatility = "moderate";
    else if (moodChanges > recentMoods.length - 2) emotionalVolatility = "increasing";

    // Avoidance signals
    const avoidanceSignals: string[] = [];
    if (skippedPromptRate > 0.5) avoidanceSignals.push("high_prompt_skip_rate");
    if (abruptEndRate > 0.3) avoidanceSignals.push("frequent_abrupt_endings");
    const longPauses = submittedEntries.filter(e =>
      e.behavioralData?.pauses.some(p => p > 10000) || false
    ).length;
    if (longPauses > submittedEntries.length * 0.4) avoidanceSignals.push("frequent_long_pauses");

    return {
      avg_session_length: avgSessionLength,
      most_common_write_time: mostCommonWriteTime,
      skipped_prompt_rate: skippedPromptRate,
      avg_backspaces_per_entry: avgBackspaces,
      abrupt_end_rate: abruptEndRate,
      recurring_topics: recurringTopics,
      emotional_volatility: emotionalVolatility,
      avoidance_signals: avoidanceSignals,
    };
  }
}

export const behavioralAnalytics = new BehavioralAnalytics();

