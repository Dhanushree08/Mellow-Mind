import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare, Calendar, ChevronRight, Search, Bot, User,
  Send, Plus, Trash2, MoreVertical, LayoutGrid, Clock, RefreshCw,
  Sparkles, Layout, Mic, MicOff
} from "lucide-react";
import { useDashboard } from "@/context/DashboardContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ChatContextPanel from "@/components/chat/ChatContextPanel";

type Session = {
  _id: string;
  last_time: string;
  message_count: number;
  first_message: string;
  top_emotion: string;
};

type ChatMessage = {
  role: "user" | "ai";
  text: string;
  time?: string;
  isCrisis?: boolean;
  audioUrl?: string;
};

const renderMessageText = (text: string, isCrisis?: boolean) => {
  if (!text) return null;

  const lines = text.split("\n");
  
  return lines.map((line, index) => {
    const boldAndLinkRegex = /(\*\*.*?\*\*|\[.*?\]\(.*?\))/g;
    const parts = line.split(boldAndLinkRegex);
    
    const parsedParts = parts.map((part, partIndex) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={partIndex} className="font-black">{part.slice(2, -2)}</strong>;
      }
      
      const linkMatch = part.match(/\[(.*?)\]\((.*?)\)/);
      if (linkMatch) {
        return (
          <a
            key={partIndex}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className={`underline hover:opacity-80 transition-opacity font-bold ${
              isCrisis ? "text-white hover:text-white/80" : "text-primary hover:text-primary/80"
            }`}
          >
            {linkMatch[1]}
          </a>
        );
      }
      
      return part;
    });

    const trimmed = line.trim();
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      const bulletContent = trimmed.slice(2);
      const bulletParts = bulletContent.split(boldAndLinkRegex).map((part, partIndex) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={partIndex} className="font-black">{part.slice(2, -2)}</strong>;
        }
        const linkMatch = part.match(/\[(.*?)\]\((.*?)\)/);
        if (linkMatch) {
          return (
            <a
              key={partIndex}
              href={linkMatch[2]}
              target="_blank"
              rel="noopener noreferrer"
              className={`underline hover:opacity-80 transition-opacity font-bold ${
                isCrisis ? "text-white hover:text-white/80" : "text-primary hover:text-primary/80"
              }`}
            >
              {linkMatch[1]}
            </a>
          );
        }
        return part;
      });

      return (
        <ul key={index} className="list-disc pl-5 my-1">
          <li>{bulletParts}</li>
        </ul>
      );
    }

    return (
      <div key={index} className="min-h-[0.5rem]">
        {parsedParts}
      </div>
    );
  });
};

const TypewriterMessage = ({ text, isCrisis, isNewest }: { text: string, isCrisis?: boolean, isNewest: boolean }) => {
  const [displayedText, setDisplayedText] = useState(isNewest ? "" : text);
  
  useEffect(() => {
    setDisplayedText(text);
  }, [text, isNewest]);

  return <>{renderMessageText(displayedText, isCrisis)}</>;
};

