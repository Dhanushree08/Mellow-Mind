import { Heart, Pause, Play } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const tracks = [
  { title: "Daily Motivation", author: "Valeria Luxor", duration: "3:20/10:12", color: "bg-wellness-green-light" },
  { title: "Book Reading Secrets", author: "Valeria Luxor", duration: "3:20/10:12", color: "bg-wellness-yellow-light" },
  { title: "Physical Exercises is Must Have", author: "Valeria Luxor", duration: "3:20/10:12", color: "bg-wellness-pink" },
];

const SavedFavorites = () => {
  const [playing, setPlaying] = useState<number | null>(null);
  const { toast } = useToast();

  const handlePlay = (index: number, track: any) => {
    if (playing === index) {
      setPlaying(null);
      toast({
        title: "Track paused",
        description: "Your session is paused.",
      });
    } else {
      setPlaying(index);
      toast({
        title: "Now playing 🎧",
        description: `${track.title} by ${track.author}. Get comfortable!`,
      });
    }
  };

  return (
    <div className="wellness-card">
      <div className="flex items-center gap-2 mb-4">
        <Heart className="w-4 h-4 text-wellness-pink-strong" fill="currentColor" />
        <h3 className="font-semibold text-foreground text-sm">Saved & Favorites</h3>
      </div>
      <div className="space-y-3">
        {tracks.map((track, i) => (
          <motion.div
            key={track.title}
            whileHover={{ x: 4 }}
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => handlePlay(i, track)}
          >
            <div className={`w-10 h-10 rounded-full ${track.color} flex items-center justify-center`}>
              <span className="text-sm">🎧</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{track.title}</p>
              <p className="text-xs text-muted-foreground">{track.author}</p>
            </div>
            <span className="text-xs text-muted-foreground mr-2">{track.duration}</span>
            <button className="w-8 h-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all">
              <AnimatePresence mode="wait">
                {playing === i ? (
                  <motion.div key="pause" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                    <Pause className="w-3 h-3" />
                  </motion.div>
                ) : (
                  <motion.div key="play" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                    <Play className="w-3 h-3 ml-0.5" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default SavedFavorites;
