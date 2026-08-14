import React, { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, User, Compass, Bell, Search, Globe, Heart, HeartHandshake } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, setLanguage, user } = useAuth();
  const { notifications, globalSettings } = useApp();
  const isAdmin = user?.role === "admin" || user?.role === "super_admin";
  const unreadCount = notifications?.filter((n) => !n.read).length || 0;
  const [showGuestModal, setShowGuestModal] = useState(false);

  React.useEffect(() => {
    if (isAdmin && !location.pathname.startsWith("/admin")) navigate("/admin");
  }, [isAdmin, location.pathname, navigate]);

  if (isAdmin) return <div className="min-h-screen w-full bg-[#fbf8f2] font-sans text-slate-900"><Outlet context={{ lang: language }} /></div>;

  const handleNav = (path: string) => {
    if (user?.role === "guest" && (path === "/services" || path === "/community" || path === "/notifications")) { setShowGuestModal(true); return; }
    navigate(path);
  };
  const rootPaths = ["/", "/services", "/community", "/notifications", "/profile"];
  const isRoot = rootPaths.includes(location.pathname);
  const navItems = [
    { path: "/", labelEn: "Home", labelHi: "होम", icon: Compass },
    { path: "/services", labelEn: "Explore", labelHi: "खोजें", icon: Search },
    { path: "/notifications", labelEn: "Activity", labelHi: "गतिविधि", icon: Bell },
    { path: "/community", labelEn: "Impact", labelHi: "प्रभाव", icon: Heart },
    { path: "/profile", labelEn: "Me", labelHi: "मैं", icon: User },
  ];

  return (
    <div className="min-h-screen w-full overflow-hidden bg-[#fbf8f2] font-sans text-slate-900 selection:bg-orange-100 selection:text-[#7f1d1d]">
      <header className="sticky top-0 z-40 w-full border-b border-amber-100/80 bg-white/95 px-3.5 pt-safe-header backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between sm:h-16 sm:px-1">
          <div className="flex min-w-0 items-center gap-2.5">
            {!isRoot ? <button type="button" onClick={() => navigate(-1)} aria-label={language === "hi" ? "वापस जाएं" : "Go back"} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#7f1d1d] transition-colors hover:bg-orange-50 active:scale-95"><ArrowLeft className="h-5 w-5" strokeWidth={1.9} /></button> : <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-amber-200 bg-white shadow-sm sm:h-10 sm:w-10"><img src={globalSettings?.logo_image || "/assets/logo.png"} alt="RP Foundation" className="h-full w-full object-contain" /></div>}
            <div className="min-w-0"><h1 className="truncate text-[14px] font-semibold tracking-[-0.02em] text-[#3b1f1f] sm:text-[15px]">RP Foundation</h1><p className="truncate text-[9px] font-medium tracking-[0.08em] text-slate-400">COMMUNITY • SERVICE • IMPACT</p></div>
          </div>
          <div className="flex shrink-0 items-center gap-0.5">
            <button type="button" onClick={() => setLanguage(language === "hi" ? "en" : "hi")} aria-label={language === "hi" ? "Switch to English" : "भाषा बदलें"} className="flex h-10 w-10 items-center justify-center rounded-full text-indigo-700 transition-colors hover:bg-indigo-50 active:scale-95"><Globe className="h-[19px] w-[19px]" strokeWidth={1.8} /></button>
            <button type="button" onClick={() => handleNav("/notifications")} aria-label={language === "hi" ? "सूचनाएं" : "Notifications"} className="relative flex h-10 w-10 items-center justify-center rounded-full text-[#a84424] transition-colors hover:bg-orange-50 active:scale-95"><Bell className="h-[19px] w-[19px]" strokeWidth={1.8} />{unreadCount > 0 && <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-rose-500 ring-2 ring-white" />}</button>
            <button type="button" onClick={() => handleNav("/profile")} aria-label={language === "hi" ? "मेरी प्रोफ़ाइल" : "My profile"} className="ml-0.5 flex h-9 w-9 items-center justify-center rounded-full border border-amber-200 bg-amber-50 text-[#7f1d1d] transition-colors hover:bg-orange-100 active:scale-95"><User className="h-[17px] w-[17px]" strokeWidth={1.8} /></button>
          </div>
        </div>
      </header>

      <main className="min-h-0 w-full overflow-x-hidden bg-[#fbf8f2] pb-[calc(5.25rem+env(safe-area-inset-bottom))]"><div className="mx-auto w-full max-w-3xl"><Outlet context={{ lang: language }} /></div></main>

      {(location.pathname === "/" || location.pathname === "/services") && <button type="button" onClick={() => handleNav("/donations")} aria-label={language === "hi" ? "दान करें" : "Donate"} className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] right-3.5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-[#a84424] text-white shadow-lg shadow-orange-900/20 transition-transform hover:scale-[1.03] active:scale-95"><HeartHandshake className="h-5 w-5" strokeWidth={1.8} /></button>}

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-amber-100/80 bg-white/96 px-1 pt-1 pb-[calc(0.35rem+env(safe-area-inset-bottom))] shadow-[0_-8px_30px_-20px_rgba(127,29,29,0.22)] backdrop-blur-xl"><div className="mx-auto flex max-w-3xl items-center justify-around">{navItems.map(({ path, labelEn, labelHi, icon: Icon }) => { const active = location.pathname === path; return <button key={path} type="button" onClick={() => handleNav(path)} aria-current={active ? "page" : undefined} className={`relative flex min-h-12 w-1/5 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] font-medium transition-colors active:scale-95 ${active ? "text-[#a84424]" : "text-slate-400 hover:text-indigo-700"}`}><Icon className={`h-[19px] w-[19px] ${active ? "stroke-[2.1]" : "stroke-[1.7]"}`} /><span>{language === "hi" ? labelHi : labelEn}</span>{active && <span className="absolute bottom-0 h-0.5 w-5 rounded-full bg-[#a84424]" />}{path === "/notifications" && unreadCount > 0 && <span className="absolute right-[calc(50%-0.8rem)] top-1 h-1.5 w-1.5 rounded-full bg-rose-500 ring-2 ring-white" />}</button>; })}</div></nav>

      {showGuestModal && <div className="fixed inset-0 z-[100] flex items-end justify-center bg-[#4c1d1d]/25 p-4 backdrop-blur-sm sm:items-center"><div className="w-full max-w-sm rounded-3xl border border-amber-100 bg-white p-6 shadow-2xl"><div className="mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-[#a84424]"><User className="h-5 w-5" strokeWidth={1.8} /></div><h2 className="text-lg font-semibold tracking-tight text-[#3b1f1f]">{language === "hi" ? "पहले साइन इन करें" : "Sign in to continue"}</h2><p className="mt-2 text-sm leading-6 text-slate-500">{language === "hi" ? "इस सुविधा का उपयोग करने के लिए अपने खाते में साइन इन करें।" : "Sign in to access your personal community features."}</p><div className="mt-6 flex gap-2"><button type="button" onClick={() => setShowGuestModal(false)} className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700">{language === "hi" ? "बंद करें" : "Close"}</button><button type="button" onClick={() => { setShowGuestModal(false); navigate("/login"); }} className="flex-1 rounded-xl bg-[#a84424] px-4 py-3 text-sm font-semibold text-white shadow-sm">{language === "hi" ? "साइन इन" : "Sign in"}</button></div></div></div>}
    </div>
  );
}
