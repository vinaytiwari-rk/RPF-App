import { useEffect, useMemo, useState } from "react";
import { BadgePlus, BriefcaseBusiness, ClipboardList, CloudSun, HeartPulse, MapPin, UsersRound, Stethoscope, CalendarDays, ChevronRight, Compass, UserRound } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";

const fallbackSlides=[{image:"/assets/mega_camp_banner.png",titleEn:"Healthcare support for the community",subEn:"Health camps, medical support and community care.",route:"/health-care",active:true},{image:"/assets/water_pump_camp.png",titleEn:"Service that reaches people",subEn:"Ground-level initiatives focused on practical support.",route:"/impact",active:true},{image:"/assets/founder.png",titleEn:"Service. Commitment. Resolve.",subEn:"Discover the people and purpose behind the work.",route:"/founder-message",active:true},{image:"/assets/donate.jpg",titleEn:"Support, skills and opportunity",subEn:"Explore programmes and services available to the community.",route:"/services",active:true}];
const actions=[{title:"Jan Seva Card",subtitle:"Your digital service identity",icon:BadgePlus,route:"/jan-seva-card",accent:"text-[#E67817] bg-[#FFF7ED]"},{title:"Healthcare",subtitle:"Health services and support",icon:HeartPulse,route:"/health-care",accent:"text-[#C81E4A] bg-[#FFF1F4]"},{title:"Employment",subtitle:"Jobs, skills and opportunities",icon:BriefcaseBusiness,route:"/employment",accent:"text-[#138808] bg-[#F0F9F1]"},{title:"Grievance",subtitle:"Submit and track an issue",icon:ClipboardList,route:"/grievance",accent:"text-[#1D5B93] bg-[#EFF6FF]"}];
const unavailablePib=["Government updates are temporarily unavailable."]; const unavailableSachet=["No disaster alert updates are available right now."];
async function timedFetch(url:string,ms=8000){const c=new AbortController();const t=window.setTimeout(()=>c.abort(),ms);try{return await fetch(`${url}${url.includes("?")?"&":"?"}t=${Date.now()}`,{cache:"no-store",signal:c.signal});}finally{window.clearTimeout(t);}}
export default function Home(){const navigate=useNavigate();const {user}=useAuth();const {cmsConfig}=useApp();const [slide,setSlide]=useState(0);const [pibFeed,setPibFeed]=useState<string[]>(unavailablePib);const [sachetFeed,setSachetFeed]=useState<string[]>(unavailableSachet);const [locationName,setLocationName]=useState("Finding location…");const [temperature,setTemperature]=useState<string|null>(null);const name=user?.name?.trim().split(/\s+/)[0]||"Guest";const hour=new Date().getHours();const greeting=hour<12?"Good Morning":hour<17?"Good Afternoon":"Good Evening";
const slides=useMemo(()=>{const managed=Array.isArray(cmsConfig?.carouselSlides)?cmsConfig.carouselSlides.filter((i:any)=>i?.active!==false&&i?.image):[];return managed.length?[...managed].sort((a:any,b:any)=>(a.order??0)-(b.order??0)):fallbackSlides;},[cmsConfig?.carouselSlides]);const current=slides[slide]||slides[0];
useEffect(()=>{if(slide>=slides.length)setSlide(0);},[slide,slides.length]);
useEffect(()=>{if(slides.length<2)return;const t=window.setInterval(()=>setSlide(v=>(v+1)%slides.length),5000);return()=>window.clearInterval(t);},[slides.length]);
useEffect(()=>{slides.forEach((s:any,i:number)=>{const src=s?.image?.startsWith("assets/")?`/${s.image}`:s?.image||fallbackSlides[i%fallbackSlides.length].image;const img=new Image();img.src=src;});},[slides]);
const getSlideImage=(sUrl?:string,idx=0)=>{if(!sUrl||typeof sUrl!=="string")return fallbackSlides[idx%fallbackSlides.length].image;const t=sUrl.trim();if(!t)return fallbackSlides[idx%fallbackSlides.length].image;if(t.startsWith("assets/"))return `/${t}`;return t;};
function parseFeedItems(items: unknown): string[] {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => {
      if (typeof item === "string") return item.trim();
      if (typeof item === "object" && item !== null) {
        const obj = item as Record<string, unknown>;
        const title = obj.titleHi || obj.titleEn || obj.title || obj.name || obj.description || "";
        const rawSource = typeof obj.source === "string" ? obj.source : "";
        const text = typeof title === "string" ? title.trim() : "";
        if (!text) return "";
        if (text.startsWith("ANI") || text.startsWith("PIB")) return text;
        if (rawSource.includes("Google")) return "";
        return rawSource ? `${rawSource}: ${text}` : text;
      }
      return "";
    })
    .filter((str) => str.length > 0 && !str.toLowerCase().includes("google") && !str.includes("temporarily unavailable") && !str.includes("available right now"));
}

