/**
 * Behavioral analytics aggregation service
 */

export class BehavioralAnalytics {
    constructor(db) {
        this.db = db;
    }

    async aggregate(sessionId = null) {
        console.log("\n[BEHAVIOR] ========================================");
        console.log("[BEHAVIOR] Aggregating behavioral data...");

        // Get events (optionally filtered by session)
        let events;
        if (sessionId) {
            events = await this.db.all(
                "SELECT * FROM events WHERE session_id = ? ORDER BY timestamp",
                [sessionId]
            );
        } else {
            // Get recent events across all sessions
            events = await this.db.all(
                "SELECT * FROM events ORDER BY timestamp DESC LIMIT 1000"
            );
        }

        console.log(`[BEHAVIOR] Total events: ${events.length}`);

        // Calculate average session length
        const sessionEvents = events.filter(e => e.event_name === "app_closed");
        const avgSessionLength = sessionEvents.length > 0
            ? sessionEvents.reduce((sum, e) => sum + (e.duration_ms || 0), 0) / sessionEvents.length
            : 0;

        // Most common write time
        const writeEvents = events.filter(e => e.event_name === "journal_entry_started");
        const timeOfDayCounts = {};
        writeEvents.forEach(e => {
            const time = e.time_of_day || "unknown";
            timeOfDayCounts[time] = (timeOfDayCounts[time] || 0) + 1;
        });
        const mostCommonWriteTime = Object.entries(timeOfDayCounts)
            .sort(([, a], [, b]) => b - a)[0]?.[0] || "unknown";

        // Skipped prompt rate
        const promptViewed = events.filter(e => e.event_name === "prompt_viewed").length;
        const promptSkipped = events.filter(e => e.event_name === "prompt_skipped").length;
        const skippedPromptRate = promptViewed > 0 ? promptSkipped / promptViewed : 0;

        // Average backspaces per entry
        const submittedEntries = events.filter(e => e.event_name === "journal_entry_submitted");
        const avgBackspaces = submittedEntries.length > 0
            ? submittedEntries.reduce((sum, e) => sum + (e.backspaces || 0), 0) / submittedEntries.length
            : 0;

        // Abrupt end rate
        const abruptEnds = submittedEntries.filter(e => e.entry_abrupt_end === 1).length;
        const abruptEndRate = submittedEntries.length > 0 ? abruptEnds / submittedEntries.length : 0;

        // Recurring topics (simplified - would use NLP in production)
        const recentEntries = events
            .filter(e => e.event_name === "journal_entry_submitted" && e.properties)
            .slice(-10);
        const topics = [];
        recentEntries.forEach(entry => {
            try {
                const props = JSON.parse(entry.properties);
                const content = (props.content || "").toLowerCase();
                if (content.includes("work") || content.includes("job")) topics.push("work");
                if (content.includes("family") || content.includes("parent")) topics.push("family");
                if (content.includes("friend") || content.includes("social")) topics.push("social");
                if (content.includes("sleep") || content.includes("tired")) topics.push("sleep");
                if (content.includes("anxious") || content.includes("worry")) topics.push("anxiety");
            } catch (e) {
                // Ignore parse errors
            }
        });
        const recurringTopics = [...new Set(topics)];

        // Emotional volatility (based on mood changes)
        const moodEvents = events.filter(e => e.mood_icon);
        const recentMoods = moodEvents.slice(-7);
        const moodChanges = recentMoods.length > 1
            ? recentMoods.slice(1).filter((m, i) => m.mood_icon !== recentMoods[i].mood_icon).length
            : 0;
        let emotionalVolatility = "low";
        if (moodChanges >= 5) emotionalVolatility = "high";
        else if (moodChanges >= 3) emotionalVolatility = "moderate";
        else if (moodChanges > recentMoods.length - 2) emotionalVolatility = "increasing";

        // Avoidance signals
        const avoidanceSignals = [];
        if (skippedPromptRate > 0.5) avoidanceSignals.push("high_prompt_skip_rate");
        if (abruptEndRate > 0.3) avoidanceSignals.push("frequent_abrupt_endings");

        // Check for long pauses
        const longPauseEntries = submittedEntries.filter(e => {
            try {
                const pauses = e.pauses ? JSON.parse(e.pauses) : [];
                return pauses.some(p => p > 10000);
            } catch {
                return false;
            }
        });
        if (longPauseEntries.length > submittedEntries.length * 0.4) {
            avoidanceSignals.push("frequent_long_pauses");
        }

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

    async getRecentEntryExcerpt(sessionId = null, maxLength = 200) {
        let entries;
        if (sessionId) {
            entries = await this.db.all(
                "SELECT * FROM events WHERE session_id = ? AND event_name = 'journal_entry_submitted' ORDER BY timestamp DESC LIMIT 1",
                [sessionId]
            );
        } else {
            entries = await this.db.all(
                "SELECT * FROM events WHERE event_name = 'journal_entry_submitted' ORDER BY timestamp DESC LIMIT 1"
            );
        }

        if (entries.length === 0) {
            console.log("[BEHAVIOR] No recent entries available");
            return null;
        }

        const latest = entries[0];
        try {
            const props = JSON.parse(latest.properties || "{}");
            const content = props.content || "";
            const excerpt = content.length > maxLength
                ? content.substring(0, maxLength) + "..."
                : content;

            if (latest.entry_abrupt_end) {
                console.log(`[BEHAVIOR] Recent entry shows abrupt ending pattern`);
            }

            return excerpt;
        } catch {
            return null;
        }
    }
}

