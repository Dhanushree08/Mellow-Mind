import { useDashboard } from "@/context/DashboardContext";
import { motion } from "framer-motion";
import { Music } from "lucide-react";

const emotionPlaylists = {
  happy: [
    { type: "spotify", url: "https://open.spotify.com/embed/playlist/37i9dQZF1DXdPec7aLTmlC?utm_source=generator" },
  ],
  sad: [
    { type: "spotify", url: "https://open.spotify.com/embed/playlist/37i9dQZF1DX7qK8ma5wgG1?utm_source=generator" },
  ],
  anxious: [
    { type: "spotify", url: "https://open.spotify.com/embed/playlist/37i9dQZF1DWZqd5JICZI0u?utm_source=generator" },
  ],
  angry: [
    { type: "spotify", url: "https://open.spotify.com/embed/playlist/37i9dQZF1DX1tyCD9QhIWF?utm_source=generator" },
  ],
  lonely: [
    { type: "spotify", url: "https://open.spotify.com/embed/playlist/37i9dQZF1DWSqBruwvlecg?utm_source=generator" },
  ],
  neutral: [
    { type: "spotify", url: "https://open.spotify.com/embed/playlist/37i9dQZF1DWTvNyxOwkztu?utm_source=generator" },
  ]
};

const MusicRecommendations = () => {
  const { emotion } = useDashboard();
  const tracks = emotionPlaylists[emotion as keyof typeof emotionPlaylists] || emotionPlaylists.neutral;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
         <Music size={16} className="text-pink-600 animate-bounce" />
         <h3 className="text-xs font-bold uppercase tracking-[0.1em] text-pink-700">Vibe Radio</h3>
      </div>

      <div className="space-y-3">
        {tracks.map((track, i) => (
          <motion.div
            key={track.url}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full rounded-2xl overflow-hidden shadow-md bg-white border border-purple-100"
          >
            <iframe 
              style={{ borderRadius: '1rem' }} 
              src={track.url} 
              width="100%" 
              height="80" 
              frameBorder="0" 
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
              loading="lazy"
            ></iframe>
          </motion.div>
        ))}
        <p className="text-xs text-center text-indigo-950/70 font-semibold uppercase tracking-wider pt-2">
           Curated for your current mood
        </p>
      </div>
    </div>
  );
};

export default MusicRecommendations;
