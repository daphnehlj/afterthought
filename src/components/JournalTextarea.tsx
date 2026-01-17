import { useState, useRef, useEffect } from "react";
import { Mic, MicOff } from "lucide-react";
import KeyboardKey from "./KeyboardKey";

interface JournalTextareaProps {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  prompt?: string;
  date?: Date;
  mood?: string;
}

const JournalTextarea = ({
  value,
  onChange,
  onKeyDown,
  prompt,
  date = new Date(),
  mood
}: JournalTextareaProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  const formatDate = (d: Date) => {
    const months = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];
    const day = d.getDate();
    const suffix = day === 1 ? "st" : day === 2 ? "nd" : day === 3 ? "rd" : "th";
    return `${months[d.getMonth()]} ${day}${suffix}`;
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // Voice recording would be implemented with ElevenLabs here
  };

  return (
    <div className="paper-grid min-h-[60vh] p-6 relative">
      {/* Header with date and mood */}
      <div className="flex items-start justify-between mb-6">
        <p className="font-serif italic text-xl text-foreground/70">
          {formatDate(date)}
        </p>
        {mood && (
          <span className="text-3xl">{
            mood === "Frustrated" ? "😤" :
              mood === "Sad" ? "😢" :
                mood === "Tired" ? "😔" :
                  mood === "Neutral" ? "😐" :
                    mood === "Happy" ? "😊" :
                      mood === "Great" ? "😎" : "😐"
          }</span>
        )}
      </div>

      {/* Prompt if present */}
      {prompt && (
        <p className="font-serif text-muted-foreground mb-4 italic">
          "{prompt}"
        </p>
      )}

      {/* Writing area */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="What's on your mind today..."
        className="w-full min-h-[200px] bg-transparent resize-none focus:outline-none font-serif text-lg leading-relaxed placeholder:text-muted-foreground/50"
      />


      {/* Continue indicator */}
      {value.length > 0 && value.endsWith("...") && (
        <button className="absolute bottom-4 right-4 text-sm text-primary hover:underline font-serif italic">
          Continue?
        </button>
      )}
    </div>
  );
};

export default JournalTextarea;
