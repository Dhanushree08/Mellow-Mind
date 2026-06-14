import { Moon, Target, CheckCircle, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

const sleepData = [
  { icon: Target, label: "8h Target", sub: "Sleep Goal", color: "text-wellness-green" },
  { icon: CheckCircle, label: "6.5h Achieved", sub: "Last Night", color: "text-wellness-yellow" },
  { icon: AlertTriangle, label: "1.5h Missing", sub: "Deficit", color: "text-wellness-orange" },
];

const days = ["Mon", "Tue", "Wed", "Thr", "Fri", "Sat", "Sun"];
const emojis = ["😤", "😊", "😔", "😴", "😊", "😤", "😌"];

const EmotionalCheckins = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2 }}
    className="wellness-card"
  >
    <h3 className="font-semibold text-foreground text-sm mb-4">Emotional Check-ins</h3>
    <div className="space-y-3 mb-5">
      {sleepData.map(({ icon: Icon, label, sub, color }) => (
        <div key={label} className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full bg-muted flex items-center justify-center`}>
            <Icon className={`w-4 h-4 ${color}`} />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{label}</p>
            <p className="text-xs text-muted-foreground">{sub}</p>
          </div>
        </div>
      ))}
    </div>
    <div className="flex items-end justify-between gap-1">
      {days.map((day, i) => (
        <div key={day} className="flex flex-col items-center gap-1">
          <span className="text-lg">{emojis[i]}</span>
          <span className="text-[10px] text-muted-foreground">{day}</span>
        </div>
      ))}
    </div>
  </motion.div>
);

export default EmotionalCheckins;
