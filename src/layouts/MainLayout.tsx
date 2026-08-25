import React, { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, User, Compass, Bell, Search, Globe, Heart, HeartHandshake, Wrench, RotateCw, Home, Sparkles, Headphones, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import GlobalMiniPlayer from "../components/GlobalMiniPlayer";

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, setLanguage, user } = useAuth();
  const { notifications, globalSettings } = useApp();
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const unread = notifications?.filter((n) => !n.read).length || 0;
  const [guest, setGuest] = useState(false);
  const [avatar, setAvatar] = useState("");
  const localAvatarKey = `@rpf_profile_avatar:${user?.id || "guest"}`;

  useEffect(() => {
    try {
      setAvatar(localStorage.getItem(localAvatarKey) || "");
    } catch {}
    const onChange = (e: Event) => setAvatar((e as CustomEvent<string>).detail || "");
    window.addEventListener("rpf-avatar-changed", onChange);
    return () => window.removeEventListener("rpf-avatar-changed", onChange);
  }, [localAvatarKey]);

  useEffect(() => {
    if (isAdmin && !location.pathname.startsWith("/admin")) navigate("/admin");
  }, [isAdmin, location.pathname, navigate]);

  if (isAdmin) {
    return (
      <div className="min-h-screen w-full bg-[#FAF0E6] font-sans text-[#2D241E]">
        <Outlet context={{ lang: language }} />
      </div>
    );
  }

  const nav = (p: string) => {
    if (user?.role === "guest" && (p === "/services" || p === "/impact" || p === "/notifications")) {
      setGuest(true);
      return;
    }
    navigate(p);
  };

  const roots = ["/", "/impact", "/events", "/services", "/profile"];
  const root = roots.includes(location.pathname);
  const items = [
    { path: "/", en: "Home", hi: "होम", icon: Home },
    { path: "/impact", en: "Initiatives", hi: "अभियान", icon: Sparkles },
    { path: "/events", en: "Events", hi: "कार्यक्रम", icon: Calendar },
    { path: "/services", en: "Support", hi: "सहायता", icon: Compass },
    { path: "/profile", en: "Profile", hi: "प्रोफाइल", icon: User },
  ];

  return (
    <div className="min-h-screen w-full overflow-hidden bg-[#FAF0E6] font-sans text-[#2D241E] selection:bg-[#E8DCD1]">
      <div className="fixed inset-x-0 top-0 z-[60] h-0.5 bg-[#8C5A3C]" aria-hidden="true" />
      
      <header className="sticky top-0 z-40 w-full border-b border-[#E8DCD1] bg-[#FFFBF7]/95 px-3.5 pt-safe-header backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between sm:h-16 sm:px-1">
          <div className="flex min-w-0 items-center gap-2.5">
            {!root ? (
              <motion.button whileTap={{ scale: 0.9 }} whileHover={{ x: -2 }} onClick={() => navigate(-1)} aria-label="Go back" className="flex h-10 w-10 items-center justify-center rounded-full text-[#8C5A3C] hover:bg-[#F5ECE2]">
                <ArrowLeft className="h-5 w-5" />
              </motion.button>
            ) : (
              <motion.div whileHover={{ rotate: -3, scale: 1.04 }} className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl border border-[#E8DCD1] bg-white shadow-xs sm:h-10 sm:w-10">
                <img src={globalSettings?.logo_image || "/assets/logo.png"} alt="RP Foundation" className="h-full w-full object-contain" />
              </motion.div>
            )}
            <div className="min-w-0">
              {location.pathname === "/browser" ? (
                <h1 className="truncate text-[14px] font-black tracking-[-0.02em] text-[#2D241E] sm:text-[15px]">
                  {decodeURIComponent(new URLSearchParams(location.search).get("title") || "RPF Browser")}
                </h1>
              ) : (
                <>
                  <h1 className="truncate text-[16px] font-black tracking-[-0.02em] text-[#2D241E] font-serif">
                    समाहित
                  </h1>
                  <p className="truncate text-[9px] font-bold tracking-[.08em] text-[#8C5A3C]">An initiative of RP Foundation</p>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-0.5">
            {location.pathname === "/browser" ? (
              <motion.button whileTap={{ scale: 0.85, rotate: 180 }} onClick={() => window.dispatchEvent(new CustomEvent("rpf-browser-refresh"))} aria-label="Refresh page" className="flex h-10 w-10 items-center justify-center rounded-full text-[#8C5A3C] hover:bg-[#F5ECE2]">
                <RotateCw className="h-[19px] w-[19px]" />
              </motion.button>
            ) : (
              <>
                <motion.button whileTap={{ scale: 0.88 }} onClick={() => navigate("/tools")} aria-label={language === "hi" ? "टूल्स" : "Tools"} title={language === "hi" ? "टूल्स" : "Tools"} className="flex h-10 w-10 items-center justify-center rounded-full text-[#8C5A3C] hover:bg-[#F5ECE2]">
                  <Wrench className="h-[19px] w-[19px]" />
                </motion.button>
                <motion.button whileTap={{ scale: 0.88, rotate: -12 }} onClick={() => setLanguage(language === "hi" ? "en" : "hi")} className="flex h-10 w-10 items-center justify-center rounded-full text-[#8C5A3C] hover:bg-[#F5ECE2]">
                  <Globe className="h-[19px] w-[19px]" />
                </motion.button>
                <motion.button whileTap={{ scale: 0.88 }} onClick={() => nav("/notifications")} className="relative flex h-10 w-10 items-center justify-center rounded-full text-[#8C5A3C] hover:bg-[#F5ECE2]">
                  <Bell className="h-[19px] w-[19px]" />
                  {unread > 0 && <motion.span animate={{ scale: [1, 1.25, 1] }} transition={{ duration: 1.8, repeat: Infinity }} className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#8C5A3C] ring-2 ring-white" />}
                </motion.button>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => nav("/profile")} className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-[#E8DCD1] bg-[#F5ECE2] text-[#8C5A3C]">
                  {avatar ? <img src={avatar} alt="Profile" className="h-full w-full object-cover" /> : <User className="h-[17px] w-[17px]" />}
                </motion.button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="min-h-0 w-full overflow-x-hidden bg-[#FAF0E6] pb-[calc(6.5rem+env(safe-area-inset-bottom))]">
        <div className="mx-auto w-full max-w-3xl">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={location.pathname} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.28, ease: "easeOut" }} className="min-h-full">
              <Outlet context={{ lang: language }} />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Global Persistent Mini Player for Radio & TV Media Streams */}
      <GlobalMiniPlayer />

      {/* Floating 24/7 Helpline Widget (FAB) */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
        onClick={() => navigate("/grievance")}
        aria-label="24/7 Helpline"
        title={language === "hi" ? "24/7 हेल्पलाइन" : "24/7 Helpline"}
        className="fixed right-4 bottom-24 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-r from-[#FF9933] to-[#F59E0B] text-white shadow-lg shadow-orange-500/30 border border-white/50"
      >
        <Headphones className="h-6 w-6" />
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
        </span>
      </motion.button>

      {/* Luxury Almond Glassmorphic Floating Bottom Bar */}
      <nav className="fixed inset-x-4 bottom-3 z-50 mx-auto max-w-lg rounded-3xl border border-[#E8DCD1] bg-[#FFFBF7]/95 px-2 py-1.5 shadow-[0_12px_35px_rgba(140,90,60,0.12)] backdrop-blur-2xl">
        <div className="flex items-center justify-around">
          {items.map(({ path, en, hi, icon: Icon }) => {
            const active = location.pathname === path;
            return (
              <motion.button
                key={path}
                whileTap={{ scale: 0.88 }}
                onClick={() => nav(path)}
                className={`relative flex flex-col items-center justify-center gap-0.5 rounded-2xl py-1 px-3 text-[10px] font-black tracking-tight transition-all ${
                  active ? "text-[#5C3A24]" : "text-[#7A6A5D] hover:text-[#2D241E]"
                }`}
              >
                <div
                  className={`flex h-7 w-9 items-center justify-center rounded-xl transition-all ${
                    active ? "bg-gradient-to-r from-[#A67C52] to-[#8C5A3C] text-white shadow-sm" : ""
                  }`}
                >
                  <Icon className={`h-4 w-4 ${active ? "text-white" : ""}`} />
                </div>
                <span>{language === "hi" ? hi : en}</span>
              </motion.button>
            );
          })}
        </div>
      </nav>

      {guest && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/30 p-4 backdrop-blur-sm sm:items-center">
          <motion.div initial={{ opacity: 0, y: 30, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="w-full max-w-sm rounded-3xl border border-[#E8DCD1] bg-[#FFFBF7] p-6 shadow-2xl">
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F5ECE2] text-[#8C5A3C]">
              <User className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold text-[#2D241E]">{language === "hi" ? "पहले साइन इन करें" : "Sign in to continue"}</h2>
            <p className="mt-2 text-sm leading-6 text-[#7A6A5D]">{language === "hi" ? "इस सुविधा का उपयोग करने के लिए अपने खाते में साइन इन करें।" : "Sign in to access your personal community features."}</p>
            <div className="mt-6 flex gap-2">
              <button onClick={() => setGuest(false)} className="flex-1 rounded-xl border border-[#E8DCD1] px-4 py-3 text-sm text-[#2D241E]">Close</button>
              <button onClick={() => setGuest(false)} className="flex-1 rounded-xl bg-[#8C5A3C] px-4 py-3 text-sm font-semibold text-white">Sign in</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