async function fetchRss2JsonApi(rssUrl: string, prefix = ""): Promise<string[]> {
  try {
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(rssUrl)}`;
    const res = await timedFetch(apiUrl, 6000);
    if (!res.ok) return [];
    const j = await res.json();
    if (j?.status === "ok" && Array.isArray(j?.items)) {
      const titles: string[] = [];
      for (const item of j.items) {
        const rawTitle = typeof item?.title === "string" ? item.title.trim() : "";
        if (rawTitle) {
          const clean = rawTitle.replace(/<[^>]+>/g, "").replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, "$1").trim();
          const lower = clean.toLowerCase();
          if (clean && !lower.includes("all india: cap") && lower !== "national" && lower !== "business") {
            const itemText = prefix ? `${prefix}: ${clean}` : clean;
            if (!titles.includes(itemText)) titles.push(itemText);
          }
        }
      }
      return titles;
    }
  } catch {}
  return [];
}

async function fetchDirectClientXml(url: string, prefix = ""): Promise<string[]> {
  try {
    const res = await timedFetch(url, 6000);
    if (!res.ok) return [];
    const text = await res.text();
    if (!text || text.length < 50) return [];
    const parser = new DOMParser();
    const xml = parser.parseFromString(text, "text/xml");
    const items = Array.from(xml.querySelectorAll("item, entry"));
    const titles: string[] = [];
    for (const item of items) {
      const titleEl = item.querySelector("title");
      if (titleEl && titleEl.textContent) {
        const clean = titleEl.textContent.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, "$1").trim();
        const lower = clean.toLowerCase();
        if (clean && !lower.includes("all india: cap") && lower !== "national" && lower !== "business" && lower !== "health" && lower !== "world") {
          const itemText = prefix ? `${prefix}: ${clean}` : clean;
          if (!titles.includes(itemText)) {
            titles.push(itemText);
            if (titles.length >= 15) break;
          }
        }
      }
    }
    return titles;
  } catch {
    return [];
  }
}

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

    // Try fast cached proxy first, then fallback to API
    const fastTargets = ["/rss-proxy.php", "/api/public/news"];
    for (const url of fastTargets) {
      try {
        const r = await timedFetch(url, 3500);
        if (r.ok) {
          const j = await r.json();
          const pItems = parseFeedItems(j?.data?.pib ?? j?.data?.news ?? j?.data);
          const sItems = parseFeedItems(j?.data?.sachet ?? j?.data);
          if (pItems.length) fetchedPib = pItems;
          if (sItems.length) fetchedSachet = sItems;
          if (fetchedPib.length && fetchedSachet.length) break;
        }
      } catch {}
    }

    if (alive) {
      if (fetchedPib.length > 0) {
        setPibFeed(fetchedPib);
        try { localStorage.setItem("@rpf_news_cache", JSON.stringify(fetchedPib)); } catch {}
      }
      if (fetchedSachet.length > 0) {
        setSachetFeed(fetchedSachet);
        try { localStorage.setItem("@rpf_sachet_cache", JSON.stringify(fetchedSachet)); } catch {}
      }
    }
  };

  void load();
  const t = window.setInterval(() => void load(), 60000);
  return () => { alive = false; window.clearInterval(t); };
}, []);
useEffect(()=>{let alive=true;if(!("geolocation"in navigator)){setLocationName("Location unavailable");return;}navigator.geolocation.getCurrentPosition(async({coords})=>{try{const [p,w]=await Promise.all([fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords.latitude}&lon=${coords.longitude}&zoom=10`,{headers:{Accept:"application/json"}}),fetch(`https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}&current=temperature_2m&timezone=auto`)]);const place=await p.json(),weather=await w.json();if(!alive)return;const a=place?.address||{};setLocationName(a.city||a.town||a.village||a.county||a.state||"Current location");if(typeof weather?.current?.temperature_2m==="number")setTemperature(`${Math.round(weather.current.temperature_2m)}°C`);}catch{if(alive)setLocationName("Current location");}},()=>{if(alive)setLocationName("Enable location");},{enableHighAccuracy:false,timeout:10000,maximumAge:300000});return()=>{alive=false;};},[]);
const pibText = useMemo(() => [...pibFeed, ...pibFeed].join("     •     "), [pibFeed]);
const sachetText = useMemo(() => [...sachetFeed, ...sachetFeed].join("     •     "), [sachetFeed]);
const pibDuration = useMemo(() => `${Math.max(50, Math.round(pibText.length * 0.08))}s`, [pibText]);
const sachetDuration = useMemo(() => `${Math.max(50, Math.round(sachetText.length * 0.08))}s`, [sachetText]);

