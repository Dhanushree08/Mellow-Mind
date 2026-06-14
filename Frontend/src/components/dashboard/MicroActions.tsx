import { motion } from "framer-motion";
import { Wind, Droplets, Footprints, Smile } from "lucide-react";

const actions = [
  { icon: Wind, label: "Breathe", desc: "2 min exercise", color: "bg-wellness-green-light text-wellness-green" },
  { icon: Droplets, label: "Hydrate", desc: "Drink water", color: "bg-blue-50 text-blue-500 dark:bg-blue-900/30 dark:text-blue-300" },
  { icon: Footprints, label: "Walk", desc: "5 min break", color: "bg-wellness-yellow-light text-wellness-orange" },
  { icon: Smile, label: "Gratitude", desc: "Name 3 things", color: "bg-wellness-pink text-wellness-pink-strong" },
];

const MicroActions = () => (
  <div className="wellness-card">
    <h3 className="text-sm font-semibold text-foreground mb-1">Micro Actions</h3>
    <p className="text-xs text-muted-foreground mb-4">Quick wellness boosts</p>
    <div className="grid grid-cols-2 gap-2">
      {actions.map(({ icon: Icon, label, desc, color }, i) => (
        <motion.button
          key={label}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.08 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-3 p-3 rounded-xl bg-muted/30 hover:bg-muted/60 transition-colors text-left"
        >
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
            <Icon className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground">{label}</p>
            <p className="text-[10px] text-muted-foreground">{desc}</p>
          </div>
        </motion.button>
      ))}
    </div>
  </div>
);

export default MicroActions;
