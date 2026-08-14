import { useEffect, useMemo, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { ArrowRight, Briefcase, ChevronRight, CloudSun, GraduationCap, Heart, HeartHandshake, Megaphone, Search, ShieldAlert, Sparkles, Users, Wind } from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";

type Lang = "en" | "hi";
type Stats = { beneficiaries: number; volunteers: number; healthCamps: number; campaigns: number };

const quickActions = [
  { id: "blood", icon: Heart, en: "Need Blood", hi: "रक्त चाहिए", route: "/blood-network", tone: "rose" },
  { id: "help", icon: ShieldAlert, en: "Need Help", hi: "मदद चाहिए", route: "/grievance", tone: "saffron" },
  { id: "jobs", icon: Briefcase, en: "Jobs", hi: "रोज़गार", route: "/services", tone: "indigo" },
  { id: "education", icon: GraduationCap, en: "Education", hi: "शिक्षा", route: "/services", tone: "gold" },
  { id: "volunteer", icon: Users, en: "Volunteer", hi: "स्वयंसेवा", route: "/services", tone: "green" },
];

function metric(value: number) {
  if (!Number.isFinite(value) || value < 0) return "0";
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(value);
}

const toneClasses: Record<string, string> = {
  rose: "bg-rose-50 text-rose-700 ring-rose-100",
  saffron: "bg-orange-50 text-orange-700 ring-orange-100",
  indigo: "bg-indigo-50 text-indigo-700 ring-indigo-100",
  gold: "bg-amber-50 text-amber-700 ring-amber-100",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-100",
};

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

  return <main className="min-h-full bg-[#fbf8f2] pb-10 text-slate-900">
    <div className="mx-auto w-full max-w-3xl px-3.5 py-4 sm:px-6 sm:py-5">
      <section className="relative overflow-hidden rounded-[26px] border border-amber-200/70 bg-gradient-to-br from-[#fff8e7] via-[#fffaf3] to-[#eef2ff] p-5 shadow-[0_14px_35px_-24px_rgba(127,29,29,.35)] sm:p-7">
        <div className="pointer-events-none absolute -right-12 -top-16 h-44 w-44 rounded-full bg-amber-300/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-10 h-36 w-36 rounded-full bg-rose-300/15 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[.22em] text-[#9a5b13]"><Sparkles className="h-3.5 w-3.5"/> RP Foundation</div>
          <h1 className="mt-2.5 text-[27px] font-black leading-tight tracking-[-0.035em] text-[#3b1f1f] sm:text-4xl">{greeting}{firstName ? `, ${firstName}` : ""}</h1>
          <p className="mt-2 max-w-xl text-[13px] leading-5.5 text-slate-600 sm:text-sm sm:leading-6">{lang === "hi" ? "सेवा, समुदाय और सकारात्मक प्रभाव के लिए आपका डिजिटल स्थान।" : "Your digital space for service, community and meaningful impact."}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={() => navigate("/daily")} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#a84424] px-4 py-2.5 text-[13px] font-bold text-white shadow-md shadow-orange-900/10">{lang === "hi" ? "आज आपके लिए" : "Today for you"}<ArrowRight className="h-4 w-4"/></button>
            <button onClick={() => navigate("/services")} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-indigo-200 bg-white/80 px-4 py-2.5 text-[13px] font-bold text-indigo-800">{lang === "hi" ? "सेवाएं" : "Explore"}</button>
          </div>
        </div>
      </section>

      <button onClick={() => navigate("/services")} className="group mt-3 flex min-h-12 w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left shadow-sm"><Search className="h-5 w-5 text-[#a84424]"/><span className="flex-1 text-[13px] font-medium text-slate-500">{lang === "hi" ? "आपको किस चीज़ में मदद चाहिए?" : "What do you need help with?"}</span><ChevronRight className="h-4 w-4 text-slate-300 group-hover:translate-x-1"/></button>

      {alert && <section className="mt-4 rounded-2xl border border-amber-200 bg-amber-50/80 p-4"><div className="flex gap-3"><Megaphone className="h-5 w-5 shrink-0 text-[#a84424]"/><div><p className="text-[9px] font-black uppercase tracking-wider text-[#a84424]">{lang === "hi" ? "महत्वपूर्ण सूचना" : "Important update"}</p><p className="mt-1 text-[13px] font-semibold text-amber-950">{alert}</p></div></div></section>}

      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between"><h2 className="text-[15px] font-black text-[#3b1f1f]">{lang === "hi" ? "त्वरित सेवाएं" : "Quick actions"}</h2><button onClick={() => navigate("/services")} className="inline-flex items-center text-[11px] font-bold text-indigo-700">{lang === "hi" ? "सभी" : "View all"}<ChevronRight className="h-4 w-4"/></button></div>
        <div className="-mx-3.5 flex snap-x gap-2.5 overflow-x-auto px-3.5 pb-1 sm:mx-0 sm:grid sm:grid-cols-5 sm:gap-3 sm:overflow-visible sm:px-0">
          {quickActions.map(({ id, icon: Icon, en, hi, route, tone }) => <button key={id} onClick={() => navigate(route)} className="flex min-w-[88px] snap-start flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white px-2 py-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:min-w-0"><span className={`flex h-11 w-11 items-center justify-center rounded-xl ring-1 ${toneClasses[tone]}`}><Icon className="h-5 w-5" strokeWidth={1.8}/></span><span className="line-clamp-2 text-center text-[10px] font-extrabold leading-3 text-slate-700">{lang === "hi" ? hi : en}</span></button>)}
        </div>
      </section>

      <section className="mt-6 overflow-hidden rounded-[24px] border border-amber-200/70 bg-white shadow-sm">
        <div className="flex items-center justify-between px-5 pt-5"><div><p className="text-[9px] font-black uppercase tracking-[.18em] text-[#a84424]">{lang === "hi" ? "दैनिक उपयोग" : "Daily utility"}</p><h2 className="mt-1 text-[17px] font-black text-[#3b1f1f]">{lang === "hi" ? "मौसम और वायु गुणवत्ता" : "Weather & air quality"}</h2></div><CloudSun className="h-5 w-5 text-amber-600"/></div>
        <button onClick={() => navigate("/daily")} className="m-4 flex min-h-16 w-[calc(100%-2rem)] items-center justify-between rounded-2xl bg-gradient-to-r from-[#7f1d1d] via-[#a84424] to-[#b8860b] p-4 text-left text-white shadow-md shadow-amber-900/10"><span><span className="block text-[13px] font-black">{lang === "hi" ? "आज का डैशबोर्ड खोलें" : "Open today’s dashboard"}</span><span className="mt-1 block text-[10px] text-amber-50/90">Weather • AQI • News • Culture • Health • Radio</span></span><Wind className="h-5 w-5"/></button>
      </section>

      {slides.length > 0 && <section className="mt-6 overflow-hidden rounded-[24px] border border-indigo-100 bg-indigo-950"><div className="relative h-52"><motion.img key={slide} src={slides[slide]?.image} alt={lang === "hi" ? slides[slide]?.titleHi || "" : slides[slide]?.titleEn || ""} initial={{ opacity: 0 }} animate={{ opacity: .92 }} transition={{ duration: .4 }} className="absolute inset-0 h-full w-full object-cover"/><div className="absolute inset-0 bg-gradient-to-t from-[#312e81]/90 via-[#312e81]/25 to-transparent"/><div className="absolute inset-x-0 bottom-0 p-5"><h2 className="text-lg font-black text-white">{lang === "hi" ? slides[slide]?.titleHi : slides[slide]?.titleEn}</h2><p className="mt-1 text-[11px] leading-5 text-indigo-50">{lang === "hi" ? slides[slide]?.subHi : slides[slide]?.subEn}</p></div></div></section>}

      <section className="mt-6"><div className="mb-3 flex items-end justify-between"><div><p className="text-[9px] font-black uppercase tracking-[.18em] text-[#a84424]">{lang === "hi" ? "वास्तविक डेटा" : "Real data"}</p><h2 className="mt-1 text-[15px] font-black text-[#3b1f1f]">{lang === "hi" ? "हमारा प्रभाव" : "Our impact"}</h2></div><span className="text-[9px] font-semibold text-slate-400">API → database</span></div><div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">{[["Beneficiaries", stats.beneficiaries],["Volunteers", stats.volunteers],["Health camps", stats.healthCamps],["Campaigns", stats.campaigns]].map(([label, value], index) => <div key={String(label)} className={`rounded-2xl border p-3.5 shadow-sm ${index === 0 ? "border-rose-100 bg-rose-50/50" : index === 1 ? "border-emerald-100 bg-emerald-50/50" : index === 2 ? "border-indigo-100 bg-indigo-50/50" : "border-amber-100 bg-amber-50/50"}`}><p className="text-[23px] font-black text-[#3b1f1f]">{metric(Number(value))}</p><p className="mt-1 text-[9px] font-bold uppercase tracking-wider text-slate-500">{lang === "hi" ? ({Beneficiaries:"लाभार्थी",Volunteers:"स्वयंसेवक","Health camps":"स्वास्थ्य शिविर",Campaigns:"अभियान"} as any)[label] : label}</p></div>)}</div></section>

      {globalSettings?.show_notices !== false && Array.isArray(announcements) && announcements.length > 0 && <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5"><h2 className="text-sm font-black text-[#3b1f1f]">{lang === "hi" ? "समुदाय अपडेट" : "Community updates"}</h2><Megaphone className="h-4 w-4 text-[#a84424]"/></div><div className="divide-y divide-slate-100">{announcements.slice(0,4).map((a:any,i:number)=><div key={a?.id||i} className="px-4 py-3.5"><p className="text-[13px] font-bold text-slate-800">{a?.title}</p>{a?.content && <p className="mt-1 line-clamp-2 text-[11px] leading-5 text-slate-500">{a.content}</p>}</div>)}</div></section>}

      <button onClick={() => navigate("/donations")} className="mt-6 flex min-h-16 w-full items-center justify-between rounded-2xl border border-orange-200 bg-gradient-to-r from-orange-50 via-amber-50 to-rose-50 px-5 py-4 text-left shadow-sm"><span><span className="block text-[13px] font-black text-[#7f1d1d]">{lang === "hi" ? "अच्छे काम में साथ दें" : "Be part of the impact"}</span><span className="mt-1 block text-[10px] text-slate-500">{lang === "hi" ? "अपना योगदान दें" : "Support the foundation’s work"}</span></span><HeartHandshake className="h-5 w-5 text-[#a84424]"/></button>
    </div>
  </main>;
}
