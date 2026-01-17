import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const moods = [
  { emoji: "(¬`‸´¬)", label: "Frustrated" },
  { emoji: "(っ◞‸◟ c)", label: "Sad" },
  { emoji: "(੭ ;´ - `;)੭", label: "Tired" },
  { emoji: "(•_•)", label: "Neutral" },
  { emoji: "( - ‿-)", label: "Happy" },
  { emoji: "٩(ˊᗜˋ*)و", label: "Great" },
];

interface MoodSelectorProps {
  selectedMood?: string;
  onSelectMood: (mood: string) => void;
}

const MoodSelector = ({ selectedMood, onSelectMood }: MoodSelectorProps) => {
  return (
    <div className="paper-grid p-6 bg-[#D7CDC1]/70">
      <p className="font-serif italic text-lg mb-4 text-[#411E03]/80">Today's vibe</p>
      <div className="grid grid-cols-3 gap-2">
        {moods.map((mood, index) => (
          <motion.button
            key={mood.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSelectMood(mood.label)}
            className={cn(
              "w-16 h-14 flex items-center justify-center rounded-md transition-all",
              "border hover:scale-105",
              selectedMood === mood.label
                ? "border-[#94AA78] bg-[#94AA78]/20"
                : "border-transparent hover:border-[#846851]/30 hover:bg-[#D6B38D]/20"
            )}
            title={mood.label}
          >
            <span className="text-sm font-pixel leading-none">{mood.emoji}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default MoodSelector;
