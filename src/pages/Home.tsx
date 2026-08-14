import { useEffect, useMemo, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { ArrowRight, Briefcase, ChevronRight, CloudSun, GraduationCap, Heart, HeartHandshake, Megaphone, Search, ShieldAlert, Sparkles, Users, Wind } from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";

type Lang = "en" | "hi";
type Stats = { beneficiaries: number; volunteers: number; healthCamps: number; campaigns: number };

const quickActions = [
  { id: "blood", icon: Heart, en: "Need Blood", hi: "रक्त चाहिए", route: "/blood-network" },
  { id: "help", icon: ShieldAlert, en: "Need Help", hi: "मदद चाहिए", route: "/grievance" },
  { id: "jobs", icon: Briefcase, en: "Jobs", hi: "रोज़गार", route: "/services" },
  { id: "education", icon: GraduationCap, en: "Education", hi: "शिक्षा", route: "/services" },
  { id: "volunteer", icon: Users, en: "Volunteer", hi: "स्वयंसेवा", route: "/services" },
];

function metric(value: number) {
  if (!Number.isFinite(value) || value < 0) return "0";
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(value);
}

export default function Home() {
  const { lang } = useOutletContext<{ lang: Lang }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cmsConfig, globalSettings, announcements } = useApp();
  const [stats, setStats] = useState<Stats>({ beneficiaries: 0, volunteers: 0, healthCamps: 0, campaigns: 0 });
  const slides = useMemo(() => Array.isArray(cmsConfig?.carouselSlides) ? cmsConfig.carouselSlides.filter((s: any) => s?.image) : [], [cmsConfig?.carouselSlides]);
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/stats").then(r => r.ok ? r.json() : null).then(data => {
      if (!cancelled && data) setStats({ beneficiaries: Number(data.beneficiaries) || 0, volunteers: Number(data.volunteers) || 0, healthCamps: Number(data.healthCamps) || 0, campaigns: Number(data.campaigns) || 0 });
    }).catch(() => undefined);
    return () => { cancelled = true; };
  }, []);

  useEffect(() => { if (slides.length > 1) { const t = window.setInterval(() => setSlide(s => (s + 1) % slides.length), 5000); return () => window.clearInterval(t); } }, [slides.length]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? (lang === "hi" ? "सुप्रभात" : "Good morning") : hour < 17 ? (lang === "hi" ? "शुभ दोपहर" : "Good afternoon") : (lang === "hi" ? "शुभ संध्या" : "Good evening");
  const firstName = user?.name?.trim().split(/\s+/)[0] || "";
  const alert = lang === "hi" ? cmsConfig?.alertBannerHi : cmsConfig?.alertBannerEn;

  return <main className="min-h-full bg-slate-50 pb-10 text-slate-950">
    <div className="mx-auto max-w-3xl px-4 py-5 sm:px-6">
      <section className="relative overflow-hidden rounded-[28px] bg-slate-950 p-6 text-white shadow-xl shadow-slate-900/10 sm:p-7">
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="relative"><div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[.2em] text-slate-400"><Sparkles className="h-3.5 w-3.5"/> RP Foundation</div><h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">{greeting}{firstName ? `, ${firstName}` : ""}</h1><p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">{lang === "hi" ? "सेवा, समुदाय और सकारात्मक प्रभाव के लिए आपका डिजिटल स्थान।" : "Your digital space for service, community and meaningful impact."}</p><div className="mt-5 flex flex-wrap gap-2"><button onClick={() => navigate("/daily")} className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-950">{lang === "hi" ? "आज आपके लिए" : "Today for you"}<ArrowRight className="h-4 w-4"/></button><button onClick={() => navigate("/services")} className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-bold text-white">{lang === "hi" ? "सेवाएं" : "Explore"}</button></div></div>
      </section>

      <button onClick={() => navigate("/services")} className="group mt-4 flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-left shadow-sm"><Search className="h-5 w-5 text-slate-400"/><span className="flex-1 text-sm font-medium text-slate-400">{lang === "hi" ? "आपको किस चीज़ में मदद चाहिए?" : "What do you need help with?"}</span><ChevronRight className="h-4 w-4 text-slate-300 group-hover:translate-x-1"/></button>

      {alert && <section className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4"><div className="flex gap-3"><Megaphone className="h-5 w-5 shrink-0 text-amber-700"/><div><p className="text-[10px] font-black uppercase tracking-wider text-amber-700">{lang === "hi" ? "महत्वपूर्ण सूचना" : "Important update"}</p><p className="mt-1 text-sm font-semibold text-amber-950">{alert}</p></div></div></section>}

      <section className="mt-7"><div className="mb-3 flex items-center justify-between"><h2 className="text-base font-black">{lang === "hi" ? "त्वरित सेवाएं" : "Quick actions"}</h2><button onClick={() => navigate("/services")} className="inline-flex items-center text-xs font-bold text-slate-500">{lang === "hi" ? "सभी" : "View all"}<ChevronRight className="h-4 w-4"/></button></div><div className="grid grid-cols-5 gap-2 sm:gap-3">{quickActions.map(({ id, icon: Icon, en, hi, route }) => <button key={id} onClick={() => navigate(route)} className="flex min-w-0 flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white px-1.5 py-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700"><Icon className="h-5 w-5"/></span><span className="line-clamp-2 text-center text-[10px] font-extrabold leading-3 text-slate-700">{lang === "hi" ? hi : en}</span></button>)}</div></section>

      <section className="mt-7 overflow-hidden rounded-[26px] bg-white shadow-sm border border-slate-200"><div className="flex items-center justify-between px-5 pt-5"><div><p className="text-[10px] font-black uppercase tracking-[.18em] text-slate-400">{lang === "hi" ? "दैनिक उपयोग" : "Daily utility"}</p><h2 className="mt-1 text-lg font-black">{lang === "hi" ? "मौसम और वायु गुणवत्ता" : "Weather & air quality"}</h2></div><CloudSun className="h-5 w-5 text-slate-400"/></div><button onClick={() => navigate("/daily")} className="m-5 mt-4 flex w-[calc(100%-2.5rem)] items-center justify-between rounded-2xl bg-slate-950 p-4 text-left text-white"><span><span className="block text-sm font-black">{lang === "hi" ? "आज का डैशबोर्ड खोलें" : "Open today’s dashboard"}</span><span className="mt-1 block text-xs text-slate-400">{lang === "hi" ? "Weather • AQI • News • Culture • Health • Radio" : "Weather • AQI • News • Culture • Health • Radio"}</span></span><Wind className="h-5 w-5"/></button></section>

      {slides.length > 0 && <section className="mt-7 overflow-hidden rounded-[26px] bg-slate-900"><div className="relative h-56"><motion.img key={slide} src={slides[slide]?.image} alt={lang === "hi" ? slides[slide]?.titleHi || "" : slides[slide]?.titleEn || ""} initial={{ opacity: 0 }} animate={{ opacity: .9 }} transition={{ duration: .4 }} className="absolute inset-0 h-full w-full object-cover"/><div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent"/><div className="absolute inset-x-0 bottom-0 p-5"><h2 className="text-xl font-black text-white">{lang === "hi" ? slides[slide]?.titleHi : slides[slide]?.titleEn}</h2><p className="mt-1 text-xs leading-5 text-slate-200">{lang === "hi" ? slides[slide]?.subHi : slides[slide]?.subEn}</p></div></div></section>}

      <section className="mt-7"><div className="mb-3 flex items-end justify-between"><div><p className="text-[10px] font-black uppercase tracking-[.18em] text-slate-400">{lang === "hi" ? "वास्तविक डेटा" : "Real data"}</p><h2 className="mt-1 text-base font-black">{lang === "hi" ? "हमारा प्रभाव" : "Our impact"}</h2></div><span className="text-[10px] font-semibold text-slate-400">API → database</span></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{[["Beneficiaries", stats.beneficiaries],["Volunteers", stats.volunteers],["Health camps", stats.healthCamps],["Campaigns", stats.campaigns]].map(([label, value]) => <div key={String(label)} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-2xl font-black">{metric(Number(value))}</p><p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">{lang === "hi" ? ({Beneficiaries:"लाभार्थी",Volunteers:"स्वयंसेवक","Health camps":"स्वास्थ्य शिविर",Campaigns:"अभियान"} as any)[label] : label}</p></div>)}</div></section>

      {globalSettings?.show_notices !== false && Array.isArray(announcements) && announcements.length > 0 && <section className="mt-7 rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5"><h2 className="text-sm font-black">{lang === "hi" ? "समुदाय अपडेट" : "Community updates"}</h2><Megaphone className="h-4 w-4 text-slate-400"/></div><div className="divide-y divide-slate-100">{announcements.slice(0,4).map((a:any,i:number)=><div key={a?.id||i} className="px-4 py-3.5"><p className="text-sm font-bold text-slate-800">{a?.title}</p>{a?.content && <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{a.content}</p>}</div>)}</div></section>}

      <button onClick={() => navigate("/donations")} className="mt-7 flex w-full items-center justify-between rounded-2xl bg-slate-950 px-5 py-4 text-left text-white shadow-lg shadow-slate-900/10"><span><span className="block text-sm font-black">{lang === "hi" ? "अच्छे काम में साथ दें" : "Be part of the impact"}</span><span className="mt-1 block text-xs text-slate-400">{lang === "hi" ? "अपना योगदान दें" : "Support the foundation’s work"}</span></span><HeartHandshake className="h-5 w-5"/></button>
    </div>
  </main>;
}