return <main className="min-h-full bg-transparent text-[#12233D]"><div className="mx-auto w-full max-w-3xl px-4 pb-3 pt-3 sm:px-6"><section className="mb-2 overflow-hidden rounded-xl border border-white/70 bg-white/80 backdrop-blur-md shadow-xs"><div className="h-9 overflow-hidden"><div className="inline-block min-w-max whitespace-nowrap px-4 text-[10px] font-semibold leading-9 text-[#46566A]" style={{animation:`rpf-pib-marquee ${pibDuration} linear infinite`}}>{pibText}</div></div></section><section className="mb-3 overflow-hidden rounded-xl border border-orange-200/60 bg-orange-50/80 backdrop-blur-md shadow-xs"><div className="h-9 overflow-hidden"><div className="inline-block min-w-max whitespace-nowrap px-4 text-[10px] font-semibold leading-9 text-[#6B4B47]" style={{animation:`rpf-sachet-marquee ${sachetDuration} linear infinite`}}>{sachetText}</div></div></section><section className="mb-4"><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#138808]">RP Foundation</p><h1 className="mt-1 whitespace-nowrap text-[18px] font-black leading-tight tracking-[-.04em] sm:text-[21px]">Namaste, {name} Ji <span className="text-[15px] sm:text-[17px]">🙏</span></h1><div className="mt-1 flex items-center gap-2 text-[10px] font-bold text-[#64748B]"><span>{greeting}</span><span>•</span><MapPin className="h-3.5 w-3.5 text-[#E67817]"/><span className="max-w-[118px] truncate">{locationName}</span>{temperature&&<><span>•</span><CloudSun className="h-3.5 w-3.5 text-[#1D5B93]"/><span>{temperature}</span></>}</div></section><section className="mb-4 rounded-2xl border border-white/70 bg-white/80 backdrop-blur-md px-4 py-3 shadow-xs"><p className="text-[8px] font-black uppercase tracking-[.16em] text-[#E67817]">Thought of the Day</p><p className="mt-1 text-[12px] font-bold leading-5 text-[#334155]">“Work is worship, and service is the greatest religion.”</p></section><section><div className="mb-2.5 flex items-end justify-between"><div><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#E67817]">Discover</p><h2 className="mt-.5 text-[21px] font-black">RP Foundation at Work</h2></div><span className="text-[12px] font-black text-slate-400">{slide+1}/{slides.length}</span></div><motion.article key={`${current?.image||"slide"}-${slide}`} initial={{opacity:.2}} animate={{opacity:1}} className="relative h-[330px] overflow-hidden rounded-[22px] bg-[#0F3157] shadow-md"><img src={getSlideImage(current?.image, slide)} alt={current?.titleEn||"RP Foundation initiative"} className="absolute inset-0 h-full w-full object-cover" onError={(e)=>{const img=e.currentTarget;const fb=fallbackSlides[slide%fallbackSlides.length].image;if(img.src!==fb)img.src=fb;}}/><div className="absolute inset-0 bg-gradient-to-t from-[#07182C]/90 via-[#07182C]/20 to-transparent"/><div className="absolute inset-x-0 bottom-0 p-4 text-white"><h3 className="text-[22px] font-black leading-tight">{current?.titleEn}</h3><p className="mt-1 text-[11px] leading-5 text-slate-200">{current?.subEn}</p><button onClick={()=>navigate((current as any)?.route||"/impact")} className="mt-2 inline-flex items-center gap-1 text-[11px] font-black">Explore <ChevronRight className="h-4 w-4"/></button></div></motion.article><div className="mt-3 flex justify-center gap-2">{slides.map((_:any,i:number)=><button key={i} onClick={()=>setSlide(i)} className={`h-2 rounded-full ${slide===i?"w-7 bg-[#FF9933]":"w-2 bg-slate-300"}`}/>)}</div></section><section className="mt-7"><div className="mb-3"><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#138808]">Foundation</p><h2 className="mt-.5 text-[21px] font-black">Our Vision & Leadership</h2></div><div className="grid grid-cols-2 gap-3"><button onClick={()=>navigate("/vision-goals")} className="rounded-2xl border border-white/70 bg-white/80 backdrop-blur-md p-4 text-left shadow-sm hover:bg-white/95 transition-all"><Compass className="h-5 w-5 text-[#1D5B93]"/><p className="mt-4 text-[15px] font-black">Our Vision</p><p className="mt-1 text-[10px] text-slate-500">A clear direction for meaningful social impact.</p></button><button onClick={()=>navigate("/founder-message")} className="rounded-2xl border border-white/70 bg-white/80 backdrop-blur-md p-4 text-left shadow-sm hover:bg-white/95 transition-all"><UserRound className="h-5 w-5 text-[#E67817]"/><p className="mt-4 text-[15px] font-black">Founder’s Message</p><p className="mt-1 text-[10px] text-slate-500">A message from Rohit Pandit, Founder of RP Foundation.</p></button></div></section><section className="mt-7"><div className="mb-3"><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#E67817]">Quick Access</p><h2 className="mt-.5 text-[21px] font-black">What can we help with?</h2></div><div className="grid grid-cols-2 gap-3">{actions.map(({title,subtitle,icon:Icon,route,accent})=><motion.button key={title} whileTap={{scale:.98}} onClick={()=>navigate(route)} className="min-h-[154px] rounded-2xl border border-white/70 bg-white/80 backdrop-blur-md p-4 text-left shadow-sm hover:bg-white/95 transition-all"><div className={`flex h-10 w-10 items-center justify-center rounded-xl ${accent}`}><Icon className="h-5 w-5"/></div><p className="mt-4 text-[15px] font-black">{title}</p><p className="mt-1 text-[10px] text-slate-500">{subtitle}</p></motion.button>)}</div></section><section className="mt-7 pb-3"><div className="mb-3"><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#138808]">Our Impact</p><h2 className="mt-.5 text-[21px] font-black">RP Foundation at Work</h2></div><div className="grid grid-cols-3 overflow-hidden rounded-2xl border border-white/70 bg-white/80 backdrop-blur-md shadow-sm">{[{icon:UsersRound,value:"Community",label:"People first"},{icon:Stethoscope,value:"Care",label:"Health initiatives"},{icon:CalendarDays,value:"Active",label:"Foundation work"}].map(({icon:Icon,value,label})=><div key={label} className="border-r border-slate-200/50 px-2 py-4 text-center last:border-r-0"><Icon className="mx-auto h-4 w-4 text-[#138808]"/><p className="mt-2 text-[13px] font-black">{value}</p><p className="mt-.5 text-[8px] text-slate-400">{label}</p></div>)}</div></section></div><style>{`@keyframes rpf-pib-marquee{0%{transform:translate3d(0,0,0)}100%{transform:translate3d(-50%,0,0)}}@keyframes rpf-sachet-marquee{0%{transform:translate3d(-50%,0,0)}100%{transform:translate3d(0,0,0)}}`}</style></main>;}
