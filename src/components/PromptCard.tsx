import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface PromptCardProps {
  prompt: string;
  onContinue: () => void;
  onSkip: () => void;
}

const PromptCard = ({ prompt, onContinue, onSkip }: PromptCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Decorative emojis */}
      <div className="flex items-start gap-4">
        <h2 className="font-pixel text-3xl md:text-4xl leading-tight">
          Prompt<br />
          <span className="italic font-serif text-2xl md:text-3xl">of the day</span>
        </h2>
        <div className="flex gap-2">
          <span className="text-4xl">₍^. .^₎Ⳋ</span>
        </div>
      </div>

      {/* Prompt text */}
      <p className="font-serif text-lg md:text-xl text-foreground/80 leading-relaxed">
        {prompt}
      </p>

      {/* Action buttons */}
      <div className="space-y-3">
        <button
          onClick={onContinue}
          className="w-full pill-button flex items-center justify-between group"
        >
          <span className="text-muted-foreground group-hover:text-foreground transition-colors">
            Continue
          </span>
          <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
        </button>

        <button
          onClick={onSkip}
          className="w-full pill-button flex items-center justify-between group"
        >
          <span className="text-muted-foreground group-hover:text-foreground transition-colors">
            Skip
          </span>
          <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
        </button>
      </div>
    </motion.div>
  );
};

export default PromptCard;
