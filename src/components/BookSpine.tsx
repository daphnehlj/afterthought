import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface BookSpineProps {
  title: string;
  color?: "sage" | "olive" | "cream" | "checked";
  onClick?: () => void;
  className?: string;
}

const colorVariants = {
  sage: "bg-gradient-to-r from-primary/90 via-primary to-primary/80",
  olive: "bg-gradient-to-r from-green-700/90 via-green-600 to-green-700/80",
  cream: "bg-gradient-to-r from-secondary via-accent to-secondary",
  checked: "bg-[repeating-conic-gradient(hsl(var(--muted))_0%_25%,hsl(var(--background))_0%_50%)] bg-[length:16px_16px]",
};

const BookSpine = ({ 
  title, 
  color = "sage", 
  onClick,
  className 
}: BookSpineProps) => {
  return (
    <motion.button
      whileHover={{ y: -8, rotateZ: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "relative h-48 w-14 rounded-sm cursor-pointer",
        "shadow-lg transition-shadow hover:shadow-xl",
        colorVariants[color],
        color !== "checked" && color !== "cream" && "text-primary-foreground",
        color === "cream" && "text-foreground",
        color === "checked" && "text-foreground border border-border",
        className
      )}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <span 
          className="font-serif text-sm font-medium tracking-wide"
          style={{ 
            writingMode: "vertical-rl", 
            textOrientation: "mixed",
            transform: "rotate(180deg)"
          }}
        >
          {title}
        </span>
      </div>
      {/* Spine highlight */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/20 rounded-l-sm" />
      {/* Spine shadow */}
      <div className="absolute right-0 top-0 bottom-0 w-2 bg-black/10 rounded-r-sm" />
    </motion.button>
  );
};

export default BookSpine;
