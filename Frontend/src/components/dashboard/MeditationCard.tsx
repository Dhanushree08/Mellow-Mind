import { Play, Clock, Pause } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import meditationImg from "@/assets/meditation-hero.jpg";

const MeditationCard = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const { toast } = useToast();

  const handlePlayPause = () => {
    if (!isPlaying) {
      toast({
        title: "Meditation started 🧘‍♀️",
        description: "Close your eyes, relax your shoulders, and breathe deeply...",
      });
    } else {
      toast({
        title: "Meditation paused",
        description: "Take your time. You can resume whenever you feel ready.",
      });
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className="wellness-card relative overflow-hidden h-full"
    >
      <div className="relative rounded-xl overflow-hidden mb-3 aspect-[4/3]">
        <img src={meditationImg} alt="Meditation" className="w-full h-full object-cover" />
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-card/80 backdrop-blur-sm rounded-full px-2.5 py-1">
          <div className="w-6 h-6 rounded-full bg-wellness-green-light flex items-center justify-center">
            <span className="text-xs">🧘</span>
          </div>
        </div>
        <div className="absolute top-3 right-3 wellness-badge bg-card/80 backdrop-blur-sm">
          <Clock className="w-3 h-3" /> 8 min
        </div>
        <button
          onClick={handlePlayPause}
          className="absolute inset-0 flex items-center justify-center"
        >
          <motion.div
            whileTap={{ scale: 0.9 }}
            className="w-12 h-12 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center shadow-lg"
          >
            <AnimatePresence mode="wait">
              {isPlaying ? (
                <motion.div key="pause" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                  <Pause className="w-5 h-5 text-foreground" fill="currentColor" />
                </motion.div>
              ) : (
                <motion.div key="play" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                  <Play className="w-5 h-5 text-foreground ml-0.5" fill="none" />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </button>
      </div>
      <h3 className="font-semibold text-foreground text-sm">Calm the Racing Mind</h3>
      <p className="text-xs text-muted-foreground mt-1">
        Immerse yourself in peace and harmony with this short meditation.
      </p>
    </motion.div>
  );
};

export default MeditationCard;
