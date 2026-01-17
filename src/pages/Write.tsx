import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, Sparkles, Check } from "lucide-react";
import Layout from "@/components/Layout";
import DatePill from "@/components/DatePill";
import JournalTextarea from "@/components/JournalTextarea";
import KeyboardKey from "@/components/KeyboardKey";
import { toast } from "sonner";

const Write = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const prompt = location.state?.prompt;
  const mood = location.state?.mood;

  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!content.trim()) {
      toast.error("Write something first...");
      return;
    }

    setIsSaving(true);
    // Simulate saving - would integrate with database
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsSaving(false);
    toast.success("Entry saved ✨");
    navigate("/history");
  };

  const pageIndicator = "3/3"; // Would be dynamic based on journal entries

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

        {/* Writing area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <JournalTextarea
            value={content}
            onChange={setContent}
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
