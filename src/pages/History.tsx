import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Layout from "@/components/Layout";
import PaperContainer from "@/components/PaperContainer";
import { eventTracker } from "@/lib/eventTracking";
import { storageService } from "@/lib/storage";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isToday,
  addMonths,
  subMonths,
} from "date-fns";

// Helper to get mood emoji
const getMoodEmoji = (mood?: string): string => {
  if (!mood) return "";
  const moodMap: Record<string, string> = {
    "Frustrated": "(¬`‸´¬)",
    "Sad": "(っ◞‸◟ c)",
    "Tired": "(੭ ;´ - `;)੭",
    "Neutral": "( •_• )",
    "Happy": "( - ‿-)",
    "Great": "٩(ˊᗜˋ*)و",
  };
  return moodMap[mood] || "";
};

const History = () => {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Pad the beginning of the month
  const startDay = monthStart.getDay();
  const paddedDays = [...Array(startDay).fill(null), ...days];

  const handleDayClick = (date: Date) => {
    const dateKey = format(date, "yyyy-MM-dd");
    const entries = storageService.getEntriesByDate(dateKey);

    eventTracker.track("calendar_date_clicked", {
      page: "calendar",
      date: dateKey,
    });

    if (entries.length > 0) {
      eventTracker.track("entry_opened_from_calendar", {
        page: "calendar",
        date: dateKey,
      });
      // Navigate to view entries for this date
      navigate("/write", { state: { date, viewOnly: true, entries } });
    }
  };

  // Get entries for display
  const getEntriesForDate = (dateKey: string) => {
    return storageService.getEntriesByDate(dateKey);
  };

  // Get recent entries for preview
  const getRecentEntries = () => {
    const allEntries = storageService.getEntries();
    return allEntries
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 3);
  };

  return (
    <Layout>
      <div className="min-h-screen px-4 py-6 md:px-8 relative">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-16 right-2 w-8 h-3 bg-[#D6B38D]/30 rotate-12" />
          <div className="absolute bottom-40 left-4 w-6 h-6 rounded-full bg-[#94AA78]/15 border border-[#94AA78]/20" />
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 relative z-10"
        >
          <h1 className="text-4xl md:text-5xl font-pixel mb-2 text-[#411E03]">History</h1>
          <p className="font-serif italic text-[#846851]">
            Your journey, day by day
          </p>
        </motion.div>

        {/* Month navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-between mb-6 relative z-10"
        >
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 hover:bg-[#D7CDC1] rounded-lg transition-colors text-[#411E03]"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <h2 className="font-serif text-xl text-[#411E03]">
            {format(currentMonth, "MMMM yyyy")}
          </h2>

          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 hover:bg-[#D7CDC1] rounded-lg transition-colors text-[#411E03]"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </motion.div>

        {/* Calendar */}
        <PaperContainer className="p-4 md:p-6 bg-[#D7CDC1]/80 relative z-10">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div
                key={day}
                className="text-center text-xs font-pixel text-[#846851] py-2"
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1">
            {paddedDays.map((day, index) => {
              if (!day) {
                return <div key={`empty-${index}`} className="aspect-square" />;
              }

              const dateKey = format(day, "yyyy-MM-dd");
              const entries = getEntriesForDate(dateKey);
              const hasEntries = entries.length > 0;
              const mood = storageService.getMoodByDate(dateKey);
              const moodEmoji = getMoodEmoji(mood);
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isCurrentDay = isToday(day);

              return (
                <motion.button
                  key={dateKey}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.01 }}
                  onClick={() => handleDayClick(day)}
                  disabled={!hasEntries}
                  className={`
                    aspect-square rounded-lg flex flex-col items-center justify-center
                    text-sm transition-all relative
                    ${!isCurrentMonth ? "opacity-30" : ""}
                    ${isCurrentDay ? "ring-2 ring-[#94AA78]" : ""}
                    ${hasEntries ? "hover:bg-[#94AA78]/20 cursor-pointer" : "cursor-default"}
                  `}
                >
                  <span className={`font-pixel ${hasEntries ? "text-[#411E03]" : "text-[#846851]"}`}>
                    {format(day, "d")}
                  </span>
                  {moodEmoji && (
                    <span className="text-[10px] mt-0.5 font-pixel leading-none">{moodEmoji}</span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </PaperContainer>

        {/* Recent entries preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 space-y-4 relative z-10"
        >
          <h3 className="font-pixel text-xl mb-4 text-[#411E03]">Recent entries</h3>

          {getRecentEntries().length > 0 ? (
            getRecentEntries().map((entry, index) => {
              const moodEmoji = getMoodEmoji(entry.mood);
              const preview = entry.content.length > 50
                ? entry.content.substring(0, 50) + "..."
                : entry.content;

              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="p-4 paper-grid flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow bg-[#D7CDC1]/60"
                  onClick={() => navigate("/write", { state: { entry, viewOnly: true } })}
                >
                  {moodEmoji && <span className="text-sm font-pixel">{moodEmoji}</span>}
                  <div className="flex-1 min-w-0">
                    <p className="font-pixel text-sm text-[#846851]">
                      {format(new Date(entry.date), "MMMM d")}
                    </p>
                    <p className="font-serif text-[#411E03] truncate">
                      {preview}
                    </p>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <p className="font-serif text-[#846851] italic">No entries yet</p>
          )}
        </motion.div>
      </div>
    </Layout>
  );
};

export default History;