import { motion, AnimatePresence } from "framer-motion";
import { User, Bell, Shield, Palette, HelpCircle, LogOut, Moon, Sun, Monitor, ChevronRight, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDashboard } from "@/context/DashboardContext";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";

const sections = [
  { id: "notifications", icon: Bell, label: "Pings (Notifications)", desc: "Manage your vibe check alerts" },
  { id: "privacy", icon: Shield, label: "Safe Space (Privacy)", desc: "Your data stays locked in the vault" },
  { id: "appearance", icon: Palette, label: "Aesthetics (Appearance)", desc: "Dark mode, colors, and dashboard layout" },
  { id: "support", icon: HelpCircle, label: "SOS (Help & Support)", desc: "FAQs and asking for help" },
];

const Settings = () => {
  const navigate = useNavigate();
  const { userName, setUserName } = useDashboard();
  const { toast } = useToast();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light");
  
  // Real setting states
  const [notifications, setNotifications] = useState(true);
  const [anonMode, setAnonMode] = useState(false);
  const [biometric, setBiometric] = useState(true);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  const toggleTheme = (newTheme: "light" | "dark" | "system") => {
    setTheme(newTheme);
    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    toast({ title: "Theme updated ✨", description: "Your aesthetic has been applied." });
  };

  const handleLogout = () => {
    toast({ title: "Session Terminated", description: "Stay safe, Bestie! 💛" });
    setTimeout(() => navigate("/"), 500);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 sm:px-10 py-10 space-y-10 text-indigo-950">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-2 mb-2">
           <span className="text-xs font-bold uppercase tracking-[0.2em] text-indigo-600">Preferences</span>
           <div className="h-[1px] w-8 bg-purple-200" />
        </div>
        <h1 className="text-4xl font-black tracking-tighter text-indigo-950">
          System <span className="text-indigo-600">Settings</span>
        </h1>
        <p className="text-base text-indigo-950/70 mt-2 font-bold">
          Customize your mental sanctuary.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: General Info */}
        <div className="lg:col-span-4 space-y-6">
           <motion.div
             initial={{ opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             className="p-8 bg-gradient-to-br from-indigo-50/90 via-purple-50/80 to-pink-50/90 border border-purple-200/50 rounded-[2.5rem] shadow-sm text-indigo-950"
           >
              <div className="w-16 h-16 rounded-[1.5rem] bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-600/20 mb-6">
                 <User size={32} />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2">Profile Aura</h3>
              <p className="text-sm font-bold text-indigo-950/80 mb-6">Update how the AI addresses you.</p>
              <div className="space-y-4">
                 <Input 
                   value={userName} 
                   onChange={(e) => setUserName(e.target.value)} 
                   placeholder="Enter your name..."
                   className="rounded-xl border-purple-200 focus-visible:ring-indigo-200 focus:border-indigo-400 bg-white h-12 font-bold text-indigo-950"
                 />
                 <Button onClick={() => toast({ title: "Saved! ✅", description: "Name updated successfully." })} className="w-full h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs uppercase tracking-widest shadow-md shadow-indigo-600/10">Update Profile</Button>
              </div>
           </motion.div>
           
           <Button
             variant="outline"
             onClick={handleLogout}
             className="w-full rounded-[1.25rem] h-14 border-pink-200 text-pink-500 hover:bg-pink-50 font-bold uppercase tracking-widest text-xs"
           >
             <LogOut className="w-4 h-4 mr-2" /> Terminate Session
           </Button>
        </div>

        {/* Right Side: Options */}
        <div className="lg:col-span-8 space-y-4">
          {sections.map(({ id, icon: Icon, label, desc }, i) => (
            <motion.div
              key={id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`wellness-card p-6 overflow-hidden transition-all group ${expandedSection === id ? "border-primary/40 ring-1 ring-primary/20" : "hover:border-primary/30"}`}
            >
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setExpandedSection(expandedSection === id ? null : id)}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${expandedSection === id ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10" : "bg-purple-50 text-indigo-950/60 group-hover:bg-indigo-50 group-hover:text-indigo-600"}`}>
                    <Icon size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-indigo-950 uppercase tracking-tight">{label}</p>
                    <p className="text-[10px] text-indigo-950/60 font-bold mt-1 uppercase tracking-widest">{desc}</p>
                  </div>
                </div>
                <ChevronRight size={20} className={`text-muted-foreground transition-transform ${expandedSection === id ? "rotate-90" : ""}`} />
              </div>

              <AnimatePresence>
                {expandedSection === id && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: "auto" }} 
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="pt-6 mt-6 border-t border-purple-100 space-y-6 text-indigo-950">
                       {id === "appearance" && (
                         <div className="space-y-6">
                            <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">Theme Selection</p>
                            <div className="grid grid-cols-3 gap-4">
                              {[
                                { name: "Light", icon: Sun, val: "light" },
                                { name: "Dark", icon: Moon, val: "dark" },
                                { name: "System", icon: Monitor, val: "system" }
                              ].map(t => (
                                <Button 
                                  key={t.val}
                                  onClick={() => toggleTheme(t.val as any)}
                                  variant={theme === t.val ? "default" : "outline"}
                                  className={`rounded-2xl h-20 flex flex-col gap-2 transition-all ${
                                    theme === t.val ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10" : "border-purple-200 hover:border-indigo-400 bg-white text-indigo-950"
                                  }`}
                                >
                                  <t.icon size={20} />
                                  <span className="text-[10px] font-bold uppercase tracking-widest">{t.name}</span>
                                  {theme === t.val && <Check size={12} className="absolute top-2 right-2" />}
                                </Button>
                              ))}
                            </div>
                         </div>
                       )}

                       {id === "notifications" && (
                         <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-purple-50/50 border border-purple-100">
                               <div>
                                  <p className="text-xs font-bold uppercase tracking-widest text-indigo-950">Push Notifications</p>
                                  <p className="text-[10px] text-indigo-950/60 mt-1 font-bold">Daily vibe checks and community pings</p>
                               </div>
                               <Switch checked={notifications} onCheckedChange={(val) => {
                                 setNotifications(val);
                                 toast({ title: val ? "Pings Enabled" : "Pings Silenced", description: "Notification settings updated." });
                               }} />
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-purple-50/50 border border-purple-100 opacity-50">
                               <div>
                                  <p className="text-xs font-bold uppercase tracking-widest text-indigo-950">Email Journal</p>
                                  <p className="text-[10px] text-indigo-950/60 mt-1 font-bold">Weekly summary of your mental growth</p>
                               </div>
                               <Switch disabled checked={false} />
                            </div>
                         </div>
                       )}

                       {id === "privacy" && (
                         <div className="space-y-6">
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-purple-50/50 border border-purple-100">
                               <div>
                                  <p className="text-xs font-bold uppercase tracking-widest text-indigo-950">Anonymous Identity</p>
                                  <p className="text-[10px] text-indigo-950/60 mt-1 font-bold">Hide your username in the community feed</p>
                               </div>
                               <Switch checked={anonMode} onCheckedChange={(val) => {
                                 setAnonMode(val);
                                 toast({ title: val ? "Ghost Mode Active" : "Identity Visible", description: "Community privacy updated." });
                               }} />
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-purple-50/50 border border-purple-100">
                               <div>
                                  <p className="text-xs font-bold uppercase tracking-widest text-indigo-950">Vault Lock</p>
                                  <p className="text-[10px] text-indigo-950/60 mt-1 font-bold">Require biometrics to open Journal</p>
                               </div>
                               <Switch checked={biometric} onCheckedChange={setBiometric} />
                            </div>
                         </div>
                       )}

                       {id === "support" && (
                         <div className="space-y-4">
                            <Button className="w-full justify-between h-12 rounded-xl bg-purple-50/50 border border-purple-100 hover:bg-indigo-50 hover:text-indigo-600 transition-all text-indigo-950 group/item">
                               <span className="text-xs font-bold uppercase tracking-widest">Help Center</span>
                               <ChevronRight size={16} />
                            </Button>
                            <Button className="w-full justify-between h-12 rounded-xl bg-purple-50/50 border border-purple-100 hover:bg-indigo-50 hover:text-indigo-600 transition-all text-indigo-950 group/item">
                               <span className="text-xs font-bold uppercase tracking-widest">Contact Support</span>
                               <ChevronRight size={16} />
                            </Button>
                         </div>
                       )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Settings;
