import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, User, Compass, Users, Bell, Activity, Globe, Search, MessageSquare, Bot, X, Send, Mic, Shield } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import AIAssistant from "../components/AIAssistant";
import { useApp } from "../context/AppContext";
import { motion, AnimatePresence } from "motion/react";

// Simple Helper Lucide Grid icon replacement
function GridIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="7" height="7" x="3" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="3" rx="1" />
      <rect width="7" height="7" x="14" y="14" rx="1" />
      <rect width="7" height="7" x="3" y="14" rx="1" />
    </svg>
  );
}

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, setLanguage, user, logout } = useAuth();
  const { notifications } = useApp();
  const unreadCount = notifications?.filter(n => !n.read).length || 0;
  const [showGuestModal, setShowGuestModal] = useState(false);

  const handleNav = (path) => {
    if (user?.role === "guest" && (path === "/services" || path === "/community" || path === "/notifications")) {
      setShowGuestModal(true);
      return;
    }
    navigate(path);
  };

  const [isAiOpen, setIsAiOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "bot"; text: string }[]>([
    { role: "bot", text: language === "hi" ? "नमस्ते! मैं RP Foundation एआई मित्र हूँ। मैं आपकी क्या सहायता कर सकता हूँ?" : "Hello! I am your RP Foundation AI Mitr. How can I help you today?" }
  ]);
  const [inputText, setInputText] = useState("");
  const [botLoading, setBotLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const handleSend = async (messageText = inputText) => {
    const text = messageText.trim();
    if (!text) return;
    
    setChatMessages(prev => [...prev, { role: "user", text }]);
    setInputText("");
    setBotLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, language })
      });
      
      if (!response.ok) throw new Error();
      const data = await response.json();
      setChatMessages(prev => [...prev, { role: "bot", text: data.response }]);
    } catch {
      setTimeout(() => {
        const reply = language === "hi" 
          ? "यह एक डेमो प्रक्रिया है। अधिक जानकारी के लिए जन सेवा कार्ड या राहत शिविरों की जांच करें!"
          : "This is a demo process. Check out our Jan Seva Card or active relief camps for more details!";
        setChatMessages(prev => [...prev, { role: "bot", text: reply }]);
      }, 1000);
    } finally {
      setBotLoading(false);
    }
  };

  const handleMicClick = () => {
    setIsListening(true);
    setTimeout(() => {
      setIsListening(false);
      setInputText(language === "hi" ? "जन सेवा कार्ड कैसे बनेगा?" : "How do I apply for a Jan Seva Card?");
    }, 2000);
  };

  // Determine if we show the back button based on route
  const isRoot = ["/", "/services", "/community", "/notifications", "/profile"].includes(location.pathname);
  
  const getPageTitle = () => {
    const isHi = language === "hi";
    if (location.pathname === "/") return isHi ? "नागरिक पोर्टल" : "Citizen Portal";
    if (location.pathname === "/services") return isHi ? "सेवाएं" : "Services";
    if (location.pathname === "/community") return isHi ? "समुदाय" : "Community";
    if (location.pathname === "/notifications") return isHi ? "नवीनतम सूचनाएं" : "Alerts";
    if (location.pathname === "/profile") return isHi ? "प्रोफ़ाइल" : "Profile";
    if (location.pathname.includes("jan-seva-card")) return isHi ? "जन सेवा कार्ड" : "Jan Seva Card";
    if (location.pathname.includes("blood-network")) return isHi ? "रक्त नेटवर्क" : "Blood Network";
    if (location.pathname.includes("grievance")) return isHi ? "शिकायत निवारण" : "Grievance Portal";
    return "RP Foundation";
  };

  return (
    <div className="w-full min-h-screen bg-slate-900 flex flex-col items-center justify-center font-sans p-0 sm:p-4">
      
      {/* Desktop Header info panel */}
      <div className="hidden sm:flex w-full max-w-[420px] justify-between items-center px-4 py-2 mb-2 select-none">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
          <span className="font-bold text-slate-300 text-xs tracking-wide">RP Super App v4.2</span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setLanguage(language === "hi" ? "en" : "hi")}
            className="flex items-center gap-1 bg-white/10 hover:bg-white/20 border border-slate-700 text-white transition px-2.5 py-1 rounded-full text-[10px]"
          >
            <Globe className="w-3 h-3 text-[#FF9933]" />
            <span>{language === "hi" ? "English" : "हिन्दी"}</span>
          </button>
        </div>
      </div>

      {/* Primary Mobile Container Frame */}
      <div className="relative w-full sm:w-[410px] h-screen sm:h-[840px] bg-heritage-base flex flex-col overflow-hidden sm:rounded-[3.2rem] sm:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] sm:border-[12px] sm:border-slate-950 animate-fadeIn" id="mobile-viewport-shell">
        
        {/* Notch / Dynamic Island Simulator (for desktop styling) */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full z-[60] pointer-events-none hidden sm:flex items-center justify-between px-3">
          <div className="w-1.5 h-1.5 bg-slate-900 rounded-full"></div>
          <div className="w-3 h-1 bg-slate-900 rounded-full"></div>
        </div>

        {/* Simulated Mobile Status Bar (Visible only on desktop preview, hidden on mobile/production device) */}
        <div className="hidden sm:flex w-full bg-white/95 backdrop-blur-xl px-6 pt-3 pb-1 justify-between items-center text-[10px] font-black text-slate-800 select-none z-[50] sticky top-0 border-b border-slate-100 shrink-0">
          <span>9:41</span>
          <div className="flex items-center gap-1.5">
            {/* Signal Strength */}
            <svg className="w-3 h-3 text-slate-800" fill="currentColor" viewBox="0 0 24 24">
              <path d="M2 22h20V2z" />
            </svg>
            {/* WiFi */}
            <svg className="w-3.5 h-3.5 text-slate-800" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 21l-12-14c4-3 8-4.5 12-4.5s8 1.5 12 4.5z" />
            </svg>
            {/* Battery */}
            <div className="w-5 h-2.5 border border-slate-800 rounded-xs p-[1px] flex items-center justify-start shrink-0">
              <div className="h-full w-3 bg-slate-800 rounded-2xs"></div>
            </div>
          </div>
        </div>

        {/* Header & Identity Clean-off */}
        <div className="w-full bg-white/95 backdrop-blur-xl border-b border-slate-200/50 px-4 py-2.5 flex justify-between items-center select-none z-45 relative overflow-hidden shrink-0" id="app-navigation-header">
          {/* Abstract Ashoka Chakra Background */}
          <div className="absolute inset-0 flex justify-center items-center opacity-[0.03] pointer-events-none">
            <svg viewBox="0 0 100 100" className="w-48 h-48 text-[#000080] mix-blend-multiply" fill="currentColor">
              <path d="M50 0a50 50 0 1 0 0 100A50 50 0 0 0 50 0zm0 95a45 45 0 1 1 0-90 45 45 0 0 1 0 90z"/>
              <circle cx="50" cy="50" r="8" />
              <path d="M50 42L48 5l2-5 2 5zm-4 3l-18-35 4-3 14 38zm-3 5L8 31l5-2 30 16zM42 50L5 48l-5-2 5 2zM45 54l-35 18-3-4 38-14zm5 3l-31 28-2-5 33-23zm4 3l-18 35-3-4 21-31zm5 3L52 95l-5-2 16-30zm3-4l35 18-2 5-33-23zm4-3l28 31-4 3-24-34zm3-5l38-14-5-2-33 16zm2-5l37 2-5-2-32 0zm-2-5l35-18 2 5-37 13zm-4-3l28-31 4 3-32 28zm-4-4l18-35 3 4-21 31z"/>
            </svg>
          </div>
          
          {/* Top Thin Border */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-[#000080] opacity-90"></div>
          
          {/* Left: Brand Identity */}
          <div className="flex items-center gap-2.5 relative z-10">
            {!isRoot ? (
              <button onClick={() => navigate(-1)} className="p-1.5 rounded-full hover:bg-slate-100/80 transition text-[#000080]">
                <ArrowLeft className="w-5 h-5" />
              </button>
            ) : (
              <img src="/assets/logo.png" alt="RP Foundation" className="w-10 h-10 rounded-full bg-white shadow-sm border border-slate-200/50 relative" />
            )}
            <div className="flex flex-col justify-center">
              <h1 className="font-display font-black text-[13px] text-[#000080] tracking-wide leading-none">
                RP FOUNDATION
              </h1>
              <span className="font-sans text-[9px] font-bold text-[#FF9933] mt-0.5 leading-none">
                Jan Seva Super App
              </span>
              <span className="font-sans text-[8px] font-semibold text-[#138808] mt-0.5 leading-none tracking-wide">
                सेवा • समर्पण • संकल्प
              </span>
            </div>
          </div>

          {/* Right: Actions (Search, Notification Bell with red badge, and Profile) */}
          <div className="flex items-center gap-3 relative z-10">
            <button 
              onClick={() => handleNav("/services")}
              className="p-1.5 rounded-full bg-slate-50 border border-slate-200 text-slate-700 hover:shadow-xs transition"
            >
              <Search className="w-4 h-4" />
            </button>
            <div className="relative">
                <button onClick={() => handleNav("/notifications")} className="p-1.5 rounded-full bg-slate-50 border border-slate-200 text-slate-700 hover:shadow-xs transition relative">
                  <Bell className="w-4 h-4" />
                </button>
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-[8px] font-black border border-white">
                    {unreadCount}
                  </span>
                )}
              </div>
            <button 
              className="w-8 h-8 rounded-full border border-[#D4AF37]/50 overflow-hidden shadow-sm transition hover:scale-105 active:scale-95 cursor-pointer bg-gradient-to-br from-[#FF9933] to-[#FF5722] flex items-center justify-center text-white text-xs font-black" 
              onClick={() => handleNav("/profile")}
            >
              {language === "hi" ? "रा" : "RA"}
            </button>
          </div>
        </div>

        {/* MAIN SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden relative scroll-smooth bg-white/40" id="main-scroll-container">
          <Outlet context={{ lang: language }} />
        </div>

        {/* FIXED BOTTOM NAVIGATION BAR */}
        <motion.div 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.2 }}
          className="w-full bg-white/95 backdrop-blur-md border-t border-slate-200 flex justify-around items-center px-1 pb-safe select-none z-50 shrink-0"
        >
          
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => handleNav("/")}
            className={`flex flex-col items-center gap-1 text-center transition py-1.5 cursor-pointer w-14 relative ${
              location.pathname === "/" ? "text-[#000080]" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            {location.pathname === "/" && <motion.div layoutId="nav-indicator" className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-[#FF9933] rounded-b-sm"></motion.div>}
            <Compass className="w-5 h-5 mt-0.5" />
            <span className="text-[9px] font-bold">{language === "hi" ? "होम" : "Home"}</span>
          </motion.button>

          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => handleNav("/services")}
            className={`flex flex-col items-center gap-1 text-center transition py-1.5 cursor-pointer w-14 relative ${
              location.pathname === "/services" ? "text-[#000080]" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            {location.pathname === "/services" && <motion.div layoutId="nav-indicator" className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-[#FF9933] rounded-b-sm"></motion.div>}
            <GridIcon className="w-5 h-5 mt-0.5" />
            <span className="text-[9px] font-bold">{language === "hi" ? "सेवाएं" : "Services"}</span>
          </motion.button>

          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => handleNav("/community")}
            className={`flex flex-col items-center gap-1 text-center transition py-1.5 cursor-pointer w-14 relative ${
              location.pathname === "/community" ? "text-[#000080]" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            {location.pathname === "/community" && <motion.div layoutId="nav-indicator" className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-[#FF9933] rounded-b-sm"></motion.div>}
            <Users className="w-5 h-5 mt-0.5" />
            <span className="text-[9px] font-bold">{language === "hi" ? "समुदाय" : "Community"}</span>
          </motion.button>

          <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => handleNav("/notifications")}
              className={`flex flex-col items-center gap-1 text-center transition py-1.5 cursor-pointer w-14 relative ${
                location.pathname === "/notifications" ? "text-[#000080]" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {location.pathname === "/notifications" && <motion.div layoutId="nav-indicator" className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-[#FF9933] rounded-b-sm"></motion.div>}
              <div className="relative">
                <Bell className="w-5 h-5 mt-0.5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1.5 w-3.5 h-3.5 bg-red-500 rounded-full flex items-center justify-center text-white text-[7px] font-black border border-white">
                    {unreadCount}
                  </span>
                )}
              </div>
              <span className="text-[9px] font-bold">{language === "hi" ? "अलर्ट" : "Alerts"}</span>
            </motion.button>

          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => handleNav("/profile")}
            className={`flex flex-col items-center gap-1 text-center transition py-1.5 cursor-pointer w-14 relative ${
              location.pathname === "/profile" ? "text-[#000080]" : "text-slate-400 hover:text-slate-600"
            }`}
          >
            {location.pathname === "/profile" && <motion.div layoutId="nav-indicator" className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-[#FF9933] rounded-b-sm"></motion.div>}
            <User className="w-5 h-5 mt-0.5" />
            <span className="text-[9px] font-bold">{language === "hi" ? "प्रोफ़ाइल" : "Profile"}</span>
          </motion.button>

        </motion.div>

        {/* Global Floating AI Sahayak Button */}
        {!isAiOpen && (
          <button 
            onClick={() => setIsAiOpen(true)}
            className="absolute bottom-20 right-4 z-40 bg-gradient-to-tr from-[#FF9933] to-[#FF5722] hover:from-[#FF7700] hover:to-[#FF5722] text-white p-3 rounded-full shadow-2xl flex items-center justify-center transition hover:scale-105 active:scale-95 cursor-pointer border border-white/20 animate-bounce"
            style={{ boxShadow: '0 8px 30px rgba(255, 153, 51, 0.4)' }}
          >
            <Bot className="w-6 h-6 text-white" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-450 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
          </button>
        )}

        {/* Slide-up AI Mitr Modal Sheet */}
        {isAiOpen && (
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xs z-50 flex flex-col justify-end animate-fadeIn">
            <div className="absolute inset-0 z-0" onClick={() => setIsAiOpen(false)}></div>
            <div className="bg-white rounded-t-3xl w-full h-[80%] flex flex-col shadow-2xl overflow-hidden relative z-10 animate-slideUp">
              {/* Close button wrapper */}
              <div className="absolute top-4 right-4 z-50">
                <button 
                  onClick={() => setIsAiOpen(false)}
                  className="p-1.5 rounded-full bg-black/20 hover:bg-black/45 text-white transition cursor-pointer"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>
              
              <AIAssistant 
                lang={language}
                userProfile={{
                  name: user?.name ?? "Citizen",
                  phone: user?.phone ?? "",
                  email: user?.email ?? "",
                  age: user?.dob ?? "",
                  gender: user?.gender ?? "",
                  income: "",
                  occupation: "",
                  category: "",
                  division: user?.address ?? "",
                  janSevaId: user?.janSevaCardNo ?? "",
                  role: user?.isVolunteer ? "Active Volunteer" : "Citizen",
                  points: user?.points ?? 0,
                  badge: "None"
                }}
                onNavigateToTab={(tabId) => {
                  setIsAiOpen(false);
                  if (tabId === "jan_seva") navigate("/jan-seva-card");
                  else if (tabId === "blood") navigate("/blood-network");
                  else if (tabId === "volunteer") navigate("/volunteers");
                  else if (tabId === "donate") navigate("/donations");
                  else if (tabId === "complaint") navigate("/grievance");
                  else if (tabId === "education") navigate("/education");
                  else if (tabId === "schemes") navigate("/services");
                  else if (tabId === "women") navigate("/women");
                }}
              />
            </div>
          </div>
        )}

        {/* Virtual Home Indicator Pill Bar (desktop-only) */}
        <div className="w-full bg-white pb-2 flex justify-center items-center z-40 shrink-0">
          <div className="w-28 h-1 bg-slate-300 rounded-full mt-1 hidden sm:block"></div>
        </div>
      </div>

    </div>
  );
}
