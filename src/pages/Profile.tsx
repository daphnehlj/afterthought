import { useState } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import PaperContainer from "@/components/PaperContainer";
import KeyboardKey from "@/components/KeyboardKey";
import { Switch } from "@/components/ui/switch";
import { Plus, Check, Crown } from "lucide-react";

const Profile = () => {
  const [settings, setSettings] = useState({
    aiPrompts: true,
    shareWithTherapist: false,
    voiceInput: true,
    dailyReminder: false,
  });

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Layout>
      <div className="min-h-screen px-4 py-6 md:px-8">
        {/* Header with decoration */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 relative"
        >
          <div className="flex items-start gap-4">
            <h1 className="text-4xl md:text-5xl font-serif">Profile</h1>
            <Crown className="w-8 h-8 text-amber-600 animate-gentle-bounce" />
          </div>
        </motion.div>

        {/* Settings section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="font-pixel text-2xl md:text-3xl mb-6">
            Settings<br />
            &Privacy
          </h2>

          <PaperContainer className="divide-y divide-border overflow-hidden">
            {/* AI Prompts */}
            <div className="p-4 flex items-center justify-between bg-card/80">
              <div>
                <p className="font-serif font-medium text-foreground">Daily prompts</p>
                <p className="text-sm text-muted-foreground font-serif">
                  Receive gentle writing suggestions
                </p>
              </div>
              <Switch 
                checked={settings.aiPrompts}
                onCheckedChange={() => toggleSetting('aiPrompts')}
              />
            </div>

            {/* Therapist sharing */}
            <div className="p-4 flex items-center justify-between bg-card/80">
              <div>
                <p className="font-serif font-medium text-foreground">Therapist access</p>
                <p className="text-sm text-muted-foreground font-serif">
                  Share selected insights with your therapist
                </p>
              </div>
              <Switch 
                checked={settings.shareWithTherapist}
                onCheckedChange={() => toggleSetting('shareWithTherapist')}
              />
            </div>

            {/* Voice input */}
            <div className="p-4 flex items-center justify-between bg-card/80">
              <div>
                <p className="font-serif font-medium text-foreground">Voice journaling</p>
                <p className="text-sm text-muted-foreground font-serif">
                  Enable voice-to-text for entries
                </p>
              </div>
              <Switch 
                checked={settings.voiceInput}
                onCheckedChange={() => toggleSetting('voiceInput')}
              />
            </div>

            {/* Daily reminder */}
            <div className="p-4 flex items-center justify-between bg-card/80">
              <div>
                <p className="font-serif font-medium text-foreground">Daily reminder</p>
                <p className="text-sm text-muted-foreground font-serif">
                  Gentle nudge to write each day
                </p>
              </div>
              <Switch 
                checked={settings.dailyReminder}
                onCheckedChange={() => toggleSetting('dailyReminder')}
              />
            </div>
          </PaperContainer>
        </motion.div>

        {/* Therapist connection section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8"
        >
          <h3 className="font-pixel text-xl mb-4">Therapist connection</h3>
          
          <PaperContainer className="p-6 text-center">
            <p className="font-serif text-muted-foreground mb-4">
              Connect with your therapist to share selected insights from your journal.
            </p>
            <button className="pill-button inline-flex items-center gap-2">
              <span>Invite therapist</span>
            </button>
          </PaperContainer>
        </motion.div>

        {/* Privacy note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 p-4 bg-secondary/50 rounded-lg"
        >
          <p className="font-serif text-sm text-muted-foreground text-center">
            Your entries are private by default. You choose what to share.
          </p>
        </motion.div>

        {/* Decorative cat illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="fixed bottom-28 right-4 text-6xl"
          style={{ filter: "grayscale(100%)" }}
        >
          🐱
        </motion.div>

        {/* Action buttons */}
        <div className="fixed bottom-28 left-4 right-4 flex justify-between pointer-events-none">
          <KeyboardKey size="lg" className="pointer-events-auto">
            <Plus className="w-5 h-5" />
          </KeyboardKey>
          <KeyboardKey size="lg" className="pointer-events-auto">
            <Check className="w-5 h-5" />
          </KeyboardKey>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
