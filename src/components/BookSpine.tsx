import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface BookSpineProps {
  title: string;
  color?: "sage" | "olive" | "cream" | "checked" | "analysis";
  onClick?: () => void;
  className?: string;
  slant?: "left" | "none";
}

const colorVariants = {
  sage: "bg-gradient-to-r from-[#8A895F] via-[#94AA78] to-[#8A895F]",
  olive: "bg-gradient-to-r from-[#846851]/80 via-[#846851] to-[#846851]/80",
  cream: "bg-gradient-to-r from-[#D7CDC1] via-[#D6B38D]/50 to-[#D7CDC1]",
  checked: "bg-[repeating-conic-gradient(hsl(var(--muted))_0%_25%,hsl(var(--background))_0%_50%)] bg-[length:16px_16px]",
  analysis: "bg-gradient-to-r from-[#94AA78]/70 via-[#8A895F]/60 to-[#94AA78]/70",
};

const BookSpine = ({ 
  title, 
  color = "sage", 
  onClick,
  className,
  slant = "none"
}: BookSpineProps) => {
  return (
    <motion.button
      whileHover={{ y: -8, rotateZ: slant === "left" ? -5 : -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      style={{ transform: slant === "left" ? "rotate(-4deg)" : undefined }}
      className={cn(
        "relative h-48 w-14 rounded-[2px] cursor-pointer",
        "shadow-lg transition-shadow hover:shadow-xl",
        colorVariants[color],
        color === "sage" && "text-[#D7CDC1]",
        color === "olive" && "text-[#D7CDC1]",
        color === "analysis" && "text-[#411E03]",
        color === "cream" && "text-[#411E03]",
        color === "checked" && "text-[#411E03] border border-border",
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
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-white/15 rounded-l-[2px]" />
      {/* Spine shadow */}
      <div className="absolute right-0 top-0 bottom-0 w-2 bg-black/15 rounded-r-[2px]" />
    </motion.button>
  );
};

export default BookSpine;