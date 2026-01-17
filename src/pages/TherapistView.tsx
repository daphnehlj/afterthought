import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import PaperContainer from "@/components/PaperContainer";
import { format } from "date-fns";

// Sample data for therapist view - only shared insights
const sharedInsights = [
  {
    id: 1,
    date: "2026-01-15",
    title: "Sleep patterns",
    content: "Client mentioned feeling tired in 4 entries this week, often on mornings after late nights.",
    category: "Behavioral",
  },
  {
    id: 2,
    date: "2026-01-14",
    title: "Positive relationships",
    content: "Conversations with Sarah seem to lift their mood — she appears in 3 of their happiest entries.",
    category: "Social",
  },
];

const excludedTopics = [
  "Work stress",
  "Family dynamics",
];

const TherapistView = () => {
  return (
    <Layout showNav={false}>
      <div className="min-h-screen px-4 py-6 md:px-8 bg-background">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-pixel">Therapist View</h1>
            <span className="px-3 py-1 bg-muted rounded-full text-sm font-pixel">
              Read only
            </span>
          </div>
          <p className="font-serif text-muted-foreground">
            Client's shared journal insights • Last updated {format(new Date(), "MMM d, yyyy")}
          </p>
        </motion.div>

        {/* Shared insights */}
        <div className="space-y-4 mb-8">
          <h2 className="font-pixel text-xl">Shared Insights</h2>
          
          {sharedInsights.map((insight, index) => (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <PaperContainer className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs font-pixel text-muted-foreground">
                    {format(new Date(insight.date), "MMMM d, yyyy")}
                  </span>
                  <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded font-pixel">
                    {insight.category}
                  </span>
                </div>
                <h3 className="font-serif font-medium mb-2">{insight.title}</h3>
                <p className="font-serif text-foreground/80 text-sm leading-relaxed">
                  {insight.content}
                </p>
              </PaperContainer>
            </motion.div>
          ))}
        </div>

        {/* Excluded topics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="font-pixel text-xl mb-4">Excluded from sharing</h2>
          <p className="font-serif text-sm text-muted-foreground mb-4">
            The client has chosen not to share insights about these topics.
          </p>
          
          <div className="flex flex-wrap gap-2">
            {excludedTopics.map((topic) => (
              <span
                key={topic}
                className="px-3 py-1 bg-muted font-serif text-sm text-muted-foreground relative"
              >
                {topic}
                {/* Red underline indicator */}
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-destructive" />
              </span>
            ))}
          </div>
        </motion.div>

        {/* Footer note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-12 pt-6 border-t border-border"
        >
          <p className="font-serif text-xs text-muted-foreground text-center">
            This view contains only insights the client has explicitly chosen to share.
            Respect their privacy and autonomy in the therapeutic relationship.
          </p>
        </motion.div>
      </div>
    </Layout>
  );
};

export default TherapistView;
