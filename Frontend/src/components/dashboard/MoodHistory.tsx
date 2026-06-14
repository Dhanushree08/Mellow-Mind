import { motion } from "framer-motion";
import { useDashboard } from "@/context/DashboardContext";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const moodToValue: Record<string, number> = {
  happy: 90,
  neutral: 60,
  lonely: 40,
  sad: 30,
  anxious: 35,
  angry: 20
};

const MoodHistory = () => {
  const { history, moodDistribution } = useDashboard();

  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  const chartData = last7Days.map(date => {
    const dayName = date.toLocaleDateString([], { weekday: 'short' });
    
    const matchingItems = history.filter(item => {
      const itemDate = new Date(item.time);
      // Validate date parsing
      return !isNaN(itemDate.getTime()) && itemDate.toDateString() === date.toDateString();
    });
    
    let dailyValue = 60;
    let dailyEmotion = "neutral";
    
    if (matchingItems.length > 0) {
      const totalScore = matchingItems.reduce((acc, curr) => {
        const itemScore = curr.score || moodToValue[curr.emotion?.toLowerCase() || 'neutral'] || 60;
        return acc + itemScore;
      }, 0);
      dailyValue = Math.round(totalScore / matchingItems.length);
      dailyEmotion = matchingItems[matchingItems.length - 1].emotion || "neutral";
    } else {
      const dayIndex = date.getDay();
      const waveValues = [60, 65, 55, 70, 62, 75, 68];
      dailyValue = waveValues[dayIndex % waveValues.length];
    }
    
    return {
      time: dayName,
      value: dailyValue,
      emotion: dailyEmotion
    };
  });

  const rawEmotion = history.length > 0 ? history[history.length - 1].emotion : "Neutral";
  const currentEmotion = rawEmotion ? rawEmotion.split(' ')[0].replace(/[^a-zA-Z]/g, '') : "Neutral";

  const totalCount = Object.values(moodDistribution).reduce((a, b) => a + b, 0);

  return (
    <div className="rounded-[2.5rem] flex flex-col h-full min-h-[280px] p-6 lg:col-span-2 bg-gradient-to-br from-indigo-50/90 via-purple-50/80 to-pink-50/90 border border-purple-200/50 shadow-lg shadow-purple-500/5 text-indigo-950">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h3 className="text-xs font-black text-indigo-600 uppercase tracking-widest">
            Vibe Flow
          </h3>
          <p className="text-lg font-bold text-indigo-950 mt-1">
            Weekly Journey
          </p>
        </div>
        <div className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-600 text-[10px] font-black uppercase tracking-widest border border-indigo-200 animate-pulse">
          {currentEmotion}
        </div>
      </div>

      <div className="flex-1 min-h-[120px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorPrimary" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25}/>
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <Tooltip 
              contentStyle={{ 
                borderRadius: '1.25rem', 
                border: '1px solid #e2e8f0', 
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', 
                fontSize: '10px', 
                fontWeight: '800',
                background: '#ffffff' 
              }}
              itemStyle={{ color: '#8b5cf6' }}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="#8b5cf6" 
              strokeWidth={4}
              fillOpacity={1} 
              fill="url(#colorPrimary)" 
              animationDuration={1500}
            />
            <XAxis 
              dataKey="time" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fontWeight: 700, fill: '#4f46e5' }}
              dy={10}
            />
            <YAxis hide domain={[0, 100]} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 pt-4 border-t border-purple-200/50">
        <div className="flex justify-between items-center mb-3">
           <p className="text-xs font-semibold text-indigo-950/70 uppercase tracking-wider">Emotional Mix</p>
        </div>
        <div className="flex h-2 w-full bg-indigo-100/50 rounded-full overflow-hidden">
          {Object.entries(moodDistribution).map(([mood, count]) => {
            const colors: Record<string, string> = {
              happy: "bg-wellness-green",
              neutral: "bg-primary",
              sad: "bg-wellness-blue",
              anxious: "bg-wellness-pink",
              angry: "bg-wellness-orange",
              lonely: "bg-indigo-400"
            };
            const width = totalCount > 0 ? (count / totalCount) * 100 : 0;
            if (width === 0) return null;
            return (
              <motion.div 
                key={mood}
                initial={{ width: 0 }}
                animate={{ width: `${width}%` }}
                className={`${colors[mood] || "bg-muted-foreground/30"} h-full`}
              />
            );
          })}
        </div>
        <div className="flex flex-wrap gap-4 mt-4">
          {["happy", "neutral", "sad", "anxious", "angry"].map((mood) => {
            const colors: Record<string, string> = {
              happy: "bg-wellness-green",
              neutral: "bg-primary",
              sad: "bg-wellness-blue",
              anxious: "bg-wellness-pink",
              angry: "bg-wellness-orange"
            };
            return (
              <div key={mood} className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${colors[mood] || "bg-muted-foreground/30"}`} />
                <span className="text-xs font-semibold text-indigo-950/80 uppercase tracking-wider">
                  {mood}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MoodHistory;
