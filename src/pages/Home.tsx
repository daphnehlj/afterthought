import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import MoodSelector from "@/components/MoodSelector";
import Bookshelf from "@/components/Bookshelf";
import { eventTracker } from "@/lib/eventTracking";
import { storageService } from "@/lib/storage";
import { behavioralAnalytics } from "@/lib/behavioralAnalytics";
import { geminiService } from "@/lib/gemini";
import { format } from "date-fns";

function useTypewriter(text: string, speed = 220, startDelay = 1000) {
  const [shown, setShown] = useState("");

  useEffect(() => {
    let i = 0;
    let cancelled = false;

    setShown("");

    const start = window.setTimeout(() => {
      const tick = () => {
        if (cancelled) return;
        i += 1;
        setShown(text.slice(0, i));
        if (i < text.length) window.setTimeout(tick, speed);
      };
      tick();
    }, startDelay);

    return () => {
      cancelled = true;
      window.clearTimeout(start);
    };
  }, [text, speed, startDelay]);

  return shown;
}

const BlinkingCursor = ({ className = "" }: { className?: string }) => (
  <span
    className={`inline-block align-baseline ${className}`}
    style={{ animation: "blink 1s steps(1) infinite" }}
    aria-hidden="true"
  >
    |
    <style>{`
      @keyframes blink { 50% { opacity: 0; } }
    `}</style>
  </span>
);

