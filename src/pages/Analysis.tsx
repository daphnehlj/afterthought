import { useState } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import PaperContainer from "@/components/PaperContainer";
import { Switch } from "@/components/ui/switch";

// Sample insights - would be AI-generated based on journal analysis
const initialInsights = [
  {
    id: 1,
    title: "Sleep patterns",
    content: "You've mentioned feeling tired in 4 entries this week, often on mornings after late nights.",
    shared: false,
  },
  {
    id: 2,
    title: "Recurring topic",
    content: "Work deadlines have come up in 6 recent entries. There might be something worth exploring there.",
    shared: false,
  },
  {
    id: 3,
    title: "Positive moments",
    content: "Conversations with Sarah seem to lift your mood — she appears in 3 of your happiest entries.",
    shared: false,
  },
  {
    id: 4,
    title: "Timing patterns",
    content: "Your most reflective entries tend to happen on Sunday evenings.",
    shared: false,
  },
];

const Analysis = () => {
  const [insights, setInsights] = useState(initialInsights);

  const toggleShared = (id: number) => {
    setInsights(prev => 
      prev.map(insight => 
        insight.id === id ? { ...insight, shared: !insight.shared } : insight
      )
    );
  };

  return (
    <Layout>
      <div className="min-h-screen px-4 py-6 md:px-8 relative">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Tape decoration top-left */}
          <div className="absolute top-20 -left-2 w-16 h-6 bg-[#D6B38D]/40 rotate-45 shadow-sm" />
          {/* Sticker decoration */}
          <div className="absolute top-40 right-4 w-8 h-8 rounded-full bg-[#94AA78]/20 border border-[#94AA78]/30" />
          {/* Paper texture overlay */}
          <div className="absolute bottom-32 left-8 w-12 h-12 bg-[#D7CDC1]/30 rotate-12" />
          {/* Small tape */}
          <div className="absolute bottom-48 right-12 w-10 h-4 bg-[#D6B38D]/30 -rotate-12" />
        </div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 relative z-10"
        >
          <h1 className="text-4xl md:text-5xl font-pixel mb-2 text-[#411E03]">Reflections</h1>
          <p className="font-serif italic text-[#846851]">
            Patterns noticed across your entries
          </p>
        </motion.div>

        {/* Scrapbook-style layout */}
        <div className="space-y-6 relative z-10">
          {insights.map((insight, index) => (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, y: 20, rotate: index % 2 === 0 ? -1 : 1 }}
              animate={{ opacity: 1, y: 0, rotate: index % 2 === 0 ? -0.5 : 0.5 }}
              transition={{ delay: index * 0.1 }}
            >
              <PaperContainer className="p-6 relative bg-[#D7CDC1]/80">
                {/* Tape decoration */}
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-10 h-5 bg-[#D6B38D]/60 rounded-sm shadow-sm" />
                
                {/* Insight content */}
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-pixel text-lg text-[#411E03]">{insight.title}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-pixel text-[#846851]">
                        {insight.shared ? "Shared" : "Private"}
                      </span>
                      <Switch 
                        checked={insight.shared}
                        onCheckedChange={() => toggleShared(insight.id)}
                        className="data-[state=checked]:bg-[#94AA78] data-[state=unchecked]:bg-[#846851]/40"
                      />
                    </div>
                  </div>
                  
                  <p className="font-serif text-[#411E03]/80 leading-relaxed">
                    {insight.content}
                  </p>
                </div>

                {/* Hand-drawn underline for private items */}
                {!insight.shared && (
                  <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-[#846851]/30" 
                       style={{ 
                         clipPath: "polygon(0 0, 100% 20%, 98% 100%, 2% 80%)" 
                       }} 
                  />
                )}
              </PaperContainer>
            </motion.div>
          ))}
        </div>

        {/* Info note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 p-4 bg-[#D7CDC1]/50 rounded-lg relative z-10"
        >
          <p className="font-serif text-sm text-[#846851] text-center italic">
            These patterns are observations, not diagnoses. 
            Share what feels right with your therapist.
          </p>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Analysis;