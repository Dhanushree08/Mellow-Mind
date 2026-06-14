import { motion } from "framer-motion";
import { Sparkles, Quote } from "lucide-react";
import { useDashboard } from "@/context/DashboardContext";

const emotionAffirmations: Record<string, string[]> = {
  crisis: [
    "You are safe right now. Just breathe.",
    "The world is better with you in it.",
    "This feeling is temporary. You will get through this.",
    "Reach out. You don't have to do this alone."
  ],
  anxious: [
    "You are capable of handling whatever comes your way.",
    "One breath at a time. You're doing great.",
    "Protect your peace. It's your power.",
    "Slow down. You have enough time."
  ],
  sad: [
    "It's okay to not be okay. Be gentle with yourself.",
    "Small progress is still progress. You're moving forward.",
    "You are worthy of love and happiness, exactly as you are.",
    "Healing isn't linear, and that's perfectly fine."
  ],
  happy: [
    "You are radiant. Keep shining, bestie!",
    "Your potential is limitless. Slay the day!",
    "Celebrate how far you've come. You earned this.",
    "Spread the vibe. You're a light in this world."
  ],
  neutral: [
    "You are enough, exactly as you are.",
    "Today is a fresh start. Make it yours.",
    "Focus on the good, and the good gets better.",
    "You've got this! ✨"
  ]
};

const DailyAffirmation = () => {
  const { emotion } = useDashboard();
  const list = emotionAffirmations[emotion as keyof typeof emotionAffirmations] || emotionAffirmations.neutral;
  // Use a simple hash or just random if we don't have a stable index
  const affirmation = list[Math.floor(Math.random() * list.length)];

  const isCrisis = emotion === "crisis";

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      className={`p-10 rounded-[2.5rem] shadow-xl relative overflow-hidden group transition-all duration-500 border-none ${
        isCrisis 
          ? "bg-gradient-to-br from-red-950 via-rose-950 to-black text-white shadow-red-900/20 animate-pulse" 
          : "bg-gradient-to-tr from-pink-500/10 via-purple-500/10 to-teal-500/10 border border-purple-500/20 shadow-indigo-500/5"
      }`}
    >
      <div className={`absolute top-6 right-6 transition-transform group-hover:scale-110 ${
        isCrisis ? "text-red-500/10" : "text-purple-500/10"
      }`}>
        <Quote size={60} />
      </div>
      
      <div className="flex items-center gap-3 mb-6">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          isCrisis ? "bg-red-500/20" : "bg-purple-500/20"
        }`}>
           <Sparkles className={`w-4 h-4 ${isCrisis ? "text-red-400" : "text-purple-500"}`} />
        </div>
        <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${
          isCrisis ? "text-red-400" : "text-purple-500"
        }`}>
          {isCrisis ? "Emergency Support" : "Daily Affirmation"}
        </span>
      </div>
      
      <p className={`text-3xl font-black leading-tight max-w-2xl ${
        isCrisis ? "text-red-300" : "text-foreground"
      }`}>
        "{affirmation}"
      </p>
    </motion.div>
  );
};

export default DailyAffirmation;
