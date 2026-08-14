import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, User, Compass, Users, Bell, Search, Globe, X, Heart, Shield, HeartHandshake } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import { motion } from "motion/react";

function GridIcon(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
  const { language, setLanguage, user } = useAuth();
  
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  
  React.useEffect(() => {
    if (isAdmin && !location.pathname.startsWith("/admin")) {
      navigate("/admin");
    }
  }, [isAdmin, location.pathname, navigate]);

  const { notifications, globalSettings } = useApp();
  const unreadCount = notifications?.filter(n => !n.read).length || 0;
  
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [showGuestModal, setShowGuestModal] = useState(false);

  if (isAdmin) {
    return (
      <div className="w-full min-h-screen bg-slate-50 flex flex-col font-sans">
        <Outlet context={{ lang: language }} />
      </div>
    );
  }

  const handleNav = (path) => {
    if (user?.role === "guest" && (path === "/services" || path === "/community" || path === "/notifications")) {
      setShowGuestModal(true);
      return;
    }
    navigate(path);
  };

  const isRoot = ["/", "/services", "/community", "/notifications", "/profile"].includes(location.pathname);

  return (
    <div className="w-full min-h-screen bg-white flex flex-col font-sans overflow-hidden">
      
      {/* Clean Top App Bar */}
      <header className="w-full bg-white border-b border-slate-100 px-4 pb-3 pt-safe-header flex justify-between items-center shrink-0 z-40 sticky top-0">
        <div className="flex items-center gap-3">
          {!isRoot ? (
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-slate-50 transition text-slate-700">
              <ArrowLeft className="w-6 h-6" />
            </button>
          ) : (
            <img src={globalSettings?.logo_image || "/assets/logo.png"} alt="RP Foundation" className="w-10 h-10 rounded-full bg-white shadow-sm border border-slate-100" />
          )}
          <div className="flex flex-col">
            <h1 className="font-bold text-lg text-[#000080] leading-none">
              RP Foundation
            </h1>
            <span className="text-[10px] font-medium text-slate-500 mt-0.5 tracking-wide">
              {language === "hi" ? "सेवा • समर्पण • संकल्प" : "Service • Dedication • Resolve"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setLanguage(language === "hi" ? "en" : "hi")} className="p-2 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600 transition">
            <Globe className="w-5 h-5" />
          </button>
          <div className="relative">
            <button onClick={() => handleNav("/notifications")} className="p-2 rounded-full bg-slate-50 hover:bg-slate-100 text-slate-600 transition">
              <Bell className="w-5 h-5" />
            </button>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            )}
          </div>
          <button onClick={() => handleNav("/profile")} className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200 ml-1">
            <User className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Scrollable Content */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden bg-slate-50 w-full pb-safe-content relative">
        <Outlet context={{ lang: language }} />
      </main>

      {/* Floating Donate Button (Only on Home and Explore) */}
      {(location.pathname === "/" || location.pathname === "/services") && (
        <button 
          onClick={() => handleNav("/donations")} 
          className="fixed bottom-20 right-4 z-40 flex items-center justify-center w-14 h-14 bg-gradient-to-br from-[#FF9933] to-[#F26522] rounded-full shadow-lg text-white shadow-orange-500/40 transform transition active:scale-95"
          aria-label="Donate"
        >
          <HeartHandshake className="w-7 h-7" />
        </button>
      )}

      {/* Standard Bottom Navigation - 5 Tabs */}
      <nav className="fixed bottom-0 w-full bg-white border-t border-slate-100 flex justify-around items-center px-1 pb-safe-nav pt-2 shrink-0 z-50 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)]">
        
        {/* 1. Home */}
        <button onClick={() => handleNav("/")} className={`flex flex-col items-center p-2 w-[20%] ${location.pathname === "/" ? "text-[#FF9933]" : "text-slate-400 hover:text-slate-700"}`}>
          <Compass className={`w-[22px] h-[22px] mb-1 ${location.pathname === "/" ? "stroke-[2.5px]" : "stroke-2"}`} />
          <span className="text-[10px] font-medium tracking-tight">{language === "hi" ? "होम" : "Home"}</span>
        </button>

        {/* 2. Explore */}
        <button onClick={() => handleNav("/services")} className={`flex flex-col items-center p-2 w-[20%] ${location.pathname === "/services" ? "text-[#FF9933]" : "text-slate-400 hover:text-slate-700"}`}>
          <Search className={`w-[22px] h-[22px] mb-1 ${location.pathname === "/services" ? "stroke-[2.5px]" : "stroke-2"}`} />
          <span className="text-[10px] font-medium tracking-tight">{language === "hi" ? "खोजें" : "Explore"}</span>
        </button>

        {/* 3. Activity */}
        <button onClick={() => handleNav("/notifications")} className={`flex flex-col items-center p-2 w-[20%] relative ${location.pathname === "/notifications" ? "text-[#FF9933]" : "text-slate-400 hover:text-slate-700"}`}>
          <Bell className={`w-[22px] h-[22px] mb-1 ${location.pathname === "/notifications" ? "stroke-[2.5px]" : "stroke-2"}`} />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-3 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          )}
          <span className="text-[10px] font-medium tracking-tight">{language === "hi" ? "गतिविधि" : "Activity"}</span>
        </button>

        {/* 4. Impact */}
        <button onClick={() => handleNav("/community")} className={`flex flex-col items-center p-2 w-[20%] ${location.pathname === "/community" ? "text-[#FF9933]" : "text-slate-400 hover:text-slate-700"}`}>
          <Heart className={`w-[22px] h-[22px] mb-1 ${location.pathname === "/community" ? "stroke-[2.5px]" : "stroke-2"}`} />
          <span className="text-[10px] font-medium tracking-tight">{language === "hi" ? "प्रभाव" : "Impact"}</span>
        </button>

        {/* 5. Me */}
        <button onClick={() => handleNav("/profile")} className={`flex flex-col items-center p-2 w-[20%] ${location.pathname === "/profile" ? "text-[#FF9933]" : "text-slate-400 hover:text-slate-700"}`}>
          <User className={`w-[22px] h-[22px] mb-1 ${location.pathname === "/profile" ? "stroke-[2.5px]" : "stroke-2"}`} />
          <span className="text-[10px] font-medium tracking-tight">{language === "hi" ? "मेरा खाता" : "Me"}</span>
        </button>

      </nav>


    </div>
  );
}
