import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BookOpen, Plus, Search, Calendar, 
  ChevronRight, Sparkles, Send, Trash2,
  Clock, Heart, Wand2
} from "lucide-react";
import { useDashboard } from "@/context/DashboardContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type JournalEntry = {
  _id: string;
  entry: string;
  mood: string;
  time: string;
  date: string;
  snippet: string;
};

const Journal = () => {
  const { userName } = useDashboard();
  const { toast } = useToast();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [newEntry, setNewEntry] = useState("");
  const [selectedMood, setSelectedMood] = useState("Neutral");
  const [isPosting, setIsPosting] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [isGeneratingFromChat, setIsGeneratingFromChat] = useState(false);

  const moods = [
    { label: "Happy", emoji: "😊", gradient: "from-emerald-400 to-teal-500", tip: "Feeling high energy and positive" },
    { label: "Neutral", emoji: "😐", gradient: "from-indigo-500 to-purple-600", tip: "Balanced and calm" },
    { label: "Sad", emoji: "😢", gradient: "from-blue-400 to-sky-500", tip: "Low energy or feeling down" },
    { label: "Anxious", emoji: "😰", gradient: "from-pink-400 to-rose-500", tip: "Feeling nervous or overwhelmed" },
    { label: "Angry", emoji: "😡", gradient: "from-orange-400 to-amber-500", tip: "Feeling frustrated or upset" }
  ];

  const fetchEntries = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
      const res = await fetch(`${apiUrl}/journal/${userName}`);
      const data = await res.json();
      setEntries(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch journal:", error);
    }
  };

  const fetchSessions = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
      const res = await fetch(`${apiUrl}/sessions?username=${userName}`);
      const data = await res.json();
      const sessionArray = Array.isArray(data) ? data : [];
      setSessions(sessionArray);
      if (sessionArray.length > 0) {
        setSelectedSessionId(sessionArray[0]._id);
      }
    } catch (error) {
      console.error("Failed to fetch sessions in journal:", error);
    }
  };

  const handleSyncFromChat = async () => {
    if (!selectedSessionId) return;
    setIsGeneratingFromChat(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
      const res = await fetch(`${apiUrl}/journal/generate-from-chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: userName,
          session_id: selectedSessionId
        })
      });
      if (res.ok) {
        const data = await res.json();
        setNewEntry(data.entry);
        setSelectedMood(data.mood);
        toast({
          title: "Reflections Synced! 💫",
          description: "Automatically populated entry and mood based on your chat vibe."
        });
      } else {
        const err = await res.json();
        toast({ title: "Sync failed", description: err.detail || "Unable to sync chat history.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Sync error:", error);
      toast({ title: "Sync failed", variant: "destructive" });
    }
    setIsGeneratingFromChat(false);
  };

  const handleEnhance = async () => {
    if (!newEntry.trim()) return;
    setIsEnhancing(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
      const res = await fetch(`${apiUrl}/enhance-journal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newEntry })
      });
      const data = await res.json();
      if (data.enhanced) {
        setNewEntry(data.enhanced);
        toast({
          title: "Vibe Enhanced ✨",
          description: "Your entry has been transformed with mindful reflection."
        });
      }
    } catch (error) {
      console.error("Enhance error:", error);
      toast({ title: "Enhance failed", variant: "destructive" });
    }
    setIsEnhancing(false);
  };

  const handleSave = async () => {
    if (!newEntry.trim()) return;
    setIsPosting(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
      const res = await fetch(`${apiUrl}/journal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: userName,
          entry: newEntry,
          mood: selectedMood,
          tags: [] // Tags removed as per user request
        })
      });
      if (res.ok) {
        toast({ title: "Entry Locked 🔒", description: "Your thoughts are safe in the vault." });
        setNewEntry("");
        fetchEntries();
      }
    } catch (error) {
      console.error("Save error:", error);
    }
    setIsPosting(false);
  };

  useEffect(() => {
    fetchEntries();
    fetchSessions();
  }, [userName]);

  const filteredEntries = entries.filter(e => 
    e.entry.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-10 py-10 space-y-10 text-indigo-950">
      <TooltipProvider>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
               <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">The Vault</span>
               <div className="h-[1px] w-8 bg-purple-200" />
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-indigo-950">
              Mind <span className="text-indigo-600">Journal</span>
            </h1>
            <p className="text-base text-indigo-950/70 mt-2 font-bold">
              Release your thoughts. No judgment, just peace.
            </p>
          </div>
          <div className="relative w-full md:w-72 group">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-950/50 group-focus-within:text-indigo-600 transition-colors" size={18} />
             <Input 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               placeholder="Search entries..." 
               className="pl-12 rounded-2xl bg-white border-purple-200 h-12 focus-visible:ring-indigo-200/50 text-indigo-950 shadow-sm" 
             />
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Editor Side */}
          <div className="lg:col-span-7 space-y-8">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 bg-gradient-to-br from-indigo-50/90 via-purple-50/80 to-pink-50/90 border border-purple-200/50 rounded-[2.5rem] shadow-lg shadow-purple-500/5 text-indigo-950"
            >
              <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-600/10 flex items-center justify-center text-indigo-600 shadow-sm">
                       <Plus size={20} />
                    </div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-950">New Entry</h3>
                 </div>
                 <div className="text-xs font-bold text-indigo-600 uppercase tracking-widest bg-indigo-600/5 px-3 py-1 rounded-full border border-indigo-200/50">
                    {new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}
                 </div>
              </div>

               <div className="bg-white/70 border border-purple-100/80 rounded-[2rem] p-6 shadow-inner">
                 <textarea 
                   value={newEntry}
                   onChange={(e) => setNewEntry(e.target.value)}
                   placeholder="How are you really doing today?"
                   className="w-full bg-transparent border-none focus:outline-none focus:ring-0 text-base font-bold text-indigo-950 resize-none min-h-[260px] placeholder:text-indigo-950/30 leading-relaxed custom-scrollbar"
                 />
               </div>

              <div className="space-y-8 pt-8 border-t border-border/30">
                 <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-6">Mood Aura</p>
                    <div className="flex flex-wrap gap-4">
                       {moods.map((m) => (
                         <Tooltip key={m.label}>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => setSelectedMood(m.label)}
                                className={`flex items-center gap-3 px-5 py-3 rounded-2xl transition-all border ${
                                  selectedMood === m.label 
                                    ? `bg-gradient-to-br ${m.gradient} text-white shadow-lg shadow-indigo-600/20 border-white/20 scale-105` 
                                    : "bg-white text-indigo-950 hover:bg-purple-100/50 border-purple-100 shadow-sm"
                                }`}
                              >
                                <span className="text-lg">{m.emoji}</span>
                                <span className="text-xs font-bold uppercase tracking-widest">{m.label}</span>
                              </button>
                            </TooltipTrigger>
                            <TooltipContent className="rounded-xl font-bold text-xs uppercase tracking-widest bg-indigo-950 text-white">
                              {m.tip}
                            </TooltipContent>
                         </Tooltip>
                       ))}
                    </div>
                 </div>

                 <div className="flex items-center justify-between gap-4">
                    <Button 
                      onClick={handleEnhance}
                      disabled={!newEntry.trim() || isEnhancing}
                      variant="outline" 
                      className="rounded-2xl h-14 px-8 font-bold text-xs uppercase tracking-widest border-indigo-600/30 text-indigo-600 bg-white hover:bg-indigo-50 group"
                    >
                       <Wand2 className={`mr-2 h-4 w-4 ${isEnhancing ? "animate-spin" : "group-hover:rotate-12 transition-transform"}`} />
                       {isEnhancing ? "Reflecting..." : "AI Enhance"}
                    </Button>
                    <Button 
                      onClick={handleSave}
                      disabled={!newEntry.trim() || isPosting}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl h-14 font-bold shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-95 group"
                    >
                       <Send className="mr-2 h-4 w-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                       {isPosting ? "Locking..." : "Save Entry"}
                    </Button>
                 </div>
              </div>
            </motion.div>
          </div>

          {/* History Side */}
          <div className="lg:col-span-5 space-y-6">
             <div className="flex items-center justify-between px-2">
                <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-600">Recent Frequency</h3>
                <Clock size={16} className="text-primary/40" />
             </div>
             
             <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
                {filteredEntries.length === 0 ? (
                  <div className="p-20 text-center space-y-4 opacity-50 border-2 border-dashed border-purple-200/50 rounded-[2.5rem] bg-white/50">
                     <BookOpen size={48} className="mx-auto text-muted-foreground" />
                     <p className="text-[10px] font-black uppercase tracking-widest">No entries found</p>
                  </div>
                ) : (
                  filteredEntries.map((entry, i) => (
                    <motion.div
                      key={entry._id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`p-6 rounded-[2rem] bg-white border border-purple-100 border-l-4 transition-all cursor-pointer group shadow-sm ${
                        entry.mood === "Happy" ? "border-l-emerald-400 hover:border-emerald-500" :
                        entry.mood === "Neutral" ? "border-l-indigo-500 hover:border-indigo-600" :
                        entry.mood === "Sad" ? "border-l-blue-400 hover:border-blue-500" :
                        entry.mood === "Anxious" ? "border-l-pink-400 hover:border-pink-500" :
                        "border-l-orange-400 hover:border-orange-500"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                           <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-md bg-gradient-to-br ${
                             moods.find(m => m.label === entry.mood)?.gradient || "from-indigo-500 to-purple-600"
                           }`}>
                              {moods.find(m => m.label === entry.mood)?.emoji || "✨"}
                           </div>
                           <div>
                              <p className="text-xs font-bold text-indigo-950">{entry.date}</p>
                              <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">{entry.mood}</p>
                           </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity text-indigo-950 hover:bg-purple-100">
                           <ChevronRight size={16} />
                        </Button>
                      </div>
                      <p className="text-sm font-semibold text-indigo-950/70 line-clamp-3 leading-relaxed">
                        {entry.entry}
                      </p>
                    </motion.div>
                  ))
                )}
             </div>
          </div>
        </div>
      </TooltipProvider>
    </div>
  );
};

export default Journal;
