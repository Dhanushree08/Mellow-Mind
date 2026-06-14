import { Leaf, Camera, Hand, Brain, Music, List, Bell, Grid3X3, LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useDashboard } from "@/context/DashboardContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const navItems = [
  { icon: Camera, label: "Capture" },
  { icon: Hand, label: "Wellness" },
  { icon: Brain, label: "Mind" },
  { icon: Music, label: "Sounds" },
  { icon: List, label: "Journal" },
];

const Navbar = () => {
  const { userName } = useDashboard();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = () => {
    localStorage.removeItem("mellow_mind_username");
    localStorage.removeItem("mellow_mind_session_id");
    navigate("/");
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-card border-b border-border/50">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 flex items-center justify-center">
          <img src="/brain_logo.png" alt="Mellow Mind Brain Logo" className="w-8 h-8 object-contain" />
        </div>
        <span className="text-lg font-bold text-foreground">Mellow Mind</span>
      </div>
      <nav className="hidden md:flex items-center gap-1">
        {navItems.map(({ icon: Icon, label }) => (
          <button
            key={label}
            onClick={() => toast({ title: `${label} feature incoming ✨`, description: "We're preparing this space for you." })}
            className="p-3 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            title={label}
          >
            <Icon className="w-5 h-5" />
          </button>
        ))}
      </nav>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 mr-2">
          <span className="text-xs font-semibold text-muted-foreground hidden sm:inline">
            Hey, {userName}
          </span>
          <Avatar className="w-9 h-9 cursor-pointer border-2 border-wellness-green/20">
            <AvatarFallback className="bg-wellness-pink text-accent-foreground text-sm font-bold uppercase">
              {userName.substring(0, 1) || "B"}
            </AvatarFallback>
          </Avatar>
        </div>
        
        <button 
          onClick={handleLogout}
          className="p-2 rounded-full text-muted-foreground hover:text-red-500 hover:bg-red-50/50 transition-all group"
          title="Logout"
        >
          <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </button>

        <button 
          onClick={() => toast({ title: "Apps menu", description: "More wellness tools coming soon. 🌿" })}
          className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <Grid3X3 className="w-5 h-5" />
        </button>
        <button 
          onClick={() => toast({ title: "Notifications", description: "You are all caught up for today! 🌟" })}
          className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted transition-colors relative"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-wellness-orange rounded-full" />
        </button>
      </div>
    </header>
  );
};

export default Navbar;
