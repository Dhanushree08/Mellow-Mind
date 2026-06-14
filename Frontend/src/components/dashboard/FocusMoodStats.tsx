import { motion } from "framer-motion";
import { Brain, Plus } from "lucide-react";

const FocusMoodStats = () => (
  <div className="flex gap-3">
    <motion.div whileHover={{ scale: 1.03 }} className="flex-1 wellness-card flex items-center gap-3">
      <div className="relative w-14 h-14">
        <svg className="w-14 h-14 -rotate-90" viewBox="0 0 56 56">
          <circle cx="28" cy="28" r="24" fill="none" stroke="hsl(var(--border))" strokeWidth="4" />
          <circle cx="28" cy="28" r="24" fill="none" stroke="hsl(var(--wellness-green))" strokeWidth="4" strokeDasharray={2 * Math.PI * 24} strokeDashoffset={2 * Math.PI * 24 * 0.3} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Brain className="w-4 h-4 text-wellness-green" />
        </div>
      </div>
      <div>
        <p className="text-xs text-muted-foreground">Focus Time</p>
        <p className="text-lg font-bold text-foreground">2h 15m</p>
      </div>
    </motion.div>

    <motion.div whileHover={{ scale: 1.03 }} className="flex-1 wellness-card flex items-center gap-3">
      <div className="w-14 h-14 rounded-full bg-wellness-yellow-light flex items-center justify-center text-2xl">
        😊
      </div>
      <div>
        <p className="text-xs text-muted-foreground">Mood Level</p>
        <p className="text-lg font-bold text-foreground">7/10</p>
      </div>
    </motion.div>

    <motion.div whileHover={{ scale: 1.03 }} className="w-12 h-full wellness-card flex items-center justify-center cursor-pointer">
      <Plus className="w-5 h-5 text-muted-foreground" />
    </motion.div>
  </div>
);

export default FocusMoodStats;
