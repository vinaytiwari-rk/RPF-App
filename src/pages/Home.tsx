import { useEffect, useState } from "react";
import { ArrowRight, ChevronRight, CloudSun, HeartHandshake, HeartPulse, Leaf, Megaphone, Quote, ShieldCheck, Sparkles, HandHeart, BookOpen, Wind, Instagram, Twitter, Facebook, Linkedin } from "lucide-react";
import { FEATURED_INSTAGRAM_REEL, INSTAGRAM_DATA_SOURCE } from "../config/featuredPost";
import InstagramEmbed from "../components/InstagramEmbed";
import InstagramApiFeed from "../components/InstagramApiFeed";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";

type Lang = "en" | "hi";
type Weather = { temp: number; aqi: number | null };
const sevaCards = [
  { icon: HeartPulse, en: "Care for people", hi: "लोगों की सेवा", textEn: "Health, blood and essential support", textHi: "स्वास्थ्य, रक्त और जरूरी सहायता", route: "/services", gradient: "from-[#FF9933] to-[#F97316]" },
  { icon: BookOpen, en: "Build futures", hi: "भविष्य बनाएं", textEn: "Education, youth and opportunity", textHi: "शिक्षा, युवा और अवसर", route: "/services", gradient: "from-[#7C3AED] to-[#A855F7]" },
  { icon: Leaf, en: "Protect tomorrow", hi: "कल को सुरक्षित करें", textEn: "Environment and community action", textHi: "पर्यावरण और सामुदायिक पहल", route: "/services", gradient: "from-[#138808] to-[#22C55E]" },
];
const visuals = [
  { image: "/assets/donate.jpg", en: "Every contribution becomes a helping hand", hi: "हर योगदान किसी के लिए मदद का हाथ बनता है" },
  { image: "/assets/education_all.png", en: "Education creates opportunity", hi: "शिक्षा अवसर का रास्ता बनाती है" },
  { image: "/assets/founder.png", en: "Seva, Samarpan & Sankalp", hi: "सेवा, समर्पण और संकल्प" },
];
const quotes = [
  { en: "A small act of kindness can become someone's biggest hope.", hi: "करुणा की छोटी-सी पहल किसी की सबसे बड़ी उम्मीद बन सकती है।" },
  { en: "Seva is not an event. It is a way of living.", hi: "सेवा कोई आयोजन नहीं, जीवन जीने का एक तरीका है।" },
  { en: "When we serve together, communities grow stronger.", hi: "जब हम साथ मिलकर सेवा करते हैं, समुदाय और मजबूत बनते हैं।" },
];

