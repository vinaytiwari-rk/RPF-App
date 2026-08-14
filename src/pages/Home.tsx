import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  Briefcase,
  ChevronRight,
  GraduationCap,
  Heart,
  Info,
  Search,
  ShieldAlert,
  Users,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { translations } from "../translations";
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
  {
    id: "blood",
    icon: Heart,
    labelEn: "Need Blood",
    labelHi: "रक्त चाहिए",
    route: "/blood-network",
  },
  {
    id: "sos",
    icon: ShieldAlert,
    labelEn: "Need Help",
    labelHi: "मदद चाहिए",
    route: "/sos",
  },
  {
    id: "jobs",
    icon: Briefcase,
    labelEn: "Jobs",
    labelHi: "रोज़गार",
    route: "/jobs",
  },
  {
    id: "education",
    icon: GraduationCap,
    labelEn: "Education",
    labelHi: "शिक्षा",
    route: "/education",
  },
  {
    id: "volunteers",
    icon: Users,
    labelEn: "Volunteer",
    labelHi: "स्वयंसेवक",
    route: "/volunteers",
  },
];

function formatMetric(value: number) {
  if (!Number.isFinite(value)) return "0";
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M+`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K+`;
  return String(value);
}

export default function Home() {
  const { lang } = useOutletContext<{ lang: Lang }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { settings, cmsConfig, globalSettings, announcements } = useApp();
  const t = translations[lang];

  const [activeSlide, setActiveSlide] = useState(0);
  const [stats, setStats] = useState<StatState>({
    beneficiaries: 0,
    volunteers: 0,
    healthCamps: 0,
    campaigns: 0,
  });

  const slides = useMemo(
    () => (Array.isArray(cmsConfig?.carouselSlides) ? cmsConfig.carouselSlides : []),
    [cmsConfig?.carouselSlides],
  );

  useEffect(() => {
    let cancelled = false;

    const fetchStats = async () => {
      try {
        const response = await fetch("/api/stats");
        if (!response.ok) return;
        const data = await response.json();
        if (cancelled) return;

        setStats({
          beneficiaries: Number(data?.beneficiaries) || 0,
          volunteers: Number(data?.volunteers) || 0,
          healthCamps: Number(data?.healthCamps) || 0,
          campaigns: Number(data?.campaigns) || 0,
        });
      } catch {
        // The home screen remains usable when the optional stats endpoint is unavailable.
      }
    };

    fetchStats();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setActiveSlide((current) => (slides.length ? Math.min(current, slides.length - 1) : 0));
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return lang === "hi" ? "सुप्रभात" : "Good morning";
    if (hour < 17) return lang === "hi" ? "शुभ दोपहर" : "Good afternoon";
    return lang === "hi" ? "शुभ संध्या" : "Good evening";
  };

  const firstName = user?.name?.trim().split(/\s+/)[0] || "";
  const alertText = lang === "hi" ? cmsConfig?.alertBannerHi : cmsConfig?.alertBannerEn;
  const founderMessage =
    globalSettings?.founder_message ||
    (lang === "hi" ? settings?.founderMessageHi : settings?.founderMessageEn);
  const quote = lang === "hi" ? cmsConfig?.quoteOfTheDayHi : cmsConfig?.quoteOfTheDayEn;
  const founderImage = cmsConfig?.founderImgUrl || globalSettings?.founder_image || "/assets/founder.png";

  return (
    <main className="min-h-full bg-slate-50 pb-10 font-sans text-slate-900 animate-fadeIn">
      <div className="mx-auto w-full max-w-2xl space-y-6 px-4 pb-6 pt-6">
        <header className="space-y-1">
          <p className="text-sm font-semibold tracking-wide text-slate-500">RP Foundation</p>
          <h1 className="text-2xl font-black tracking-tight text-slate-950">
            {getGreeting()}{firstName ? `, ${firstName}` : ""}
          </h1>
          {firstName && (
            <p className="text-sm font-medium text-slate-500">
              {lang === "hi" ? "आज हम आपकी कैसे मदद कर सकते हैं?" : "How can we help you today?"}
            </p>
          )}
        </header>

        <button
          type="button"
          onClick={() => navigate("/services")}
          className="group flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-left shadow-sm transition hover:border-slate-300 hover:shadow-md active:scale-[0.99]"
          aria-label={lang === "hi" ? "सेवाएं खोजें" : "Search services"}
        >
          <Search className="h-5 w-5 shrink-0 text-slate-400" />
          <span className="flex-1 text-sm font-medium text-slate-400">
            {lang === "hi" ? "आपको किस चीज़ में मदद चाहिए?" : "What do you need help with?"}
          </span>
          <ArrowRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5" />
        </button>

        {alertText && (
          <section className="rounded-2xl border border-red-100 bg-red-50 p-4" aria-label="Important alert">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-lg bg-white p-2 text-red-600 shadow-sm">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-wider text-red-700">
                  {lang === "hi" ? "महत्वपूर्ण अलर्ट" : "Important alert"}
                </p>
                <p className="mt-1 text-sm font-medium leading-5 text-red-900">{alertText}</p>
              </div>
            </div>
          </section>
        )}

        <section aria-labelledby="quick-actions-title">
          <div className="mb-3 flex items-center justify-between">
            <h2 id="quick-actions-title" className="text-base font-extrabold tracking-tight">
              {lang === "hi" ? "त्वरित सेवाएं" : "Quick services"}
            </h2>
            <button
              type="button"
              onClick={() => navigate("/services")}
              className="inline-flex items-center gap-0.5 text-xs font-bold text-slate-600 hover:text-slate-950"
            >
              {lang === "hi" ? "सभी देखें" : "View all"}
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => navigate(action.route)}
                  className="group flex min-w-0 flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white px-1.5 py-3 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md active:scale-95"
                >
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition group-hover:bg-slate-900 group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="line-clamp-2 text-center text-[10px] font-bold leading-3 text-slate-700">
                    {lang === "hi" ? action.labelHi : action.labelEn}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {slides.length > 0 && (
          <section aria-label={lang === "hi" ? "फाउंडेशन अपडेट" : "Foundation updates"}>
            <div className="relative h-[190px] overflow-hidden rounded-3xl bg-slate-900 shadow-sm">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeSlide}
                  src={slides[activeSlide]?.image}
                  alt={lang === "hi" ? slides[activeSlide]?.titleHi || "" : slides[activeSlide]?.titleEn || ""}
                  initial={{ opacity: 0, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45 }}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </AnimatePresence>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 p-5">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`caption-${activeSlide}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="text-lg font-extrabold leading-tight text-white">
                      {lang === "hi" ? slides[activeSlide]?.titleHi : slides[activeSlide]?.titleEn}
                    </h2>
                    <p className="mt-1 line-clamp-2 text-xs font-medium leading-5 text-slate-200">
                      {lang === "hi" ? slides[activeSlide]?.subHi : slides[activeSlide]?.subEn}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {slides.length > 1 && (
                <div className="absolute bottom-5 right-5 flex items-center gap-1.5">
                  {slides.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setActiveSlide(index)}
                      aria-label={`Show slide ${index + 1}`}
                      className={`h-1.5 rounded-full transition-all ${
                        index === activeSlide ? "w-5 bg-white" : "w-1.5 bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {globalSettings?.show_notices !== false && announcements?.length > 0 && (
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" aria-labelledby="updates-title">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  {lang === "hi" ? "नवीनतम" : "Latest"}
                </p>
                <h2 id="updates-title" className="mt-0.5 text-sm font-extrabold">
                  {lang === "hi" ? "समुदाय अपडेट" : "Community updates"}
                </h2>
              </div>
              <Info className="h-4 w-4 text-slate-400" />
            </div>
            <div className="divide-y divide-slate-100">
              {announcements.slice(0, 4).map((announcement: any, index: number) => (
                <div key={announcement?.id || index} className="px-4 py-3.5">
                  <p className="text-sm font-bold text-slate-800">{announcement?.title}</p>
                  {announcement?.content && (
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{announcement.content}</p>
                  )}
                  {announcement?.link_url && (
                    <a
                      href={announcement.link_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center text-[10px] font-extrabold uppercase tracking-wider text-slate-700 hover:text-slate-950"
                    >
                      {lang === "hi" ? "अधिक पढ़ें" : "Read more"}
                      <ChevronRight className="ml-0.5 h-3 w-3" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {globalSettings?.show_widgets !== false && (
          <section aria-labelledby="impact-title">
            <div className="mb-3 flex items-end justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  {lang === "hi" ? "डेटा" : "Verified data"}
                </p>
                <h2 id="impact-title" className="mt-0.5 text-base font-extrabold tracking-tight">
                  {lang === "hi" ? "हमारा प्रभाव" : "Our impact"}
                </h2>
              </div>
              <span className="text-[10px] font-semibold text-slate-400">
                {lang === "hi" ? "सर्वर से प्राप्त" : "From live data"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                [lang === "hi" ? "लाभार्थी" : "Beneficiaries", stats.beneficiaries],
                [lang === "hi" ? "स्वयंसेवक" : "Volunteers", stats.volunteers],
                [lang === "hi" ? "स्वास्थ्य शिविर" : "Health camps", stats.healthCamps],
                [lang === "hi" ? "अभियान" : "Campaigns", stats.campaigns],
              ].map(([label, value]) => (
                <div key={String(label)} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-2xl font-black tracking-tight text-slate-950">{formatMetric(Number(value))}</p>
                  <p className="mt-1 text-[10px] font-bold uppercase leading-4 tracking-wider text-slate-400">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {quote && (
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-slate-400">
              <Info className="h-4 w-4" />
              <p className="text-[10px] font-bold uppercase tracking-[0.16em]">
                {lang === "hi" ? "आज का सुविचार" : "Quote of the day"}
              </p>
            </div>
            <p className="mt-3 text-sm font-semibold italic leading-6 text-slate-700">“{quote}”</p>
          </section>
        )}

        {founderMessage && (
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start gap-4">
              <img
                src={founderImage}
                alt={cmsConfig?.founderName || "Founder"}
                className="h-14 w-14 shrink-0 rounded-full border border-slate-200 object-cover"
              />
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">
                  {lang === "hi" ? "संस्थापक का संदेश" : "Founder’s message"}
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-600">“{founderMessage}”</p>
                <p className="mt-3 text-sm font-extrabold text-slate-900">
                  {cmsConfig?.founderName || "Rohit Pandit"}
                </p>
                <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {cmsConfig?.founderDesignation || "Founder, RP Foundation"}
                </p>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
