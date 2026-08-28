import { useEffect, useMemo, useState } from "react";
import { BadgePlus, BriefcaseBusiness, ClipboardList, HeartPulse, UsersRound, Stethoscope, CalendarDays, ChevronRight, Compass, UserRound, Quote } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";

const fallbackSlides = [
  { image: "/assets/mega_camp_banner.png", titleEn: "Healthcare support for the community", subEn: "Health camps, medical support and community care.", route: "/health-care" },
  { image: "/assets/water_pump_camp.png", titleEn: "Service that reaches people", subEn: "Ground-level initiatives focused on practical support.", route: "/impact" },
  { image: "/assets/founder.png", titleEn: "Service. Commitment. Resolve.", subEn: "Discover the people and purpose behind the work.", route: "/founder-message" },
  { image: "/assets/donate.jpg", titleEn: "Support, skills and opportunity", subEn: "Explore programmes and services available to the community.", route: "/services" }
];

const actions = [
  { title: "Jan Seva Card", subtitle: "Your digital service identity", icon: BadgePlus, route: "/jan-seva-card", accent: "text-[#D97706] bg-amber-500/10 border border-amber-500/20" },
  { title: "Healthcare", subtitle: "Health services and support", icon: HeartPulse, route: "/health-care", accent: "text-[#DC2626] bg-red-500/10 border border-red-500/20" },
  { title: "Employment", subtitle: "Jobs, skills and opportunities", icon: BriefcaseBusiness, route: "/employment", accent: "text-[#167C5A] bg-emerald-500/10 border border-emerald-500/20" },
  { title: "Grievance", subtitle: "Submit and track an issue", icon: ClipboardList, route: "/grievance", accent: "text-[#14213D] bg-slate-500/10 border border-slate-500/20" }
];

async function timedFetch(url: string, ms = 5000) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(`${url}${url.includes("?") ? "&" : "?"}t=${Date.now()}`, { cache: "no-store", signal: controller.signal });
  } finally {
    window.clearTimeout(timer);
  }
}