const Home = () => {
  const navigate = useNavigate();
  const [selectedMood, setSelectedMood] = useState<string>();
  const [dailyPrompt, setDailyPrompt] = useState<string | null>(null);
  const [promptLoading, setPromptLoading] = useState(false);

  useEffect(() => {
    const today = format(new Date(), "yyyy-MM-dd");
    const todayMood = storageService.getMoodByDate(today);
    if (todayMood) {
      setSelectedMood(todayMood);
    }
  }, []);

  useEffect(() => {
    const loadPrompt = async () => {
      const settings = storageService.getSettings();

      if (!settings.dailyPrompts) {
        setDailyPrompt("How are you feeling today?");
        eventTracker.track("prompt_viewed", { page: "home" });
        return;
      }

      setPromptLoading(true);
      eventTracker.track("prompt_viewed", { page: "home" });

      try {
        const entries = storageService.getEntries();
        const recentEntries = entries.slice(-5);
        const allContent = recentEntries.map((e) => e.content).join(" ");

        const datePatterns = [
          /(?:tomorrow|next week|next month|on \w+day|this \w+day)/gi,
          /(?:interview|exam|meeting|appointment|deadline)/gi,
        ];
        const hasUpcomingEvents = datePatterns.some((pattern) =>
          pattern.test(allContent)
        );

        const behaviorSummary = behavioralAnalytics.aggregate();
        const recentEntry = behavioralAnalytics.getRecentEntryExcerpt();

        const enhancedSummary = {
          ...behaviorSummary,
          has_upcoming_events: hasUpcomingEvents,
          recent_content_themes: allContent.slice(-500),
        };

        const prompt = await geminiService.generatePrompt(
          enhancedSummary,
          recentEntry
        );
        setDailyPrompt(prompt);
      } catch (error) {
        console.error("Failed to generate prompt:", error);
        setDailyPrompt("What's been on your mind lately?");
      } finally {
        setPromptLoading(false);
      }
    };

    loadPrompt();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const fullGreeting = `${getGreeting()},`;
  const typedGreeting = useTypewriter(fullGreeting, 220, 1000);

  const spaceIndex = typedGreeting.indexOf(" ");
  const typedGood =
    spaceIndex === -1 ? typedGreeting : typedGreeting.slice(0, spaceIndex);
  const typedRest =
    spaceIndex === -1 ? "" : typedGreeting.slice(spaceIndex + 1);

  const isTyping = typedGreeting.length < fullGreeting.length;
  const isTypingFirstWord = isTyping && spaceIndex === -1;

  const [showEndCursor, setShowEndCursor] = useState(false);

  useEffect(() => {
    if (!isTyping && typedGreeting.length === fullGreeting.length) {
      setShowEndCursor(true);
      const t = window.setTimeout(() => setShowEndCursor(false), 2000);
      return () => window.clearTimeout(t);
    }
    if (isTyping) setShowEndCursor(false);
  }, [isTyping, typedGreeting, fullGreeting]);

  const handleMoodSelect = (mood: string) => {
    setSelectedMood(mood);
    const today = format(new Date(), "yyyy-MM-dd");
    storageService.saveMood(today, mood);
    eventTracker.track("mood_selected", {
      page: "home",
      mood_icon: mood,
    });
  };

  const handleStartJournal = () => {
    navigate("/prompt", { state: { mood: selectedMood, prompt: dailyPrompt } });
  };

  return (
    <Layout>
      <div className="min-h-screen px-4 py-8 md:px-8 relative">
        <div className="absolute top-4 right-10 z-30">
          <img
            src="/assets/logo.png"
            alt="Afterthought logo"
            className="
              w-[10vw] max-w-[140px] min-w-[72px] h-auto opacity-95
              transition-transform duration-300 ease-out
              hover:-rotate-6 hover:-translate-y-1
            "
          />
        </div>


        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-12 -left-4 w-16 h-5 bg-[#D6B38D]/35 rotate-[25deg]" />
          <div className="absolute top-32 right-2 w-10 h-4 bg-[#D6B38D]/30 -rotate-12" />
          <div className="absolute bottom-48 left-6 w-8 h-8 rounded-full bg-[#94AA78]/15 border border-[#94AA78]/20" />
          <div className="absolute top-64 right-8 w-6 h-6 bg-[#8A895F]/10 rotate-45" />
        </div>

        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 relative z-10"
        >
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-6xl md:text-8xl font-pixel leading-none text-[#411E03]">
                {typedGood}
                {isTypingFirstWord && <BlinkingCursor className="ml-1" />}
              </h1>

              <h1 className="text-6xl md:text-8xl font-serif italic leading-none -mt-1 text-[#411E03]">
                {typedRest}
                {(isTyping && !isTypingFirstWord) || showEndCursor ? (
                  <BlinkingCursor className="ml-1" />
                ) : null}
              </h1>
            </div>
          </div>

          {typedGreeting.length === fullGreeting.length && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-block mt-12 px-4 py-1 bg-[#D6B38D]/40 rounded-md"
            >
              <span className="font-serif italic text-6xl text-[#411E03]">
                Daphne
              </span>
            </motion.div>
          )}
        </motion.header>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="flex justify-end mb-6"
        >
          <div className="bg-[#94AA78]/80 text-[#411E03] px-4 py-2 rounded-2xl rounded-br-sm shadow-md">
            {promptLoading ? (
              <span className="font-pixel text-xl">{">^..^<"}</span>
            ) : dailyPrompt ? (
              <span className="font-pixel text-xl">{dailyPrompt}</span>
            ) : (
              <span className="font-pixel text-sm">
                A quiet day for reflection
              </span>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <MoodSelector selectedMood={selectedMood} onSelectMood={handleMoodSelect} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-16 w-full"
        >
          <div className="relative w-full origin-top scale-[1.25]">
            <Bookshelf />

            <div className="absolute inset-0 pointer-events-none">
              <div className="flex items-end justify-center h-full px-4">
                <div className="pointer-events-auto -translate-y-28 -translate-x-[250px]">
                  <button
                    onClick={handleStartJournal}
                    className="w-[260px] p-5 bg-[#D7CDC1] border-2 border-dashed border-[#846851]/50 shadow-md transition-transform duration-200 rotate-2 hover:rotate-3"
                  >
                    <p className="font-pixel text-xl text-center text-[#411E03]">
                      Today&apos;s
                      <br />
                      thoughts...
                    </p>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Home;
