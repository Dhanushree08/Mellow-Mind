import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, Sparkles, Moon, Sun } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const emojis = ["😊","✨","🌸","🌿","🧠","💫","🌈"];

const Login = () => {

  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [showPassword,setShowPassword] = useState(false);
  const [dark,setDark] = useState(false);
  const [isLoading,setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: "Fill all fields bestie ✨",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const loginId = email.split('@')[0];
      const formattedName = loginId ? loginId.charAt(0).toUpperCase() + loginId.slice(1) : "Bestie";
      
      const apiUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
      const res = await fetch(`${apiUrl}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formattedName,
          email: email,
          password: password
        })
      });

      const data = await res.json();

      if (data.status === "success") {
        localStorage.setItem("mellow_mind_username", data.username);
        toast({
          title: `Welcome back ${data.username} 🌸`
        });
        navigate("/dashboard");
      } else {
        toast({
          title: "Login failed 😔",
          description: data.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Server error 😔",
        description: "Make sure your backend is running.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (

    <div className={`min-h-screen flex items-center justify-center p-6
    ${dark
      ? "bg-gradient-to-br from-gray-900 via-purple-900 to-black"
      : "bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100"
    }`}>

      {/* Floating emojis */}

      <div className="absolute inset-0 overflow-hidden pointer-events-none">

        {emojis.map((emoji,i)=>(
          <motion.div
            key={i}
            className="absolute text-2xl opacity-40"
            initial={{y:200,opacity:0}}
            animate={{y:-200,opacity:[0,0.6,0]}}
            transition={{
              duration:8+i,
              repeat:Infinity
            }}
            style={{
              left:`${10 + i*12}%`
            }}
          >
            {emoji}
          </motion.div>
        ))}

      </div>


      {/* Dark Mode Toggle */}

      <button
        onClick={()=>setDark(!dark)}
        className="absolute top-6 right-6 p-2 rounded-full bg-white/40 backdrop-blur"
      >
        {dark ? <Sun size={20}/> : <Moon size={20}/>}
      </button>



      {/* Login Card */}

      <motion.div
        initial={{opacity:0,y:30}}
        animate={{opacity:1,y:0}}
        className={`w-full max-w-md rounded-2xl shadow-xl p-8
        backdrop-blur-xl border border-white/40
        ${dark ? "bg-black/40 text-white" : "bg-white/70"}`}
      >

        {/* Logo */}

        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 flex items-center justify-center">
            <img src="/logo.png" alt="Mellow Mind Logo" className="w-9 h-9 object-contain" />
          </div>
          <span className="text-xl font-bold">
            Mellow Mind
          </span>
        </div>



        {/* Title */}

        <h1 className="text-3xl font-bold mb-1">
          Hey there 👋
        </h1>

        <p className="text-sm opacity-70 mb-6">
          Ready to vibe with your mind today?
        </p>



        {/* Form */}

        <form onSubmit={handleLogin} className="space-y-4">

          <Input
            type="email"
            placeholder="your vibe email ✉️"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            className="h-12 rounded-xl bg-white/60"
          />



          <div className="relative">

            <Input
              type={showPassword ? "text":"password"}
              placeholder="secret password 🔒"
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
              className="h-12 rounded-xl bg-white/60 pr-12"
            />

            <button
              type="button"
              onClick={()=>setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2"
            >
              {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
            </button>

          </div>



          {/* Login Button */}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-12 rounded-xl
            bg-gradient-to-r from-pink-500 to-purple-500 text-white"
          >

            {isLoading ? "Logging you in..." : "Let's go 🚀"}

          </Button>



          {/* Google Login */}

          <Button
            type="button"
            className="w-full h-12 rounded-xl bg-white border text-black"
          >
            Continue with Google 🌐
          </Button>

        </form>



        {/* Footer */}

        <p className="text-center text-sm opacity-70 mt-6">

          New here?

          <span className="text-purple-500 font-semibold ml-1 cursor-pointer">
            Join the vibe ✨
          </span>

        </p>

      </motion.div>

    </div>

  );

};

export default Login;
