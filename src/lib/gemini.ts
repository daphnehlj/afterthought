/**
 * Gemini API integration for AI-powered insights and prompts
 * Now uses backend API for secure API key handling
 */

import { BehaviorSummary } from "./behavioralAnalytics";
import { ApiClient } from "./apiClient";
import { eventTracker } from "./eventTracking";

export interface GeminiInsight {
  title: string;
  explanation: string;
}

export interface GeminiResponse {
  insights: GeminiInsight[];
  suggested_prompt: string;
  follow_up_recommended: boolean;
  confidence: "low" | "medium" | "high";
}

export interface SessionSummary {
  key_observations: string[];
  recurring_themes: string[];
  writing_patterns: string[];
  summary_text: string;
}

// System prompt is now handled by the backend

export class GeminiService {
  // Backend handles all Gemini API calls securely

  async generatePrompt(
    behaviorSummary: BehaviorSummary,
    recentEntryExcerpt?: string | null
  ): Promise<string> {
    console.log("[GEMINI] Generating daily prompt from behavioral data...");

    try {
      const result = await ApiClient.getGeminiInsights({
        behavior_summary: behaviorSummary,
        recent_entry_excerpt: recentEntryExcerpt,
        session_id: eventTracker.getSessionId(),
        type: 'prompt',
      });

      const prompt = result.suggested_prompt || "How are you feeling today?";
      console.log(`[GEMINI] Generated prompt: "${prompt}"`);
      console.log(`[GEMINI] Decision: Using adaptive prompt based on behavioral patterns`);
      return prompt;
    } catch (error) {
      console.error("[GEMINI] Failed to generate prompt:", error);
      console.log("[GEMINI] Using fallback prompt due to error");
      return "How are you feeling today?";
    }
  }

  async analyzePatterns(
    behaviorSummary: BehaviorSummary,
    recentEntryExcerpt?: string | null
  ): Promise<GeminiResponse> {
    console.log("\n[GEMINI] ========================================");
    console.log("[GEMINI] Analyzing behavioral patterns for reflections...");
    console.log("[GEMINI] ========================================");
    console.log("[GEMINI] Input behavioral summary:");
    console.log(JSON.stringify(behaviorSummary, null, 2));
    if (recentEntryExcerpt) {
      console.log(`[GEMINI] Recent entry excerpt: "${recentEntryExcerpt}"`);
    }

    try {
      const result = await ApiClient.getGeminiInsights({
        behavior_summary: behaviorSummary,
        recent_entry_excerpt: recentEntryExcerpt,
        session_id: eventTracker.getSessionId(),
        type: 'analysis',
      });

      // Log trace logs from backend
      if (result.trace_logs) {
        result.trace_logs.forEach((log: string) => {
          console.log(`[GEMINI] ${log}`);
        });
      }

      return {
        insights: result.insights || [],
        suggested_prompt: result.suggested_prompt || "How are you feeling today?",
        follow_up_recommended: result.follow_up_recommended || false,
        confidence: result.confidence || "low",
      };
    } catch (error) {
      console.error("[GEMINI] Failed to analyze patterns:", error);
      console.log("[GEMINI] Using fallback insights");
      // Return fallback
      return {
        insights: [
          {
            title: "Pattern observation",
            explanation: "Your writing patterns show interesting variations over time.",
          },
        ],
        suggested_prompt: "How are you feeling today?",
        follow_up_recommended: false,
        confidence: "low",
      };
    }
  }