function parseFeedItems(items: unknown): string[] {
  if (!Array.isArray(items)) return [];
  return items.map((item) => {
    if (typeof item === "string") return item.trim();
    if (!item || typeof item !== "object") return "";
    const value = item as Record<string, unknown>;
    const title = value.titleHi || value.titleEn || value.title || value.name || value.description || "";
    return typeof title === "string" ? title.replace(/<[^>]*>/g, " ").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim() : "";
  }).filter((item) => item.length >= 15);
}

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cmsConfig } = useApp();
  const [slide, setSlide] = useState(0);
  const [marquee1, setMarquee1] = useState<string[]>([]);
  const [marquee2, setMarquee2] = useState<string[]>([]);
  const name = user?.name?.trim().split(/\s+/)[0] || "Guest";
  const hour = new Date().getHours();
  const greeting = hour >= 4 && hour < 12 ? "Good Morning" : hour >= 12 && hour < 17 ? "Good Afternoon" : hour >= 17 && hour < 22 ? "Good Evening" : "Good Night";

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
    const restore = (key: string, setter: (value: string[]) => void) => {
      try { const cached = JSON.parse(localStorage.getItem(key) || "[]"); if (Array.isArray(cached) && cached.length) setter(cached); } catch {}
    };
    restore("@rpf_marquee1_cache", setMarquee1);
    restore("@rpf_marquee2_cache", setMarquee2);
    const load = async () => {
      for (const url of ["/api/public/live-feeds", "/rss-proxy.php", "/api/public/news"]) {
        try {
          const response = await timedFetch(url);
          if (!response.ok) continue;
          const json = await response.json();
          const data = json?.data ?? json;
          const first = parseFeedItems(data?.marquee1 ?? data?.pib ?? data?.news ?? []);
          const second = parseFeedItems(data?.marquee2 ?? data?.sachet ?? data?.publicUpdates ?? []);
          if (!alive) return;
          if (first.length) { setMarquee1(first); try { localStorage.setItem("@rpf_marquee1_cache", JSON.stringify(first)); } catch {} }
          if (second.length) { setMarquee2(second); try { localStorage.setItem("@rpf_marquee2_cache", JSON.stringify(second)); } catch {} }
          if (first.length || second.length) return;
        } catch {}
      }
    };
    void load();
    const timer = window.setInterval(() => void load(), 60000);
    return () => { alive = false; window.clearInterval(timer); };
  }, []);

  const marquee1Text = useMemo(() => marquee1.length ? [...marquee1, ...marquee1].join("     •     ") : "Updates are loading…", [marquee1]);
  const marquee2Text = useMemo(() => marquee2.length ? [...marquee2, ...marquee2].join("     •     ") : "Alerts are loading…", [marquee2]);
  const marquee1Duration = `${Math.max(50, Math.round(marquee1Text.length * 0.08))}s`;
  const marquee2Duration = `${Math.max(50, Math.round(marquee2Text.length * 0.08))}s`;
  const image = (value?: string, index = 0) => !value ? fallbackSlides[index % fallbackSlides.length].image : value.startsWith("assets/") ? `/${value}` : value;

  return <main className="min-h-full bg-transparent text-[#14213D]">
    <div className="mx-auto w-full max-w-3xl px-4 pb-4 pt-3 sm:px-6">
      <section className="mb-4 bg-transparent py-1">
        <h1 className="text-[24px] sm:text-[28px] font-bold leading-tight tracking-tight text-[#14213D]">{greeting}, {name} Ji <span className="text-[20px]">🙏</span></h1>
        <p className="mt-1 text-[12px] sm:text-[13px] font-medium text-slate-600">Welcome to Samahit, a volunteer initiative for RP Foundation.</p>
      </section>
      <section className="mb-2 overflow-hidden rounded-xl border border-amber-200/80 bg-white/70 flex items-center h-9"><div className="inline-block min-w-max whitespace-nowrap px-3 text-[11.5px] font-semibold text-[#14213D]" style={{ animation: `rpf-marquee ${marquee1Duration} linear infinite` }}>{marquee1Text}</div></section>
      <section className="mb-4 overflow-hidden rounded-xl border border-emerald-200/80 bg-white/70 flex items-center h-9"><div className="inline-block min-w-max whitespace-nowrap px-3 text-[11.5px] font-semibold text-[#167C5A]" style={{ animation: `rpf-marquee ${marquee2Duration} linear infinite` }}>{marquee2Text}</div></section>
      <section className="mb-6 rounded-2xl border border-amber-200/60 bg-amber-50/40 px-4 py-3.5"><div className="flex items-center gap-1.5 text-[#D97706]"><Quote className="h-3.5 w-3.5"/><p className="text-[10px] font-bold uppercase tracking-widest">Thought of the Day</p></div><p className="mt-1.5 text-[13px] sm:text-[14px] font-semibold">“Work is worship, and service is the greatest religion.”</p></section>
      <section className="mb-7"><div className="mb-3 flex items-end justify-between"><div><p className="text-[10.5px] font-bold uppercase tracking-widest text-[#D97706]">Discover</p><h2 className="mt-0.5 text-[20px] sm:text-[22px] font-bold">RP Foundation at Work</h2></div><span className="text-[12px] font-semibold text-slate-500">{slide + 1}/{slides.length}</span></div><motion.article key={`${current?.image || "slide"}-${slide}`} initial={{opacity:.2}} animate={{opacity:1}} className="relative h-[320px] sm:h-[350px] overflow-hidden rounded-[24px] bg-[#14213D]"><img src={image(current?.image, slide)} alt={current?.titleEn || "RP Foundation initiative"} className="absolute inset-0 h-full w-full object-cover"/><div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/95 via-[#0F172A]/40 to-transparent"/><div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 text-white"><h3 className="text-[20px] sm:text-[22px] font-bold">{current?.titleEn}</h3><p className="mt-1 text-[12px] sm:text-[13px] text-slate-200">{current?.subEn}</p><button onClick={() => navigate((current as any)?.route || "/impact")} className="mt-2.5 inline-flex items-center gap-1 text-[12px] font-bold text-amber-300">Explore <ChevronRight className="h-4 w-4"/></button></div></motion.article><div className="mt-3 flex justify-center gap-2">{slides.map((_: any, index: number) => <button key={index} onClick={() => setSlide(index)} className={`h-2 rounded-full ${slide === index ? "w-7 bg-[#D97706]" : "w-2 bg-slate-300"}`}/>)}</div></section>
      <section className="mb-7"><div className="mb-3"><p className="text-[10.5px] font-bold uppercase tracking-widest text-[#D97706]">Quick Access</p><h2 className="mt-0.5 text-[20px] sm:text-[22px] font-bold">What can we help with?</h2></div><div className="grid grid-cols-2 gap-3.5">{actions.map(({title,subtitle,icon:Icon,route,accent}) => <motion.button key={title} whileTap={{scale:.98}} onClick={() => navigate(route)} className="min-h-[150px] rounded-2xl border border-amber-100/80 bg-white/80 p-4 text-left flex flex-col justify-between"><div className={`flex h-10 w-10 items-center justify-center rounded-xl ${accent}`}><Icon className="h-5 w-5"/></div><div><p className="mt-3 text-[15px] font-bold">{title}</p><p className="mt-0.5 text-[11.5px] text-slate-500">{subtitle}</p></div></motion.button>)}</div></section>
      <section className="mb-7"><div className="mb-3"><p className="text-[10.5px] font-bold uppercase tracking-widest text-[#167C5A]">Foundation</p><h2 className="mt-0.5 text-[20px] sm:text-[22px] font-bold">Our Vision & Leadership</h2></div><div className="grid grid-cols-2 gap-3.5"><button onClick={() => navigate("/vision-goals")} className="rounded-2xl border border-amber-100/80 bg-white/80 p-4 text-left min-h-[140px]"><Compass className="h-5 w-5 text-[#14213D]"/><p className="mt-3 text-[15px] font-bold">Our Vision</p><p className="mt-0.5 text-[11.5px] text-slate-500">A clear direction for meaningful social impact.</p></button><button onClick={() => navigate("/founder-message")} className="rounded-2xl border border-amber-100/80 bg-white/80 p-4 text-left min-h-[140px]"><UserRound className="h-5 w-5 text-[#D97706]"/><p className="mt-3 text-[15px] font-bold">Founder’s Message</p><p className="mt-0.5 text-[11.5px] text-slate-500">A message from Rohit Pandit, Founder of RP Foundation.</p></button></div></section>
      <section className="mb-4"><div className="mb-3"><p className="text-[10.5px] font-bold uppercase tracking-widest text-[#167C5A]">Our Impact</p><h2 className="mt-0.5 text-[20px] sm:text-[22px] font-bold">Social Impact Highlights</h2></div><div className="grid grid-cols-3 overflow-hidden rounded-2xl border border-amber-100/80 bg-white/80">{[{icon:UsersRound,value:"Community",label:"People first"},{icon:Stethoscope,value:"Care",label:"Health initiatives"},{icon:CalendarDays,value:"Active",label:"Foundation work"}].map(({icon:Icon,value,label}) => <div key={label} className="border-r border-slate-200/60 px-2 py-4 text-center last:border-r-0"><Icon className="mx-auto h-4.5 w-4.5 text-[#167C5A]"/><p className="mt-2 text-[13px] sm:text-[14px] font-bold">{value}</p><p className="mt-0.5 text-[9px] text-slate-500">{label}</p></div>)}</div></section>
    </div><style>{`@keyframes rpf-marquee{0%{transform:translate3d(0,0,0)}100%{transform:translate3d(-50%,0,0)}}`}</style>
  </main>;
}
