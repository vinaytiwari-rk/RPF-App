import { useEffect, useMemo, useState } from "react";
import { BadgePlus, BriefcaseBusiness, ClipboardList, CloudSun, HeartPulse, MapPin, UsersRound, Stethoscope, CalendarDays, ChevronRight, Compass, UserRound, Instagram, Play, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";

const fallbackSlides=[{image:"/assets/mega_camp_banner.png",titleEn:"Healthcare support for the community",subEn:"Health camps, medical support and community care.",route:"/health-care",active:true},{image:"/assets/water_pump_camp.png",titleEn:"Service that reaches people",subEn:"Ground-level initiatives focused on practical support.",route:"/impact",active:true},{image:"/assets/founder.png",titleEn:"Service. Commitment. Resolve.",subEn:"Discover the people and purpose behind the work.",route:"/founder-message",active:true},{image:"/assets/donate.jpg",titleEn:"Support, skills and opportunity",subEn:"Explore programmes and services available to the community.",route:"/services",active:true}];
const actions=[{title:"Jan Seva Card",subtitle:"Your digital service identity",icon:BadgePlus,route:"/jan-seva-card",accent:"text-[#E67817] bg-transparent border border-orange-300/60"},{title:"Healthcare",subtitle:"Health services and support",icon:HeartPulse,route:"/health-care",accent:"text-[#DC2626] bg-transparent border border-red-300/60"},{title:"Employment",subtitle:"Jobs, skills and opportunities",icon:BriefcaseBusiness,route:"/employment",accent:"text-[#138808] bg-transparent border border-green-300/60"},{title:"Grievance",subtitle:"Submit and track an issue",icon:ClipboardList,route:"/grievance",accent:"text-[#7E22CE] bg-transparent border border-purple-300/60"}];
const defaultPibFeed = [
  "PIB: वीडियो कॉन्फ्रेंसिंग के ज़रिए 'खेलो इंडिया डायलॉग' में प्रधानमंत्री नरेंद्र मोदी जी का मुख्य संबोधन",
  "ANI: भारतीय नौसेना ने अरब सागर में समुद्री सुरक्षा अभियानों के लिए नए गश्ती पोत तैनात किए",
  "PIB: प्रधानमंत्री जन धन योजना के सफल 12 वर्ष पूरे - देश भर में वित्तीय समावेशन में ऐतिहासिक प्रगति",
  "ANI: NTPC ने 2032 तक 149 गीगावॉट क्षमता का लक्ष्य तय किया, नए हरित ऊर्जा निवेश योजना का खाका प्रस्तुत किया",
  "PIB: मॉस्को गोलमेज सम्मेलन में भारत ने हिम तेंदुए के संरक्षण और जैव विविधता की वैज्ञानिक रणनीति प्रस्तुत की",
  "ANI: ओडिशा के मुख्यमंत्री मोहन चरण माझी ने 112 विस्थापित परिवारों के लिए भूमि पट्टे की घोषणा की"
];
const defaultSachetFeed = [
  "NDMA SACHET: गुजरात एवं तटीय क्षेत्रों में भारी वर्षा एवं तेज हवाओं की चेतावनी जारी - सतर्कता बरतें",
  "IMD Alert: पूर्वोत्तर भारत एवं उत्तराखंड के पर्वतीय क्षेत्रों में वज्रपात एवं मूसलाधार बारिश का पूर्वानुमान",
  "NDMA Alert: उत्तर-पूर्वी राज्यों में संभावित बाढ़ से निपटने के लिए पूर्व तैयारी एवं राहत कार्य जारी",
  "SACHET Alert: तटीय ओडिशा एवं आंध्र प्रदेश में समुद्र की लहरें तीव्र होने की आशंका, मछुआरों को सलाह जारी"
];
async function timedFetch(url:string,ms=8000){const c=new AbortController();const t=window.setTimeout(()=>c.abort(),ms);try{return await fetch(`${url}${url.includes("?")?"&":"?"}t=${Date.now()}`,{cache:"no-store",signal:c.signal});}finally{window.clearTimeout(t);}}
export default function Home(){const navigate=useNavigate();const {user}=useAuth();const {cmsConfig}=useApp();const [slide,setSlide]=useState(0);const [pibFeed,setPibFeed]=useState<string[]>(defaultPibFeed);const [sachetFeed,setSachetFeed]=useState<string[]>(defaultSachetFeed);const [locationName,setLocationName]=useState("Finding location…");const [temperature,setTemperature]=useState<string|null>(null);const name=user?.name?.trim().split(/\s+/)[0]||"Guest";const hour=new Date().getHours();const greeting=hour>=4&&hour<12?"Good Morning":hour>=12&&hour<17?"Good Afternoon":hour>=17&&hour<22?"Good Evening":"Good Night";
const slides=useMemo(()=>{const managed=Array.isArray(cmsConfig?.carouselSlides)?cmsConfig.carouselSlides.filter((i:any)=>i?.active!==false&&i?.image):[];return managed.length?[...managed].sort((a:any,b:any)=>(a.order??0)-(b.order??0)):fallbackSlides;},[cmsConfig?.carouselSlides]);const current=slides[slide]||slides[0];
useEffect(()=>{if(slide>=slides.length)setSlide(0);},[slide,slides.length]);
useEffect(()=>{if(slides.length<2)return;const t=window.setInterval(()=>setSlide(v=>(v+1)%slides.length),5000);return()=>window.clearInterval(t);},[slides.length]);
useEffect(()=>{slides.forEach((s:any,i:number)=>{const src=s?.image?.startsWith("assets/")?`/${s.image}`:s?.image||fallbackSlides[i%fallbackSlides.length].image;const img=new Image();img.src=src;});},[slides]);
const getSlideImage=(sUrl?:string,idx=0)=>{if(!sUrl||typeof sUrl!=="string")return fallbackSlides[idx%fallbackSlides.length].image;const t=sUrl.trim();if(!t)return fallbackSlides[idx%fallbackSlides.length].image;if(t.startsWith("assets/"))return `/${t}`;return t;};
function parseFeedItems(items: unknown): string[] {
  if (!Array.isArray(items)) return [];
  return items
    .map((item) => {
      let text = "";
      if (typeof item === "string") text = item.trim();
      else if (typeof item === "object" && item !== null) {
        const obj = item as Record<string, unknown>;
        const title = obj.titleHi || obj.titleEn || obj.title || obj.name || obj.description || "";
        const rawSource = typeof obj.source === "string" ? obj.source : "";
        text = typeof title === "string" ? title.trim() : "";
        if (!text) return "";
        if (text.startsWith("ANI") || text.startsWith("PIB") || text.startsWith("SACHET") || text.startsWith("NDMA")) {
          // keep as is
        } else if (rawSource.includes("Google")) {
          return "";
        } else {
          text = rawSource ? `${rawSource}: ${text}` : text;
        }
      }
      if (!text) return "";
      text = text
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/(\.\.\.|…|\s+\.)$/g, "")
        .trim();
      return text;
    })
    .filter((str) => str.length >= 15 && !str.toLowerCase().includes("google") && !str.includes("temporarily unavailable") && !str.includes("available right now"));
}

useEffect(() => {
  let alive = true;
  if (!("geolocation" in navigator)) { setLocationName("Location unavailable"); return; }
  navigator.geolocation.getCurrentPosition(
    async ({ coords }) => {
      try {
        const [p, w] = await Promise.all([
          fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords.latitude}&lon=${coords.longitude}&zoom=10`, { headers: { Accept: "application/json" } }),
          fetch(`https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}&current=temperature_2m&timezone=auto`)
        ]);
        const place = await p.json(), weather = await w.json();
        if (!alive) return;
        const a = place?.address || {};
        setLocationName(a.city || a.town || a.village || a.county || a.state || "Current location");
        if (typeof weather?.current?.temperature_2m === "number") setTemperature(`${Math.round(weather.current.temperature_2m)}°C`);
      } catch {
        if (alive) setLocationName("Current location");
      }
    },
    () => {
      if (alive) setLocationName("Enable location");
    },
    { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
  );
  return () => { alive = false; };
}, []);

const pibText = useMemo(() => [...pibFeed, ...pibFeed].join("     •     "), [pibFeed]);
const sachetText = useMemo(() => [...sachetFeed, ...sachetFeed].join("     •     "), [sachetFeed]);
const pibDuration = useMemo(() => `${Math.max(50, Math.round(pibText.length * 0.08))}s`, [pibText]);
const sachetDuration = useMemo(() => `${Math.max(50, Math.round(sachetText.length * 0.08))}s`, [sachetText]);

return (
  <main className="min-h-full bg-transparent text-[#12233D]">
    <div className="mx-auto w-full max-w-3xl px-4 pb-3 pt-2 sm:px-6">
      
      {/* 1. Header ke Turant Baad: Completely Transparent Welcome Section with Blue Name Text & Saffron Badge */}
      <section className="mb-3.5 bg-transparent py-1">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-400/60 bg-transparent px-2.5 py-0.5 text-[9.5px] font-black uppercase tracking-wider text-[#E67817]">
            <Sparkles className="h-3 w-3 text-[#FF9933]" />
            {greeting}
          </span>
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-700 bg-transparent px-2.5 py-0.5 rounded-full border border-slate-300/60">
            <MapPin className="h-3 w-3 text-[#E67817]" />
            <span className="max-w-[110px] truncate">{locationName}</span>
            {temperature && (
              <>
                <span>•</span>
                <CloudSun className="h-3 w-3 text-[#1D5B93]" />
                <span>{temperature}</span>
              </>
            )}
          </div>
        </div>
        <h1 className="mt-2 text-[22px] font-black leading-tight tracking-tight text-[#1D5B93] sm:text-[25px]">
          Namaste, {name} Ji <span className="text-[20px]">🙏</span>
        </h1>
        <p className="mt-0.5 text-[11px] font-semibold text-slate-600">
          {greeting}! Welcome to RP Foundation Samahit.
        </p>
      </section>

      {/* 2. Iske Baad: Card 2 - Thought of the Day (Transparent Card) */}
      <section className="mb-3.5 rounded-2xl border border-white/70 bg-transparent px-4 py-3">
        <p className="text-[8.5px] font-black uppercase tracking-[.18em] text-[#E67817]">Thought of the Day</p>
        <p className="mt-1 text-[12px] font-black leading-5 text-[#12233D]">“Work is worship, and service is the greatest religion.”</p>
      </section>

      {/* 3. Fir Marquee: Saffron PIB & Green SACHET Tickers */}
      <section className="mb-1 overflow-hidden bg-transparent py-0.5">
        <div className="h-7 overflow-hidden">
          <div className="inline-block min-w-max whitespace-nowrap px-1 text-[11px] font-bold leading-7 text-[#E67817]" style={{ animation: `rpf-pib-marquee ${pibDuration} linear infinite` }}>
            {pibText}
          </div>
        </div>
      </section>
      <section className="mb-4 overflow-hidden bg-transparent py-0.5">
        <div className="h-7 overflow-hidden">
          <div className="inline-block min-w-max whitespace-nowrap px-1 text-[11px] font-bold leading-7 text-[#138808]" style={{ animation: `rpf-sachet-marquee ${sachetDuration} linear infinite` }}>
            {sachetText}
          </div>
        </div>
      </section>

      {/* 4. RP Foundation at Work (Single Carousel) */}
      <section className="mb-7">
        <div className="mb-2.5 flex items-end justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[.16em] text-[#E67817]">Discover</p>
            <h2 className="mt-.5 text-[21px] font-black text-[#12233D]">RP Foundation at Work</h2>
          </div>
          <span className="text-[12px] font-black text-slate-500">{slide + 1}/{slides.length}</span>
        </div>
        <motion.article key={`${current?.image || "slide"}-${slide}`} initial={{ opacity: 0.2 }} animate={{ opacity: 1 }} className="relative h-[330px] overflow-hidden rounded-[22px] bg-[#0F3157] shadow-md">
          <img src={getSlideImage(current?.image, slide)} alt={current?.titleEn || "RP Foundation initiative"} className="absolute inset-0 h-full w-full object-cover" onError={(e) => { const img = e.currentTarget; const fb = fallbackSlides[slide % fallbackSlides.length].image; if (img.src !== fb) img.src = fb; }} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07182C]/90 via-[#07182C]/20 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-4 text-white">
            <h3 className="text-[22px] font-black leading-tight">{current?.titleEn}</h3>
            <p className="mt-1 text-[11px] leading-5 text-slate-200">{current?.subEn}</p>
            <button onClick={() => navigate((current as any)?.route || "/impact")} className="mt-2 inline-flex items-center gap-1 text-[11px] font-black">Explore <ChevronRight className="h-4 w-4" /></button>
          </div>
        </motion.article>
        <div className="mt-3 flex justify-center gap-2">
          {slides.map((_: any, i: number) => (
            <button key={i} onClick={() => setSlide(i)} className={`h-2 rounded-full ${slide === i ? "w-7 bg-[#FF9933]" : "w-2 bg-slate-300"}`} />
          ))}
        </div>
      </section>

      {/* 5. Foundation Vision & Leadership */}
      <section className="mt-7">
        <div className="mb-3">
          <p className="text-[10px] font-black uppercase tracking-[.16em] text-[#138808]">Foundation</p>
          <h2 className="mt-.5 text-[21px] font-black text-[#12233D]">Our Vision & Leadership</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => navigate("/vision-goals")} className="rounded-2xl border border-white/70 bg-transparent p-4 text-left hover:bg-white/20 transition-all">
            <Compass className="h-5 w-5 text-[#1D5B93]" />
            <p className="mt-4 text-[15px] font-black">Our Vision</p>
            <p className="mt-1 text-[10px] text-slate-600 font-medium">A clear direction for meaningful social impact.</p>
          </button>
          <button onClick={() => navigate("/founder-message")} className="rounded-2xl border border-white/70 bg-transparent p-4 text-left hover:bg-white/20 transition-all">
            <UserRound className="h-5 w-5 text-[#E67817]" />
            <p className="mt-4 text-[15px] font-black">Founder’s Message</p>
            <p className="mt-1 text-[10px] text-slate-600 font-medium">A message from Rohit Pandit, Founder of RP Foundation.</p>
          </button>
        </div>
      </section>

      {/* 6. Quick Access Cards */}
      <section className="mt-7">
        <div className="mb-3">
          <p className="text-[10px] font-black uppercase tracking-[.16em] text-[#E67817]">Quick Access</p>
          <h2 className="mt-.5 text-[21px] font-black text-[#12233D]">What can we help with?</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {actions.map(({ title, subtitle, icon: Icon, route, accent }) => (
            <motion.button key={title} whileTap={{ scale: 0.98 }} onClick={() => navigate(route)} className="min-h-[150px] rounded-2xl border border-white/70 bg-transparent p-4 text-left hover:bg-white/20 transition-all">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${accent}`}>
                <Icon className="h-5 w-5" />
              </div>
              <p className="mt-4 text-[15px] font-black">{title}</p>
              <p className="mt-1 text-[10px] text-slate-600 font-medium">{subtitle}</p>
            </motion.button>
          ))}
        </div>
      </section>

      {/* 7. Social Impact Highlights */}
      <section className="mt-7 pb-3">
        <div className="mb-3">
          <p className="text-[10px] font-black uppercase tracking-[.16em] text-[#138808]">Our Impact</p>
          <h2 className="mt-.5 text-[21px] font-black text-[#12233D]">Social Impact Highlights</h2>
        </div>
        <div className="grid grid-cols-3 overflow-hidden rounded-2xl border border-white/70 bg-transparent">
          {[{ icon: UsersRound, value: "Community", label: "People first" }, { icon: Stethoscope, value: "Care", label: "Health initiatives" }, { icon: CalendarDays, value: "Active", label: "Foundation work" }].map(({ icon: Icon, value, label }) => (
            <div key={label} className="border-r border-slate-200/50 px-2 py-4 text-center last:border-r-0">
              <Icon className="mx-auto h-4 w-4 text-[#138808]" />
              <p className="mt-2 text-[13px] font-black">{value}</p>
              <p className="mt-.5 text-[8px] text-slate-500 font-bold">{label}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
    <style>{`@keyframes rpf-pib-marquee{0%{transform:translate3d(0,0,0)}100%{transform:translate3d(-50%,0,0)}}@keyframes rpf-sachet-marquee{0%{transform:translate3d(-50%,0,0)}100%{transform:translate3d(0,0,0)}}`}</style>
  </main>
);
}
