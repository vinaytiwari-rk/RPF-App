import { useEffect, useMemo, useState } from "react";
import { BadgePlus, BriefcaseBusiness, ClipboardList, CloudSun, HeartPulse, MapPin, UsersRound, Stethoscope, CalendarDays, ChevronRight, Compass, UserRound } from "lucide-react";
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

const defaultPib = ["Official Government updates are loading…"];
const defaultSachet = ["Official disaster alerts are loading…"];

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cmsConfig } = useApp();
  const [slide, setSlide] = useState(0);
  const [pibFeed, setPibFeed] = useState<string[]>(defaultPib);
  const [sachetFeed, setSachetFeed] = useState<string[]>(defaultSachet);
  const [locationName, setLocationName] = useState("Finding location…");
  const [temperature, setTemperature] = useState<string | null>(null);
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

  useEffect(() => {
    let alive = true;
    const load = async () => {
      for (const endpoint of ["/api/public/live-feeds", "/rss-proxy.php"]) {
        try {
          const response = await fetch(`${endpoint}?t=${Date.now()}`, { cache: "no-store" });
          if (!response.ok) continue;
          const json = await response.json();
          if (!alive || !json?.success) continue;
          if (Array.isArray(json.data?.pib) && json.data.pib.length) setPibFeed(json.data.pib);
          if (Array.isArray(json.data?.sachet) && json.data.sachet.length) setSachetFeed(json.data.sachet);
          return;
        } catch {}
      }
    };
    load();
    const timer = window.setInterval(load, 60000);
    return () => { alive = false; window.clearInterval(timer); };
  }, []);

  useEffect(() => {
    let alive = true;
    if (!("geolocation" in navigator)) { setLocationName("Location unavailable"); return; }
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      const { latitude, longitude } = coords;
      try {
        const [placeResponse, weatherResponse] = await Promise.all([
          fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=10`, { headers: { Accept: "application/json" } }),
          fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m&timezone=auto`),
        ]);
        const place = await placeResponse.json();
        const weather = await weatherResponse.json();
        if (!alive) return;
        const address = place?.address || {};
        setLocationName(address.city || address.town || address.village || address.county || address.state || "Current location");
        if (typeof weather?.current?.temperature_2m === "number") setTemperature(`${Math.round(weather.current.temperature_2m)}°C`);
      } catch {
        if (alive) setLocationName("Current location");
      }
    }, () => { if (alive) setLocationName("Enable location"); }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 });
    return () => { alive = false; };
  }, []);

  const pibText = [...pibFeed, ...pibFeed].join("     •     ");
  const sachetText = [...sachetFeed, ...sachetFeed].join("     •     ");

  return (
    <main className="min-h-full bg-[#FAFAF7] text-[#12233D]">
      <div className="mx-auto w-full max-w-3xl px-4 pb-3 pt-3 sm:px-6">
        <section className="mb-2 overflow-hidden rounded-xl border border-[#E7EAE4] bg-white shadow-[0_2px_10px_rgba(15,49,87,.03)]"><div className="h-9 overflow-hidden"><div className="inline-block min-w-max whitespace-nowrap px-4 text-[10px] font-semibold leading-9 text-[#46566A]" style={{ animation: "rpf-pib-marquee 34s linear infinite" }}>{pibText}</div></div></section>
        <section className="mb-3 overflow-hidden rounded-xl border border-[#F0DDD5] bg-[#FFFDFC] shadow-[0_2px_10px_rgba(15,49,87,.025)]"><div className="h-9 overflow-hidden"><div className="inline-block min-w-max whitespace-nowrap px-4 text-[10px] font-semibold leading-9 text-[#6B4B47]" style={{ animation: "rpf-sachet-marquee 34s linear infinite" }}>{sachetText}</div></div></section>

        <section className="mb-4"><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#138808]">RP Foundation</p><h1 className="mt-1 whitespace-nowrap text-[18px] font-black leading-tight tracking-[-0.04em] text-[#12233D] sm:text-[21px]">Namaste, {name} Ji <span className="text-[15px] sm:text-[17px]">🙏</span></h1><div className="mt-1 flex items-center gap-2 text-[10px] font-bold text-[#64748B]"><span>{greeting}</span><span className="text-slate-300">•</span><MapPin className="h-3.5 w-3.5 shrink-0 text-[#E67817]" /><span className="max-w-[118px] truncate">{locationName}</span>{temperature && <><span className="text-slate-300">•</span><CloudSun className="h-3.5 w-3.5 shrink-0 text-[#1D5B93]" /><span>{temperature}</span></>}</div></section>

        <section className="mb-4 rounded-2xl border border-[#E5EAE6] bg-white px-4 py-3 shadow-[0_4px_16px_rgba(15,49,87,.04)]"><p className="text-[8px] font-black uppercase tracking-[.16em] text-[#E67817]">Thought of the Day</p><p className="mt-1 text-[12px] font-bold leading-5 text-[#334155]">“Work is worship, and service is the greatest religion.”</p></section>

        <section><div className="mb-2.5 flex items-end justify-between"><div><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#E67817]">Discover</p><h2 className="mt-0.5 text-[21px] font-black tracking-[-0.035em] text-[#12233D]">RP Foundation at Work</h2></div><span className="text-[12px] font-black text-slate-400">{slide + 1}/{slides.length}</span></div>
          <motion.article key={`${current?.image || "slide"}-${slide}`} initial={{ opacity: 0.2 }} animate={{ opacity: 1 }} transition={{ duration: 0.28 }} className="relative h-[330px] overflow-hidden rounded-[22px] bg-[#0F3157] shadow-[0_10px_26px_rgba(15,49,87,.10)]"><img src={current?.image} alt={current?.titleEn || "RP Foundation initiative"} className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-[#07182C]/90 via-[#07182C]/20 to-transparent" /><div className="absolute inset-x-0 bottom-0 p-4 text-white"><span className="inline-flex rounded-full border border-white/15 bg-black/20 px-3 py-1 text-[8px] font-black uppercase tracking-[.16em] backdrop-blur">RP FOUNDATION</span><h3 className="mt-2 text-[22px] font-black leading-tight tracking-[-0.035em]">{current?.titleEn}</h3><p className="mt-1 text-[11px] leading-5 text-slate-200">{current?.subEn}</p><button onClick={() => navigate((current as any)?.route || "/impact")} className="mt-2 inline-flex items-center gap-1 text-[11px] font-black text-white">Explore <ChevronRight className="h-4 w-4" /></button></div></motion.article>
          <div className="mt-3 flex justify-center gap-2">{slides.map((_: any, index: number) => <button key={index} onClick={() => setSlide(index)} aria-label={`Slide ${index + 1}`} className={`h-2 rounded-full transition-all ${slide === index ? "w-7 bg-[#FF9933]" : "w-2 bg-slate-300"}`} />)}</div></section>

        <section className="mt-7"><div className="mb-3"><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#138808]">Foundation</p><h2 className="mt-0.5 text-[21px] font-black tracking-[-0.03em] text-[#12233D]">Our Vision & Leadership</h2></div><div className="grid grid-cols-2 gap-3"><button onClick={() => navigate("/vision-goals")} className="rounded-2xl border border-[#E6EAE6] bg-white p-4 text-left shadow-[0_3px_14px_rgba(15,49,87,.035)]"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EFF6FF] text-[#1D5B93]"><Compass className="h-5 w-5" /></div><p className="mt-4 text-[15px] font-black text-[#12233D]">Our Vision</p><p className="mt-1 text-[10px] font-semibold leading-4 text-slate-500">A clear direction for meaningful social impact.</p><span className="mt-3 inline-block text-[10px] font-black text-[#0F3157]">Read more ↗</span></button><button onClick={() => navigate("/founder-message")} className="rounded-2xl border border-[#E6EAE6] bg-white p-4 text-left shadow-[0_3px_14px_rgba(15,49,87,.035)]"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF7ED] text-[#E67817]"><UserRound className="h-5 w-5" /></div><p className="mt-4 text-[15px] font-black text-[#12233D]">Founder’s Message</p><p className="mt-1 text-[10px] font-semibold leading-4 text-slate-500">A message from Rohit Pandit, Founder of RP Foundation.</p><span className="mt-3 inline-block text-[10px] font-black text-[#0F3157]">Read message ↗</span></button></div></section>

        <section className="mt-7"><div className="mb-3"><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#E67817]">Quick Access</p><h2 className="mt-0.5 text-[21px] font-black tracking-[-0.03em] text-[#12233D]">What can we help with?</h2></div><div className="grid grid-cols-2 gap-3">{actions.map(({ title, subtitle, icon: Icon, route, accent }) => <motion.button key={title} whileTap={{ scale: 0.98 }} onClick={() => navigate(route)} className="min-h-[154px] rounded-2xl border border-[#E6EAE6] bg-white p-4 text-left shadow-[0_3px_14px_rgba(15,49,87,.035)]"><div className={`flex h-10 w-10 items-center justify-center rounded-xl ${accent}`}><Icon className="h-5 w-5" /></div><p className="mt-4 text-[15px] font-black text-[#12233D]">{title}</p><p className="mt-1 text-[10px] font-semibold leading-4 text-slate-500">{subtitle}</p><span className="mt-3 inline-block text-[10px] font-black text-[#0F3157]">Open ↗</span></motion.button>)}</div></section>
        <section className="mt-7 pb-3"><div className="mb-3"><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#138808]">Our Impact</p><h2 className="mt-0.5 text-[21px] font-black tracking-[-0.03em] text-[#12233D]">RP Foundation at Work</h2></div><div className="grid grid-cols-3 overflow-hidden rounded-2xl border border-[#E5EAE6] bg-white">{[{ icon: UsersRound, value: "Community", label: "People first" }, { icon: Stethoscope, value: "Care", label: "Health initiatives" }, { icon: CalendarDays, value: "Active", label: "Foundation work" }].map(({ icon: Icon, value, label }) => <div key={label} className="border-r border-[#EEF1EE] px-2 py-4 text-center last:border-r-0"><Icon className="mx-auto h-4 w-4 text-[#138808]" /><p className="mt-2 text-[13px] font-black text-[#0F3157]">{value}</p><p className="mt-0.5 text-[8px] font-bold text-slate-400">{label}</p></div>)}</div></section>
      </div>
      <style>{`@keyframes rpf-pib-marquee { from { transform: translateX(-100%); } to { transform: translateX(100vw); } } @keyframes rpf-sachet-marquee { from { transform: translateX(100vw); } to { transform: translateX(-100%); } }`}</style>
    </main>
  );
}
