/**
 * Secure Gemini API integration (server-side only)
 */

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent";

const SYSTEM_PROMPT = `You are an AI analyzing behavioral product analytics for a mental health journaling app.

You receive summarized behavioral data, not raw logs.

Your task is to:
1. Identify meaningful behavioral or emotional patterns.
2. Detect subtle hesitation, avoidance, or emotional shifts.
3. Suggest a gentle product response (prompt or follow-up).
4. Avoid clinical language or diagnosis.
5. Output structured, explainable insights.

Do not provide medical advice.
Do not shame or judge the user.

Output your response as a JSON object with this exact structure:
{
  "insights": [
    {
      "title": "Brief title",
      "explanation": "Gentle observation about the pattern"
    }
  ],
  "suggested_prompt": "A gentle, open-ended writing prompt",
  "follow_up_recommended": true/false,
  "confidence": "low" | "medium" | "high"
}`;

export class GeminiService {
    constructor(apiKey) {
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY is required");
        }
        this.apiKey = apiKey;
    }

    async callGemini(userPrompt) {
        const fullPrompt = `${SYSTEM_PROMPT}\n\n${userPrompt}`;

        try {
            const response = await fetch(
                `${GEMINI_API_URL}?key=${this.apiKey}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        contents: [
                            {
                                parts: [
                                    {
                                        text: fullPrompt,
                                    },
                                ],
                            },
                        ],
                    }),
                }
            );

            if (!response.ok) {
                const error = await response.text();
                throw new Error(`Gemini API error: ${response.status} - ${error}`);
            }

            const data = await response.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!text) {
                throw new Error("No response from Gemini API");
            }

            return text;
        } catch (error) {
            console.error("[GEMINI] API call failed:", error);
            throw error;
        }
    }

    parseGeminiResponse(text) {
        // Try to extract JSON from the response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            try {
                return JSON.parse(jsonMatch[0]);
            } catch (e) {
                console.warn("[GEMINI] Failed to parse JSON, using fallback");
            }
        }

        // Fallback response
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

    async generatePrompt(behaviorSummary, recentEntryExcerpt = null) {
        console.log("[GEMINI] Generating daily prompt from behavioral data...");

        const userPrompt = `Generate a gentle, open-ended writing prompt based on this behavioral summary:

${JSON.stringify(behaviorSummary, null, 2)}

${recentEntryExcerpt ? `Recent entry excerpt: "${recentEntryExcerpt}"` : ""}

Return only the prompt text, nothing else.`;

        try {
            const response = await this.callGemini(userPrompt);

            // Extract just the prompt text
            const promptMatch = response.match(/"suggested_prompt":\s*"([^"]+)"/);
            if (promptMatch) {
                const prompt = promptMatch[1];
                console.log(`[GEMINI] Generated prompt: "${prompt}"`);
                console.log(`[GEMINI] Decision: Using adaptive prompt based on behavioral patterns`);
                return prompt;
            }

            // Fallback: try to extract any quoted text
            const quotedMatch = response.match(/"([^"]{20,})"/);
            if (quotedMatch) {
                const prompt = quotedMatch[1];
                console.log(`[GEMINI] Generated prompt (extracted): "${prompt}"`);
                return prompt;
            }

            console.log("[GEMINI] Using fallback prompt");
            return "How are you feeling today?";
        } catch (error) {
            console.error("[GEMINI] Failed to generate prompt:", error);
            console.log("[GEMINI] Using fallback prompt due to error");
            return "How are you feeling today?";
        }
    }

    async generateContinuationPrompt(behaviorSummary, recentEntryExcerpt = null) {
        console.log("[GEMINI] Generating context-aware continuation prompt...");

        const continuationPromptInstructions = `Generate a short, context-aware continuation prompt (1 sentence max) based on the user's recent journal content and writing behavior.

STYLE GUIDELINES:
- Conversational, warm, human tone
- No "should", no "try to", no "it seems like"
- Phrased as an invitation, not a task
- Feels like a gentle nudge, not advice
- Never judgmental or diagnostic
- Avoid therapy language or instructions

ANALYZE:
- Recent journal content and themes
- Detected hesitation signals (pauses, backspaces, unfinished thoughts)
- Avoidance patterns (circling a topic without naming it)
- Emotional intensity changes

EXAMPLES OF GOOD TONE:
- "You keep coming back to this moment — want to stay with it a bit longer?"
- "You paused when you mentioned this. What feels hardest to say right now?"
- "This part seems important. Want to write one more sentence about it?"
- "You've touched on this a few times — want to look at it again?"

Behavior Summary:
${JSON.stringify(behaviorSummary, null, 2)}

${recentEntryExcerpt ? `Recent entry excerpt: "${recentEntryExcerpt}"` : ""}

Generate ONE short sentence (max) that reflects what the user has already written, feels conversational and warm, and invites them to continue if they want. Return only the prompt text, nothing else.`;

        try {
            const response = await this.callGemini(continuationPromptInstructions);

            // Extract the prompt text
            const promptMatch = response.match(/"suggested_prompt":\s*"([^"]+)"/);
            if (promptMatch) {
                const prompt = promptMatch[1];
                console.log(`[GEMINI] Generated continuation prompt: "${prompt}"`);
                return prompt;
            }

            // Try to extract quoted text
            const quotedMatch = response.match(/"([^"]{20,120})"/);
            if (quotedMatch) {
                const prompt = quotedMatch[1];
                console.log(`[GEMINI] Generated continuation prompt (extracted): "${prompt}"`);
                return prompt;
            }

            // Try to extract any sentence ending with question mark
            const questionMatch = response.match(/([^.!?]*\?)/);
            if (questionMatch && questionMatch[1].length < 120) {
                const prompt = questionMatch[1].trim();
                console.log(`[GEMINI] Generated continuation prompt (question): "${prompt}"`);
                return prompt;
            }

            console.log("[GEMINI] Using fallback continuation prompt");
            return "Want to write a bit more about that?";
        } catch (error) {
            console.error("[GEMINI] Failed to generate continuation prompt:", error);
            console.log("[GEMINI] Using fallback continuation prompt due to error");
            return "Want to write a bit more about that?";
        }
    }

    async analyzePatterns(behaviorSummary, recentEntryExcerpt = null) {
        const userPrompt = `Analyze this behavioral data and provide insights:

Behavior Summary:
${JSON.stringify(behaviorSummary, null, 2)}

${recentEntryExcerpt ? `Recent entry excerpt: "${recentEntryExcerpt}"` : ""}

Provide insights following the JSON structure specified.`;

        console.log("\n[GEMINI] ========================================");
        console.log("[GEMINI] Analyzing behavioral patterns for reflections...");
        console.log("[GEMINI] ========================================");
        console.log("[GEMINI] Input behavioral summary:");
        console.log(JSON.stringify(behaviorSummary, null, 2));
        if (recentEntryExcerpt) {
            console.log(`[GEMINI] Recent entry excerpt: "${recentEntryExcerpt}"`);
        }

        const traceLogs = [];

        try {
            const response = await this.callGemini(userPrompt);
            const parsed = this.parseGeminiResponse(response);

            console.log("\n[GEMINI] Interpretation (Non-clinical):");
            parsed.insights.forEach((insight, index) => {
                console.log(`[GEMINI]   Insight ${index + 1}: ${insight.title}`);
                console.log(`[GEMINI]   ${insight.explanation}`);

                traceLogs.push(`Insight: ${insight.title} - ${insight.explanation}`);

                // Use non-clinical language indicators
                if (insight.explanation.includes("may suggest") ||
                    insight.explanation.includes("could indicate") ||
                    insight.explanation.includes("appears to reflect")) {
                    console.log(`[GEMINI]   ✓ Uses appropriate non-clinical language`);
                }
            });

            console.log("\n[GEMINI] Decision:");
            console.log(`[GEMINI]   Suggested prompt: "${parsed.suggested_prompt}"`);
            console.log(`[GEMINI]   Follow-up recommended: ${parsed.follow_up_recommended}`);
            console.log(`[GEMINI]   Confidence: ${parsed.confidence}`);

            traceLogs.push(`Suggested prompt: "${parsed.suggested_prompt}"`);
            traceLogs.push(`Follow-up recommended: ${parsed.follow_up_recommended}`);

            if (parsed.follow_up_recommended) {
                console.log(`[GEMINI]   → Product response: Show "Continue?" button to user`);
                traceLogs.push(`Product response: Show "Continue?" button to user`);
            }

            // Detect avoidance patterns and suggest product response
            if (behaviorSummary.avoidance_signals && behaviorSummary.avoidance_signals.length > 0) {
                console.log(`[GEMINI]   → Avoidance signals detected: ${behaviorSummary.avoidance_signals.join(", ")}`);
                console.log(`[GEMINI]   → Product response: Soften prompt language`);
                traceLogs.push(`Avoidance signals detected: ${behaviorSummary.avoidance_signals.join(", ")}`);
                traceLogs.push(`Product response: Soften prompt language`);
            }

            if (behaviorSummary.emotional_volatility === "increasing" || behaviorSummary.emotional_volatility === "high") {
                console.log(`[GEMINI]   → Emotional volatility: ${behaviorSummary.emotional_volatility}`);
                console.log(`[GEMINI]   → Product response: Reduce prompt frequency`);
                traceLogs.push(`Emotional volatility: ${behaviorSummary.emotional_volatility}`);
                traceLogs.push(`Product response: Reduce prompt frequency`);
            }

            console.log("[GEMINI] ========================================\n");

            return {
                ...parsed,
                trace_logs: traceLogs,
            };
        } catch (error) {
            console.error("[GEMINI] Failed to analyze patterns:", error);
            console.log("[GEMINI] Using fallback insights");
            traceLogs.push("Error: Using fallback insights");

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
                trace_logs: traceLogs,
            };
        }
    }
}

