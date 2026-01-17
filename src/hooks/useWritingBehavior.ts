/**
 * Hook to track writing behavior: keystrokes, backspaces, pauses, etc.
 */

import { useEffect, useRef, useState } from "react";
import { eventTracker } from "@/lib/eventTracking";

export interface WritingBehavior {
  keystrokes: number;
  backspaces: number;
  pauses: number[];
  sessionStart: number;
  lastKeyTime: number;
}

export function useWritingBehavior() {
  const [behavior, setBehavior] = useState<WritingBehavior>({
    keystrokes: 0,
    backspaces: 0,
    pauses: [],
    sessionStart: Date.now(),
    lastKeyTime: Date.now(),
  });

  const behaviorRef = useRef(behavior);
  behaviorRef.current = behavior;

  const pauseThreshold = 2000; // 2 seconds
  const pauseCheckInterval = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Track entry started
    eventTracker.track("journal_entry_started", { page: "writing" });

    // Check for pauses periodically
    pauseCheckInterval.current = setInterval(() => {
      const now = Date.now();
      const timeSinceLastKey = now - behaviorRef.current.lastKeyTime;
      
      if (timeSinceLastKey >= pauseThreshold && behaviorRef.current.lastKeyTime > 0) {
        const pauseDuration = timeSinceLastKey;
        setBehavior(prev => ({
          ...prev,
          pauses: [...prev.pauses, pauseDuration],
        }));
        
        // Log long pauses
        if (pauseDuration > 10000) {
          console.log(`[BEHAVIOR] Long pause detected (${Math.round(pauseDuration / 1000)}s mid-sentence)`);
        }
      }
    }, 1000);

    return () => {
      if (pauseCheckInterval.current) {
        clearInterval(pauseCheckInterval.current);
      }
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const now = Date.now();
    const timeSinceLastKey = now - behaviorRef.current.lastKeyTime;

    // Detect pause before this keystroke
    if (timeSinceLastKey >= pauseThreshold && behaviorRef.current.lastKeyTime > 0) {
      setBehavior(prev => ({
        ...prev,
        pauses: [...prev.pauses, timeSinceLastKey],
      }));
    }

    // Track backspace
    if (e.key === "Backspace" || e.key === "Delete") {
      setBehavior(prev => ({
        ...prev,
        backspaces: prev.backspaces + 1,
        lastKeyTime: now,
      }));
    } else if (e.key.length === 1) {
      // Regular character
      setBehavior(prev => ({
        ...prev,
        keystrokes: prev.keystrokes + 1,
        lastKeyTime: now,
      }));
    }
  };

  const detectAbruptEnd = (content: string): boolean => {
    if (!content.trim()) return false;
    
    // Check for trailing ellipsis or incomplete sentences
    const trimmed = content.trim();
    const endsWithEllipsis = trimmed.endsWith("...");
    const endsWithDash = trimmed.endsWith("—") || trimmed.endsWith("-");
    const lastSentence = trimmed.split(/[.!?]/).pop() || "";
    const isVeryShort = lastSentence.length < 10 && trimmed.length > 50;
    
    return endsWithEllipsis || endsWithDash || isVeryShort;
  };

  const getFinalBehavior = (content: string) => {
    const sessionDuration = Date.now() - behaviorRef.current.sessionStart;
    const abruptEnd = detectAbruptEnd(content);

    // Log high backspace rate
    if (behaviorRef.current.backspaces > 30 && sessionDuration < 120000) {
      console.log(`[BEHAVIOR] High backspace rate detected (${behaviorRef.current.backspaces} deletions in ${Math.round(sessionDuration / 1000)}s)`);
    }

    return {
      sessionDuration,
      keystrokes: behaviorRef.current.keystrokes,
      backspaces: behaviorRef.current.backspaces,
      pauses: behaviorRef.current.pauses,
      abruptEnd,
    };
  };

  return {
    behavior,
    handleKeyDown,
    getFinalBehavior,
  };
}

