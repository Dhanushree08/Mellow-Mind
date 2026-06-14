import { motion } from "framer-motion";

const intakeItems = ["🍎", "🥗", "🍳", "🥑", "🍌", "🥤", "🍵", "🥜"];
const mentalItems = ["🧘", "📖", "🎵", "🌿", "💆", "🎨", "✍️", "🌙"];

const IntakeSection = () => (
  <div className="grid grid-cols-2 gap-3">
    <div className="wellness-card">
      <h4 className="text-sm font-semibold text-foreground mb-1">Intake</h4>
      <p className="text-xs text-muted-foreground mb-3">Deep Talk</p>
      <div className="grid grid-cols-4 gap-2">
        {intakeItems.map((emoji, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-sm hover:bg-wellness-green-light transition-colors"
          >
            {emoji}
          </motion.button>
        ))}
      </div>
    </div>
    <div className="wellness-card">
      <h4 className="text-sm font-semibold text-foreground mb-1">Mental Effect</h4>
      <p className="text-xs text-wellness-green mb-3">Very High</p>
      <div className="grid grid-cols-4 gap-2">
        {mentalItems.map((emoji, i) => (
          <motion.button
            key={i}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-sm hover:bg-wellness-yellow-light transition-colors"
          >
            {emoji}
          </motion.button>
        ))}
      </div>
    </div>
  </div>
);

export default IntakeSection;
