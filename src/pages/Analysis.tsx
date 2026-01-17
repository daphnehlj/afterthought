import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import PaperContainer from "@/components/PaperContainer";

// Sample insights - would be AI-generated based on journal analysis
const sampleInsights = [
  {
    id: 1,
    title: "Sleep patterns",
    content: "You've mentioned feeling tired in 4 entries this week, often on mornings after late nights.",
    shared: true,
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
    shared: true,
  },
  {
    id: 4,
    title: "Timing patterns",
    content: "Your most reflective entries tend to happen on Sunday evenings.",
    shared: false,
  },
];

const Analysis = () => {
  return (
    <Layout>
      <div className="min-h-screen px-4 py-6 md:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-pixel mb-2">Reflections</h1>
          <p className="font-serif italic text-muted-foreground">
            Patterns noticed across your entries
          </p>
        </motion.div>

        {/* Scrapbook-style layout */}
        <div className="space-y-6">
          {sampleInsights.map((insight, index) => (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, y: 20, rotate: index % 2 === 0 ? -1 : 1 }}
              animate={{ opacity: 1, y: 0, rotate: index % 2 === 0 ? -0.5 : 0.5 }}
              transition={{ delay: index * 0.1 }}
            >
              <PaperContainer className="p-6 relative">
                {/* Pin/tape decoration */}
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-8 h-4 bg-amber-200/80 rounded-sm shadow-sm" />
                
                {/* Insight content */}
                <div className="pt-2">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-pixel text-lg">{insight.title}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full font-pixel ${
                      insight.shared 
                        ? "bg-primary/20 text-primary" 
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {insight.shared ? "Shared" : "Private"}
                    </span>
                  </div>
                  
                  <p className="font-serif text-foreground/80 leading-relaxed">
                    {insight.content}
                  </p>
                </div>

                {/* Hand-drawn underline decoration */}
                {!insight.shared && (
                  <div className="absolute bottom-0 left-4 right-4 h-0.5 bg-destructive/30" 
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
          className="mt-8 p-4 bg-secondary/50 rounded-lg"
        >
          <p className="font-serif text-sm text-muted-foreground text-center italic">
            These patterns are observations, not diagnoses. 
            Share what feels right with your therapist.
          </p>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Analysis;
