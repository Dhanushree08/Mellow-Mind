import { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useDashboard } from "@/context/DashboardContext";
import { TrendingUp, TrendingDown, Activity, User, Target, RefreshCw, ShieldAlert, ShieldCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Analytics = () => {
  const { history, fetchHistory } = useDashboard();
  const [timeframe, setTimeframe] = useState<"Time" | "Date" | "Month" | "Year">("Date");
  const [selectedBar, setSelectedBar] = useState<{label: string, score: number} | null>(null);

  const { chartData, moodDistribution, riskDistribution, stats, chartTitle, topMood } = useMemo(() => {
    
    const getRollingDays = () => {
      const now = new Date();
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const currentDay = now.getDay();
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        let d = currentDay - i;
        if (d < 0) d += 7;
        last7Days.push(dayNames[d]);
      }
      return last7Days;
    };

    const emptyState: Record<string, {label: string, score: number}[]> = {
      Time: Array.from({length: 24}, (_, i) => ({ label: `${i}:00`, score: 0 })),
      Date: getRollingDays().map(d => ({ label: d, score: 0 })),
      Month: Array.from({length: 31}, (_, i) => ({ label: `${i+1}`, score: 0 })),
      Year: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map(m => ({ label: m, score: 0 })),
    };

    if (!history || history.length === 0) {
      return {
        chartData: emptyState[timeframe],
        moodDistribution: [{ name: "Neutral", value: 100, color: "#6366f1" }],
        stats: [
          { label: "Avg Vibe", value: "0", change: "Need data", up: true, icon: Activity, tip: "Your average emotional score" },
          { label: "Check-ins", value: "0", change: "Start chatting!", up: true, icon: User, tip: "Number of times you've checked in" },
          { label: "Top Mood", value: "-", change: "Need data", up: true, icon: Target, tip: "Your most frequent emotion" },
        ],
        chartTitle: `${timeframe} Vibe Scores`,
        riskDistribution: [{ name: "Low", value: 100, color: "#22c55e" }],
        topMood: "Neutral"
      };
    }

    const now = new Date();
    const parseDate = (timeStr: string): Date => {
      if (!timeStr) return new Date(0);
      return new Date(timeStr.replace(" ", "T"));
    };

    const todayLocalStr = now.toLocaleDateString("en-CA");

    const filteredHistory = history.filter(item => {
      const date = parseDate(item.time || "");
      if (isNaN(date.getTime())) return false;
      if (timeframe === "Time") return date.toLocaleDateString("en-CA") === todayLocalStr;
      if (timeframe === "Date") {
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        weekAgo.setHours(0, 0, 0, 0);
        return date >= weekAgo;
      }
      if (timeframe === "Month") return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      return date.getFullYear() === now.getFullYear();
    });

    const colors: Record<string, string> = {
      "Happy": "#22c55e", 
      "Neutral": "#6366f1", 
      "Anxious": "#ec4899",
      "Sad": "#3b82f6", 
      "Angry": "#f97316", 
      "Lonely": "#a855f7",
      "Crisis": "#ef4444"
    };

    const bins: Record<string, number[]> = {};
    const moodCounts: Record<string, number> = {};
    const binMoods: Record<string, Record<string, number>> = {};
    const riskCounts: Record<string, number> = { "LOW": 0, "MEDIUM": 0, "HIGH": 0 };
    let totalScore = 0;

    const riskColors: Record<string, string> = {
      "LOW": "#22c55e",
      "MEDIUM": "#f97316",
      "HIGH": "#ef4444"
    };

    filteredHistory.forEach(item => {
      const date = parseDate(item.time || "");
      let binKey = "";

      if (timeframe === "Time") binKey = `${date.getHours()}:00`;
      else if (timeframe === "Date") binKey = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()];
      else if (timeframe === "Month") binKey = `${date.getDate()}`;
      else binKey = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][date.getMonth()];

      if (!bins[binKey]) bins[binKey] = [];
      const s = item.score ?? item.mind_vibe_score ?? 70;
      bins[binKey].push(s);

      const rawEm = item.emotion || "neutral";
      const em = rawEm.split(' ')[0].replace(/[^a-zA-Z]/g, '').charAt(0).toUpperCase() + rawEm.split(' ')[0].replace(/[^a-zA-Z]/g, '').slice(1).toLowerCase();
      moodCounts[em] = (moodCounts[em] || 0) + 1;
      if (!binMoods[binKey]) binMoods[binKey] = {};
      binMoods[binKey][em] = (binMoods[binKey][em] || 0) + 1;
      
      const rawRisk = item.risk || "LOW";
      const risk = rawRisk.split(' ')[0].replace(/[^a-zA-Z]/g, '').toUpperCase();
      if (riskCounts[risk] !== undefined) riskCounts[risk] = (riskCounts[risk] || 0) + 1;
      totalScore += s;
    });

    const finalChartData = emptyState[timeframe].map(b => {
      const scores = bins[b.label] || [];
      const mCounts = binMoods[b.label] || {};
      let topMoodForBin = "Neutral";
      let maxCount = 0;
      for (const [m, count] of Object.entries(mCounts)) {
        if (count > maxCount) { maxCount = count; topMoodForBin = m; }
      }
      const barColor = colors[topMoodForBin] || colors["Neutral"];
      const avgScore = scores.length > 0 ? Math.round(scores.reduce((a,b)=>a+b,0)/scores.length) : 0;
      return { label: b.label, score: avgScore, fill: barColor, topMood: topMoodForBin };
    });

    const totalMoods = Object.values(moodCounts).reduce((a,b)=>a+b, 0);
    const totalRisks = Object.values(riskCounts).reduce((a,b)=>a+b, 0);
    const finalMoods = Object.keys(moodCounts).map(m => ({
      name: m,
      value: totalMoods > 0 ? Math.round((moodCounts[m] / totalMoods) * 100) : 0,
      color: colors[m] || "#6366f1"
    })).sort((a,b)=>b.value - a.value);

    const avgVibe = filteredHistory.length > 0 ? Math.round(totalScore / filteredHistory.length) : 0;
    const topMoodLabel = finalMoods.length > 0 ? finalMoods[0].name : "Neutral";
    
    const finalRisks = Object.keys(riskCounts).map(r => ({
      name: r === "MEDIUM" ? "Analyze" : r.charAt(0).toUpperCase() + r.slice(1).toLowerCase(),
      value: totalRisks > 0 ? Math.round((riskCounts[r] / totalRisks) * 100) : 0,
      color: riskColors[r] || "#6366f1"
    })).sort((a, b) => b.value - a.value);

    return {
      chartData: finalChartData,
      moodDistribution: finalMoods,
      stats: [
        { label: "Avg Vibe", value: String(avgVibe), change: "Current Period", up: true, icon: Activity, tip: "Average of all your recorded emotional scores" },
        { label: "Check-ins", value: String(filteredHistory.length), change: "Active sessions", up: true, icon: User, tip: "Total interactions with Mellow Mind AI" },
        { label: "Top Mood", value: topMoodLabel, change: "Dominant vibe", up: true, icon: Target, tip: "The emotion you've expressed most frequently" },
      ],
      chartTitle: `${timeframe} Vibe Analysis`,
      riskDistribution: finalRisks,
      topMood: topMoodLabel
    };
  }, [history, timeframe]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const now = new Date();
      let tTime = "--";
      let tDate = "--";
      let tMonth = "--";
      let tYear = String(now.getFullYear());

      if (timeframe === "Time") {
        tTime = label;
        tDate = String(now.getDate());
        tMonth = now.toLocaleString('default', { month: 'short' });
      } else if (timeframe === "Date") {
        tTime = "Daily Avg";
        tDate = label;
        tMonth = now.toLocaleString('default', { month: 'short' });
      } else if (timeframe === "Month") {
        tTime = "Daily Avg";
        tDate = label;
        tMonth = now.toLocaleString('default', { month: 'short' });
      } else if (timeframe === "Year") {
        tTime = "Monthly Avg";
        tDate = "Monthly Avg";
        tMonth = label;
      }

      return (
        <div className="bg-white border border-purple-200 rounded-2xl p-4 shadow-xl shadow-purple-900/5 text-xs font-bold text-indigo-950 min-w-[140px]">
          <div className="space-y-1 mb-3 pb-3 border-b border-purple-100">
            <div className="flex justify-between gap-4"><span className="opacity-50">TIME:</span> <span>{tTime}</span></div>
            <div className="flex justify-between gap-4"><span className="opacity-50">DATE:</span> <span>{tDate}</span></div>
            <div className="flex justify-between gap-4"><span className="opacity-50">MONTH:</span> <span>{tMonth}</span></div>
            <div className="flex justify-between gap-4"><span className="opacity-50">YEAR:</span> <span>{tYear}</span></div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-indigo-600">SCORE:</span>
            <span className="text-lg font-black">{payload[0].value}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-10 py-10 space-y-10">
      <TooltipProvider>
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="flex flex-col md:flex-row md:items-end justify-between gap-6"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
               <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">Intelligence</span>
               <div className="h-[1px] w-8 bg-purple-200" />
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-indigo-950">Vibe <span className="text-indigo-600">Analytics</span></h1>
            <p className="text-base text-indigo-950/70 mt-2 font-bold">Deep insights into your mental sanctuary.</p>
          </div>

          <div className="flex items-center gap-4">
             <Button variant="ghost" size="icon" onClick={() => fetchHistory()} className="rounded-2xl hover:bg-indigo-50 text-indigo-600">
                <RefreshCw size={18} />
             </Button>
             <div className="flex bg-white p-1.5 rounded-2xl border border-purple-200 shadow-sm">
               {(["Time", "Date", "Month", "Year"] as const).map((t) => (
                 <Tooltip key={t}>
                   <TooltipTrigger asChild>
                     <button
                       onClick={() => { setTimeframe(t); setSelectedBar(null); }}
                       className={`px-5 py-2 text-xs font-bold uppercase tracking-widest rounded-xl transition-all ${
                         timeframe === t 
                           ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10 border border-indigo-600" 
                           : "text-indigo-950/60 hover:text-indigo-950 hover:bg-purple-50"
                       }`}
                     >
                       {t}
                     </button>
                   </TooltipTrigger>
                   <TooltipContent className="rounded-xl font-bold text-xs uppercase tracking-widest bg-indigo-950 text-white">
                     View {t.toLowerCase()} statistics
                   </TooltipContent>
                 </Tooltip>
               ))}
             </div>
          </div>
        </motion.div>

        {/* Quick Stats Grid + Mini Risk Meter */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <Tooltip key={stat.label}>
              <TooltipTrigger asChild>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-6 bg-gradient-to-br from-indigo-50/50 via-purple-50/50 to-pink-50/50 border border-purple-200/50 rounded-[2rem] shadow-sm flex flex-col justify-between group cursor-help transition-all hover:border-indigo-400/50"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm">
                      <stat.icon size={20} />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                      {stat.change}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-indigo-950/60 mb-1">{stat.label}</p>
                    <p className="text-3xl font-black text-indigo-950 tracking-tighter">{stat.value}</p>
                  </div>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent className="rounded-xl font-bold text-xs uppercase tracking-widest bg-indigo-950 text-white max-w-[200px]">
                {stat.tip}
              </TooltipContent>
            </Tooltip>
          ))}

          {/* New Interactive Vibe Safety Details Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 bg-gradient-to-br from-purple-50/90 via-pink-50/90 to-indigo-50/90 border border-purple-200/50 rounded-[2rem] shadow-md flex flex-col justify-between group"
          >
             <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
                   <ShieldCheck size={20} />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600">Vibe Safety Details</h3>
             </div>
             <div className="space-y-3 pt-4">
                {(() => {
                  const highRisk = riskDistribution.find(r => r.name === "High")?.value || 0;
                  const analyzeRisk = riskDistribution.find(r => r.name === "Analyze")?.value || 0;
                  const totalRisk = highRisk + analyzeRisk;
                  const riskColor = highRisk > 20 ? "#ef4444" : analyzeRisk > 20 ? "#f97316" : "#6366f1";
                  
                  return (
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                         <span className="text-xs font-bold uppercase tracking-wider text-indigo-950/60">Overall Risk</span>
                         <span className="text-xs font-bold text-indigo-950">{totalRisk}%</span>
                      </div>
                      <div className="h-2 w-full bg-purple-100 rounded-full overflow-hidden">
                         <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${totalRisk}%` }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: riskColor }}
                         />
                      </div>
                      <p className="text-[10px] font-bold text-indigo-950/60 uppercase tracking-tighter text-center pt-2">
                        {totalRisk < 10 ? "Optimal Sanctuary" : totalRisk < 30 ? "Balanced Vibe" : "Action Recommended"}
                      </p>
                    </div>
                  );
                })()}
             </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Chart */}
          <div className="lg:col-span-8 space-y-8">
            <div className="p-8 bg-white border border-purple-100 rounded-[2.5rem] shadow-sm min-h-[450px] flex flex-col">
              <div className="flex items-center justify-between mb-8 h-7">
                <div className="flex items-center gap-3">
                  <p className="text-lg font-bold text-indigo-950 leading-none">Emotional Frequency</p>
                  <span className="text-purple-200 leading-none">|</span>
                  <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-widest leading-none mt-0.5">{chartTitle}</h3>
                </div>
                {selectedBar && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-indigo-600/10 text-indigo-600 px-4 py-2 rounded-2xl text-xs font-bold uppercase tracking-widest border border-indigo-200"
                  >
                    Score: {selectedBar.score}
                  </motion.div>
                )}
              </div>
              <div className="w-full h-[350px] mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} onClick={(e) => {
                    if (e && e.activePayload && e.activePayload.length > 0) {
                      setSelectedBar({ label: e.activePayload[0].payload.label, score: e.activePayload[0].payload.score });
                    }
                  }}>
                    <XAxis 
                      dataKey="label" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fontSize: 10, fill: "#1e1b4b", fontWeight: 700 }} 
                      dy={10}
                    />
                    <YAxis hide domain={[0, 100]} />
                    <RechartsTooltip
                      content={<CustomTooltip />}
                      cursor={{ fill: '#6366f1', opacity: 0.05 }}
                    />
                    <Bar 
                      dataKey="score" 
                      radius={[10, 10, 10, 10]} 
                      animationDuration={1500} 
                      className="cursor-pointer"
                      barSize={timeframe === "Date" ? 40 : timeframe === "Time" ? 20 : timeframe === "Month" ? 12 : 30}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill || "#6366f1"} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Distributions Side */}
          <div className="lg:col-span-4 space-y-8">
            <div className="p-8 bg-white border border-purple-100 rounded-[2.5rem] shadow-sm">
              <div className="flex items-center mb-8 h-7">
                <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-wider leading-none mt-0.5">Mood Portfolio</h3>
              </div>
              <div className="w-full h-[200px] mb-8 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={moodDistribution} 
                      cx="50%" 
                      cy="50%" 
                      innerRadius={60} 
                      outerRadius={90} 
                      dataKey="value" 
                      strokeWidth={0}
                      paddingAngle={5}
                    >
                      {moodDistribution.map((entry, index) => (
                        <Cell key={`mood-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                   <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="text-center cursor-help">
                          <p className="text-xs font-bold text-indigo-950/60 uppercase tracking-wider">Top Vibe</p>
                          <p className="text-lg font-bold text-indigo-950 tracking-tighter">{topMood}</p>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="rounded-xl font-bold text-xs uppercase tracking-widest bg-indigo-950 text-white">
                        Your dominant emotion in this period
                      </TooltipContent>
                   </Tooltip>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {moodDistribution.map(({ name, value, color }) => (
                  <div key={name} className="flex items-center justify-between p-3 rounded-2xl bg-purple-50/50 border border-purple-100">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: color }} />
                      <span className="text-[11px] font-bold text-indigo-950 uppercase tracking-wider truncate">{name}</span>
                    </div>
                    <span className="text-[11px] font-bold text-indigo-600 ml-1">{value}%</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </TooltipProvider>
    </div>
  );
};

export default Analytics;