const Chat = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [contextPanelOpen, setContextPanelOpen] = useState(true);

  // Audio Recording States
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  
  const currentInputRef = useRef("");
  useEffect(() => { currentInputRef.current = input; }, [input]);

  const {
    userName, sessionId, setSessionId, startNewSession, fetchHistory,
    setEmotion, setMindVibeScore, setActivities, setMoodLabel
  } = useDashboard();

  const chatScrollRef = useRef<HTMLDivElement>(null);

  const fetchSessions = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
      const res = await fetch(`${apiUrl}/sessions?username=${userName}`);
      const data = await res.json();
      setSessions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
    }
  };

  const loadSession = async (sid: string) => {
    if (sid === selectedSessionId) return;
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
      const res = await fetch(`${apiUrl}/history?username=${userName}&session_id=${sid}`);
      const data = await res.json();

      const historyMessages = (data.history || []).map((d: any) => [
        { role: "user", text: d.message, time: d.time, audioUrl: d.audio_url ? `${apiUrl}${d.audio_url}` : undefined },
        { role: "ai", text: d.ai_reply, time: d.time, isCrisis: String(d.risk || "").toUpperCase().includes("HIGH") || String(d.emotion || "").toUpperCase() === "CRISIS" }
      ]).flat();
      setMessages(historyMessages);
      setSelectedSessionId(sid);
      setSessionId(sid);

      // Update contextual panel too
      if (data.analytics) {
        if (data.analytics.activities) setActivities(data.analytics.activities);
        if (data.analytics.emotion) setEmotion(data.analytics.emotion);
        if (data.analytics.mood_label) setMoodLabel(data.analytics.mood_label);
      }
    } catch (error) {
      console.error("Failed to load session:", error);
    }
    setLoading(false);
  };

  const handleNewChat = () => {
    startNewSession();
    setSelectedSessionId(null);
    setMessages([]);
  };

  const send = async (overrideText?: string | any, voiceAudioUrl?: string, backendAudioUrl?: string) => {
    const finalText = typeof overrideText === "string" ? overrideText : input;
    if (!finalText.trim() && !voiceAudioUrl) return;
    if (loading) return;

    const userMsg: ChatMessage = { role: "user", text: finalText, audioUrl: voiceAudioUrl };
    setMessages(prev => [...prev, userMsg]);

    if (typeof overrideText !== "string" || overrideText === input) {
      setInput("");
    }
    setLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
      const res = await fetch(`${apiUrl}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: userName || "Bestie",
          session_id: selectedSessionId,
          message: finalText,
          audio_url: backendAudioUrl || undefined
        }),
      });

      const data = await res.json();

      const aiMsg: ChatMessage = {
        role: "ai",
        text: data.reply || "I'm here with you. Tell me more.",
        isCrisis: String(data.emotion).toUpperCase() === "CRISIS" || String(data.risk).toUpperCase().includes("HIGH")
      };

      // Only play audio automatically for serious, crisis, or de-escalation messages
      // Casual chats like "I'm having a great day!" will stay completely silent as requested.
      const shouldPlayAudio = aiMsg.isCrisis || data.emotion === "Angry" || data.emotion === "Sad" || data.emotion === "Lonely" || String(data.risk).toUpperCase().includes("HIGH");
      
      if (shouldPlayAudio) {
        try {
          let textToSpeak = aiMsg.text;
          // If it's a crisis message, don't read the robotic phone numbers out loud!
          if (aiMsg.isCrisis && textToSpeak.includes("As an AI")) {
            textToSpeak = textToSpeak.split("As an AI")[0].trim();
          }

          const ttsAudio = new Audio(`${apiUrl}/tts?text=${encodeURIComponent(textToSpeak)}&emotion=${encodeURIComponent(data.emotion || 'Neutral')}`);
          ttsAudio.play().catch(e => console.error("Audio playback failed:", e));
        } catch (err) {
          console.error("Failed to fetch TTS:", err);
        }
      }

      setMessages(prev => [...prev, aiMsg]);

      if (data.emotion) setEmotion(data.emotion);
      if (data.mind_vibe_score !== undefined) setMindVibeScore(data.mind_vibe_score);
      if (data.activities) setActivities(data.activities);
      if (data.mood_label) setMoodLabel(data.mood_label);
      const currentSid = selectedSessionId || data.session_id;
      setSessionId(currentSid);

      await fetchSessions();
      if (!selectedSessionId) setSelectedSessionId(currentSid);
      fetchHistory(currentSid);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: "ai", text: "⚠️ Connection error. Please try again." }]);
    }
    setLoading(false);
  };

  const accumulatedChunksRef = useRef<Blob[]>([]);

  const isFinalizingRef = useRef(false);

  const startRecording = async () => {
    try {
      isFinalizingRef.current = false;
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      accumulatedChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          accumulatedChunksRef.current.push(e.data);
          
          // Send accumulated chunks for live typing via local faster-whisper
          const currentChunks = [...accumulatedChunksRef.current];
          const audioBlob = new Blob(currentChunks, { type: recorder.mimeType || 'audio/webm' });
          handleAudioUpload(audioBlob, false);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(accumulatedChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        const voiceAudioUrl = URL.createObjectURL(audioBlob);
        await handleAudioUpload(audioBlob, true, voiceAudioUrl);
        stream.getTracks().forEach(track => track.stop());
      };

      // Only fire when recording stops to prevent lag and ensure it processes the full file instantly
      recorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleAudioUpload = async (blob: Blob, isFinal: boolean, voiceAudioUrl?: string) => {
    if (isFinal) {
      setLoading(true);
      isFinalizingRef.current = true;
    }
    
    // If we are already finalizing/sending, ignore any delayed live-typing chunks
    if (!isFinal && isFinalizingRef.current) return;

    try {
      const formData = new FormData();
      formData.append("file", blob, "recording.webm");

      const apiUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
      const res = await fetch(`${apiUrl}/transcribe`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Transcription failed");

      const data = await res.json();
      if (data.text !== undefined) {
        if (isFinal) {
          const finalFullText = data.text ? data.text : currentInputRef.current;
          setInput(""); // Clear input box since we are sending it
          const permanentAudioUrl = data.audio_url ? `${apiUrl}${data.audio_url}` : voiceAudioUrl;
          send(finalFullText, permanentAudioUrl, data.audio_url);
        } else {
          if (data.text && !isFinalizingRef.current) setInput(data.text);
        }
      }
    } catch (error) {
      console.error("Transcription error:", error);
      if (isFinal) {
         const fallbackText = currentInputRef.current;
         setInput("");
         send(fallbackText, voiceAudioUrl);
      }
    }
    if (isFinal) setLoading(false);
  };

  useEffect(() => {
    fetchSessions();
  }, [userName]);

  useEffect(() => {
    if (sessionId && !selectedSessionId) {
      loadSession(sessionId);
    }
  }, [sessionId, selectedSessionId]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages]);

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr.replace(" ", "T"));
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden bg-gradient-to-tr from-purple-50/50 via-pink-50/30 to-indigo-50/50 text-indigo-950">
      {/* LEFT Sidebar - Chat History */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 300 : 0, opacity: sidebarOpen ? 1 : 0 }}
        className="border-r border-purple-200/50 bg-gradient-to-br from-indigo-50/80 via-purple-50/80 to-pink-50/80 flex flex-col overflow-hidden transition-all duration-300 shadow-xl z-20"
      >
        <div className="p-6">
          <Button
            onClick={handleNewChat}
            className="w-full justify-start gap-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 h-12 transition-all hover:scale-[1.02] active:scale-95"
          >
            <Plus size={20} />
            <span className="font-bold">New Session</span>
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-6 space-y-2 custom-scrollbar">
          <div className="flex items-center justify-between px-3 py-2">
            <h3 className="text-xs font-bold text-indigo-600/80 uppercase tracking-wider">History</h3>
            <button onClick={fetchSessions} className="p-1 hover:bg-purple-100 rounded-md text-indigo-600 transition-colors">
              <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
            </button>
          </div>

          {sessions.length === 0 ? (
            <div className="px-4 py-12 text-center space-y-2 opacity-50">
              <MessageSquare size={32} className="mx-auto text-indigo-600 mb-4" />
              <p className="text-xs font-bold uppercase tracking-widest text-indigo-950">No vibes found</p>
            </div>
          ) : (
            sessions.map((s) => (
              <button
                key={s._id}
                onClick={() => loadSession(s._id)}
                className={`w-full text-left p-4 rounded-2xl flex items-center gap-4 transition-all group relative border ${selectedSessionId === s._id
                    ? "bg-white text-indigo-950 border-purple-200 shadow-md shadow-purple-500/5 font-bold"
                    : "hover:bg-purple-100/40 text-indigo-950/70 hover:text-indigo-950 border-transparent"
                  }`}
              >
                <div className={`w-2 h-2 rounded-full shrink-0 ${selectedSessionId === s._id ? "bg-indigo-600 animate-pulse" : "bg-indigo-950/20"}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate leading-tight text-indigo-950">
                    {s.first_message || "Empty conversation"}
                  </p>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-[10px] font-semibold opacity-60 flex items-center gap-1 text-indigo-950">
                      <Clock size={10} />
                      {formatDate(s.last_time)}
                    </span>
                    {s.message_count > 0 && (
                      <span className="text-[9px] bg-purple-100/80 text-purple-700 px-1.5 py-0.5 rounded-md font-bold">{s.message_count}</span>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </motion.aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col relative min-w-0 bg-transparent">
        {/* Toggle Left Sidebar */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -left-3 top-1/2 -translate-y-1/2 z-30 w-6 h-12 bg-white border border-purple-200/50 rounded-full flex items-center justify-center text-indigo-950 hover:text-indigo-600 transition-all lg:flex hidden shadow-md"
        >
          {sidebarOpen ? <ChevronRight className="rotate-180" size={14} /> : <ChevronRight size={14} />}
        </button>

        {/* Chat Header */}
        <header className="px-6 py-4 border-b border-purple-200/40 flex items-center justify-between bg-white/40 backdrop-blur-md z-10 text-indigo-950">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600/10 flex items-center justify-center border border-indigo-200 text-indigo-600 shadow-sm">
              <Bot size={22} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-indigo-950 uppercase tracking-wider">Mellow Mind AI</h2>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-wellness-green animate-pulse" />
                <p className="text-[10px] text-indigo-950/60 font-semibold italic">Listening to your frequency...</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setContextPanelOpen(!contextPanelOpen)}
              className={`rounded-xl transition-all ${contextPanelOpen ? "bg-indigo-600/10 text-indigo-600" : "text-indigo-950/60"}`}
            >
              <Layout size={18} />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-xl text-indigo-950 hover:bg-indigo-600/10 hover:text-indigo-600"><MoreVertical size={18} /></Button>
          </div>
        </header>

        {/* Messages */}
        <div
          ref={chatScrollRef}
          className="flex-1 overflow-y-auto p-6 md:p-12 space-y-8 scroll-smooth custom-scrollbar"
        >
          <AnimatePresence initial={false}>
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white mb-8 shadow-xl shadow-purple-500/20 border-4 border-white"
                >
                  <Bot size={40} />
                </motion.div>
                <h3 className="text-3xl font-black text-indigo-950 mb-4">How can I help you today?</h3>
                <p className="text-xs text-indigo-950/70 max-w-sm mx-auto leading-relaxed font-bold">
                  Start a conversation about your feelings, your day, or anything on your mind. I'm your safe space.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-12 max-w-xl w-full">
                  {[
                    { text: "I'm feeling stressed", border: "border-pink-200", bg: "bg-pink-50 hover:bg-pink-100/50 text-pink-700 hover:border-pink-300", color: "var(--wellness-pink)" },
                    { text: "Help me focus", border: "border-indigo-200", bg: "bg-indigo-50 hover:bg-indigo-100/50 text-indigo-700 hover:border-indigo-300", color: "var(--wellness-blue)" },
                    { text: "Need to vent", border: "border-amber-200", bg: "bg-amber-50 hover:bg-amber-100/50 text-amber-700 hover:border-amber-300", color: "var(--wellness-orange)" },
                    { text: "Analyze my vibe", border: "border-purple-200", bg: "bg-purple-50 hover:bg-purple-100/50 text-purple-700 hover:border-purple-300", color: "var(--primary)" }
                  ].map(hint => (
                    <motion.button
                      key={hint.text}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setInput(hint.text)}
                      className={`p-5 rounded-2xl border text-xs font-bold transition-all text-left flex items-center justify-between group shadow-sm ${hint.border} ${hint.bg}`}
                    >
                      <span>{hint.text}</span>
                      <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-all" style={{ color: hint.color }} />
                    </motion.button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`flex gap-4 max-w-[90%] md:max-w-[75%] ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    <div className={`w-10 h-10 rounded-2xl flex-shrink-0 flex items-center justify-center shadow-md transition-transform hover:scale-110 ${msg.role === "user" ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/10" : "bg-white border border-purple-200 text-indigo-600 shadow-sm"
                      }`}>
                      {msg.role === "user" ? <User size={20} /> : <Bot size={20} />}
                    </div>
                    <div className={`relative p-5 rounded-[1.75rem] text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${msg.role === "user"
                        ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-tr-none shadow-md shadow-indigo-600/20 font-bold"
                        : msg.isCrisis
                          ? "bg-red-500 text-white rounded-tl-none shadow-lg shadow-red-500/20 border-none font-bold"
                          : "bg-white text-indigo-950 rounded-tl-none border border-purple-200/60 border-l-4 border-l-purple-500 shadow-sm font-bold"
                      }`}>
                      <TypewriterMessage 
                        text={msg.text} 
                        isCrisis={msg.isCrisis} 
                        isNewest={msg.role === "ai" && i === messages.length - 1} 
                      />
                      {msg.audioUrl && (
                        <div className="mt-3 mb-1">
                          <audio controls src={msg.audioUrl} className="h-9 w-full max-w-[240px] opacity-95" />
                        </div>
                      )}
                      {msg.time && (
                        <span className={`text-[9px] mt-2.5 block opacity-40 font-bold uppercase tracking-tighter ${msg.role === "user" ? "text-right" : "text-left"} ${msg.isCrisis ? "text-white opacity-60" : "text-indigo-950"}`}>
                          {formatDate(msg.time)}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
            {loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-white border border-purple-200 text-indigo-600 flex items-center justify-center shadow-sm">
                    <Bot size={20} />
                  </div>
                  <div className="bg-white border border-purple-200/60 border-l-4 border-l-purple-500 px-5 py-3 rounded-2xl flex items-center gap-2 shadow-sm">
                    <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                    <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                    <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Chat Input */}
        <footer className="p-6 md:p-10 bg-transparent">
          <div className="max-w-4xl mx-auto relative flex items-center gap-4">
            <div className="relative flex-1 group">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Tell me what's on your mind..."
                className="w-full h-16 pl-8 pr-32 rounded-3xl bg-white border border-purple-200 shadow-xl focus-visible:ring-indigo-200/50 text-base font-bold text-indigo-950 transition-all group-hover:border-indigo-400"
              />
              <Button
                onClick={isRecording ? stopRecording : startRecording}
                className={`absolute right-14 top-1/2 -translate-y-1/2 h-10 w-10 rounded-[1.25rem] transition-all active:scale-90 ${isRecording
                    ? "bg-red-500 hover:bg-red-600 text-white animate-pulse"
                    : "bg-purple-100 hover:bg-purple-200 text-purple-700"
                  }`}
              >
                {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
              </Button>
              <Button
                onClick={send}
                disabled={!input.trim() || loading || isRecording}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 rounded-[1.25rem] bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 transition-all active:scale-90 disabled:opacity-30"
              >
                <Send size={20} />
              </Button>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setContextPanelOpen(!contextPanelOpen)}
              className="h-16 w-16 rounded-3xl bg-white border border-purple-200 shadow-md hover:border-indigo-300 hover:text-indigo-600 transition-all hidden sm:flex group"
            >
              <Sparkles size={22} className="text-indigo-950/60 group-hover:text-indigo-600 transition-colors" />
            </Button>
          </div>
        </footer>
      </main>

      {/* RIGHT Sidebar - Live Contextual Panel */}
      <motion.aside
        initial={false}
        animate={{ width: contextPanelOpen ? 350 : 0, opacity: contextPanelOpen ? 1 : 0 }}
        className="border-l border-purple-200/50 bg-gradient-to-br from-purple-50/80 via-pink-50/80 to-indigo-50/80 flex flex-col overflow-hidden transition-all duration-300 z-20"
      >
        <ChatContextPanel />
      </motion.aside>
    </div>
  );
};

export default Chat;
