import { useEffect, useMemo, useState } from "react";
import { ArrowRight, Briefcase, ChevronRight, CloudSun, GraduationCap, Heart, HeartHandshake, Megaphone, Search, ShieldAlert, Sparkles, Users, Wind } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate, useOutletContext } from "react-router-dom";
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

  return <main className="min-h-full bg-slate-50 pb-6 text-slate-900 sm:pb-10">
    <div className="mx-auto w-full max-w-3xl px-3 py-4 sm:px-6 sm:py-5">
      <section className="relative overflow-hidden rounded-[24px] border border-teal-100 bg-gradient-to-br from-teal-50 via-white to-indigo-50 p-5 shadow-sm sm:rounded-[28px] sm:p-7">
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-teal-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-12 h-36 w-36 rounded-full bg-indigo-200/40 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-2 text-[9px] font-extrabold uppercase tracking-[.16em] text-teal-700 sm:text-[10px] sm:tracking-[.2em]"><Sparkles className="h-3.5 w-3.5"/> RP Foundation</div>
          <h1 className="mt-2.5 text-[26px] font-extrabold leading-tight tracking-[-0.03em] text-slate-900 sm:mt-3 sm:text-4xl">{greeting}{firstName ? `, ${firstName}` : ""}</h1>
          <p className="mt-2 max-w-xl text-[13px] leading-5 text-slate-600 sm:text-sm sm:leading-6">{lang === "hi" ? "सेवा, समुदाय और सकारात्मक प्रभाव के लिए आपका डिजिटल स्थान।" : "Your digital space for service, community and meaningful impact."}</p>
          <div className="mt-4 flex flex-col gap-2 min-[390px]:flex-row sm:mt-5">
            <button onClick={() => navigate("/daily")} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm shadow-teal-600/20 transition hover:bg-teal-700 active:scale-[.98]">{lang === "hi" ? "आज आपके लिए" : "Today for you"}<ArrowRight className="h-4 w-4"/></button>
            <button onClick={() => navigate("/services")} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white/90 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-white active:scale-[.98]">{lang === "hi" ? "सेवाएं" : "Explore"}</button>
          </div>
        </div>
      </section>

      <button onClick={() => navigate("/services")} className="group mt-3.5 flex min-h-12 w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3.5 py-3 text-left shadow-sm sm:mt-4 sm:px-4 sm:py-3.5"><Search className="h-5 w-5 shrink-0 text-slate-400"/><span className="flex-1 text-[13px] font-medium text-slate-500 sm:text-sm">{lang === "hi" ? "आपको किस चीज़ में मदद चाहिए?" : "What do you need help with?"}</span><ChevronRight className="h-4 w-4 shrink-0 text-slate-300 group-hover:translate-x-1"/></button>

      {alert && <section className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-3.5 sm:mt-5 sm:p-4"><div className="flex gap-3"><Megaphone className="h-5 w-5 shrink-0 text-amber-700"/><div><p className="text-[9px] font-extrabold uppercase tracking-wider text-amber-700 sm:text-[10px]">{lang === "hi" ? "महत्वपूर्ण सूचना" : "Important update"}</p><p className="mt-1 text-[13px] font-semibold leading-5 text-amber-950 sm:text-sm">{alert}</p></div></div></section>}

      <section className="mt-6 sm:mt-7"><div className="mb-3 flex items-center justify-between"><h2 className="text-[15px] font-extrabold text-slate-900 sm:text-base">{lang === "hi" ? "त्वरित सेवाएं" : "Quick actions"}</h2><button onClick={() => navigate("/services")} className="inline-flex items-center text-[11px] font-bold text-slate-500 sm:text-xs">{lang === "hi" ? "सभी" : "View all"}<ChevronRight className="h-4 w-4"/></button></div><div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar sm:grid sm:grid-cols-5 sm:gap-3">{quickActions.map(({ id, icon: Icon, en, hi, route }) => <button key={id} onClick={() => navigate(route)} className="flex w-[92px] min-w-[92px] shrink-0 flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white px-1.5 py-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:scale-[.98] sm:w-auto sm:min-w-0"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-50 text-teal-700 sm:h-11 sm:w-11"><Icon className="h-5 w-5"/></span><span className="line-clamp-2 text-center text-[10px] font-bold leading-3 text-slate-700 sm:text-[10px]">{lang === "hi" ? hi : en}</span></button>)}</div></section>

      <section className="mt-6 overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm sm:mt-7 sm:rounded-[26px]"><div className="flex items-center justify-between px-4 pt-4 sm:px-5 sm:pt-5"><div><p className="text-[9px] font-extrabold uppercase tracking-[.16em] text-slate-400 sm:text-[10px]">{lang === "hi" ? "दैनिक उपयोग" : "Daily utility"}</p><h2 className="mt-1 text-[17px] font-extrabold text-slate-900 sm:text-lg">{lang === "hi" ? "मौसम और वायु गुणवत्ता" : "Weather & air quality"}</h2></div><CloudSun className="h-5 w-5 text-teal-600"/></div><button onClick={() => navigate("/daily")} className="m-4 mt-3.5 flex min-h-[72px] w-[calc(100%-2rem)] items-center justify-between rounded-2xl bg-gradient-to-r from-teal-600 to-indigo-600 p-4 text-left text-white shadow-md shadow-indigo-600/10 sm:m-5 sm:mt-4 sm:w-[calc(100%-2.5rem)]"><span><span className="block text-[13px] font-extrabold sm:text-sm">{lang === "hi" ? "आज का डैशबोर्ड खोलें" : "Open today’s dashboard"}</span><span className="mt-1 block text-[10px] leading-4 text-white/80 sm:text-xs">{lang === "hi" ? "Weather • AQI • News • Culture • Health • Radio" : "Weather • AQI • News • Culture • Health • Radio"}</span></span><Wind className="h-5 w-5 shrink-0"/></button></section>

      {slides.length > 0 && <section className="mt-6 overflow-hidden rounded-[22px] bg-slate-800 shadow-sm sm:mt-7 sm:rounded-[26px]"><div className="relative h-48 sm:h-56"><motion.img key={slide} src={slides[slide]?.image} alt={lang === "hi" ? slides[slide]?.titleHi || "" : slides[slide]?.titleEn || ""} initial={{ opacity: 0 }} animate={{ opacity: .9 }} transition={{ duration: .4 }} className="absolute inset-0 h-full w-full object-cover"/><div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/15 to-transparent"/><div className="absolute inset-x-0 bottom-0 p-4 sm:p-5"><h2 className="text-lg font-extrabold text-white sm:text-xl">{lang === "hi" ? slides[slide]?.titleHi : slides[slide]?.titleEn}</h2><p className="mt-1 text-[11px] leading-4 text-slate-100 sm:text-xs sm:leading-5">{lang === "hi" ? slides[slide]?.subHi : slides[slide]?.subEn}</p></div></div></section>}

      <section className="mt-6 sm:mt-7"><div className="mb-3 flex items-end justify-between"><div><p className="text-[9px] font-extrabold uppercase tracking-[.16em] text-slate-400 sm:text-[10px]">{lang === "hi" ? "वास्तविक डेटा" : "Real data"}</p><h2 className="mt-1 text-[15px] font-extrabold text-slate-900 sm:text-base">{lang === "hi" ? "हमारा प्रभाव" : "Our impact"}</h2></div><span className="text-[9px] font-semibold text-slate-400 sm:text-[10px]">API → database</span></div><div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">{[["Beneficiaries", stats.beneficiaries],["Volunteers", stats.volunteers],["Health camps", stats.healthCamps],["Campaigns", stats.campaigns]].map(([label, value]) => <div key={String(label)} className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm sm:p-4"><p className="text-xl font-extrabold text-slate-900 sm:text-2xl">{metric(Number(value))}</p><p className="mt-1 text-[9px] font-bold uppercase tracking-wider text-slate-400 sm:text-[10px]">{lang === "hi" ? ({Beneficiaries:"लाभार्थी",Volunteers:"स्वयंसेवक","Health camps":"स्वास्थ्य शिविर",Campaigns:"अभियान"} as any)[label] : label}</p></div>)}</div></section>

      {globalSettings?.show_notices !== false && Array.isArray(announcements) && announcements.length > 0 && <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm sm:mt-7"><div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5"><h2 className="text-sm font-extrabold text-slate-900">{lang === "hi" ? "समुदाय अपडेट" : "Community updates"}</h2><Megaphone className="h-4 w-4 text-slate-400"/></div><div className="divide-y divide-slate-100">{announcements.slice(0,4).map((a:any,i:number)=><div key={a?.id||i} className="px-4 py-3.5"><p className="text-[13px] font-bold text-slate-800 sm:text-sm">{a?.title}</p>{a?.content && <p className="mt-1 line-clamp-2 text-[11px] leading-5 text-slate-500 sm:text-xs">{a.content}</p>}</div>)}</div></section>}

      <button onClick={() => navigate("/donations")} className="mt-6 flex min-h-[72px] w-full items-center justify-between rounded-2xl border border-teal-100 bg-gradient-to-r from-teal-50 to-indigo-50 px-4 py-4 text-left shadow-sm sm:mt-7 sm:px-5"><span><span className="block text-[13px] font-extrabold text-slate-900 sm:text-sm">{lang === "hi" ? "अच्छे काम में साथ दें" : "Be part of the impact"}</span><span className="mt-1 block text-[11px] text-slate-500 sm:text-xs">{lang === "hi" ? "अपना योगदान दें" : "Support the foundation’s work"}</span></span><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-600 text-white"><HeartHandshake className="h-5 w-5"/></span></button>
    </div>
  </main>;
}
