import { useEffect, useMemo, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import {
  ArrowRight,
  Briefcase,
  ChevronRight,
  GraduationCap,
  Heart,
  HeartHandshake,
  Megaphone,
  Search,
  ShieldAlert,
  Sparkles,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";

type Lang = "en" | "hi";

type StatState = {
  beneficiaries: number;
  volunteers: number;
  healthCamps: number;
  campaigns: number;
};

const quickActions = [
  { id: "blood", icon: Heart, labelEn: "Need Blood", labelHi: "रक्त चाहिए", route: "/blood-network", tone: "bg-rose-50 text-rose-700" },
  { id: "help", icon: ShieldAlert, labelEn: "Need Help", labelHi: "मदद चाहिए", route: "/sos", tone: "bg-amber-50 text-amber-700" },
  { id: "jobs", icon: Briefcase, labelEn: "Jobs", labelHi: "रोज़गार", route: "/jobs", tone: "bg-blue-50 text-blue-700" },
  { id: "education", icon: GraduationCap, labelEn: "Education", labelHi: "शिक्षा", route: "/education", tone: "bg-violet-50 text-violet-700" },
  { id: "volunteers", icon: Users, labelEn: "Volunteer", labelHi: "स्वयंसेवक", route: "/volunteers", tone: "bg-emerald-50 text-emerald-700" },
];

function formatMetric(value: number) {
  if (!Number.isFinite(value) || value < 0) return "0";
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(value);
}

export default function Home() {
  const { lang } = useOutletContext<{ lang: Lang }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { settings, cmsConfig, globalSettings, announcements } = useApp();
  const [activeSlide, setActiveSlide] = useState(0);
  const [stats, setStats] = useState<StatState>({ beneficiaries: 0, volunteers: 0, healthCamps: 0, campaigns: 0 });

  const slides = useMemo(
    () => (Array.isArray(cmsConfig?.carouselSlides) ? cmsConfig.carouselSlides.filter((slide: any) => slide?.image) : []),
    [cmsConfig?.carouselSlides],
  );

  useEffect(() => {
    let cancelled = false;
    fetch("/api/stats")
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        setStats({
          beneficiaries: Number(data.beneficiaries) || 0,
          volunteers: Number(data.volunteers) || 0,
          healthCamps: Number(data.healthCamps) || 0,
          campaigns: Number(data.campaigns) || 0,
        });
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setActiveSlide((current) => (slides.length ? Math.min(current, slides.length - 1) : 0));
  }, [slides.length]);

  useEffect(() => {
    if (slides.length < 2) return;
    const timer = window.setInterval(() => setActiveSlide((current) => (current + 1) % slides.length), 5000);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? (lang === "hi" ? "सुप्रभात" : "Good morning") : hour < 17 ? (lang === "hi" ? "शुभ दोपहर" : "Good afternoon") : (lang === "hi" ? "शुभ संध्या" : "Good evening");
  const firstName = user?.name?.trim().split(/\s+/)[0] || "";
  const alertText = lang === "hi" ? cmsConfig?.alertBannerHi : cmsConfig?.alertBannerEn;
  const quote = lang === "hi" ? cmsConfig?.quoteOfTheDayHi : cmsConfig?.quoteOfTheDayEn;
  const founderMessage = globalSettings?.founder_message || (lang === "hi" ? settings?.founderMessageHi : settings?.founderMessageEn);
  const founderImage = cmsConfig?.founderImgUrl || globalSettings?.founder_image || "/assets/founder.png";

  return (
    <main className="min-h-full bg-slate-50 pb-8 font-sans text-slate-950">
      <div className="mx-auto w-full max-w-3xl px-4 pb-8 pt-5 sm:px-6">
        <section className="relative overflow-hidden rounded-[28px] bg-slate-950 px-5 py-6 text-white shadow-xl shadow-slate-900/10 sm:px-7">
          <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-300">
              <Sparkles className="h-3.5 w-3.5" /> RP Foundation
            </div>
            <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">{greeting}{firstName ? `, ${firstName}` : ""}</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
              {lang === "hi" ? "सेवा, समुदाय और सकारात्मक प्रभाव के लिए आपका डिजिटल स्थान।" : "Your digital space for service, community and meaningful impact."}
            </p>
            <button type="button" onClick={() => navigate("/services")} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-950 shadow-sm transition hover:bg-slate-100 active:scale-[.98]">
              {lang === "hi" ? "सेवाएं देखें" : "Explore services"}<ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>

        <button type="button" onClick={() => navigate("/services")} className="group mt-4 flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-left shadow-sm transition hover:border-slate-300 hover:shadow-md">
          <Search className="h-5 w-5 shrink-0 text-slate-400" />
          <span className="flex-1 text-sm font-medium text-slate-400">{lang === "hi" ? "आपको किस चीज़ में मदद चाहिए?" : "What do you need help with?"}</span>
          <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-1" />
        </button>

        {alertText && (
          <section className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4" aria-label="Important alert">
            <div className="flex items-start gap-3">
              <Megaphone className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
              <div><p className="text-xs font-black uppercase tracking-wider text-amber-700">{lang === "hi" ? "महत्वपूर्ण सूचना" : "Important update"}</p><p className="mt-1 text-sm font-semibold leading-5 text-amber-950">{alertText}</p></div>
            </div>
          </section>
        )}

        <section className="mt-7" aria-labelledby="quick-title">
          <div className="mb-3 flex items-center justify-between"><h2 id="quick-title" className="text-base font-black tracking-tight">{lang === "hi" ? "त्वरित सेवाएं" : "Quick actions"}</h2><button type="button" onClick={() => navigate("/services")} className="inline-flex items-center text-xs font-bold text-slate-500">{lang === "hi" ? "सभी" : "View all"}<ChevronRight className="h-4 w-4" /></button></div>
          <div className="grid grid-cols-5 gap-2 sm:gap-3">
            {quickActions.map(({ id, icon: Icon, labelEn, labelHi, route, tone }) => (
              <button key={id} type="button" onClick={() => navigate(route)} className="group flex min-w-0 flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white px-1.5 py-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:scale-95">
                <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${tone}`}><Icon className="h-5 w-5" /></span>
                <span className="line-clamp-2 text-center text-[10px] font-extrabold leading-3 text-slate-700">{lang === "hi" ? labelHi : labelEn}</span>
              </button>
            ))}
          </div>
        </section>

        {slides.length > 0 && (
          <section className="mt-7 overflow-hidden rounded-[26px] bg-slate-900 shadow-sm" aria-label={lang === "hi" ? "फाउंडेशन अपडेट" : "Foundation updates"}>
            <div className="relative h-52 sm:h-64">
              <motion.img key={activeSlide} src={slides[activeSlide]?.image} alt={lang === "hi" ? slides[activeSlide]?.titleHi || "" : slides[activeSlide]?.titleEn || ""} initial={{ opacity: 0, scale: 1.03 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .45 }} className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6"><h2 className="text-xl font-black text-white">{lang === "hi" ? slides[activeSlide]?.titleHi : slides[activeSlide]?.titleEn}</h2><p className="mt-1 max-w-xl text-xs leading-5 text-slate-200">{lang === "hi" ? slides[activeSlide]?.subHi : slides[activeSlide]?.subEn}</p></div>
              {slides.length > 1 && <div className="absolute bottom-5 right-5 flex gap-1.5">{slides.map((_: any, index: number) => <button key={index} type="button" onClick={() => setActiveSlide(index)} aria-label={`Show slide ${index + 1}`} className={`h-1.5 rounded-full transition-all ${index === activeSlide ? "w-6 bg-white" : "w-1.5 bg-white/50"}`} />)}</div>}
            </div>
          </section>
        )}

        <section className="mt-7" aria-labelledby="impact-title">
          <div className="mb-3 flex items-end justify-between"><div><p className="text-[10px] font-black uppercase tracking-[.18em] text-slate-400">{lang === "hi" ? "लाइव डेटा" : "Live data"}</p><h2 id="impact-title" className="mt-1 text-base font-black">{lang === "hi" ? "हमारा प्रभाव" : "Our impact"}</h2></div><span className="text-[10px] font-semibold text-slate-400">{lang === "hi" ? "डेटाबेस से" : "From database"}</span></div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[[lang === "hi" ? "लाभार्थी" : "Beneficiaries", stats.beneficiaries], [lang === "hi" ? "स्वयंसेवक" : "Volunteers", stats.volunteers], [lang === "hi" ? "स्वास्थ्य शिविर" : "Health camps", stats.healthCamps], [lang === "hi" ? "अभियान" : "Campaigns", stats.campaigns]].map(([label, value]) => <div key={String(label)} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"><p className="text-2xl font-black tracking-tight">{formatMetric(Number(value))}</p><p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p></div>)}
          </div>
        </section>

        {globalSettings?.show_notices !== false && Array.isArray(announcements) && announcements.length > 0 && (
          <section className="mt-7 rounded-2xl border border-slate-200 bg-white shadow-sm" aria-labelledby="updates-title">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5"><h2 id="updates-title" className="text-sm font-black">{lang === "hi" ? "समुदाय अपडेट" : "Community updates"}</h2><Megaphone className="h-4 w-4 text-slate-400" /></div>
            <div className="divide-y divide-slate-100">{announcements.slice(0, 4).map((item: any, index: number) => <div key={item?.id || index} className="px-4 py-3.5"><p className="text-sm font-bold text-slate-800">{item?.title}</p>{item?.content && <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{item.content}</p>}</div>)}</div>
          </section>
        )}

        {quote && <section className="mt-7 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-[10px] font-black uppercase tracking-[.18em] text-slate-400">{lang === "hi" ? "आज का सुविचार" : "Quote of the day"}</p><p className="mt-3 text-sm font-semibold italic leading-6 text-slate-700">“{quote}”</p></section>}

        {founderMessage && <section className="mt-7 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex gap-4 p-5"><img src={founderImage} alt="RP Foundation" className="h-16 w-16 shrink-0 rounded-2xl object-cover" /><div><p className="text-[10px] font-black uppercase tracking-[.18em] text-slate-400">{lang === "hi" ? "संस्थापक का संदेश" : "Founder’s message"}</p><p className="mt-2 line-clamp-5 text-sm leading-6 text-slate-600">{founderMessage}</p></div></div></section>}

        <button type="button" onClick={() => navigate("/donations")} className="mt-7 flex w-full items-center justify-between rounded-2xl bg-slate-950 px-5 py-4 text-left text-white shadow-lg shadow-slate-900/10 transition hover:bg-slate-800 active:scale-[.99]"><span><span className="block text-sm font-black">{lang === "hi" ? "अच्छे काम में साथ दें" : "Be part of the impact"}</span><span className="mt-0.5 block text-xs text-slate-400">{lang === "hi" ? "अपना योगदान दें" : "Support the foundation’s work"}</span></span><HeartHandshake className="h-5 w-5" /></button>
      </div>
    </main>
  );
}
