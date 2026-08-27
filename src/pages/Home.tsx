import { useEffect, useMemo, useState } from "react";
import { BadgePlus, BriefcaseBusiness, ClipboardList, CloudSun, HeartPulse, MapPin, UsersRound, Stethoscope, CalendarDays, ChevronRight, Compass, UserRound, Quote } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";

const fallbackSlides = [
  { image: "/assets/mega_camp_banner.png", titleEn: "Healthcare support for the community", subEn: "Health camps, medical support and community care.", route: "/health-care", active: true },
  { image: "/assets/water_pump_camp.png", titleEn: "Service that reaches people", subEn: "Ground-level initiatives focused on practical support.", route: "/impact", active: true },
  { image: "/assets/founder.png", titleEn: "Service. Commitment. Resolve.", subEn: "Discover the people and purpose behind the work.", route: "/founder-message", active: true },
  { image: "/assets/donate.jpg", titleEn: "Support, skills and opportunity", subEn: "Explore programmes and services available to the community.", route: "/services", active: true }
];

const actions = [
  { title: "Jan Seva Card", subtitle: "Your digital service identity", icon: BadgePlus, route: "/jan-seva-card", accent: "text-[#D97706] bg-amber-500/10 border border-amber-500/20" },
  { title: "Healthcare", subtitle: "Health services and support", icon: HeartPulse, route: "/health-care", accent: "text-[#DC2626] bg-red-500/10 border border-red-500/20" },
  { title: "Employment", subtitle: "Jobs, skills and opportunities", icon: BriefcaseBusiness, route: "/employment", accent: "text-[#167C5A] bg-emerald-500/10 border border-emerald-500/20" },
  { title: "Grievance", subtitle: "Submit and track an issue", icon: ClipboardList, route: "/grievance", accent: "text-[#14213D] bg-slate-500/10 border border-slate-500/20" }
];

const defaultPibFeed: string[] = [];
const defaultSachetFeed: string[] = [];

async function timedFetch(url: string, ms = 8000) {
  const c = new AbortController();
  const t = window.setTimeout(() => c.abort(), ms);
  try {
    return await fetch(`${url}${url.includes("?") ? "&" : "?"}t=${Date.now()}`, { cache: "no-store", signal: c.signal });
  } finally {
    window.clearTimeout(t);
  }
}

