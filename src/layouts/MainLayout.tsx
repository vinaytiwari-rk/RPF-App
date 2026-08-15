import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, User, Compass, Bell, Search, Globe, Heart, HeartHandshake } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";

const tricolorPattern = {
  backgroundImage:
    "radial-gradient(circle at 50% 0%, rgba(255,153,51,.10), transparent 32%), radial-gradient(circle at 50% 100%, rgba(19,136,8,.08), transparent 32%), repeating-linear-gradient(45deg, rgba(0,0,128,.025) 0, rgba(0,0,128,.025) 1px, transparent 1px, transparent 12px)",
};

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, setLanguage, user } = useAuth();
  const { notifications, globalSettings } = useApp();
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const unread = notifications?.filter((n) => !n.read).length || 0;
  const [guest, setGuest] = useState(false);

  React.useEffect(() => {
    if (isAdmin && !location.pathname.startsWith("/admin")) navigate("/admin");
  }, [isAdmin, location.pathname, navigate]);

  if (isAdmin) {
    return (
      <div className="min-h-screen w-full bg-white font-sans text-slate-900" style={tricolorPattern}>
        <Outlet context={{ lang: language }} />
      </div>
    );
  }

  const nav = (p: string) => {
    if (user?.role === "guest" && (p === "/services" || p === "/community" || p === "/notifications")) {
      setGuest(true);
      return;
    }
    navigate(p);
  };

  const roots = ["/", "/services", "/community", "/notifications", "/profile"];
  const root = roots.includes(location.pathname);
  const items = [
    { path: "/", en: "Home", hi: "होम", icon: Compass },
    { path: "/services", en: "Explore", hi: "खोजें", icon: Search },
    { path: "/notifications", en: "Activity", hi: "गतिविधि", icon: Bell },
    { path: "/community", en: "Impact", hi: "प्रभाव", icon: Heart },
    { path: "/profile", en: "Me", hi: "मैं", icon: User },
  ];

  return (
    <div className="min-h-screen w-full overflow-hidden bg-white font-sans text-slate-900 selection:bg-orange-100 selection:text-[#000080]" style={tricolorPattern}>
      <div className="fixed inset-x-0 top-0 z-[60] h-0.5 bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" aria-hidden="true" />
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 px-3.5 pt-safe-header backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between sm:h-16 sm:px-1">
          <div className="flex min-w-0 items-center gap-2.5">
            {!root ? (
              <button onClick={() => navigate(-1)} aria-label="Go back" className="flex h-10 w-10 items-center justify-center rounded-full text-[#000080] hover:bg-orange-50">
                <ArrowLeft className="h-5 w-5" />
              </button>
            ) : (
              <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl border border-orange-200 bg-white shadow-sm sm:h-10 sm:w-10">
                <img src={globalSettings?.logo_image || "/assets/logo.png"} alt="RP Foundation" className="h-full w-full object-contain" />
              </div>
            )}
            <div className="min-w-0">
              <h1 className="truncate text-[14px] font-semibold tracking-[-0.02em] text-[#000080] sm:text-[15px]">RP Foundation</h1>
              <p className="truncate text-[9px] font-medium tracking-[.08em] text-slate-400">COMMUNITY • SERVICE • IMPACT</p>
            </div>
          </div>
          <div className="flex items-center gap-0.5">
            <button onClick={() => setLanguage(language === "hi" ? "en" : "hi")} className="flex h-10 w-10 items-center justify-center rounded-full text-[#000080] hover:bg-blue-50">
              <Globe className="h-[19px] w-[19px]" />
            </button>
            <button onClick={() => nav("/notifications")} className="relative flex h-10 w-10 items-center justify-center rounded-full text-[#000080] hover:bg-blue-50">
              <Bell className="h-[19px] w-[19px]" />
              {unread > 0 && <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#FF9933] ring-2 ring-white" />}
            </button>
            <button onClick={() => nav("/profile")} className="flex h-9 w-9 items-center justify-center rounded-full border border-orange-200 bg-orange-50 text-[#000080]">
              <User className="h-[17px] w-[17px]" />
            </button>
          </div>
        </div>
      </header>

      <main className="min-h-0 w-full overflow-x-hidden bg-white/90 pb-[calc(5.25rem+env(safe-area-inset-bottom))]">
        <div className="mx-auto w-full max-w-3xl"><Outlet context={{ lang: language }} /></div>
      </main>

      {(location.pathname === "/" || location.pathname === "/services") && (
        <button onClick={() => nav("/donations")} aria-label="Donate" className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] right-3.5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[#138808] text-white shadow-lg shadow-green-900/20">
          <HeartHandshake className="h-5 w-5" />
        </button>
      )}

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-slate-200/80 bg-white/96 px-1 pt-1 pb-[calc(.35rem+env(safe-area-inset-bottom))] shadow-[0_-8px_30px_-20px_rgba(0,0,128,.22)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-around">
          {items.map(({ path, en, hi, icon: Icon }) => {
            const active = location.pathname === path;
            return (
              <button key={path} onClick={() => nav(path)} className={`relative flex min-h-12 w-1/5 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] font-medium ${active ? "text-[#000080]" : "text-slate-400 hover:text-[#138808]"}`}>
                <Icon className="h-[19px] w-[19px]" />
                <span>{language === "hi" ? hi : en}</span>
                {active && <span className="absolute bottom-0 h-0.5 w-5 rounded-full bg-[#FF9933]" />}
                {path === "/notifications" && unread > 0 && <span className="absolute right-[calc(50%-0.8rem)] top-1 h-1.5 w-1.5 rounded-full bg-[#FF9933] ring-2 ring-white" />}
              </button>
            );
          })}
        </div>
      </nav>

      {guest && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-[#000080]/20 p-4 backdrop-blur-sm sm:items-center">
          <div className="w-full max-w-sm rounded-3xl border border-orange-100 bg-white p-6 shadow-2xl">
            <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-[#000080]"><User className="h-5 w-5" /></div>
            <h2 className="text-lg font-semibold text-[#000080]">{language === "hi" ? "पहले साइन इन करें" : "Sign in to continue"}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">{language === "hi" ? "इस सुविधा का उपयोग करने के लिए अपने खाते में साइन इन करें।" : "Sign in to access your personal community features."}</p>
            <div className="mt-6 flex gap-2">
              <button onClick={() => setGuest(false)} className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700">Close</button>
              <button onClick={() => { setGuest(false); navigate("/login"); }} className="flex-1 rounded-xl bg-[#000080] px-4 py-3 text-sm font-semibold text-white">Sign in</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}