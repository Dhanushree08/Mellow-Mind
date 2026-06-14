import { motion, AnimatePresence } from "framer-motion";
import { 
  Users, MessageCircle, Heart, Share2, 
  Sparkles, ShieldCheck, Globe, Zap, Send,
  Trash2, MoreHorizontal, Lock, Unlock, Eye, EyeOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useDashboard } from "@/context/DashboardContext";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type Post = {
  _id: string;
  username: string;
  content: string;
  likes: number;
  comments: number;
  time: string;
  mood: string;
  is_anonymous: boolean;
  isLiked?: boolean;
};

const Community = () => {
  const { userName } = useDashboard();
  const { toast } = useToast();
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState("");
  const [isPosting, setIsPosting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedPostMood, setSelectedPostMood] = useState("zen");
  const [isPrivate, setIsPrivate] = useState(false);
  const [showMoodPicker, setShowMoodPicker] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  const moods = [
    { label: "zen", emoji: "🧘" },
    { label: "peaceful", emoji: "✨" },
    { label: "vulnerable", emoji: "🥺" },
    { label: "proud", emoji: "🏆" },
    { label: "hyped", emoji: "⚡" },
    { label: "low-vibe", emoji: "☁️" }
  ];

  const fetchPosts = async () => {
    try {
      const res = await fetch(`${API_URL}/community/posts`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data);
      }
    } catch (err) {
      console.error("Failed to fetch posts:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handlePost = async () => {
    if (!newPost.trim()) return;
    setIsPosting(true);
    
    try {
      const res = await fetch(`${API_URL}/community/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: userName || "Bestie",
          content: newPost,
          mood: selectedPostMood,
          is_anonymous: isPrivate
        })
      });

      if (res.ok) {
        setNewPost("");
        setShowMoodPicker(false);
        fetchPosts(); // Refresh list
        toast({
          title: isPrivate ? "Ghost Vibe Shared! 👻" : "Vibe Shared! ✨",
          description: "Your frequency has been broadcasted to the hive."
        });
      }
    } catch (err) {
      toast({ title: "Post failed", description: "The hive is currently unreachable.", variant: "destructive" });
    } finally {
      setIsPosting(false);
    }
  };

  const handleLike = async (id: string) => {
    setPosts(posts.map(p => {
      if (p._id === id) {
        return {
          ...p,
          likes: p.isLiked ? p.likes - 1 : p.likes + 1,
          isLiked: !p.isLiked
        };
      }
      return p;
    }));

    try {
      await fetch(`${API_URL}/community/posts/${id}/like`, { method: "POST" });
    } catch (err) {
      console.error("Like failed:", err);
    }
  };

  const formatTime = (timeStr: string) => {
    try {
      const date = new Date(timeStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHrs < 1) return "Just now";
      if (diffHrs < 24) return `${diffHrs}h ago`;
      return `${Math.floor(diffHrs / 24)}d ago`;
    } catch (e) {
      return timeStr;
    }
  };

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
             <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">The Hive</span>
             <div className="h-[1px] w-8 bg-purple-200" />
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-indigo-950">
            Vibe <span className="text-indigo-600">Community</span>
          </h1>
          <p className="text-base text-indigo-950/70 mt-2 font-bold">
            An anonymous safe space to share your frequency.
          </p>
        </div>
        <div className="flex items-center gap-4">
           <div className="px-4 py-2 rounded-2xl bg-green-100 text-green-700 text-xs font-bold uppercase tracking-wider flex items-center gap-2 border border-green-200 shadow-sm">
              <ShieldCheck size={14} />
              Verified Safe
           </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Community Feed */}
        <div className="lg:col-span-8 space-y-8">
          <div className="p-6 bg-gradient-to-br from-indigo-50/90 via-purple-50/80 to-pink-50/90 border border-purple-200/50 rounded-[2.5rem] shadow-lg shadow-purple-500/5 text-indigo-950">
             <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 flex items-center justify-center text-indigo-600 shrink-0 border border-indigo-200 shadow-sm">
                   {isPrivate ? <EyeOff size={24} className="text-indigo-600 animate-pulse" /> : <Sparkles size={24} />}
                </div>
                <div className="flex-1 space-y-4">
                   <textarea 
                     value={newPost}
                     onChange={(e) => setNewPost(e.target.value)}
                     placeholder={isPrivate ? "Sharing anonymously..." : "Share a vibe with the hive..."}
                     className="w-full bg-transparent border-none focus:ring-0 text-base font-bold text-indigo-950 resize-none min-h-[80px] p-2 placeholder:text-indigo-950/30"
                   />
                   
                   <AnimatePresence>
                      {showMoodPicker && (
                        <motion.div 
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="flex flex-wrap gap-2 p-3 bg-white/80 rounded-2xl border border-purple-200 shadow-md"
                        >
                           {moods.map(m => (
                             <button
                               key={m.label}
                               onClick={() => { setSelectedPostMood(m.label); setShowMoodPicker(false); }}
                               className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                                 selectedPostMood === m.label ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10" : "bg-white text-indigo-950 hover:bg-purple-50 border border-purple-100"
                               }`}
                             >
                               {m.emoji} {m.label}
                             </button>
                           ))}
                        </motion.div>
                      )}
                   </AnimatePresence>

                   <div className="flex justify-between items-center pt-4 border-t border-purple-200/40">
                      <div className="flex gap-2">
                         <Button 
                           variant="ghost" 
                           size="sm" 
                           onClick={() => setShowMoodPicker(!showMoodPicker)}
                           className={`rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${showMoodPicker ? "bg-indigo-600/10 text-indigo-600" : "text-indigo-950/60 hover:bg-purple-100/50"}`}
                         >
                            {selectedPostMood ? `Mood: ${selectedPostMood}` : "Add Mood"}
                         </Button>
                         <Button 
                           variant="ghost" 
                           size="sm" 
                           onClick={() => {
                             setIsPrivate(!isPrivate);
                             toast({ 
                               title: !isPrivate ? "Ghost Mode ON 👻" : "Ghost Mode OFF ✨", 
                               description: !isPrivate ? "Your next post will be anonymous." : "Your name will be visible again." 
                             });
                           }}
                           className={`rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${isPrivate ? "bg-pink-100 text-pink-700" : "text-indigo-950/60 hover:bg-purple-100/50"}`}
                         >
                            {isPrivate ? <EyeOff size={14} className="mr-2" /> : <Eye size={14} className="mr-2" />}
                            {isPrivate ? "Private" : "Public"}
                         </Button>
                      </div>
                      <Button 
                        onClick={handlePost}
                        disabled={!newPost.trim() || isPosting}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-8 h-10 font-bold shadow-lg shadow-indigo-600/20 transition-all active:scale-95 disabled:opacity-50"
                      >
                        {isPosting ? "Posting..." : "Post Vibe"}
                      </Button>
                   </div>
                </div>
             </div>
          </div>

          <div className="space-y-6">
            {isLoading ? (
               <div className="flex flex-col items-center justify-center py-20 space-y-4 opacity-50">
                  <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin" />
                  <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">Tuning into the Hive...</p>
               </div>
            ) : (
              <AnimatePresence initial={false}>
                {posts.map((post) => (
                  <motion.div
                    key={post._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className={`p-5 border border-purple-100 rounded-[2rem] shadow-sm hover:border-indigo-300 hover:shadow-md transition-all group border-l-4 ${
                      post.mood === "zen" ? "border-l-emerald-400 bg-gradient-to-br from-white via-white to-emerald-50/25" :
                      post.mood === "peaceful" ? "border-l-purple-400 bg-gradient-to-br from-white via-white to-purple-50/25" :
                      post.mood === "vulnerable" ? "border-l-blue-400 bg-gradient-to-br from-white via-white to-blue-50/25" :
                      post.mood === "proud" ? "border-l-amber-400 bg-gradient-to-br from-white via-white to-amber-50/25" :
                      post.mood === "hyped" ? "border-l-pink-400 bg-gradient-to-br from-white via-white to-pink-50/25" :
                      "border-l-slate-400 bg-gradient-to-br from-white via-white to-slate-50/25"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-white text-xs shadow-md border border-white/10 shrink-0 ${
                          post.is_anonymous 
                            ? "bg-slate-500" 
                            : post.mood === "zen" ? "bg-gradient-to-br from-emerald-400 to-teal-500" :
                              post.mood === "peaceful" ? "bg-gradient-to-br from-purple-400 to-indigo-500" :
                              post.mood === "vulnerable" ? "bg-gradient-to-br from-blue-400 to-sky-500" :
                              post.mood === "proud" ? "bg-gradient-to-br from-amber-400 to-orange-500" :
                              post.mood === "hyped" ? "bg-gradient-to-br from-pink-400 to-rose-500" :
                              "bg-gradient-to-br from-indigo-500 to-purple-600"
                        }`}>
                          {post.is_anonymous ? <EyeOff size={14} /> : post.username[0].toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                             <p className="text-xs font-black text-indigo-950">@{post.is_anonymous ? "Anonymous Bestie" : post.username}</p>
                             {post.is_anonymous && <Lock size={10} className="text-muted-foreground" />}
                          </div>
                          <p className="text-xs font-bold text-indigo-950/50 uppercase tracking-widest">{formatTime(post.time)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="px-3 py-1 rounded-full bg-purple-50 border border-purple-100 text-indigo-600 text-[10px] font-bold uppercase tracking-wider">
                           {post.mood}
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity text-indigo-950 hover:bg-purple-100">
                           <MoreHorizontal size={14} />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-indigo-950 leading-relaxed mb-4">
                      {post.content}
                    </p>
                    <div className="flex items-center gap-6 pt-4 border-t border-purple-100/50">
                       <button 
                         onClick={() => handleLike(post._id)}
                         className={`flex items-center gap-2 transition-all group/btn ${post.isLiked ? "text-pink-500" : "text-indigo-950/50 hover:text-pink-500"}`}
                       >
                          <Heart size={18} className={post.isLiked ? "fill-pink-500" : "group-hover/btn:fill-pink-500/20"} />
                          <span className="text-xs font-bold">{post.likes}</span>
                       </button>
                       <button className="flex items-center gap-2 text-indigo-950/50 hover:text-indigo-600 transition-colors group/btn">
                          <MessageCircle size={18} className="group-hover/btn:fill-indigo-600/10" />
                          <span className="text-xs font-bold">{post.comments}</span>
                       </button>
                       <button 
                         onClick={() => {
                           navigator.clipboard.writeText(post.content);
                           toast({ title: "Copied! 🔗", description: "Post content copied to clipboard." });
                         }}
                         className="ml-auto flex items-center gap-2 text-indigo-950/50 hover:text-indigo-600 transition-colors"
                       >
                          <Share2 size={18} />
                       </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-4 space-y-8">
           <div className="p-8 bg-white border border-purple-100 rounded-[2.5rem] shadow-sm space-y-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 border-b border-purple-100 pb-4">Safe Space Rules</h3>
              <ul className="space-y-4">
                 {[
                   { title: "Be Kind", desc: "No toxicity, ever." },
                   { title: "Be Real", desc: "Share your authentic self." },
                   { title: "Be Safe", desc: "Report any harmful content." }
                 ].map(rule => (
                   <li key={rule.title} className="flex gap-4">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 shrink-0" />
                      <div>
                         <p className="text-xs font-bold text-indigo-950 uppercase tracking-wider">{rule.title}</p>
                         <p className="text-xs text-indigo-950/60 font-semibold mt-1">{rule.desc}</p>
                      </div>
                   </li>
                 ))}
              </ul>
           </div>
        </div>
      </div>
      </TooltipProvider>
    </div>
  );
};

export default Community;
