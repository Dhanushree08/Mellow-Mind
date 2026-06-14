import { motion } from "framer-motion";
import { Sun, MessageSquare, Bot, Zap, Trophy, Heart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

import MindVibeScore from "@/components/dashboard/MindVibeScore";
import MoodHistory from "@/components/dashboard/MoodHistory";
import ActivitySuggestions from "@/components/dashboard/ActivitySuggestions";
import MusicRecommendations from "@/components/dashboard/MusicRecommendations";
import DailyAffirmation from "@/components/dashboard/DailyAffirmation";

import { useDashboard } from "@/context/DashboardContext";

const Dashboard = () => {
  const { userName } = useDashboard();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6"
      >
        <div>
          <div className="flex items-center gap-2 mb-2">
             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">Sanctuary</span>
             <div className="h-[1px] w-8 bg-primary/20" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-foreground">
            Welcome back, <span className="text-primary">{userName}</span>
          </h1>
          <p className="text-base md:text-lg text-foreground mt-2 font-bold">
            Your safe space is ready. How are we feeling today?
          </p>
        </div>
        <div className="hidden md:flex items-center gap-4">
           <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20 shadow-xl shadow-amber-500/10">
              <Sun size={28} />
           </div>
        </div>
      </motion.div>

      {/* TOP ROW: Essential Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <MindVibeScore />
        </div>
        
        <div className="lg:col-span-1 flex flex-col gap-6">
           <motion.div 
             whileHover={{ scale: 1.02 }}
             className="flex-1 rounded-[2rem] bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 p-6 text-white relative overflow-hidden group shadow-md shadow-fuchsia-500/10 border-none"
           >
              <Zap size={100} className="absolute -right-6 -bottom-6 opacity-20 group-hover:scale-110 transition-transform duration-700 text-white" />
              <span className="text-xs font-bold uppercase tracking-wider text-white/90">Weekly Streak</span>
              <p className="text-3xl font-black mt-2">7 Days</p>
              <p className="text-sm font-bold mt-4 text-white">You're on fire, bestie! 🔥</p>
           </motion.div>
           
           <motion.div 
             whileHover={{ scale: 1.02 }}
             className="flex-1 rounded-[2rem] bg-gradient-to-br from-amber-400 via-orange-400 to-rose-400 p-6 text-white relative overflow-hidden group shadow-md shadow-amber-500/10 border-none"
           >
              <Trophy size={100} className="absolute -right-6 -bottom-6 opacity-20 group-hover:scale-110 transition-transform duration-700 text-white" />
              <span className="text-xs font-bold uppercase tracking-wider text-white/90">Community Rank</span>
              <p className="text-3xl font-black mt-2">Top 5%</p>
              <p className="text-sm font-bold mt-4 text-white">Keep glowing! 🏆</p>
           </motion.div>
        </div>

        <div className="sm:col-span-2 lg:col-span-2">
          <MoodHistory />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-8">
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-gradient-to-tr from-indigo-50 via-purple-50 to-pink-50 border border-purple-200/60 rounded-[2.5rem] p-8 md:p-12 shadow-lg shadow-purple-500/5 relative overflow-hidden group flex flex-col md:flex-row items-center gap-12 text-indigo-950"
          >
             <div className="relative z-10 flex-1 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-2 mb-6">
                   <Heart className="text-pink-500 fill-pink-500 animate-pulse" size={16} />
                   <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Your Safe Space</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-black mb-6 leading-tight">Your AI bestie is <span className="text-indigo-600">online.</span></h2>
                <p className="text-indigo-950/80 text-sm md:text-base mb-10 max-w-md mx-auto md:mx-0 font-bold leading-relaxed">Need to vent, find focus, or just share a moment? I'm here to listen, 24/7.</p>
                <Button 
                  onClick={() => window.location.href='/chat'}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white hover:scale-105 active:scale-95 rounded-2xl px-10 h-14 font-black shadow-lg shadow-indigo-600/20 transition-all group"
                >
                  <MessageSquare className="mr-3 h-5 w-5" />
                  Start Vibing
                  <ArrowRight className="ml-2 h-4 w-4 opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0" />
                </Button>
             </div>
             <div className="w-full md:w-1/3 flex justify-center relative">
                <div className="w-48 h-48 rounded-[3.5rem] bg-indigo-100/80 flex items-center justify-center animate-float relative z-10">
                   <Bot size={90} className="text-indigo-600" />
                </div>
             </div>
          </motion.div>
          
          <DailyAffirmation />
        </div>

        {/* Intelligence Sidebar */}
        <div className="lg:col-span-4 space-y-8">
           <div className="bg-gradient-to-br from-purple-50/90 via-pink-50/80 to-indigo-50/90 border border-purple-200/50 rounded-[2.5rem] p-8 space-y-10 shadow-lg shadow-purple-500/5 text-indigo-950">
              <ActivitySuggestions />
              <div className="h-[1px] bg-purple-200/50" />
              <MusicRecommendations />
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
