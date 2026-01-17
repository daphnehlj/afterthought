import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Send, BookOpen } from "lucide-react";
import Layout from "@/components/Layout";
import PaperContainer from "@/components/PaperContainer";
import { Switch } from "@/components/ui/switch";
import { eventTracker } from "@/lib/eventTracking";
import { storageService } from "@/lib/storage";
import { behavioralAnalytics } from "@/lib/behavioralAnalytics";
import { geminiService, GeminiInsight } from "@/lib/gemini";
import { format } from "date-fns";
import { toast } from "sonner";

interface Insight {
  id: string;
  title: string;
  content: string;
  shared: boolean;
  followUpRecommended?: boolean;
}

const Analysis = () => {
  const navigate = useNavigate();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [followUpRecommended, setFollowUpRecommended] = useState(false);
  const [continuationPrompt, setContinuationPrompt] = useState<string | null>(null);
  const [showRawEntries, setShowRawEntries] = useState(false);
  const [sessionSummary, setSessionSummary] = useState<any>(null);

  // Get today's entries count
  const today = format(new Date(), "yyyy-MM-dd");
  const todayEntries = storageService.getEntriesByDate(today);

  useEffect(() => {
    const loadInsights = async () => {
      eventTracker.track("reflection_viewed", { page: "reflections" });

      setLoading(true);
      try {
        // Load saved insights first
        const savedInsights = storageService.getInsights();
        if (savedInsights.length > 0) {
          setInsights(savedInsights);
          setLoading(false);
        }

        // Generate new insights from Gemini
        const behaviorSummary = behavioralAnalytics.aggregate();
        const recentEntry = behavioralAnalytics.getRecentEntryExcerpt();

        console.log("[GEMINI] Analyzing patterns for reflections...");
        const geminiResponse = await geminiService.analyzePatterns(behaviorSummary, recentEntry);

        // Convert Gemini insights to our format
        const newInsights: Insight[] = geminiResponse.insights.map((insight, index) => ({
          id: `insight_${Date.now()}_${index}`,
          title: insight.title,
          content: insight.explanation,
          shared: false,
        }));

        // Merge with existing insights (avoid duplicates)
        const merged = [...savedInsights, ...newInsights].filter(
          (insight, index, self) =>
            index === self.findIndex(i => i.title === insight.title)
        );

        setInsights(merged);
        setFollowUpRecommended(geminiResponse.follow_up_recommended);
        storageService.saveInsights(merged);

        // Generate context-aware continuation prompt if follow-up is recommended
        if (geminiResponse.follow_up_recommended) {
          try {
            const continuationPrompt = await geminiService.generateContinuationPrompt(
              behaviorSummary,
              recentEntry
            );
            setContinuationPrompt(continuationPrompt);
          } catch (error) {
            console.error("Failed to generate continuation prompt:", error);
            setContinuationPrompt("Want to write a bit more about that?");
          }
        }
      } catch (error) {
        console.error("Failed to load insights:", error);
        // Use fallback insights
        setInsights([
          {
            id: "fallback_1",
            title: "Pattern observation",
            content: "Your writing patterns show interesting variations over time.",
            shared: false,
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    loadInsights();
  }, []);

  const toggleShared = (id: string) => {
    setInsights(prev => {
      const updated = prev.map(insight =>
        insight.id === id ? { ...insight, shared: !insight.shared } : insight
      );
      storageService.saveInsights(updated);

      eventTracker.track("reflection_shared_toggled", {
        page: "reflections",
        insight_id: id,
        shared: updated.find(i => i.id === id)?.shared || false,
      });

      return updated;
    });
  };

  const handleSend = () => {
    // Simulate sending to therapist - clear AI insights, show only raw entries
    setShowRawEntries(true);
    setInsights([]);
    eventTracker.track("reflections_sent", { page: "reflections" });
    toast.success("Sent to therapist ✨");
  };

  const handleViewTodayEntries = () => {
    navigate("/history", { state: { date: today, entries: todayEntries } });
  };

  const handleEndSession = async () => {
    try {
      const sessionId = eventTracker.getSessionId();
      const behaviorSummary = behavioralAnalytics.aggregatePerSession(sessionId);
      const entries = storageService.getEntries().map(e => ({
        content: e.content,
        timestamp: e.timestamp,
      }));

      console.log("[SESSION] Generating session summary...");
      const summary = await geminiService.generateSessionSummary(behaviorSummary, entries);

      // Save summary
      storageService.saveSessionSummary(sessionId, summary);
      setSessionSummary(summary);

      // End session
      await eventTracker.endSession();

      // Add summary as insight
      const summaryInsight: Insight = {
        id: `session_summary_${Date.now()}`,
        title: "Session Summary",
        content: summary.summary_text,
        shared: false,
      };

      setInsights(prev => [...prev, summaryInsight]);
      storageService.saveInsights([...insights, summaryInsight]);

      toast.success("Session ended. Summary generated.");
    } catch (error) {
      console.error("Failed to end session:", error);
      toast.error("Failed to generate session summary");
    }
  };

  return (
    <Layout>
      <div className="min-h-screen px-4 py-6 md:px-8 relative">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Tape decoration top-left */}
          <div className="absolute top-20 -left-2 w-16 h-6 bg-[#D6B38D]/40 rotate-45 shadow-sm" />
          {/* Sticker decoration */}
          <div className="absolute top-40 right-4 w-8 h-8 rounded-full bg-[#94AA78]/20 border border-[#94AA78]/30" />
          {/* Paper texture overlay */}
          <div className="absolute bottom-32 left-8 w-12 h-12 bg-[#D7CDC1]/30 rotate-12" />
          {/* Small tape */}
          <div className="absolute bottom-48 right-12 w-10 h-4 bg-[#D6B38D]/30 -rotate-12" />
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 relative z-10"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-pixel mb-2 text-[#411E03]">Reflections</h1>
              <p className="font-serif italic text-[#846851]">
                Patterns noticed across your entries
              </p>
            </div>
            {/* Today's entries button */}
            {todayEntries.length > 0 && (
              <button
                onClick={handleViewTodayEntries}
                className="flex items-center gap-2 px-4 py-2 bg-[#D7CDC1]/60 rounded-lg hover:bg-[#D7CDC1]/80 transition-colors"
              >
                <BookOpen className="w-4 h-4 text-[#411E03]" />
                <span className="font-pixel text-sm text-[#411E03]">
                  {todayEntries.length} {todayEntries.length === 1 ? 'entry' : 'entries'} today
                </span>
              </button>
            )}
          </div>
        </motion.div>

        {/* Scrapbook-style layout */}
        {loading ? (
          <div className="text-center py-12 relative z-10">
            <p className="font-serif text-[#846851] italic">Analyzing your patterns...</p>
          </div>
        ) : insights.length === 0 ? (
          <div className="text-center py-12 relative z-10">
            <p className="font-serif text-[#846851] italic">No insights yet. Start writing to see patterns emerge.</p>
          </div>
        ) : (
          <div className="space-y-6 relative z-10">
            {insights.map((insight, index) => (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 20, rotate: index % 2 === 0 ? -1 : 1 }}
                animate={{ opacity: 1, y: 0, rotate: index % 2 === 0 ? -0.5 : 0.5 }}
                transition={{ delay: index * 0.1 }}
              >
                <PaperContainer className="p-6 relative bg-[#D7CDC1]/80">
                  {/* Tape decoration */}
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-10 h-5 bg-[#D6B38D]/60 rounded-sm shadow-sm" />

                  {/* Insight content */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-pixel text-lg text-[#411E03]">{insight.title}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-pixel text-[#846851]">
                          {insight.shared ? "Shared" : "Private"}
                        </span>
                        <Switch
                          checked={insight.shared}
                          onCheckedChange={() => toggleShared(insight.id)}
                          className="data-[state=checked]:bg-[#94AA78] data-[state=unchecked]:bg-[#846851]/40"
                        />
                      </div>
                    </div>

                    <p className="font-serif text-[#411E03]/80 leading-relaxed">
                      {insight.content}
                    </p>
                  </div>

                  {/* Hand-drawn underline for private items */}
                  {!insight.shared && (
                    <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-[#846851]/30"
                      style={{
                        clipPath: "polygon(0 0, 100% 20%, 98% 100%, 2% 80%)"
                      }}
                    />
                  )}
                </PaperContainer>
              </motion.div>
            ))}

            {/* Session Summary */}
            {sessionSummary && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: insights.length * 0.1 }}
              >
                <PaperContainer className="p-6 relative bg-[#D6B38D]/30 border-2 border-[#D6B38D]/50">
                  <h3 className="font-pixel text-lg text-[#411E03] mb-4">Session Summary</h3>

                  {sessionSummary.key_observations && sessionSummary.key_observations.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-pixel text-sm text-[#846851] mb-2">Key Observations</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {sessionSummary.key_observations.map((obs: string, i: number) => (
                          <li key={i} className="font-serif text-sm text-[#411E03]">{obs}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {sessionSummary.recurring_themes && sessionSummary.recurring_themes.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-pixel text-sm text-[#846851] mb-2">Recurring Themes</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {sessionSummary.recurring_themes.map((theme: string, i: number) => (
                          <li key={i} className="font-serif text-sm text-[#411E03]">{theme}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {sessionSummary.writing_patterns && sessionSummary.writing_patterns.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-pixel text-sm text-[#846851] mb-2">Writing Patterns</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {sessionSummary.writing_patterns.map((pattern: string, i: number) => (
                          <li key={i} className="font-serif text-sm text-[#411E03]">{pattern}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <p className="font-serif text-[#411E03] mt-4">{sessionSummary.summary_text}</p>
                </PaperContainer>
              </motion.div>
            )}

            {/* Follow-up recommendation */}
            {followUpRecommended && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: insights.length * 0.1 }}
              >
                <PaperContainer className="p-6 relative bg-[#94AA78]/20 border-2 border-[#94AA78]/40">
                  <div className="text-center">
                    <h3 className="font-pixel text-lg text-[#411E03] mb-2">Continue?</h3>
                    <p className="font-serif text-[#846851] mb-4">
                      {continuationPrompt || "Want to write a bit more about that?"}
                    </p>
                    <button
                      onClick={() => {
                        eventTracker.track("follow_up_clicked", { page: "reflections" });
                        navigate("/write");
                      }}
                      className="px-6 py-2 bg-[#94AA78]/40 rounded-md font-serif text-[#411E03] hover:bg-[#94AA78]/60 transition-colors"
                    >
                      Follow up
                    </button>
                  </div>
                </PaperContainer>
              </motion.div>
            )}
          </div>
        )}

        {/* Raw entries view (after Send) */}
        {showRawEntries && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 space-y-4 relative z-10"
          >
            <h2 className="font-pixel text-2xl text-[#411E03] mb-4">Your Journal Entries</h2>
            {storageService.getEntries().length === 0 ? (
              <p className="font-serif text-[#846851] italic">No entries yet.</p>
            ) : (
              storageService.getEntries()
                .sort((a, b) => b.timestamp - a.timestamp)
                .map((entry) => (
                  <PaperContainer key={entry.id} className="p-4 bg-[#D7CDC1]/80">
                    <p className="text-xs font-pixel text-[#846851] mb-2">
                      {format(new Date(entry.timestamp), "MMMM d, yyyy 'at' h:mm a")}
                    </p>
                    <p className="font-serif text-[#411E03] whitespace-pre-wrap">
                      {entry.content}
                    </p>
                  </PaperContainer>
                ))
            )}
          </motion.div>
        )}

        {/* Info note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 p-4 bg-[#D7CDC1]/50 rounded-lg relative z-10"
        >
          <p className="font-serif text-sm text-[#846851] text-center italic">
            These patterns are observations, not diagnoses.
            Share what feels right with your therapist.
          </p>
        </motion.div>

        {/* Action buttons */}
        {!showRawEntries && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 flex justify-center gap-4 relative z-10"
          >
            {insights.length > 0 && (
              <button
                onClick={handleSend}
                className="flex items-center gap-2 px-8 py-3 bg-[#94AA78] text-[#411E03] rounded-lg font-serif hover:bg-[#94AA78]/80 transition-colors shadow-md"
              >
                <Send className="w-5 h-5" />
                <span>Send</span>
              </button>
            )}
            <button
              onClick={handleEndSession}
              className="flex items-center gap-2 px-8 py-3 bg-[#D6B38D] text-[#411E03] rounded-lg font-serif hover:bg-[#D6B38D]/80 transition-colors shadow-md"
            >
              <span>End Session</span>
            </button>
          </motion.div>
        )}
      </div>
    </Layout>
  );
};

export default Analysis;