export default function Home() {
  const { lang } = useOutletContext<{ lang: Lang }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cmsConfig, globalSettings, announcements } = useApp();
  const [slide, setSlide] = useState(0);
  const [quote, setQuote] = useState(0);
  const [weather, setWeather] = useState<Weather | null>(null);
  const name = user?.name?.trim().split(/\s+/)[0] || "";
  const h = new Date().getHours();
  const greeting = h < 12 ? (lang === "hi" ? "सुप्रभात" : "Good morning") : h < 17 ? (lang === "hi" ? "शुभ दोपहर" : "Good afternoon") : (lang === "hi" ? "शुभ संध्या" : "Good evening");
  const alert = lang === "hi" ? cmsConfig?.alertBannerHi : cmsConfig?.alertBannerEn;
  const announcement = Array.isArray(announcements) ? announcements[0] : null;

  useEffect(() => { const t = window.setInterval(() => setSlide((s) => (s + 1) % visuals.length), 5200); return () => window.clearInterval(t); }, []);
  useEffect(() => { const t = window.setInterval(() => setQuote((q) => (q + 1) % quotes.length), 7000); return () => window.clearInterval(t); }, []);
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      try {
        const wf = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}&current=temperature_2m&timezone=auto`);
        const w = await wf.json();
        let aqi: number | null = null;
        try { const af = await fetch(`https://api.waqi.info/feed/geo:${coords.latitude};${coords.longitude}/?token=83274cc3f5749b4ec7b5b6c7b9f40464debbd6b1`); const a = await af.json(); if (a?.status === "ok") aqi = Number(a.data?.aqi); } catch { /* AQI unavailable */ }
        if (w?.current) setWeather({ temp: Math.round(Number(w.current.temperature_2m)), aqi });
      } catch { /* detailed data remains available in Daily Hub */ }
    }, () => undefined, { timeout: 5000, maximumAge: 900000 });
  }, []);

  return <main className="min-h-full bg-[#f8fafc] pb-10 text-slate-900"><div className="mx-auto w-full max-w-3xl px-3.5 py-4 sm:px-6 sm:py-5">\n
    <header className="mb-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <img src="/assets/rpf-samahit-icon.png" alt="RP Foundation" className="h-10 object-contain" onError={(e) => e.currentTarget.style.display='none'} />
        <img src="/assets/logo.png" alt="Samahit" className="h-7 object-contain" onError={(e) => e.currentTarget.style.display='none'} />
      </div>
      <div className="flex items-center gap-3 text-slate-300">
        <a href="#" className="hover:text-[#000080] transition"><Instagram className="h-4 w-4" /></a>
        <a href="#" className="hover:text-[#000080] transition"><Twitter className="h-4 w-4" /></a>
        <a href="#" className="hover:text-[#000080] transition"><Facebook className="h-4 w-4" /></a>
        <a href="#" className="hover:text-[#000080] transition"><Linkedin className="h-4 w-4" /></a>
      </div>
    </header>

    <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .55 }} className="relative overflow-hidden rounded-[30px] border border-orange-200/70 bg-white shadow-[0_18px_55px_rgba(0,0,0,.08)]">
      <div className="h-1.5 w-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808]"/><div className="absolute -right-20 -top-20 h-60 w-60 rounded-full bg-[#FF9933]/15 blur-3xl"/><div className="absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-[#138808]/15 blur-3xl"/>
      <div className="relative p-5 sm:p-7"><div className="flex items-start justify-between gap-4"><div className="flex items-center gap-3"><motion.div animate={{ y:[0,-4,0], rotate:[0,2,0,-2,0] }} transition={{ duration:4, repeat:Infinity, ease:"easeInOut" }} className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF9933] via-white to-[#138808] p-[2px] shadow-lg shadow-orange-100"><div className="flex h-full w-full items-center justify-center rounded-[14px] bg-white"><HandHeart className="h-7 w-7 text-[#000080]"/></div></motion.div><div><p className="text-[9px] font-black uppercase tracking-[.2em] text-[#FF9933]">RPF Seva App</p><p className="mt-1 text-[10px] font-bold tracking-[.12em] text-[#000080]">SEVA • SAMARPAN • SANKALP</p></div></div><motion.div animate={{ rotate:360 }} transition={{ duration:20, repeat:Infinity, ease:"linear" }} className="hidden h-12 w-12 rounded-full border border-dashed border-orange-200 sm:block"/></div>
      <h1 className="mt-6 text-[28px] font-black leading-tight tracking-[-0.035em] text-[#000080] sm:text-[34px]">{greeting}{name ? `, ${name}` : ""}</h1><p className="mt-2 max-w-xl text-[13px] leading-5 text-slate-600">{lang === "hi" ? "जहाँ सेवा एक विचार नहीं, एक संकल्प बनकर जीवन से जुड़ती है।" : "Where service becomes more than an idea — it becomes a shared commitment."}</p>
      <div className="mt-5 flex flex-wrap gap-2.5"><motion.button whileTap={{scale:.97}} whileHover={{y:-2}} onClick={()=>navigate("/jan-seva-card")} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-[#FF9933] to-[#F59E0B] px-4 py-2.5 text-[12px] font-bold text-white shadow-md shadow-orange-200"><HeartHandshake className="h-4 w-4"/>{lang === "hi" ? "जन सेवा कार्ड" : "Jan Seva Card"}<ArrowRight className="h-4 w-4"/></motion.button><motion.button whileTap={{scale:.97}} whileHover={{y:-2}} onClick={()=>navigate("/services")} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-green-200 bg-white px-4 py-2.5 text-[12px] font-bold text-[#138808]">{lang === "hi" ? "सेवाएं देखें" : "Explore services"}</motion.button></div>
      <div className="mt-6 grid grid-cols-3 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/80 text-center"><div className="border-r border-slate-200 py-2.5"><span className="block text-[10px] font-black text-[#FF9933]">SEVA</span><span className="text-[9px] text-slate-500">{lang === "hi" ? "सेवा" : "Service"}</span></div><div className="border-r border-slate-200 py-2.5"><span className="block text-[10px] font-black text-[#7C3AED]">SAMARPAN</span><span className="text-[9px] text-slate-500">{lang === "hi" ? "समर्पण" : "Dedication"}</span></div><div className="py-2.5"><span className="block text-[10px] font-black text-[#138808]">SANKALP</span><span className="text-[9px] text-slate-500">{lang === "hi" ? "संकल्प" : "Commitment"}</span></div></div></div>
    </motion.section>

    <motion.section initial={{opacity:0,y:14}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="mt-5 overflow-hidden rounded-[24px] border border-slate-100 bg-white shadow-[0_4px_20px_rgb(0,0,0,0.04)]"><div className="grid grid-cols-3 divide-x divide-slate-100"><button onClick={()=>navigate("/daily")} className="p-4 text-left hover:bg-sky-50/60"><CloudSun className="h-5 w-5 text-sky-500"/><p className="mt-2 text-[9px] font-black uppercase tracking-wider text-slate-400">Weather</p><p className="mt-1 text-[17px] font-black text-[#000080]">{weather ? `${weather.temp}°` : "—"}</p></button><button onClick={()=>navigate("/daily")} className="p-4 text-left hover:bg-green-50/60"><Wind className="h-5 w-5 text-[#138808]"/><p className="mt-2 text-[9px] font-black uppercase tracking-wider text-slate-400">AQI</p><p className="mt-1 text-[17px] font-black text-[#138808]">{weather?.aqi == null ? "—" : weather.aqi}</p></button><button onClick={()=>setQuote((q)=>(q+1)%quotes.length)} className="p-4 text-left hover:bg-violet-50/60"><Quote className="h-5 w-5 text-[#7C3AED]"/><p className="mt-2 text-[9px] font-black uppercase tracking-wider text-slate-400">Quote of the day</p><p className="mt-1 line-clamp-2 text-[10px] font-bold leading-4 text-slate-700">{lang === "hi" ? quotes[quote].hi : quotes[quote].en}</p></button></div><div className="border-t border-slate-100 px-4 py-2 text-[9px] text-slate-400">{lang === "hi" ? "विस्तृत मौसम और AQI के लिए Daily Hub खोलें" : "Open Daily Hub for detailed weather and AQI"}</div></motion.section>

    <motion.section initial={{opacity:0,y:14}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="mt-5 overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between px-5 py-4"><div><p className="text-[9px] font-black uppercase tracking-[.18em] text-[#FF9933]">{lang === "hi" ? "आज की प्रेरणा" : "A reason to care"}</p><h2 className="mt-1 text-[17px] font-black text-[#000080]">{lang === "hi" ? "आपकी छोटी पहल, किसी की बड़ी उम्मीद" : "A small act can become someone's big hope"}</h2></div><Sparkles className="h-5 w-5 text-[#F59E0B]"/></div><div className="grid gap-2.5 p-3 sm:grid-cols-3">{sevaCards.map(({icon:Icon,en,hi,textEn,textHi,route,gradient},i)=><motion.button key={en} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:.08*i}} whileHover={{y:-4}} whileTap={{scale:.98}} onClick={()=>navigate(route)} className="group rounded-2xl border border-slate-100 bg-white p-4 text-left shadow-[0_4px_20px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300"><motion.span animate={{y:[0,-2,0]}} transition={{duration:2.8,delay:i*.2,repeat:Infinity,ease:"easeInOut"}} className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-sm`}><Icon className="h-5 w-5 text-white"/></motion.span><p className="mt-3 text-[12px] font-black text-slate-800">{lang === "hi" ? hi : en}</p><p className="mt-1 text-[10px] leading-4 text-slate-500">{lang === "hi" ? textHi : textEn}</p><ChevronRight className="mt-3 h-4 w-4 text-slate-300 transition group-hover:translate-x-1"/></motion.button>)}</div></motion.section>

    <motion.section initial={{opacity:0,y:14}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="mt-5 overflow-hidden rounded-[25px] border-none bg-[#000080] text-white shadow-xl shadow-blue-900/10"><div className="flex items-center justify-between px-5 pt-5"><div><p className="text-[9px] font-black uppercase tracking-[.18em] text-orange-200">{lang === "hi" ? "संस्थापक की बात" : "From the founder"}</p><h2 className="mt-1 text-[17px] font-black text-white">{lang === "hi" ? "सेवा, समर्पण और संकल्प" : "Seva, Samarpan & Sankalp"}</h2></div><ShieldCheck className="h-5 w-5 text-orange-200"/></div><div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center"><motion.div whileHover={{scale:1.03}} className="relative mx-auto shrink-0 sm:mx-0"><div className="absolute inset-0 rounded-[22px] bg-gradient-to-br from-[#FF9933] via-white to-[#138808] blur-sm"/><img src="/assets/founder.png" alt="Rohit Pandit, Founder of RP Foundation" className="relative h-36 w-32 rounded-[20px] border-2 border-white object-cover object-top shadow-lg"/></motion.div><div className="flex-1"><p className="text-[14px] font-black text-white">{lang === "hi" ? "रोहित पंडित" : "Rohit Pandit"}</p><p className="mt-0.5 text-[10px] font-bold text-orange-200">{lang === "hi" ? "संस्थापक, आरपी फाउंडेशन" : "Founder, RP Foundation"}</p><p className="mt-3 text-[12px] leading-5 text-indigo-100">{lang === "hi" ? "सच्ची सेवा वही है जो समाज के सबसे कमजोर व्यक्ति तक पहुंचे और उसके जीवन में सकारात्मक परिवर्तन लाए।" : "True social service reaches the most vulnerable and creates meaningful positive change in their lives."}</p><motion.button whileTap={{scale:.97}} onClick={()=>navigate("/community")} className="mt-4 inline-flex items-center gap-1 rounded-full bg-white px-4 py-2 text-[11px] font-black text-[#000080] shadow-sm transition hover:bg-slate-50">{lang === "hi" ? "पूरा संदेश पढ़ें" : "Read the full message"}<ArrowRight className="h-3.5 w-3.5"/></motion.button></div></div></motion.section>

    <motion.section initial={{opacity:0,y:14}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="mt-5 overflow-hidden rounded-[25px] bg-slate-900 shadow-md"><div className="relative h-52 sm:h-60"><AnimatePresence mode="wait"><motion.img key={visuals[slide].image} src={visuals[slide].image} alt="RPF Seva App real-world visual" initial={{opacity:0,scale:1.04}} animate={{opacity:1,scale:1}} exit={{opacity:0}} transition={{duration:.65}} className="absolute inset-0 h-full w-full object-cover"/></AnimatePresence><div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"/><div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5"><div><p className="text-[9px] font-black uppercase tracking-[.18em] text-orange-200">RPF Seva App</p><h2 className="mt-1 max-w-xl text-[17px] font-black text-white">{lang === "hi" ? visuals[slide].hi : visuals[slide].en}</h2></div><div className="flex gap-1.5">{visuals.map((_,i)=><button key={i} onClick={()=>setSlide(i)} aria-label={`Slide ${i+1}`} className={`h-1.5 rounded-full transition-all ${i===slide?"w-6 bg-white":"w-2 bg-white/50"}`}/>)}</div></div></div></motion.section>

    {alert && <motion.section initial={{opacity:0,scale:.98}} whileInView={{opacity:1,scale:1}} viewport={{once:true}} className="mt-5 rounded-2xl border border-orange-200 bg-orange-50/70 p-4"><div className="flex gap-3"><Megaphone className="h-5 w-5 shrink-0 text-[#FF9933]"/><div><p className="text-[9px] font-black uppercase tracking-wider text-[#FF9933]">{lang === "hi" ? "महत्वपूर्ण सूचना" : "Important update"}</p><p className="mt-1 text-[13px] font-semibold text-slate-800">{alert}</p></div></div></motion.section>}
    {globalSettings?.show_notices !== false && announcement && <motion.section initial={{opacity:0,y:12}} whileInView={{opacity:1,y:0}} viewport={{once:true}} className="mt-5 rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5"><h2 className="text-[14px] font-black text-[#000080]">{lang === "hi" ? "समुदाय से जुड़ें" : "Stay connected"}</h2><Megaphone className="h-4 w-4 text-[#FF9933]"/></div><div className="px-4 py-4"><p className="text-[13px] font-bold text-slate-800">{announcement.title}</p>{announcement.content && <p className="mt-1 text-[11px] leading-5 text-slate-500">{announcement.content}</p>}<button onClick={()=>navigate("/notifications")} className="mt-3 text-[10px] font-black text-[#000080]">{lang === "hi" ? "सभी अपडेट देखें" : "View all updates"}<ChevronRight className="inline h-3.5 w-3.5"/></button></div></motion.section>}
    <div className="mt-5 mb-5">
      <p className="text-[11px] font-black uppercase tracking-[.18em] text-slate-400 mb-2">{lang === "hi" ? "नवीनतम अपडेट" : "Latest Updates"}</p>
      <InstagramEmbed url={FEATURED_INSTAGRAM_REEL} />
    </div>
    <div className="mt-5 mb-5">
      <p className="text-[11px] font-black uppercase tracking-[.18em] text-slate-400 mb-2">{lang === "hi" ? "लाइव फीड" : "Live Social Feed"}</p>
      <InstagramApiFeed sourceUrl={INSTAGRAM_DATA_SOURCE} />
    </div>
    <motion.button whileHover={{y:-2}} whileTap={{scale:.99}} onClick={()=>navigate("/donations")} className="mt-5 flex min-h-16 w-full items-center justify-between rounded-2xl border border-orange-200 bg-white px-5 py-4 text-left shadow-sm"><span><span className="block text-[13px] font-black text-[#000080]">{lang === "hi" ? "सेवा के लिए योगदान दें" : "Support the seva"}</span><span className="mt-1 block text-[10px] text-slate-500">{lang === "hi" ? "आपका सहयोग सीधे सेवा के कार्यों तक पहुंचता है।" : "Your support helps turn compassion into action."}</span></span><HeartHandshake className="h-6 w-6 text-[#FF9933]"/></motion.button>
  </div></main>;
}
