import { useState, useEffect } from "react";
import { CheckCircle2, ChevronDown, ChevronUp, Music, ExternalLink, Sparkles, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDashboard } from "@/context/DashboardContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

const activityDetails: Record<string, { description: string; steps: string[] }> = {
  "Crisis Lifeline: 988": {
    description: "Immediate professional support is available for you.",
    steps: ["Call 988 from your phone.", "Text HOME to 741741.", "Stay on the line with a trained counselor."]
  },
  "Emergency Services: 911": {
    description: "Call for immediate physical safety and help.",
    steps: ["Dial 911 immediately.", "State your location clearly.", "Explain your situation to the operator."]
  },
  "Deep breathing": {
    description: "Calm your nervous system immediately.",
    steps: ["Inhale deeply through your nose for 4 seconds.", "Hold your breath for 4 seconds.", "Exhale slowly through your mouth for 6 seconds."]
  },
  "Meditation": {
    description: "Quiet your mind and focus on the present.",
    steps: ["Find a comfortable seated position.", "Close your eyes.", "Focus entirely on the physical feeling of breathing."]
  }
};

const emotionPlaylists: Record<string, { name: string; link: string }[]> = {
  crisis: [
    { name: "Crisis Grounding", link: "https://open.spotify.com/playlist/37i9dQZF1DWZqd5JICZI0u" },
    { name: "Breathing Room", link: "https://open.spotify.com/playlist/37i9dQZF1DX4sWSp46o6pT" }
  ],
  anxious: [
    { name: "Anxiety Relief", link: "https://open.spotify.com/playlist/37i9dQZF1DX4sWSp46o6pT" },
    { name: "Focus & Clarity", link: "https://open.spotify.com/playlist/37i9dQZF1DX8Ueb9W7Y7hR" }
  ],
  sad: [
    { name: "Comfort Zone", link: "https://open.spotify.com/playlist/37i9dQZF1DX7qK8ma5wgG1" },
    { name: "Rainy Day", link: "https://open.spotify.com/playlist/37i9dQZF1DXbvAB4BhR7XG" }
  ],
  happy: [
    { name: "Feel Good Dinner", link: "https://open.spotify.com/playlist/37i9dQZF1DXdPec7aLTmlC" },
    { name: "Confidence Boost", link: "https://open.spotify.com/playlist/37i9dQZF1DX84S0hkOn97v" }
  ],
  neutral: [
    { name: "Lofi Chill Beats", link: "https://open.spotify.com/playlist/37i9dQZF1DWWQRvui9Df7X" },
    { name: "Morning Coffee", link: "https://open.spotify.com/playlist/37i9dQZF1DXaImfncB9G9S" }
  ]
};

const getDetails = (activity: string) => activityDetails[activity] || {
  description: "Take a moment to focus on yourself with this simple activity.",
  steps: ["Find a quiet, comfortable spot.", "Take your time.", "Reflect on how you feel afterwards."]
};

