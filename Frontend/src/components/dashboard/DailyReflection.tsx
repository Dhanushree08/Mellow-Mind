import { useState } from "react";
import { motion } from "framer-motion";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const moods = [
  { emoji: "😊", label: "Happy" },
  { emoji: "😌", label: "Calm" },
  { emoji: "😤", label: "Angry" },
  { emoji: "😔", label: "Sad" },
  { emoji: "😴", label: "Tired" },
  { emoji: "🤩", label: "Excited" },
];

const moodPositions = [
  { label: "GOOD", angle: -60 },
  { label: "SHED", angle: -120 },
  { label: "STRESSED", angle: 0 },
  { label: "ANGRY", angle: 60 },
];

const DailyReflection = () => {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const { toast } = useToast();

  return (
    <div className="wellness-card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-foreground text-sm">Journal</h3>
          <p className="text-xs text-muted-foreground">What is your mood today?</p>
        </div>
        <button 
          onClick={() => toast({ title: "Journal opened", description: "Take a deep breath and let it out. 🌿" })}
          className="p-2 rounded-lg bg-muted text-muted-foreground hover:text-foreground transition-colors"
        >
          <MessageSquare className="w-4 h-4" />
        </button>
      </div>

      {/* Mood emojis selection */}
      <div className="flex justify-between mb-6">
        {moods.map((mood) => (
          <motion.button
            key={mood.label}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setSelectedMood(mood.label)}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors ${
              selectedMood === mood.label ? "bg-wellness-green-light" : "hover:bg-muted"
            }`}
          >
            <span className="text-2xl">{mood.emoji}</span>
            <span className="text-[10px] text-muted-foreground">{mood.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Mood wheel */}
      <div className="relative w-48 h-48 mx-auto mb-6">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          {/* Outer ring segments */}
          <circle cx="100" cy="100" r="85" fill="none" stroke="hsl(var(--wellness-green-light))" strokeWidth="20" strokeDasharray="80 450" strokeDashoffset="-40" />
          <circle cx="100" cy="100" r="85" fill="none" stroke="hsl(var(--wellness-yellow-light))" strokeWidth="20" strokeDasharray="80 450" strokeDashoffset="-170" />
          <circle cx="100" cy="100" r="85" fill="none" stroke="hsl(var(--wellness-pink))" strokeWidth="20" strokeDasharray="80 450" strokeDashoffset="-300" />
          <circle cx="100" cy="100" r="85" fill="none" stroke="hsl(var(--border))" strokeWidth="20" strokeDasharray="80 450" strokeDashoffset="-430" />
          {/* Center */}
          <circle cx="100" cy="100" r="50" fill="hsl(var(--card))" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Mood</p>
            <p className="text-sm font-bold text-foreground">{selectedMood || "GOOD"}</p>
          </div>
        </div>
        {moodPositions.map(({ label, angle }) => {
          const rad = (angle * Math.PI) / 180;
          const x = 50 + 48 * Math.cos(rad);
          const y = 50 + 48 * Math.sin(rad);
          return (
            <span
              key={label}
              className="absolute text-[9px] font-semibold text-muted-foreground"
              style={{ left: `${x}%`, top: `${y}%`, transform: "translate(-50%, -50%)" }}
            >
              {label}
            </span>
          );
        })}
      </div>

      <Button
        onClick={() => {
          if (selectedMood) {
            toast({
              title: "Mood gently noted 📝",
              description: `You're feeling ${selectedMood}. That's perfectly okay. ✨`,
            });
          } else {
            toast({
              title: "Hold on... 🌸",
              description: "Please select a mood to save your reflection.",
            });
          }
        }}
        className="w-full h-11 rounded-xl bg-gradient-to-r from-wellness-pink to-wellness-pink-strong text-card-foreground font-semibold shadow-sm hover:shadow-md transition-shadow"
      >
        Save Mood 📝
      </Button>
    </div>
  );
};

export default DailyReflection;
