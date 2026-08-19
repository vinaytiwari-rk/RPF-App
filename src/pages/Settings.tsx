import { useState, type ReactNode } from "react";
import { Bell, ChevronRight, Globe2, LogOut, Sparkles, UserRound, Volume2 } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { requestNotificationPermission } from "../lib/permissions";
import { vibrate } from "../lib/deviceCapabilities";

type Lang = "en" | "hi";
const key = "@rpf_user_settings";
function loadPrefs() { try { return JSON.parse(localStorage.getItem(key) || "{}") as Record<string, boolean>; } catch { return {}; } }

export default function Settings() {
  const navigate = useNavigate(); const { lang } = useOutletContext<{ lang: Lang }>(); const { language, setLanguage, logout } = useAuth(); const hi = lang === "hi" || language === "hi";
  const initial = loadPrefs(); const [prefs, setPrefs] = useState({ notifications: initial.notifications !== false, dailyQuote: initial.dailyQuote !== false, haptics: initial.haptics !== false });
  const save = (next: typeof prefs) => { localStorage.setItem(key, JSON.stringify(next)); setPrefs(next); };
  const toggle = (name: keyof typeof prefs) => save({ ...prefs, [name]: !prefs[name] });
  const toggleNotifications = async () => {
    if (prefs.notifications) { toggle("notifications"); return; }
    const status = await requestNotificationPermission();
    if (status === "granted") { save({ ...prefs, notifications: true }); return; }
    toast.error(hi ? "Notification permission अनुमति नहीं मिली" : "Notification permission was not granted");
  };
  const toggleHaptics = () => { const next = !prefs.haptics; save({ ...prefs, haptics: next }); if (next) vibrate(25); };
  const row = (icon: ReactNode, title: string, sub: string, action: ReactNode) => <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3.5"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-[#000080]">{icon}</span><span className="min-w-0 flex-1"><span className="block text-[12px] font-black text-slate-800">{title}</span><span className="mt-0.5 block text-[9px] leading-4 text-slate-500">{sub}</span></span>{action}</div>;
  const toggleButton = (on: boolean, click: () => void, active: string) => <button onClick={click} className={`h-6 w-11 rounded-full p-1 transition ${on ? active : "bg-slate-300"}`}><span className={`block h-4 w-4 rounded-full bg-white transition ${on ? "translate-x-5" : "translate-x-0"}`} /></button>;
  return <main className="min-h-full bg-[#f8fafc] pb-12"><div className="mx-auto max-w-3xl px-3.5 py-5 sm:px-6"><motion.section initial={{opacity:0,y:14}} animate={{opacity:1,y:0}} className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm"><div className="h-1.5 bg-gradient-to-r from-[#FF9933] via-[#7C3AED] to-[#138808]"/><div className="p-5 sm:p-7"><div className="flex items-center gap-3"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-100 to-violet-100 text-[#000080]"><Sparkles className="h-6 w-6"/></span><div><p className="text-[9px] font-black uppercase tracking-[.2em] text-[#FF9933]">RPF Seva App</p><h1 className="text-[23px] font-black text-[#000080]">{hi ? "सेटिंग्स" : "Settings"}</h1><p className="text-[10px] text-slate-500">{hi ? "ऐप को अपनी सुविधा के अनुसार बदलें" : "Personalize the app for your needs"}</p></div></div><div className="mt-6 space-y-2.5">
{row(<Globe2 className="h-5 w-5"/>, hi ? "भाषा" : "Language", hi ? "ऐप की भाषा" : "App language", <button onClick={() => setLanguage(language === "hi" ? "en" : "hi")} className="rounded-xl border border-slate-200 px-3 py-2 text-[10px] font-black text-[#000080]">{language === "hi" ? "English" : "हिन्दी"}</button>)}
{row(<Bell className="h-5 w-5"/>, hi ? "सूचनाएं" : "Notifications", hi ? "महत्वपूर्ण अपडेट और घोषणाएं" : "Important updates and announcements", toggleButton(prefs.notifications, () => void toggleNotifications(), "bg-[#138808]"))}
{row(<Sparkles className="h-5 w-5"/>, hi ? "दैनिक विचार" : "Daily Quote", hi ? "हर दिन Quote of the Day दिखाएं" : "Show the Quote of the Day", toggleButton(prefs.dailyQuote, () => toggle("dailyQuote"), "bg-[#7C3AED]"))}
{row(<Volume2 className="h-5 w-5"/>, hi ? "स्पर्श प्रतिक्रिया" : "Haptic Feedback", hi ? "जहां उपलब्ध हो वहां हल्का vibration" : "Use subtle vibration where supported", toggleButton(prefs.haptics, toggleHaptics, "bg-[#0EA5E9]"))}
{row(<UserRound className="h-5 w-5"/>, hi ? "प्रोफाइल" : "Profile", hi ? "अपनी प्रोफाइल और पहचान अपडेट करें" : "Update your profile and identity", <button onClick={() => navigate("/profile")} className="rounded-xl bg-slate-50 p-2 text-slate-400"><ChevronRight className="h-4 w-4"/></button>)}
</div><button onClick={() => { void logout(); navigate("/"); }} className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3.5 text-[12px] font-black text-red-600"><LogOut className="h-4 w-4"/>{hi ? "लॉग आउट" : "Log out"}</button></div></motion.section></div></main>;
}
