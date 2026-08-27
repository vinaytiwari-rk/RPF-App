import React, { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, User, Compass, Bell, Search, RotateCw, Home, Activity } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import GlobalMiniPlayer from "../components/GlobalMiniPlayer";
import SearchModal from "../components/SearchModal";

export default function MainLayout() {
  const navigate = useNavigate(); const location = useLocation();
  const { language, user } = useAuth(); const { notifications, globalSettings } = useApp();
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const unread = notifications?.filter((n) => !n.read).length || 0;
  const [guest, setGuest] = useState(false); const [avatar, setAvatar] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const localAvatarKey = `@rpf_profile_avatar:${user?.id || "guest"}`;

  useEffect(() => {
    const handleOpenSearch = () => setSearchOpen(true);
    window.addEventListener("rpf-open-search", handleOpenSearch);
    return () => window.removeEventListener("rpf-open-search", handleOpenSearch);
  }, []);
  
  useEffect(() => {
    try { setAvatar(localStorage.getItem(localAvatarKey) || ""); } catch {}
    const onChange = (e: Event) => setAvatar((e as CustomEvent<string>).detail || "");
    window.addEventListener("rpf-avatar-changed", onChange);
    return () => window.removeEventListener("rpf-avatar-changed", onChange);
  }, [localAvatarKey]);

  useEffect(() => {
    if (isAdmin && !location.pathname.startsWith("/admin")) navigate("/admin");
  }, [isAdmin, location.pathname, navigate]);

  if (isAdmin) return <div className="min-h-screen w-full bg-[#F8F9F7] font-sans text-slate-800"><Outlet context={{ lang: language }} /></div>;

  const nav = (p: string) => {
    if (user?.role === "guest" && (p === "/services" || p === "/impact" || p === "/notifications" || p === "/grievance")) {
      setGuest(true); return;
    }
    navigate(p);
  };

  const roots = ["/", "/services", "/impact", "/profile"];
  const root = roots.includes(location.pathname);
  const items = [
    { path: "/", label: "Home", icon: Home },
    { path: "/services", label: "Explore", icon: Compass },
    { path: "/impact", label: "Activity", icon: Activity },
    { path: "/profile", label: "Profile", icon: User }
  ];

  return (
    <div className="min-h-screen w-full bg-[url('/assets/app_tricolor_bg.png')] bg-cover bg-center bg-fixed font-sans text-slate-800 selection:bg-orange-100">
      <div className="fixed inset-x-0 top-0 z-[60] h-1 bg-gradient-to-r from-[#FF9933] via-[#F59E0B] to-[#138808]" aria-hidden="true" />
      
      <header className="sticky top-0 z-40 w-full border-b border-orange-200/50 bg-[url('/assets/app_tricolor_bg.png')] bg-cover bg-center bg-fixed bg-white/75 px-3.5 pt-safe-header backdrop-blur-xl shadow-xs">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between sm:h-16 sm:px-1">
          <div className="flex min-w-0 items-center gap-2.5">
            {!root ? (
              <motion.button whileTap={{ scale: 0.9 }} onClick={() => navigate(-1)} aria-label="Go back" className="flex h-10 w-10 items-center justify-center rounded-full text-slate-700 hover:bg-slate-100/80">
                <ArrowLeft className="h-5 w-5" />
              </motion.button>
            ) : (
              <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl bg-transparent">
                <img src={globalSettings?.logo_image || "/assets/rpf-samahit-icon.png"} alt="समाहित" className="h-full w-full object-contain" />
              </div>
            )}
            <div className="min-w-0 flex flex-col justify-center">
              {location.pathname === "/browser" ? (
                <h1 className="truncate text-[14px] font-black text-slate-900">{decodeURIComponent(new URLSearchParams(location.search).get("title") || "RPF Browser")}</h1>
              ) : (
                <>
                  <img src="/assets/samahit_header_logo.png" alt="समाहित" className="h-9 sm:h-11 w-auto max-w-[190px] sm:max-w-[240px] object-contain select-none bg-transparent" />
                  <p className="truncate text-[8.5px] font-bold tracking-[.08em] text-[#667085] uppercase -mt-1">An Initiative For RP Foundation</p>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            {location.pathname === "/browser" ? (
              <motion.button whileTap={{ scale: 0.85, rotate: 180 }} onClick={() => window.dispatchEvent(new CustomEvent("rpf-browser-refresh"))} aria-label="Refresh page" className="flex h-10 w-10 items-center justify-center rounded-full text-[#FF9933]">
                <RotateCw className="h-[19px] w-[19px]" />
              </motion.button>
            ) : (
              <>
                <motion.button whileTap={{ scale: 0.88 }} onClick={() => window.dispatchEvent(new CustomEvent("rpf-open-search"))} aria-label="Search" className="flex h-10 w-10 items-center justify-center rounded-full text-slate-700 hover:bg-slate-100/80">
                  <Search className="h-[20px] w-[20px]" />
                </motion.button>
                <motion.button whileTap={{ scale: 0.88 }} onClick={() => nav("/notifications")} aria-label="Notifications" className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-700 hover:bg-slate-100/80">
                  <Bell className="h-[20px] w-[20px]" />
                  {unread > 0 && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#FF9933] ring-2 ring-white" />}
                </motion.button>
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => nav("/profile")} aria-label="Profile" className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-[#E8ECE7] bg-white/80 text-slate-600">
                  {avatar ? <img src={avatar} alt="Profile" className="h-full w-full object-cover" /> : <User className="h-[17px] w-[17px]" />}
                </motion.button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="w-full bg-transparent pb-[calc(5.5rem+env(safe-area-inset-bottom))]">
        <div className="mx-auto w-full max-w-3xl">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={location.pathname} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="w-full">
              <Outlet context={{ lang: language }} />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <GlobalMiniPlayer />

      {/* Android Native Standard Bottom Navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-3xl border-t border-orange-200/50 bg-[url('/assets/app_tricolor_bg.png')] bg-cover bg-center bg-fixed bg-white/85 px-2 pb-[max(0.35rem,env(safe-area-inset-bottom))] pt-1.5 shadow-[0_-4px_20px_rgba(15,49,87,.08)] backdrop-blur-xl">
        <div className="flex items-center justify-around">
          {items.map(({ path, label, icon: Icon }) => {
            const active = location.pathname === path;
            return (
              <motion.button
                key={path}
                whileTap={{ scale: 0.92 }}
                onClick={() => nav(path)}
                className={`relative flex flex-1 flex-col items-center justify-center gap-0.5 py-1 text-[10px] font-black tracking-tight transition-all ${
                  active ? "text-[#E67817]" : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <div className={`flex h-8 w-12 items-center justify-center rounded-full transition-all ${active ? "bg-orange-50 text-[#E67817]" : ""}`}>
                  <Icon className={`h-5 w-5 ${active ? "stroke-[2.5]" : "stroke-[1.8]"}`} />
                </div>
                <span className="leading-none">{label}</span>
              </motion.button>
            );
          })}
        </div>
      </nav>

      {guest && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/30 p-4 backdrop-blur-sm sm:items-center">
          <motion.div initial={{ opacity: 0, y: 30, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="w-full max-w-sm rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl">
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-[#E67817]">
              <User className="h-5 w-5" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900">Sign in to continue</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">Sign in to access your personal community features.</p>
            <div className="mt-6 flex gap-2">
              <button onClick={() => setGuest(false)} className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700">Close</button>
              <button onClick={() => setGuest(false)} className="flex-1 rounded-xl bg-[#0F3157] px-4 py-3 text-sm font-semibold text-white">Sign in</button>
            </div>
          </motion.div>
        </div>
      )}

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
