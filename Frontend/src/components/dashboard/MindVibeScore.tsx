import { motion } from "framer-motion";
import { useDashboard } from "@/context/DashboardContext";

const MindVibeScore = () => {
  const { mindVibeScore, stress, energy, moodLabel, emotion } = useDashboard();

  const score = mindVibeScore || 0;
  const isCrisis = emotion === "crisis";

  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className={`rounded-[2.5rem] flex flex-col h-full min-h-[280px] p-6 justify-between transition-all duration-500 border border-purple-200/50 shadow-lg shadow-purple-500/5 ${
      isCrisis 
        ? "bg-gradient-to-br from-red-500/10 via-rose-500/10 to-red-100/30 text-indigo-950 animate-pulse border-red-200" 
        : "bg-gradient-to-br from-indigo-50/90 via-purple-50/80 to-pink-50/90 text-indigo-950"
    }`}>
      {/* Title */}
      <div className="shrink-0 mb-4">
        <h3 className={`text-xs font-black uppercase tracking-widest ${isCrisis ? "text-red-600" : "text-indigo-600"}`}>
          Mind Vibe
        </h3>
        <p className="text-lg font-bold text-indigo-950 mt-1">
          {isCrisis ? "Vibe Alert" : "Daily Sync"}
        </p>
      </div>

      {/* Circle + Stats Row */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-8 flex-1">
        {/* Circle */}
        <div className="relative w-32 h-32">
          <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
            <circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="currentColor"
              className={isCrisis ? "text-red-200" : "text-indigo-100"}
              strokeWidth="10"
            />
            <motion.circle
              cx="60"
              cy="60"
              r="54"
              fill="none"
              stroke="currentColor"
              className={isCrisis ? "text-red-500" : "text-indigo-600"}
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
          </svg>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.span
              className={`text-3xl font-black ${isCrisis ? "text-red-600 animate-pulse" : "text-indigo-950"}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {score}
            </motion.span>
            <span className={`text-xs font-bold uppercase tracking-wide ${isCrisis ? "text-red-500" : "text-indigo-600"}`}>
              {isCrisis ? "Urgent" : "Aura"}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-col gap-3 w-full sm:w-auto">
          {[
            { 
              label: "Stress", 
              value: isCrisis ? "Critical" : stress, 
              color: isCrisis || stress === "Cooked" ? "bg-destructive text-white shadow-lg shadow-destructive/20" : stress === "Mid" ? "bg-amber-500/10 text-amber-500" : "bg-wellness-green-light text-wellness-green" 
            },
            { 
              label: "Energy", 
              value: isCrisis ? "Low" : energy, 
              color: isCrisis ? "bg-muted text-muted-foreground" : energy === "Hype" ? "bg-primary/10 text-primary" : energy === "Zzz" ? "bg-wellness-blue-light text-wellness-blue" : "bg-emerald-500/10 text-emerald-500" 
            },
            { 
              label: "Mood", 
              value: isCrisis ? "Crisis" : moodLabel, 
              color: isCrisis ? "bg-destructive text-white" : "bg-wellness-pink-light text-wellness-pink" 
            },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex items-center justify-between sm:justify-start gap-4">
              <p className="text-xs font-semibold text-indigo-950/70 uppercase tracking-wider w-12">
                {label}
              </p>
              <span className={`px-3 py-1 rounded-full text-xs font-bold min-w-[60px] text-center transition-all ${color}`}>
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MindVibeScore;
