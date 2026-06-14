import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { day: "Mon", mood: 65, energy: 50 },
  { day: "Tue", mood: 72, energy: 60 },
  { day: "Wed", mood: 58, energy: 45 },
  { day: "Thu", mood: 80, energy: 70 },
  { day: "Fri", mood: 75, energy: 65 },
  { day: "Sat", mood: 85, energy: 80 },
  { day: "Sun", mood: 78, energy: 72 },
];

const EmotionTrend = () => (
  <div className="wellness-card">
    <div className="flex items-center justify-between mb-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Emotion Trend</h3>
        <p className="text-xs text-muted-foreground">This week's vibe</p>
      </div>
      <div className="flex gap-3 text-[10px]">
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-wellness-green" /> Mood</span>
        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-wellness-pink-strong" /> Energy</span>
      </div>
    </div>
    <ResponsiveContainer width="100%" height={160}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(72,60%,50%)" stopOpacity={0.3} />
            <stop offset="100%" stopColor="hsl(72,60%,50%)" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(340,70%,65%)" stopOpacity={0.3} />
            <stop offset="100%" stopColor="hsl(340,70%,65%)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "hsl(160,5%,45%)" }} />
        <YAxis hide domain={[30, 100]} />
        <Tooltip
          contentStyle={{
            background: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "12px",
            fontSize: "12px",
          }}
        />
        <Area type="monotone" dataKey="mood" stroke="hsl(72,60%,50%)" fill="url(#moodGrad)" strokeWidth={2} />
        <Area type="monotone" dataKey="energy" stroke="hsl(340,70%,65%)" fill="url(#energyGrad)" strokeWidth={2} />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

export default EmotionTrend;
