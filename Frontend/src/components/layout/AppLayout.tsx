import { useState, useEffect } from "react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, BookOpen, BarChart3, Users, Settings,
  Moon, Sun, Menu, X, Leaf, Search, Bell, Mic, MessageSquare,
  LogOut, Palette, ChevronDown, User
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { useDashboard } from "@/context/DashboardContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: MessageSquare, label: "Chat", path: "/chat" },
  { icon: BookOpen, label: "Journal", path: "/journal" },
  { icon: BarChart3, label: "Vibe Check", path: "/analytics" },
  { icon: Users, label: "Community", path: "/community" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

const AppLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem("theme") === "dark");
  const { userName } = useDashboard();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    toast({
      title: !darkMode ? "Dark Mode Active 🌙" : "Light Mode Active ☀️",
      description: "Aesthetic updated."
    });
  };

  const handleLogout = () => {
    toast({ title: "Logging out...", description: "See you later, Bestie! 💛" });
    setTimeout(() => navigate("/"), 800);
  };

  return (
    <div className="min-h-screen bg-background flex text-foreground">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-72 bg-card border-r border-border/50 z-40 flex flex-col transition-all duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-8">
          <div className="w-12 h-12 flex items-center justify-center">
            <img src="/logo.png" alt="Mellow Mind Logo" className="w-11 h-11 object-contain" />
          </div>
          <span className="text-xl font-bold tracking-tight">Mellow Mind</span>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto lg:hidden p-2 hover:bg-muted rounded-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-2 space-y-2 overflow-y-auto custom-scrollbar">
          {navItems.map(({ icon: Icon, label, path }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-medium transition-all duration-300 relative group ${active
                    ? "bg-primary text-white shadow-xl shadow-primary/20"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
              >
                <Icon className={`w-5 h-5 transition-transform duration-300 ${active ? "scale-110" : "group-hover:scale-110"}`} />
                <span>{label}</span>
                {active && (
                  <motion.div
                    layoutId="sidebar-dot"
                    className="absolute right-4 w-1.5 h-1.5 rounded-full bg-white"
                  />
                )}
              </Link>
            );
          })}
        </nav>


      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex items-center justify-between px-4 sm:px-8 py-4 bg-background/80 backdrop-blur-xl border-b border-border/30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2.5 rounded-2xl bg-card border border-border/50 shadow-sm text-muted-foreground hover:text-foreground transition-all"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="relative hidden md:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search anything..."
                className="pl-12 pr-12 h-12 rounded-2xl bg-card border-border/50 w-64 lg:w-80 shadow-sm focus:ring-primary/20 transition-all"
              />
              <button className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <Mic className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden sm:flex flex-col items-end mr-1">
              <span className="text-sm font-bold text-foreground leading-tight">{userName || "Bestie"}</span>
              <span className="text-[10px] text-primary font-bold uppercase tracking-wider">Online ✨</span>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger className="focus:outline-none">
                <div className="relative group">
                  <Avatar className="w-10 h-10 sm:w-11 sm:h-11 cursor-pointer border-2 border-primary/20 group-hover:border-primary transition-all shadow-md group-active:scale-95">
                    <AvatarFallback className="bg-primary text-white text-sm font-bold">
                      {userName ? userName.charAt(0).toUpperCase() : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5 border border-border shadow-sm">
                    <ChevronDown size={10} className="text-muted-foreground" />
                  </div>
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 border-border/50 shadow-2xl">
                <DropdownMenuLabel className="px-3 py-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Account Aura</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => navigate("/settings")} className="rounded-xl p-3 flex items-center gap-3 cursor-pointer">
                  <User size={16} className="text-primary" />
                  <span className="text-xs font-bold">Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={toggleDarkMode} className="rounded-xl p-3 flex items-center gap-3 cursor-pointer">
                  {darkMode ? <Sun size={16} className="text-amber-500" /> : <Moon size={16} className="text-indigo-400" />}
                  <span className="text-xs font-bold">{darkMode ? "Light Mode" : "Dark Mode"}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-2 bg-border/50" />
                <DropdownMenuItem onClick={handleLogout} className="rounded-xl p-3 flex items-center gap-3 cursor-pointer text-wellness-pink hover:text-wellness-pink hover:bg-wellness-pink/10 focus:text-wellness-pink focus:bg-wellness-pink/10">
                  <LogOut size={16} />
                  <span className="text-xs font-bold">Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-background custom-scrollbar">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