const ChatContextPanel = () => {
  const { activities, sessionId, completeActivity, moodLabel, emotion } = useDashboard();
  const { toast } = useToast();
  const [expanded, setExpanded] = useState<string | null>(null);
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  useEffect(() => {
    setCompleted(new Set());
    setExpanded(null);
  }, [sessionId]);

  const toggleComplete = (act: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (completed.has(act)) return;
    
    setCompleted(prev => new Set([...prev, act]));
    completeActivity(act);
    toast({
      title: "Activity Logged! 🌟",
      description: `You completed "${act}".`,
    });
  };

  const isCrisis = emotion?.toLowerCase() === "crisis";

  if (isCrisis) {
    return <div className="h-full w-full bg-transparent" />;
  }

  const playlists = isCrisis 
    ? [
        { name: "Deep Zen Calming", link: "https://open.spotify.com/playlist/37i9dQZF1DWZqd5JICZI0u" },
        { name: "Ocean Breath Grounding", link: "https://open.spotify.com/playlist/37i9dQZF1DX4sWSp46o6pT" }
      ]
    : emotionPlaylists[emotion?.toLowerCase() as keyof typeof emotionPlaylists] || emotionPlaylists.neutral;

  const displayActivities = isCrisis 
    ? ["Emergency Services: 911", "Crisis Lifeline: 988", "Deep breathing"]
    : activities.length > 0 ? activities : ["Deep breathing", "Meditation", "Unplug from socials"];

  return (
    <div className="h-full flex flex-col p-6 space-y-8 overflow-y-auto custom-scrollbar">
      {/* Personalized for you */}
      <section>
        <div className="flex items-center gap-2 mb-4">
           <Sparkles size={16} className={isCrisis ? "text-destructive" : "text-primary"} />
           <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] ${isCrisis ? "text-destructive" : "text-primary/60"}`}>
             Personalized for you
           </h3>
        </div>
              <div className="space-y-4">
           {isCrisis ? (
             <div className="p-5 rounded-[1.75rem] bg-red-500/10 border border-red-500/25 text-red-700 shadow-md shadow-red-500/5 space-y-3">
               <div className="flex items-center gap-2 font-black uppercase text-xs tracking-wider text-red-700">
                 <AlertTriangle size={16} />
                 <span>Safety Shield Active</span>
               </div>
               <p className="text-[10px] font-bold leading-relaxed text-red-800">
                 Standard task suggestions and daily exercises are temporarily locked. Please prioritize your peace and safety above all else.
               </p>
             </div>
           ) : (
             <AnimatePresence mode="popLayout">
                {displayActivities.map((activity, idx) => {
                  const isCompleted = completed.has(activity);
                  const isExpanded = expanded === activity;
                  const details = getDetails(activity);
                  const isUrgent = activity.includes("988") || activity.includes("911");

                  return (
                    <motion.div
                      key={`${activity}-${idx}`}
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                        isCompleted 
                          ? "bg-green-50 border-green-200 text-green-700" 
                          : "bg-white border-purple-100 hover:border-indigo-300 shadow-sm"
                      }`}
                    >
                      <div 
                        className="p-4 flex items-center justify-between cursor-pointer"
                        onClick={() => setExpanded(isExpanded ? null : activity)}
                      >
                        <div className="flex items-center gap-3">
                           <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                             isCompleted ? "bg-green-500 text-white shadow-md shadow-green-500/20" : "bg-indigo-600/10 text-indigo-600 border border-indigo-200"
                           }`}>
                             {isCompleted ? <CheckCircle2 size={16} /> : "✨"}
                           </div>
                           <p className={`text-xs font-bold ${isCompleted ? "text-green-700 line-through opacity-50" : "text-indigo-950"}`}>
                             {activity}
                           </p>
                        </div>
                        <Button
                          size="sm"
                          variant={isCompleted ? "ghost" : "outline"}
                          onClick={(e) => toggleComplete(activity, e)}
                          className={`h-8 rounded-xl text-[10px] font-bold ${
                            isCompleted ? "text-green-700 font-bold" : "hover:bg-indigo-600 hover:text-white border border-purple-200 text-indigo-950 font-bold"
                          }`}
                        >
                          {isCompleted ? "Done" : "Mark Complete"}
                        </Button>
                      </div>

                      <AnimatePresence>
                        {isExpanded && !isCompleted && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="px-4 pb-4 overflow-hidden"
                          >
                            <p className="text-[10px] mb-3 leading-relaxed text-muted-foreground">
                              {details.description}
                            </p>
                            <div className="space-y-2">
                               {details.steps.map((step, i) => (
                                 <div key={i} className="flex gap-2 items-start">
                                   <span className="shrink-0 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center bg-primary/10 text-primary">
                                     {i+1}
                                   </span>
                                   <p className="text-[10px] font-medium text-foreground">{step}</p>
                                 </div>
                               ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
             </AnimatePresence>
           )}
        </div>
      </section>

      {/* Playlists for You */}
      <section>
        <div className="flex items-center gap-2 mb-4">
           <Music size={16} className={isCrisis ? "text-destructive" : "text-wellness-pink"} />
           <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] ${isCrisis ? "text-destructive" : "text-wellness-pink/60"}`}>
             Playlists for You
           </h3>
        </div>
        
        <div className={`border rounded-[2rem] p-6 space-y-4 shadow-lg ${isCrisis ? "border-red-200 bg-red-50 text-red-700 shadow-md shadow-red-500/5" : "border-purple-200/50 bg-gradient-to-br from-indigo-50/90 via-purple-50/80 to-pink-50/90 shadow-purple-500/5 text-indigo-950"}`}>
           <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${isCrisis ? "bg-red-500 shadow-red-500/20" : "bg-gradient-to-br from-pink-500 to-rose-500 shadow-pink-500/20"}`}>
                 <Music size={24} />
              </div>
              <div className="flex-1">
                 <p className={`text-xs font-black uppercase tracking-widest ${isCrisis ? "text-red-700 font-bold" : "text-indigo-950 font-bold"}`}>Mood: {isCrisis ? "Crisis" : moodLabel}</p>
                 <p className={`text-[10px] font-bold ${isCrisis ? "text-red-700/70" : "text-indigo-950/60"}`}>Curated for your safety & peace</p>
              </div>
           </div>
           
           {isCrisis ? (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-800">
                 <p className="text-[10px] font-bold leading-relaxed">
                    Music streaming suggestions are suspended to encourage mindful grounding and external safety outreach.
                 </p>
              </div>
           ) : (
              <div className="space-y-2">
                 {playlists.map(pl => (
                   <a 
                     key={pl.name}
                     href={pl.link}
                     target="_blank"
                     rel="noreferrer"
                     className="flex items-center justify-between p-3 rounded-xl transition-all group border bg-white hover:bg-purple-100/50 text-indigo-950 border-purple-100"
                   >
                     <span className="text-[10px] font-black uppercase tracking-widest">{pl.name}</span>
                     <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-all" />
                   </a>
                 ))}
              </div>
           )}
        </div>
      </section>
    </div>
  );
};

export default ChatContextPanel;
