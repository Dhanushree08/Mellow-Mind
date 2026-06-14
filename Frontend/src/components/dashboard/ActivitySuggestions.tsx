import { useState, useEffect } from "react";
import { CheckCircle2, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDashboard } from "@/context/DashboardContext";
import { useToast } from "@/hooks/use-toast";

const activityDetails: Record<string, { description: string; steps: string[] }> = {
  "Call a friend": {
    description: "Reach out and connect with someone you trust.",
    steps: ["Scroll through your contacts and pick someone.", "Send a quick text asking if they are free to talk.", "Hit call and just say hi!"]
  },
  "Deep breathing": {
    description: "Calm your nervous system immediately.",
    steps: ["Inhale deeply through your nose for 4 seconds.", "Hold your breath for 4 seconds.", "Exhale slowly through your mouth for 6 seconds. Repeat 3 times."]
  },
  "Meditation": {
    description: "Quiet your mind and focus on the present.",
    steps: ["Find a comfortable seated position.", "Close your eyes.", "Focus entirely on the physical feeling of breathing for 5 minutes."]
  },
  "Stretching": {
    description: "Release physical tension from your muscles.",
    steps: ["Stand up straight.", "Reach your arms high above your head.", "Slowly bend down and try to touch your toes until you feel a stretch."]
  },
  "Coloring or Drawing": {
    description: "Engage your creative brain to distract from anxiety.",
    steps: ["Get some paper and a pen/colored pencils.", "Draw random shapes or color in an existing picture.", "Focus entirely on the movement of the pen."]
  },
  "Listen to brown noise": {
    description: "Drown out anxious thoughts with deep sound frequencies.",
    steps: ["Search for 1 hour of Brown Noise.", "Put in headphones.", "Close your eyes and focus on the static sound."]
  },
  "Unplug from socials": {
    description: "Remove external triggers.",
    steps: ["Put your phone on 'Do Not Disturb'.", "Place it in another room.", "Do something entirely offline for 20 minutes."]
  }
};

const getDetails = (activity: string) => activityDetails[activity] || {
  description: "Take a moment to focus on yourself with this simple activity.",
  steps: ["Find a quiet, comfortable spot.", "Take your time and don't rush the process.", "Reflect on how you feel afterwards."]
};

const fallbackActivities = [
  "Deep breathing", 
  "Take a short walk",
  "Drink a glass of water"
];

const ActivitySuggestions = () => {
  const { activities, sessionId, completeActivity } = useDashboard();
  const { toast } = useToast();
  const displayActivities = activities.length > 0 ? activities : fallbackActivities;

  const [expanded, setExpanded] = useState<string | null>(null);
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  useEffect(() => {
    setCompleted(new Set());
    setExpanded(null);
  }, [sessionId]);

  const toggleComplete = (act: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCompleted(prev => {
      const next = new Set(prev);
      if (next.has(act)) {
        next.delete(act);
      } else {
        next.add(act);
        completeActivity(act);
        toast({
          title: "Slay! 🌟",
          description: `You completed "${act}". Keep going!`,
        });
      }
      return next;
    });
  };

  return (
    <div className="space-y-4 text-indigo-950">
      <div className="flex items-center gap-2 mb-2">
         <Sparkles size={16} className="text-fuchsia-600 animate-pulse" />
         <h3 className="text-xs font-bold uppercase tracking-[0.1em] text-fuchsia-700">Daily Quests</h3>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {displayActivities.slice(0, 5).map((activity, idx) => {
            const isCompleted = completed.has(activity);
            const isExpanded = expanded === activity;
            const details = getDetails(activity);

            return (
              <motion.div
                key={`${activity}-${idx}`}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isCompleted 
                    ? "bg-emerald-50 border-emerald-200" 
                    : "bg-white border-purple-100/80 hover:border-purple-300"
                }`}
              >
                <div 
                  className="p-3 flex items-center justify-between cursor-pointer"
                  onClick={() => setExpanded(isExpanded ? null : activity)}
                >
                  <div className="flex items-center gap-3">
                     <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                       isCompleted ? "bg-emerald-500 text-white" : "bg-purple-100 text-purple-700"
                     }`}>
                       {isCompleted ? <CheckCircle2 size={16} /> : "✨"}
                     </div>
                     <p className={`text-sm font-semibold ${isCompleted ? "text-emerald-600 line-through opacity-50" : "text-indigo-950"}`}>
                       {activity}
                     </p>
                  </div>
                  <button 
                    onClick={(e) => toggleComplete(activity, e)}
                    className={`h-7 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                      isCompleted 
                        ? "bg-emerald-500 text-white" 
                        : "bg-purple-100 text-purple-700 hover:bg-purple-600 hover:text-white"
                    }`}
                  >
                    {isCompleted ? "Done" : "Complete"}
                  </button>
                </div>

                <AnimatePresence>
                  {isExpanded && !isCompleted && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-4 pb-4 overflow-hidden"
                    >
                      <div className="pt-2 border-t border-purple-100">
                        <p className="text-xs text-indigo-950/70 font-semibold mb-3">
                          {details.description}
                        </p>
                        <div className="space-y-1.5">
                          {details.steps.map((step, i) => (
                            <div key={i} className="flex gap-2 items-start">
                              <span className="w-4 h-4 rounded-full bg-purple-100 text-purple-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                                {i + 1}
                              </span>
                              <p className="text-xs text-indigo-950/90 font-medium mt-0.5">
                                {step}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ActivitySuggestions;
