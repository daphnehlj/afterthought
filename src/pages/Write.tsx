import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, Sparkles, Check } from "lucide-react";
import Layout from "@/components/Layout";
import DatePill from "@/components/DatePill";
import JournalTextarea from "@/components/JournalTextarea";
import KeyboardKey from "@/components/KeyboardKey";
import PaperContainer from "@/components/PaperContainer";
import { toast } from "sonner";
import { eventTracker } from "@/lib/eventTracking";
import { storageService, JournalEntry } from "@/lib/storage";
import { useWritingBehavior } from "@/hooks/useWritingBehavior";
import { geminiService } from "@/lib/gemini";
import { format } from "date-fns";
import { useEffect, useRef } from "react";

const Write = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const prompt = location.state?.prompt;
  const mood = location.state?.mood;
  const promptId = location.state?.promptId;

  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [livePrompt, setLivePrompt] = useState<string | null>(null);
  const [showLivePrompt, setShowLivePrompt] = useState(false);
  const { handleKeyDown, getFinalBehavior, behavior } = useWritingBehavior();

  const promptDebounceRef = useRef<NodeJS.Timeout>();
  const lastPromptTimeRef = useRef<number>(0);

  useEffect(() => {
    // Generate live prompt when user shows hesitation
    const checkForHesitation = async () => {
      if (content.length < 50) return; // Need some content first

      const now = Date.now();
      if (now - lastPromptTimeRef.current < 30000) return; // Don't prompt too frequently

      const behaviorData = getFinalBehavior(content);
      const longPauses = behaviorData.pauses.filter(p => p > 5000).length;
      const backspaceRate = behaviorData.backspaces / Math.max(behaviorData.keystrokes, 1);

      // Show prompt if hesitation detected
      if (longPauses > 2 || backspaceRate > 0.3 || content.trim().endsWith("...")) {
        try {
          const currentBehavior = {
            keystrokes: behavior.keystrokes,
            backspaces: behavior.backspaces,
            pauses: behavior.pauses,
            sessionDuration: Date.now() - behavior.sessionStart,
          };
          const prompt = await geminiService.generateLivePrompt(content, currentBehavior);
          setLivePrompt(prompt);
          setShowLivePrompt(true);
          lastPromptTimeRef.current = now;
        } catch (error) {
          console.error("Failed to generate live prompt:", error);
        }
      }
    };

    // Debounce prompt generation
    if (promptDebounceRef.current) {
      clearTimeout(promptDebounceRef.current);
    }

    promptDebounceRef.current = setTimeout(() => {
      checkForHesitation();
    }, 5000); // Check after 5 seconds of inactivity

    return () => {
      if (promptDebounceRef.current) {
        clearTimeout(promptDebounceRef.current);
      }
    };
  }, [content, behavior, getFinalBehavior]);

  const handleContentChange = (value: string) => {
    setContent(value);
    // Hide prompt when user continues writing
    if (showLivePrompt && value.length > content.length) {
      setShowLivePrompt(false);
    }
  };

  const handleSave = async () => {
    if (!content.trim()) {
      toast.error("Write something first...");
      return;
    }

    setIsSaving(true);

    try {
      const behavioralData = getFinalBehavior(content);
      const today = format(new Date(), "yyyy-MM-dd");

      const entry: JournalEntry = {
        id: `entry_${Date.now()}`,
        content: content.trim(),
        timestamp: Date.now(),
        date: today,
        mood,
        prompt,
        behavioralData,
      };

      storageService.saveEntry(entry);

      eventTracker.track("journal_entry_submitted", {
        page: "writing",
        entry_length: content.length,
        entry_abrupt_end: behavioralData.abruptEnd,
        keystrokes: behavioralData.keystrokes,
        backspaces: behavioralData.backspaces,
        duration_ms: behavioralData.sessionDuration,
        prompt_id: promptId,
      });

      await new Promise(resolve => setTimeout(resolve, 800));
      setIsSaving(false);
      toast.success("Entry saved ✨");
      navigate("/history");
    } catch (error) {
      console.error("Failed to save entry:", error);
      setIsSaving(false);
      toast.error("Failed to save entry");
    }
  };

  const handleAbandon = () => {
    if (content.trim().length > 0) {
      const behavioralData = getFinalBehavior(content);
      eventTracker.track("journal_entry_abandoned", {
        page: "writing",
        entry_length: content.length,
        duration_ms: behavioralData.sessionDuration,
      });
    }
  };

  // Calculate page indicator based on today's entries
  const today = format(new Date(), "yyyy-MM-dd");
  const todayEntries = storageService.getEntriesByDate(today);
  const pageIndicator = `${todayEntries.length + 1}/${todayEntries.length + 1}`;

  return (
    <Layout showNav={false}>
      <div className="min-h-screen px-4 py-6 md:px-8">
        {/* Top navigation */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <button
            onClick={() => {
              handleAbandon();
              navigate(-1);
            }}
            className="text-foreground/60 hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>

          <DatePill />

          <button className="text-foreground/60 hover:text-foreground transition-colors">
            <Sparkles className="w-6 h-6" />
          </button>
        </motion.div>

        {/* Page indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center mb-4"
        >
          <div className="px-6 py-1 rounded-full border border-border bg-background">
            <span className="font-pixel text-sm text-muted-foreground">
              {pageIndicator}
            </span>
          </div>
        </motion.div>

        {/* Live prompt during writing */}
        {showLivePrompt && livePrompt && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 relative z-10"
          >
            <PaperContainer className="p-4 bg-[#94AA78]/20 border border-[#94AA78]/40">
              <p className="font-serif text-sm text-[#411E03] mb-2">{livePrompt}</p>
              <button
                onClick={() => setShowLivePrompt(false)}
                className="text-xs font-pixel text-[#846851] hover:text-[#411E03]"
              >
                Dismiss
              </button>
            </PaperContainer>
          </motion.div>
        )}

        {/* Writing area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <JournalTextarea
            value={content}
            onChange={handleContentChange}
            onKeyDown={handleKeyDown}
            prompt={prompt}
            mood={mood}
          />
        </motion.div>

        {/* Save button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <KeyboardKey
            size="lg"
            onClick={handleSave}
            className={isSaving ? "animate-pulse" : ""}
          >
            <Check className="w-5 h-5" />
          </KeyboardKey>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Write;
