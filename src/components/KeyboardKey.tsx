import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface KeyboardKeyProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  active?: boolean;
  size?: "sm" | "md" | "lg";
}

const KeyboardKey = ({ 
  children, 
  onClick, 
  className,
  active = false,
  size = "md"
}: KeyboardKeyProps) => {
  const sizeClasses = {
    sm: "w-10 h-10 text-lg",
    md: "w-12 h-12 text-xl",
    lg: "w-14 h-14 text-2xl",
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "keyboard-key flex items-center justify-center font-pixel transition-all",
        sizeClasses[size],
        active && "bg-primary text-primary-foreground",
        className
      )}
    >
      {children}
    </button>
  );
};

export default KeyboardKey;
