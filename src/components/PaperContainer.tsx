import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface PaperContainerProps {
  children: ReactNode;
  className?: string;
  withGrid?: boolean;
}

const PaperContainer = ({ 
  children, 
  className,
  withGrid = true 
}: PaperContainerProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={cn(
        "relative rounded-lg shadow-sm",
        withGrid ? "paper-grid" : "bg-card border border-border",
        className
      )}
    >
      {children}
    </motion.div>
  );
};

export default PaperContainer;
