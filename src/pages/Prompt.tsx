import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, Sparkles } from "lucide-react";
import Layout from "@/components/Layout";
import DatePill from "@/components/DatePill";
import PromptCard from "@/components/PromptCard";
import Bookshelf from "@/components/Bookshelf";
import { eventTracker } from "@/lib/eventTracking";
import { storageService } from "@/lib/storage";

// Sample prompts - would be AI-generated based on journal history
const samplePrompts = [
  "Who has made you laugh recently? What did they do to make you laugh?",
  "What's one small thing that brought you comfort today?",
  "Is there something you've been avoiding thinking about?",
  "Describe a moment from this week that surprised you.",
  "What would you tell your past self from a month ago?",
];

const Prompt = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const mood = location.state?.mood;
  const promptFromHome = location.state?.prompt;

  const [currentPrompt] = useState(
    promptFromHome || samplePrompts[Math.floor(Math.random() * samplePrompts.length)]
  );
  const [promptId] = useState(`prompt_${Date.now()}`);

  useEffect(() => {
    eventTracker.track("prompt_viewed", {
      page: "home",
      prompt_id: promptId,
    });
  }, [promptId]);

  const handleContinue = () => {
    navigate("/write", { state: { prompt: currentPrompt, mood, promptId } });
  };

  const handleSkip = () => {
    eventTracker.track("prompt_skipped", {
      page: "home",
      prompt_id: promptId,
    });
    navigate("/write", { state: { mood } });
  };

  return (
    <Layout>
      <div className="min-h-screen px-4 py-6 md:px-8">
        {/* Top navigation */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <button
            onClick={() => navigate(-1)}
            className="text-foreground/60 hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>

          <DatePill />

          <button className="text-foreground/60 hover:text-foreground transition-colors">
            <Sparkles className="w-6 h-6" />
          </button>
        </motion.div>

        {/* Paper background container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="paper-grid p-6 md:p-8 mb-8"
        >
          <PromptCard
            prompt={currentPrompt}
            onContinue={handleContinue}
            onSkip={handleSkip}
          />
        </motion.div>

        {/* Bookshelf */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Bookshelf />
        </motion.div>
      </div>
    </Layout>
  );
};

export default Prompt;
