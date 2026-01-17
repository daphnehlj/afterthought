import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Layout from "@/components/Layout";
import PaperContainer from "@/components/PaperContainer";
import KeyboardKey from "@/components/KeyboardKey";
import { Switch } from "@/components/ui/switch";
import { Plus, Check } from "lucide-react";
import { storageService, UserSettings } from "@/lib/storage";
import { eventTracker } from "@/lib/eventTracking";

const Profile = () => {
  const [settings, setSettings] = useState<UserSettings>({
    dailyPrompts: true,
    shareWithTherapist: false,
    voiceInput: true,
    dailyReminder: false,
  });

  useEffect(() => {
    // Load settings from storage
    const savedSettings = storageService.getSettings();
    setSettings(savedSettings);
  }, []);

  const toggleSetting = (key: keyof UserSettings) => {
    const updated = { ...settings, [key]: !settings[key] };
    setSettings(updated);
    storageService.saveSettings(updated);

    eventTracker.track("setting_changed", {
      page: "profile",
      setting: key,
      value: updated[key],
    });
  };

  return (
    <Layout>
      <div className="min-h-screen px-4 py-6 md:px-8 relative">
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-24 -right-2 w-12 h-5 bg-[#D6B38D]/35 rotate-[-15deg]" />
          <div className="absolute top-48 left-2 w-5 h-5 rounded-full bg-[#8A895F]/15" />
          <div className="absolute bottom-60 right-8 w-8 h-3 bg-[#D6B38D]/25 rotate-6" />
        </div>

        {/* Header with decoration */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 relative z-10"
        >
          <div className="flex items-start gap-4">
            <h1 className="text-4xl md:text-5xl font-serif text-[#411E03]">Profile</h1>
            <span className="text-2xl animate-gentle-bounce">٩(ˊᗜˋ*)و</span>
          </div>
        </motion.div>

        {/* Settings section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative z-10"
        >
          <h2 className="font-pixel text-2xl md:text-3xl mb-6 text-[#411E03]">
            Settings<br />
            & Privacy
          </h2>

          <PaperContainer className="divide-y divide-[#846851]/20 overflow-hidden bg-[#D7CDC1]/80">
            {/* AI Prompts */}
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="font-serif font-medium text-[#411E03]">Daily prompts</p>
                <p className="text-sm text-[#846851] font-serif">
                  Receive gentle writing suggestions
                </p>
              </div>
              <Switch
                checked={settings.dailyPrompts}
                onCheckedChange={() => toggleSetting('dailyPrompts')}
                className="data-[state=checked]:bg-[#94AA78] data-[state=unchecked]:bg-[#846851]/40"
              />
            </div>

            {/* Therapist sharing */}
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="font-serif font-medium text-[#411E03]">Therapist access</p>
                <p className="text-sm text-[#846851] font-serif">
                  Share selected insights with your therapist
                </p>
              </div>
              <Switch
                checked={settings.shareWithTherapist}
                onCheckedChange={() => toggleSetting('shareWithTherapist')}
                className="data-[state=checked]:bg-[#94AA78] data-[state=unchecked]:bg-[#846851]/40"
              />
            </div>

            {/* Voice input */}
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="font-serif font-medium text-[#411E03]">Voice journaling</p>
                <p className="text-sm text-[#846851] font-serif">
                  Enable voice-to-text for entries
                </p>
              </div>
              <Switch
                checked={settings.voiceInput}
                onCheckedChange={() => toggleSetting('voiceInput')}
                className="data-[state=checked]:bg-[#94AA78] data-[state=unchecked]:bg-[#846851]/40"
              />
            </div>

            {/* Daily reminder */}
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="font-serif font-medium text-[#411E03]">Daily reminder</p>
                <p className="text-sm text-[#846851] font-serif">
                  Gentle nudge to write each day
                </p>
              </div>
              <Switch
                checked={settings.dailyReminder}
                onCheckedChange={() => toggleSetting('dailyReminder')}
                className="data-[state=checked]:bg-[#94AA78] data-[state=unchecked]:bg-[#846851]/40"
              />
            </div>
          </PaperContainer>
        </motion.div>

        {/* Therapist connection section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 relative z-10"
        >
          <h3 className="font-pixel text-xl mb-4 text-[#411E03]">Therapist connection</h3>

          <PaperContainer className="p-6 text-center bg-[#D7CDC1]/80">
            <p className="font-serif text-[#846851] mb-4">
              Connect with your therapist to share selected insights from your journal.
            </p>
            <button className="px-8 py-3 rounded-full border border-[#846851]/40 bg-transparent font-serif text-lg text-[#411E03] hover:bg-[#D6B38D]/30 transition-colors inline-flex items-center gap-2">
              <span>Invite therapist</span>
            </button>
          </PaperContainer>
        </motion.div>

        {/* Privacy note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 p-4 bg-[#D7CDC1]/50 rounded-lg relative z-10"
        >
          <p className="font-serif text-sm text-[#846851] text-center">
            Your entries are private by default. You choose what to share.
          </p>
        </motion.div>

        {/* Decorative kaomoji */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.4, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="fixed bottom-28 right-4 font-pixel text-3xl text-[#846851]"
        >
          (=^･ω･^=)
        </motion.div>

        {/* Action buttons */}
        {/* <div className="fixed bottom-28 left-4 right-4 flex justify-between pointer-events-none z-50">
          <KeyboardKey size="lg" className="pointer-events-auto">
            <Plus className="w-5 h-5" />
          </KeyboardKey>
          <KeyboardKey size="lg" className="pointer-events-auto">
            <Check className="w-5 h-5" />
          </KeyboardKey>
        </div> */}
      </div>
    </Layout>
  );
};

export default Profile;