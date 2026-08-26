import { useEffect, useMemo, useState } from "react";
import { BadgePlus, BriefcaseBusiness, ClipboardList, CloudSun, HeartPulse, MapPin, UsersRound, Stethoscope, CalendarDays, ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";

const fallbackSlides = [
  { image: "/assets/mega_camp_banner.png", titleEn: "Healthcare support for the community", subEn: "Health camps, medical support and community care.", route: "/health-care", active: true },
  { image: "/assets/water_pump_camp.png", titleEn: "Service that reaches people", subEn: "Ground-level initiatives focused on practical support.", route: "/impact", active: true },
  { image: "/assets/founder.png", titleEn: "Service. Commitment. Resolve.", subEn: "Discover the people and purpose behind the work.", route: "/founder-message", active: true },
  { image: "/assets/donate.jpg", titleEn: "Support, skills and opportunity", subEn: "Explore programmes and services available to the community.", route: "/services", active: true },
];

const actions = [
  { title: "Jan Seva Card", subtitle: "Your digital service identity", icon: BadgePlus, route: "/jan-seva-card", accent: "text-[#E67817] bg-[#FFF7ED]" },
  { title: "Healthcare", subtitle: "Health services and support", icon: HeartPulse, route: "/health-care", accent: "text-[#C81E4A] bg-[#FFF1F4]" },
  { title: "Employment", subtitle: "Jobs, skills and opportunities", icon: BriefcaseBusiness, route: "/employment", accent: "text-[#138808] bg-[#F0F9F1]" },
  { title: "Grievance", subtitle: "Submit and track an issue", icon: ClipboardList, route: "/grievance", accent: "text-[#1D5B93] bg-[#EFF6FF]" },
];

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cmsConfig } = useApp();
  const [slide, setSlide] = useState(0);
  const name = user?.name?.trim().split(/\s+/)[0] || "Guest";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  const slides = useMemo(() => {
    const managed = Array.isArray(cmsConfig?.carouselSlides) ? cmsConfig.carouselSlides.filter((item: any) => item?.active !== false && item?.image) : [];
    return managed.length ? [...managed].sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0)) : fallbackSlides;
  }, [cmsConfig?.carouselSlides]);
  const current = slides[slide] || slides[0];

  useEffect(() => { if (slide >= slides.length) setSlide(0); }, [slide, slides.length]);
  useEffect(() => {
    if (slides.length < 2) return;
    const timer = window.setInterval(() => setSlide((value) => (value + 1) % slides.length), 5000);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  return (
    <main className="min-h-full bg-[#FAFAF7] text-[#12233D]">
      <div className="mx-auto w-full max-w-3xl px-4 pb-2 pt-2 sm:px-6">
        <section className="mb-4 overflow-hidden rounded-lg border border-[#E7EAE4] bg-white"><div className="flex h-8 items-center whitespace-nowrap"><span className="shrink-0 bg-[#0F3157] px-3 text-[8px] font-black uppercase tracking-[.13em] leading-8 text-white">Thought of the Day</span><div className="min-w-0 overflow-hidden"><div className="animate-[marquee_18s_linear_infinite] pl-4 text-[11px] font-semibold text-[#4B5563]">Work is worship, and service is the greatest religion. • Together, we can build a better and stronger India.</div></div></div></section>
        <section className="mb-5"><p className="text-[11px] font-black uppercase tracking-[.16em] text-[#138808]">RP Foundation</p><div className="mt-1 flex items-end justify-between gap-3"><div><h1 className="text-[25px] font-black leading-tight tracking-[-0.045em] text-[#12233D]">Namaste, {name} Ji <span className="text-[21px]">🙏</span></h1><p className="mt-0.5 text-[13px] font-bold text-[#64748B]">{greeting}</p></div><div className="flex shrink-0 items-center gap-1.5 pb-0.5 text-[10px] font-bold text-[#64748B]"><MapPin className="h-3.5 w-3.5 text-[#E67817]" /><span className="max-w-[82px] truncate">Your location</span><span className="mx-0.5 text-slate-300">•</span><CloudSun className="h-3.5 w-3.5 text-[#1D5B93]" /><span>25°C</span></div></div></section>
        <section><div className="mb-2.5 flex items-end justify-between"><div><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#E67817]">Discover</p><h2 className="mt-0.5 text-[21px] font-black tracking-[-0.035em] text-[#12233D]">RP Foundation at Work</h2></div><span className="text-[12px] font-black text-slate-400">{slide + 1}/{slides.length}</span></div>
          <motion.article key={`${current?.image || "slide"}-${slide}`} initial={{ opacity: 0.2 }} animate={{ opacity: 1 }} transition={{ duration: 0.28 }} className="relative h-[330px] overflow-hidden rounded-[22px] bg-[#0F3157] shadow-[0_10px_26px_rgba(15,49,87,.10)]"><img src={current?.image} alt={current?.titleEn || "RP Foundation initiative"} className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-[#07182C]/90 via-[#07182C]/20 to-transparent" /><div className="absolute inset-x-0 bottom-0 p-4 text-white"><span className="inline-flex rounded-full border border-white/15 bg-black/20 px-3 py-1 text-[8px] font-black uppercase tracking-[.16em] backdrop-blur">RP FOUNDATION</span><h3 className="mt-2 text-[22px] font-black leading-tight tracking-[-0.035em]">{current?.titleEn}</h3><p className="mt-1 text-[11px] leading-5 text-slate-200">{current?.subEn}</p><button onClick={() => navigate((current as any)?.route || "/impact")} className="mt-2 inline-flex items-center gap-1 text-[11px] font-black text-white">Explore <ChevronRight className="h-4 w-4" /></button></div></motion.article>
          <div className="mt-3 flex justify-center gap-2">{slides.map((_: any, index: number) => <button key={index} onClick={() => setSlide(index)} aria-label={`Slide ${index + 1}`} className={`h-2 rounded-full transition-all ${slide === index ? "w-7 bg-[#FF9933]" : "w-2 bg-slate-300"}`} />)}</div></section>
        <section className="mt-7"><div className="mb-3"><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#E67817]">Quick Access</p><h2 className="mt-0.5 text-[21px] font-black tracking-[-0.03em] text-[#12233D]">What can we help with?</h2></div><div className="grid grid-cols-2 gap-3">{actions.map(({ title, subtitle, icon: Icon, route, accent }) => <motion.button key={title} whileTap={{ scale: 0.98 }} onClick={() => navigate(route)} className="min-h-[154px] rounded-2xl border border-[#E6EAE6] bg-white p-4 text-left shadow-[0_3px_14px_rgba(15,49,87,.035)]"><div className={`flex h-10 w-10 items-center justify-center rounded-xl ${accent}`}><Icon className="h-5 w-5" /></div><p className="mt-4 text-[15px] font-black text-[#12233D]">{title}</p><p className="mt-1 text-[10px] font-semibold leading-4 text-slate-500">{subtitle}</p><span className="mt-3 inline-block text-[10px] font-black text-[#0F3157]">Open ↗</span></motion.button>)}</div></section>
        <section className="mt-7 pb-3"><div className="mb-3"><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#138808]">Our Impact</p><h2 className="mt-0.5 text-[21px] font-black tracking-[-0.03em] text-[#12233D]">RP Foundation at Work</h2></div><div className="grid grid-cols-3 overflow-hidden rounded-2xl border border-[#E5EAE6] bg-white">{[{ icon: UsersRound, value: "Community", label: "People first" }, { icon: Stethoscope, value: "Care", label: "Health initiatives" }, { icon: CalendarDays, value: "Active", label: "Foundation work" }].map(({ icon: Icon, value, label }) => <div key={label} className="border-r border-[#EEF1EE] px-2 py-4 text-center last:border-r-0"><Icon className="mx-auto h-4 w-4 text-[#138808]" /><p className="mt-2 text-[13px] font-black text-[#0F3157]">{value}</p><p className="mt-0.5 text-[8px] font-bold text-slate-400">{label}</p></div>)}</div></section>
      </div>
    </main>
  );
}