  async generateLivePrompt(
    currentContent: string,
    behaviorData: {
      keystrokes: number;
      backspaces: number;
      pauses: number[];
      sessionDuration: number;
    }
  ): Promise<string> {
    console.log("[GEMINI] Generating live writing prompt...");

    try {
      // Detect hesitation signals
      const longPauses = behaviorData.pauses.filter(p => p > 5000).length;
      const backspaceRate = behaviorData.backspaces / Math.max(behaviorData.keystrokes, 1);
      const hasAbruptEnd = currentContent.trim().endsWith("...") ||
        currentContent.trim().endsWith("—") ||
        currentContent.trim().endsWith("-");

      const context = {
        content_length: currentContent.length,
        long_pauses: longPauses,
        backspace_rate: backspaceRate,
        has_abrupt_end: hasAbruptEnd,
        recent_content: currentContent.slice(-200), // Last 200 chars
      };

      const result = await ApiClient.getGeminiInsights({
        behavior_summary: context as any,
        recent_entry_excerpt: currentContent.slice(-200),
        session_id: eventTracker.getSessionId(),
        type: 'prompt',
      });

      const prompt = result.suggested_prompt || "Would you like to continue writing?";
      console.log(`[GEMINI] Live prompt: "${prompt}"`);
      return prompt;
    } catch (error) {
      console.error("[GEMINI] Failed to generate live prompt:", error);
      return "Would you like to write more about that?";
    }
  }

  async generateContinuationPrompt(
    behaviorSummary: BehaviorSummary,
    recentEntryExcerpt?: string | null
  ): Promise<string> {
    console.log("[GEMINI] Generating context-aware continuation prompt...");

    try {
      const result = await ApiClient.getGeminiInsights({
        behavior_summary: behaviorSummary,
        recent_entry_excerpt: recentEntryExcerpt,
        session_id: eventTracker.getSessionId(),
        type: 'continuation',
      });

      const prompt = result.suggested_prompt || "Want to write a bit more about that?";
      console.log(`[GEMINI] Generated continuation prompt: "${prompt}"`);
      return prompt;
    } catch (error) {
      console.error("[GEMINI] Failed to generate continuation prompt:", error);
      return "Want to write a bit more about that?";
    }
  }

  async generateSessionSummary(
    behaviorSummary: BehaviorSummary,
    entries: Array<{ content: string; timestamp: number }>
  ): Promise<SessionSummary> {
    console.log("[GEMINI] Generating session summary...");

    try {
      const entriesText = entries.map(e => e.content).join("\n\n---\n\n");
      const recentExcerpt = entries.length > 0 ? entries[entries.length - 1].content.slice(-300) : null;

      const result = await ApiClient.getGeminiInsights({
        behavior_summary: behaviorSummary,
        recent_entry_excerpt: recentExcerpt,
        session_id: eventTracker.getSessionId(),
        type: 'analysis',
      });

      // Generate structured summary
      const summaryPrompt = `Based on this session's behavioral data and entries, generate a structured summary with:
1. Key behavioral observations (2-3 items)
2. Recurring themes (2-3 items)
3. Writing patterns over time (2-3 items)
4. A brief summary text (2-3 sentences)

Behavioral data: ${JSON.stringify(behaviorSummary)}
Recent entries: ${entriesText.slice(-1000)}

Return as JSON with keys: key_observations, recurring_themes, writing_patterns, summary_text`;

      // For now, construct from insights
      const keyObservations = result.insights.slice(0, 3).map(i => i.explanation);
      const recurringThemes: string[] = [];
      if (behaviorSummary.recurring_topics.length > 0) {
        recurringThemes.push(...behaviorSummary.recurring_topics);
      }
      const writingPatterns: string[] = [];
      if (behaviorSummary.most_common_write_time !== "unknown") {
        writingPatterns.push(`Most writing occurs during ${behaviorSummary.most_common_write_time}`);
      }
      if (behaviorSummary.avg_backspaces_per_entry > 20) {
        writingPatterns.push("Frequent editing and revision patterns");
      }

      return {
        key_observations: keyObservations,
        recurring_themes: recurringThemes,
        writing_patterns: writingPatterns,
        summary_text: result.insights.map(i => i.explanation).join(" ") || "Your writing session shows interesting patterns and themes.",
      };
    } catch (error) {
      console.error("[GEMINI] Failed to generate session summary:", error);
      return {
        key_observations: ["Session completed"],
        recurring_themes: [],
        writing_patterns: [],
        summary_text: "Your writing session has been saved.",
      };
    }
  }
}

export const geminiService = new GeminiService();

