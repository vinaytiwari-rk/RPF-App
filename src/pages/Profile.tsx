import { motion } from "motion/react";
import { Award, Bell, ChevronRight, Globe, HeartHandshake, IdCard, Settings, ShieldCheck, User, Users, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const navigate = useNavigate();
  const { user, language, setLanguage } = useAuth();
  const name = user?.name?.trim() || (language === "hi" ? "नागरिक" : "Citizen");
  const role = user?.role || "citizen";
  const phone = user?.phone || "";
  const initials = name.split(/\s+/).map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  const hi = language === "hi";

  const menu = [
    { icon: IdCard, title: hi ? "जन सेवा कार्ड" : "Jan Seva Card", sub: hi ? "आपकी सेवा और नागरिक पहचान" : "Your service and citizen identity", route: "/jan-seva-card", color: "from-[#FF9933] to-[#F59E0B]" },
    { icon: Activity, title: hi ? "मेरी गतिविधि" : "My Activity", sub: hi ? "आपकी हाल की गतिविधियां और अपडेट" : "Your recent activities and updates", route: "/notifications", color: "from-[#7C3AED] to-[#A855F7]" },
    { icon: HeartHandshake, title: hi ? "सेवा में जुड़ें" : "Join the Seva", sub: hi ? "जन सेवा कार्ड के माध्यम से अपनी भागीदारी बढ़ाएं" : "Manage your participation through Jan Seva Card", route: "/jan-seva-card", color: "from-[#138808] to-[#22C55E]" },
    { icon: Bell, title: hi ? "सूचनाएं" : "Notifications", sub: hi ? "जरूरी अपडेट और घोषणाएं" : "Important updates and announcements", route: "/notifications", color: "from-[#0EA5E9] to-[#38BDF8]" },
  ];

  return <main className="min-h-full bg-[#f8fafc] pb-10"><div className="mx-auto max-w-3xl px-3.5 py-5 sm:px-6">
    <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-[28px] border border-orange-200/70 bg-white shadow-[0_18px_50px_rgba(0,0,0,.07)]">
      <div className="h-1.5 bg-gradient-to-r from-[#FF9933] via-white to-[#138808]"/><div className="absolute -right-20 -top-20 h-52 w-52 rounded-full bg-violet-200/30 blur-3xl"/><div className="absolute -bottom-20 -left-20 h-52 w-52 rounded-full bg-green-200/30 blur-3xl"/>
      <div className="relative p-6"><div className="flex items-center gap-4"><motion.div animate={{ y:[0,-3,0] }} transition={{ duration:3, repeat:Infinity, ease:"easeInOut" }} className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[24px] bg-gradient-to-br from-[#FF9933] via-white to-[#138808] p-[2px] shadow-lg"><div className="flex h-full w-full items-center justify-center rounded-[22px] bg-white text-2xl font-black text-[#000080]">{initials || <User/>}</div></motion.div><div className="min-w-0"><p className="text-[9px] font-black uppercase tracking-[.2em] text-[#FF9933]">RPF Seva App</p><h1 className="mt-1 truncate text-[22px] font-black text-[#000080]">{name}</h1><p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">{role.replace(/_/g, " ")}</p>{phone && <p className="mt-1 text-[11px] text-slate-500">{phone}</p>}</div></div>
      <div className="mt-6 grid grid-cols-3 rounded-2xl border border-slate-100 bg-slate-50/70 text-center"><div className="border-r border-slate-200 py-3"><ShieldCheck className="mx-auto h-4 w-4 text-[#138808]"/><p className="mt-1 text-[9px] font-bold text-slate-500">{hi ? "सत्यापित" : "Verified"}</p></div><div className="border-r border-slate-200 py-3"><Users className="mx-auto h-4 w-4 text-[#7C3AED]"/><p className="mt-1 text-[9px] font-bold text-slate-500">{hi ? "समुदाय" : "Community"}</p></div><div className="py-3"><Award className="mx-auto h-4 w-4 text-[#FF9933]"/><p className="mt-1 text-[9px] font-bold text-slate-500">{hi ? "सेवा" : "Seva"}</p></div></div></div>
    </motion.section>

    <motion.section initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:.08 }} className="mt-5 space-y-2.5">{menu.map(({ icon:Icon,title,sub,route,color},i)=><motion.button key={title} whileHover={{ x:2 }} whileTap={{ scale:.985 }} onClick={()=>navigate(route)} className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 text-left shadow-sm"><span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${color} shadow-sm`}><Icon className="h-5 w-5 text-white"/></span><span className="min-w-0 flex-1"><span className="block text-[13px] font-black text-slate-800">{title}</span><span className="mt-0.5 block text-[10px] leading-4 text-slate-500">{sub}</span></span><ChevronRight className="h-4 w-4 text-slate-300"/></motion.button>)}</motion.section>

    <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-500"><Globe className="h-5 w-5"/></span><div className="flex-1"><p className="text-[12px] font-black text-slate-800">{hi ? "भाषा" : "Language"}</p><p className="text-[10px] text-slate-500">{hi ? "ऐप की भाषा बदलें" : "Change app language"}</p></div><button onClick={()=>setLanguage(hi ? "en" : "hi")} className="rounded-xl border border-slate-200 px-3 py-2 text-[10px] font-black text-[#000080]">{hi ? "English" : "हिन्दी"}</button></div><button onClick={()=>navigate("/services")} className="mt-3 flex w-full items-center gap-3 border-t border-slate-100 pt-3 text-left"><Settings className="h-4 w-4 text-slate-400"/><span className="flex-1 text-[11px] font-bold text-slate-600">{hi ? "और सेवाएं देखें" : "Explore more services"}</span><ChevronRight className="h-4 w-4 text-slate-300"/></button></section>
    <p className="mt-6 text-center text-[9px] font-bold tracking-[.16em] text-slate-300">SEVA • SAMARPAN • SANKALP</p>
  </div></main>;
}
