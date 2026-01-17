import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import MoodSelector from "@/components/MoodSelector";
import Bookshelf from "@/components/Bookshelf";
import KeyboardKey from "@/components/KeyboardKey";
import { Edit3 } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();
  const [selectedMood, setSelectedMood] = useState<string>();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const handleStartJournal = () => {
    navigate("/prompt", { state: { mood: selectedMood } });
  };

  return (
    <Layout>
      <div className="min-h-screen px-4 py-8 md:px-8">
        {/* Header with greeting */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-5xl md:text-7xl font-pixel leading-tight">
                Good
              </h1>
              <h1 className="text-5xl md:text-7xl font-serif italic leading-tight -mt-2">
                {getGreeting().split(" ")[1]}
              </h1>
            </div>
            <KeyboardKey size="lg" className="mt-2">
              <span className="text-xs font-pixel">Home</span>
            </KeyboardKey>
          </div>

          {/* Username tag */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-block mt-4 px-4 py-1 bg-secondary rounded-md"
          >
            <span className="font-serif italic text-lg">friend</span>
          </motion.div>
        </motion.header>

        {/* Weather/info bubble */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="flex justify-end mb-6"
        >
          <div className="bg-primary text-primary-foreground px-4 py-2 rounded-2xl rounded-br-sm shadow-md">
            <span className="font-pixel text-sm">☁️ A quiet day for reflection</span>
          </div>
        </motion.div>

        {/* Mood selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <MoodSelector 
            selectedMood={selectedMood} 
            onSelectMood={setSelectedMood} 
          />
        </motion.div>

        {/* Stamp-style journal prompt */}
        <motion.div
          initial={{ opacity: 0, rotate: 2 }}
          animate={{ opacity: 1, rotate: 1 }}
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <button
            onClick={handleStartJournal}
            className="w-full max-w-sm mx-auto block p-6 bg-amber-50 border-4 border-dashed border-secondary shadow-md transform rotate-1 hover:rotate-0 transition-transform"
          >
            <p className="font-pixel text-xl text-center text-foreground">
              i want to write<br />
              about...
            </p>
          </button>
        </motion.div>

        {/* Quick write button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="fixed left-4 bottom-28 z-40"
        >
          <KeyboardKey size="lg" onClick={handleStartJournal}>
            <Edit3 className="w-5 h-5" />
          </KeyboardKey>
        </motion.div>

        {/* Bookshelf */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Bookshelf />
        </motion.div>
      </div>
    </Layout>
  );
};

export default Home;