function parseFeedItems(items: unknown): string[] {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => {
      if (typeof item === "string") return item.trim();
      if (typeof item !== "object" || item === null) return "";
      const obj = item as Record<string, unknown>;
      const title = obj.titleHi || obj.titleEn || obj.title || obj.name || obj.description || "";
      const source = typeof obj.source === "string" ? obj.source.trim() : "";
      if (typeof title !== "string" || !title.trim()) return "";
      const cleanTitle = title
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .trim();
      return source ? `${source}: ${cleanTitle}` : cleanTitle;
    })
    .filter((str) => str.length >= 15 && !str.toLowerCase().includes("google") && !str.includes("temporarily unavailable") && !str.includes("available right now"));
}

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cmsConfig } = useApp();
  const [slide, setSlide] = useState(0);
  const [pibFeed, setPibFeed] = useState<string[]>(defaultPibFeed);
  const [sachetFeed, setSachetFeed] = useState<string[]>(defaultSachetFeed);
  const [locationName, setLocationName] = useState("Finding location…");
  const [temperature, setTemperature] = useState<string | null>(null);

  const name = user?.name?.trim().split(/\s+/)[0] || "Guest";
  const hour = new Date().getHours();
  const greeting = hour >= 4 && hour < 12 ? "Good Morning" : hour >= 12 && hour < 17 ? "Good Afternoon" : hour >= 17 && hour < 22 ? "Good Evening" : "Good Night";

  const slides = useMemo(() => {
    const managed = Array.isArray(cmsConfig?.carouselSlides) ? cmsConfig.carouselSlides.filter((i: any) => i?.active !== false && i?.image) : [];
    return managed.length ? [...managed].sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0)) : fallbackSlides;
  }, [cmsConfig?.carouselSlides]);

  const current = slides[slide] || slides[0];

  useEffect(() => { if (slide >= slides.length) setSlide(0); }, [slide, slides.length]);
  useEffect(() => {
    if (slides.length < 2) return;
    const t = window.setInterval(() => setSlide((v) => (v + 1) % slides.length), 5000);
    return () => window.clearInterval(t);
  }, [slides.length]);
  useEffect(() => {
    slides.forEach((s: any, i: number) => {
      const src = s?.image?.startsWith("assets/") ? `/${s.image}` : s?.image || fallbackSlides[i % fallbackSlides.length].image;
      const img = new Image(); img.src = src;
    });
  }, [slides]);

  const getSlideImage = (sUrl?: string, idx = 0) => {
    if (!sUrl || typeof sUrl !== "string") return fallbackSlides[idx % fallbackSlides.length].image;
    const t = sUrl.trim();
    if (!t) return fallbackSlides[idx % fallbackSlides.length].image;
    return t.startsWith("assets/") ? `/${t}` : t;
  };

  useEffect(() => {
    let alive = true;
    try {
      const cachedPib = localStorage.getItem("@rpf_news_cache");
      const cachedSachet = localStorage.getItem("@rpf_sachet_cache");
      if (cachedPib) { const parsed = JSON.parse(cachedPib); if (Array.isArray(parsed) && parsed.length) setPibFeed(parsed); }
      if (cachedSachet) { const parsed = JSON.parse(cachedSachet); if (Array.isArray(parsed) && parsed.length) setSachetFeed(parsed); }
    } catch {}

    const load = async () => {
      let fetchedPib: string[] = [];
      let fetchedSachet: string[] = [];
      for (const url of ["/rss-proxy.php", "/api/public/news"]) {
        try {
          const r = await timedFetch(url, 5000);
          if (!r.ok) continue;
          const j = await r.json();
          const pItems = parseFeedItems(j?.data?.pib ?? j?.data?.news ?? j?.data);
          const sItems = parseFeedItems(j?.data?.sachet ?? []);
          if (pItems.length) fetchedPib = pItems;
          if (sItems.length) fetchedSachet = sItems;
          if (fetchedPib.length && fetchedSachet.length) break;
        } catch {}
      }
      if (!alive) return;
      if (fetchedPib.length) { setPibFeed(fetchedPib); try { localStorage.setItem("@rpf_news_cache", JSON.stringify(fetchedPib)); } catch {} }
      if (fetchedSachet.length) { setSachetFeed(fetchedSachet); try { localStorage.setItem("@rpf_sachet_cache", JSON.stringify(fetchedSachet)); } catch {} }
    };
    void load();
    const t = window.setInterval(() => void load(), 60000);
    return () => { alive = false; window.clearInterval(t); };
  }, []);

  useEffect(() => {
    let alive = true;
    if (!("geolocation" in navigator)) { setLocationName("Location off"); return; }
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      try {
        const [p, w] = await Promise.all([
          fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords.latitude}&lon=${coords.longitude}&zoom=10`, { headers: { Accept: "application/json" } }),
          fetch(`https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}&current=temperature_2m&timezone=auto`)
        ]);
        const place = await p.json(), weather = await w.json(); if (!alive) return;
        const a = place?.address || {};
        setLocationName(a.city || a.town || a.village || a.county || a.state || "Current location");
        if (typeof weather?.current?.temperature_2m === "number") setTemperature(`${Math.round(weather.current.temperature_2m)}°C`);
      } catch { if (alive) setLocationName("Current location"); }
    }, () => { if (alive) setLocationName("Location off"); }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 });
    return () => { alive = false; };
  }, []);

  const pibText = useMemo(() => pibFeed.length ? [...pibFeed, ...pibFeed].join("     •     ") : "Updates are loading…", [pibFeed]);
  const sachetText = useMemo(() => sachetFeed.length ? [...sachetFeed, ...sachetFeed].join("     •     ") : "Alerts are loading…", [sachetFeed]);
  const pibDuration = useMemo(() => `${Math.max(50, Math.round(pibText.length * 0.08))}s`, [pibText]);
  const sachetDuration = useMemo(() => `${Math.max(50, Math.round(sachetText.length * 0.08))}s`, [sachetText]);

  return (
    <main className="min-h-full bg-transparent text-[#14213D]">
      <div className="mx-auto w-full max-w-3xl px-4 pb-4 pt-3 sm:px-6">
        <section className="mb-4 bg-transparent py-1">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h1 className="text-[24px] sm:text-[28px] font-bold leading-tight tracking-tight text-[#14213D]">{greeting}, {name} Ji <span className="text-[20px]">🙏</span></h1>
              <p className="mt-1 text-[12px] sm:text-[13px] font-medium text-slate-600">Welcome to Samahit, a volunteer initiative for RP Foundation.</p>
            </div>
            <div className="flex shrink-0 items-center gap-1.5 text-[10.5px] font-semibold text-slate-700 bg-white/60 px-2.5 py-1 rounded-full border border-slate-200/80 shadow-2xs backdrop-blur-xs">
              <MapPin className="h-3 w-3 text-[#D97706]" />
              <span className="max-w-[100px] truncate">{locationName}</span>
              {temperature && <><span className="text-slate-300">•</span><CloudSun className="h-3 w-3 text-[#167C5A]" /><span>{temperature}</span></>}
            </div>
          </div>
        </section>

        <section className="mb-2 overflow-hidden rounded-xl border border-amber-200/80 bg-white/70 backdrop-blur-xs flex items-center h-9 shadow-2xs">
          <div className="overflow-hidden w-full flex items-center h-full"><div className="inline-block min-w-max whitespace-nowrap px-3 text-[11.5px] font-semibold text-[#14213D]" style={{ animation: `rpf-pib-marquee ${pibDuration} linear infinite` }}>{pibText}</div></div>
        </section>

        <section className="mb-4 overflow-hidden rounded-xl border border-emerald-200/80 bg-white/70 backdrop-blur-xs flex items-center h-9 shadow-2xs">
          <div className="overflow-hidden w-full flex items-center h-full"><div className="inline-block min-w-max whitespace-nowrap px-3 text-[11.5px] font-semibold text-[#167C5A]" style={{ animation: `rpf-sachet-marquee ${sachetDuration} linear infinite` }}>{sachetText}</div></div>
        </section>

        <section className="mb-6 rounded-2xl border border-amber-200/60 bg-amber-50/40 backdrop-blur-xs px-4 py-3.5 shadow-2xs">
          <div className="flex items-center gap-1.5 text-[#D97706]"><Quote className="h-3.5 w-3.5" /><p className="text-[10px] font-bold uppercase tracking-widest">Thought of the Day</p></div>
          <p className="mt-1.5 text-[13px] sm:text-[14px] font-semibold leading-relaxed text-[#14213D]">“Work is worship, and service is the greatest religion.”</p>
        </section>

        <section className="mb-7">
          <div className="mb-3 flex items-end justify-between"><div><p className="text-[10.5px] font-bold uppercase tracking-widest text-[#D97706]">Discover</p><h2 className="mt-0.5 text-[20px] sm:text-[22px] font-bold text-[#14213D]">RP Foundation at Work</h2></div><span className="text-[12px] font-semibold text-slate-500">{slide + 1}/{slides.length}</span></div>
          <motion.article key={`${current?.image || "slide"}-${slide}`} initial={{ opacity: 0.2 }} animate={{ opacity: 1 }} className="relative h-[320px] sm:h-[350px] overflow-hidden rounded-[24px] bg-[#14213D] shadow-md">
            <img src={getSlideImage(current?.image, slide)} alt={current?.titleEn || "RP Foundation initiative"} className="absolute inset-0 h-full w-full object-cover" onError={(e) => { const img = e.currentTarget; const fb = fallbackSlides[slide % fallbackSlides.length].image; if (img.src !== fb) img.src = fb; }} />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/95 via-[#0F172A]/40 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 text-white"><h3 className="text-[20px] sm:text-[22px] font-bold leading-tight text-white">{current?.titleEn}</h3><p className="mt-1 text-[12px] sm:text-[13px] leading-relaxed text-slate-200 font-medium">{current?.subEn}</p><button onClick={() => navigate((current as any)?.route || "/impact")} className="mt-2.5 inline-flex items-center gap-1 text-[12px] font-bold text-amber-300 hover:text-amber-200 transition-colors">Explore <ChevronRight className="h-4 w-4" /></button></div>
          </motion.article>
          <div className="mt-3 flex justify-center gap-2">{slides.map((_: any, i: number) => <button key={i} onClick={() => setSlide(i)} className={`h-2 rounded-full transition-all ${slide === i ? "w-7 bg-[#D97706]" : "w-2 bg-slate-300"}`} />)}</div>
        </section>

        <section className="mb-7"><div className="mb-3"><p className="text-[10.5px] font-bold uppercase tracking-widest text-[#D97706]">Quick Access</p><h2 className="mt-0.5 text-[20px] sm:text-[22px] font-bold text-[#14213D]">What can we help with?</h2></div><div className="grid grid-cols-2 gap-3.5">{actions.map(({ title, subtitle, icon: Icon, route, accent }) => <motion.button key={title} whileTap={{ scale: 0.98 }} onClick={() => navigate(route)} className="min-h-[150px] rounded-2xl border border-amber-100/80 bg-white/80 backdrop-blur-md p-4 text-left shadow-2xs hover:border-amber-300/80 hover:shadow-xs transition-all flex flex-col justify-between"><div className={`flex h-10 w-10 items-center justify-center rounded-xl ${accent}`}><Icon className="h-5 w-5" /></div><div><p className="mt-3 text-[15px] font-bold text-[#14213D]">{title}</p><p className="mt-0.5 text-[11.5px] text-slate-500 font-medium leading-snug">{subtitle}</p></div></motion.button>)}</div></section>

        <section className="mb-7"><div className="mb-3"><p className="text-[10.5px] font-bold uppercase tracking-widest text-[#167C5A]">Foundation</p><h2 className="mt-0.5 text-[20px] sm:text-[22px] font-bold text-[#14213D]">Our Vision & Leadership</h2></div><div className="grid grid-cols-2 gap-3.5"><button onClick={() => navigate("/vision-goals")} className="rounded-2xl border border-amber-100/80 bg-white/80 backdrop-blur-md p-4 text-left shadow-2xs hover:border-amber-300/80 transition-all flex flex-col justify-between min-h-[140px]"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-500/10 border border-slate-500/20 text-[#14213D]"><Compass className="h-5 w-5" /></div><div><p className="mt-3 text-[15px] font-bold text-[#14213D]">Our Vision</p><p className="mt-0.5 text-[11.5px] text-slate-500 font-medium leading-snug">A clear direction for meaningful social impact.</p></div></button><button onClick={() => navigate("/founder-message")} className="rounded-2xl border border-amber-100/80 bg-white/80 backdrop-blur-md p-4 text-left shadow-2xs hover:border-amber-300/80 transition-all flex flex-col justify-between min-h-[140px]"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-[#D97706]"><UserRound className="h-5 w-5" /></div><div><p className="mt-3 text-[15px] font-bold text-[#14213D]">Founder’s Message</p><p className="mt-0.5 text-[11.5px] text-slate-500 font-medium leading-snug">A message from Rohit Pandit, Founder of RP Foundation.</p></div></button></div></section>

        <section className="mb-4"><div className="mb-3"><p className="text-[10.5px] font-bold uppercase tracking-widest text-[#167C5A]">Our Impact</p><h2 className="mt-0.5 text-[20px] sm:text-[22px] font-bold text-[#14213D]">Social Impact Highlights</h2></div><div className="grid grid-cols-3 overflow-hidden rounded-2xl border border-amber-100/80 bg-white/80 backdrop-blur-md shadow-2xs">{[{ icon: UsersRound, value: "Community", label: "People first" }, { icon: Stethoscope, value: "Care", label: "Health initiatives" }, { icon: CalendarDays, value: "Active", label: "Foundation work" }].map(({ icon: Icon, value, label }) => <div key={label} className="border-r border-slate-200/60 px-2 py-4 text-center last:border-r-0"><Icon className="mx-auto h-4.5 w-4.5 text-[#167C5A]" /><p className="mt-2 text-[13px] sm:text-[14px] font-bold text-[#14213D]">{value}</p><p className="mt-0.5 text-[9px] text-slate-500 font-semibold tracking-tight">{label}</p></div>)}</div></section>
      </div>
      <style>{`@keyframes rpf-pib-marquee{0%{transform:translate3d(0,0,0)}100%{transform:translate3d(-50%,0,0)}}@keyframes rpf-sachet-marquee{0%{transform:translate3d(-50%,0,0)}100%{transform:translate3d(0,0,0)}}`}</style>
    </main>
  );
}
