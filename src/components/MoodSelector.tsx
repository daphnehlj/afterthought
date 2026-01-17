import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const moods = [
  { emoji: "😤", label: "Frustrated" },
  { emoji: "😢", label: "Sad" },
  { emoji: "😔", label: "Tired" },
  { emoji: "😐", label: "Neutral" },
  { emoji: "😊", label: "Happy" },
  { emoji: "😎", label: "Great" },
];

interface MoodSelectorProps {
  selectedMood?: string;
  onSelectMood: (mood: string) => void;
}

const MoodSelector = ({ selectedMood, onSelectMood }: MoodSelectorProps) => {
  return (
    <div className="paper-grid p-6">
      <p className="font-serif italic text-lg mb-4 text-foreground/80">Today's vibe</p>
      <div className="grid grid-cols-3 gap-3">
        {moods.map((mood, index) => (
          <motion.button
            key={mood.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSelectMood(mood.label)}
            className={cn(
              "w-16 h-16 flex items-center justify-center text-3xl rounded-lg transition-all",
              "border-2 hover:scale-110",
              selectedMood === mood.label
                ? "border-primary bg-primary/10"
                : "border-transparent hover:border-border"
            )}
            title={mood.label}
          >
            <span className="hand-drawn-mood">{mood.emoji}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default MoodSelector;
