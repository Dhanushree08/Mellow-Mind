import React, { createContext, useContext, useState, useEffect } from "react";

export type HistoryItem = {
  emotion: string;
  time: string;
  score?: number;
  message?: string;
  ai_reply?: string;
  risk?: string;
  is_dummy?: boolean;
};

export type DashboardContextType = {
  userName: string;
  setUserName: (n: string) => void;
  sessionId: string;
  setSessionId: (id: string) => void;
  startNewSession: () => void;
  emotion: string;
  setEmotion: (e: string) => void;
  mindVibeScore: number | null;
  setMindVibeScore: (score: number) => void;
  trend: string;
  setTrend: (trend: string) => void;
  tomorrowPrediction: string;
  setTomorrowPrediction: (pred: string) => void;
  stress: string;
  setStress: (s: string) => void;
  energy: string;
  setEnergy: (e: string) => void;
  moodLabel: string;
  setMoodLabel: (m: string) => void;
  activities: string[];
  setActivities: (acts: string[]) => void;
  history: HistoryItem[];
  fetchHistory: (overrideSid?: string) => Promise<void>;
  completedTasksWeek: number;
  completeActivity: (activity: string) => Promise<void>;
  moodDistribution: Record<string, number>;
  setMoodDistribution: (d: Record<string, number>) => void;
  riskDistribution: Record<string, number>;
  setRiskDistribution: (d: Record<string, number>) => void;
};

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userName, setUserName] = useState<string>(() => {
    const stored = localStorage.getItem("mellow_mind_username");
    // Migrate old/incorrect usernames to the canonical demo user
    if (!stored || stored === "Dhanu" || stored === "Bestie" || stored === "demo_user") {
      localStorage.setItem("mellow_mind_username", "Dhanushree.K");
      return "Dhanushree.K";
    }
    return stored;
  });
  const [sessionId, setSessionId] = useState<string>(() => Math.random().toString(36).substring(7));
  const [emotion, setEmotion] = useState<string>("neutral");
  const [mindVibeScore, setMindVibeScore] = useState<number>(0);
  const [trend, setTrend] = useState("");
  const [tomorrowPrediction, setTomorrowPrediction] = useState("");
  const [stress, setStress] = useState("Chill");
  const [energy, setEnergy] = useState("Vibing");
  const [moodLabel, setMoodLabel] = useState("Real");
  const [activities, setActivities] = useState<string[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [completedTasksWeek, setCompletedTasksWeek] = useState<number>(0);
  const [moodDistribution, setMoodDistribution] = useState<Record<string, number>>({ happy: 0, neutral: 0, sad: 0, anxious: 0, angry: 0 });
  const [riskDistribution, setRiskDistribution] = useState<Record<string, number>>({ LOW: 0, MEDIUM: 0, HIGH: 0 });

  const fetchHistory = async (overrideSid?: string) => {
    try {
      const activeSid = overrideSid || sessionId;
      const apiUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
      const res = await fetch(`${apiUrl}/history?username=${userName}&session_id=${activeSid}`);
      const data = await res.json();
      if (data.all_history) {
        setHistory(data.all_history);
      } else if (data.history) {
        setHistory(data.history);
      }
      if (data.analytics && Object.keys(data.analytics).length > 0) {
        if (data.analytics.mind_vibe_score !== undefined) setMindVibeScore(data.analytics.mind_vibe_score);
        if (data.analytics.trend) setTrend(data.analytics.trend);
        if (data.analytics.tomorrow_prediction) setTomorrowPrediction(data.analytics.tomorrow_prediction);
        if (data.analytics.stress) setStress(data.analytics.stress);
        if (data.analytics.energy) setEnergy(data.analytics.energy);
        
        // Only set emotion and activities if the current session actually has history
        const hasHistory = data.history && data.history.length > 0;
        if (hasHistory) {
          if (data.analytics.mood_label) setMoodLabel(data.analytics.mood_label);
          if (data.analytics.emotion) setEmotion(data.analytics.emotion);
          if (data.analytics.activities) setActivities(data.analytics.activities);
        }
        
        if (data.analytics.completed_tasks_week !== undefined) setCompletedTasksWeek(data.analytics.completed_tasks_week);
        if (data.analytics.mood_distribution) {
          // Merge with base 5 so all moods always show
          const base = { happy: 0, neutral: 0, sad: 0, anxious: 0, angry: 0 };
          const normalized: Record<string, number> = {};
          Object.entries(data.analytics.mood_distribution).forEach(([k, v]) => {
            const key = k.toLowerCase();
            if (base.hasOwnProperty(key)) normalized[key] = (normalized[key] || 0) + (v as number);
          });
          setMoodDistribution({ ...base, ...normalized });
        }
        if (data.analytics.risk_distribution) setRiskDistribution(data.analytics.risk_distribution);
      }
    } catch (error) {
      console.error("Failed to fetch history:", error);
    }
  };

  const completeActivity = async (activity: string) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
      await fetch(`${apiUrl}/activity/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: userName, session_id: sessionId, activity })
      });
      // Re-fetch history to get the boosted Mind Vibe Score and updated completed count
      await fetchHistory();
    } catch (error) {
      console.error("Failed to complete activity:", error);
    }
  };

  const startNewSession = () => {
    setSessionId(Math.random().toString(36).substring(7));
    setHistory([]);
    setMindVibeScore(0);
    setTrend("");
    setTomorrowPrediction("");
    setStress("Chill");
    setEnergy("Vibing");
    setMoodLabel("Real");
    setActivities([]);
    setEmotion("neutral");
  };

  useEffect(() => {
    localStorage.setItem("mellow_mind_username", userName);
  }, [userName]);

  useEffect(() => {
    localStorage.setItem("mellow_mind_session_id", sessionId);
  }, [sessionId]);

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  return (
    <DashboardContext.Provider
      value={{
        userName,
        setUserName,
        sessionId,
        setSessionId,
        startNewSession,
        emotion,
        setEmotion,
        mindVibeScore,
        setMindVibeScore,
        trend,
        setTrend,
        tomorrowPrediction,
        setTomorrowPrediction,
        stress,
        setStress,
        energy,
        setEnergy,
        moodLabel,
        setMoodLabel,
        activities,
        setActivities,
        history,
        fetchHistory,
        completedTasksWeek,
        completeActivity,
        moodDistribution,
        setMoodDistribution,
        riskDistribution,
        setRiskDistribution,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
};

