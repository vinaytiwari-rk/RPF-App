import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CloudSun, Facebook, Globe, HandHeart, HeartHandshake, HeartPulse, Instagram, Leaf, MapPin, Quote, ShieldCheck, Sparkles, Twitter, Users, Wind, Youtube } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";

type Lang = "en" | "hi";
type Daily = { temp: number | null; aqi: number | null; location: string };
type QuoteData = { quote: string; author: string; link?: string };
type Visual = { image: string; en: string; hi: string };

// Neutral real-world photography only. No NGO/brand uniforms, logos or organisation-owned event imagery.
const visuals: Visual[] = [
  { image: "https://images.unsplash.com/photo-1509099836639-18ba02c2f7a1?auto=format&fit=crop&w=1600&q=88", en: "Every child's smile is a reason to serve", hi: "हर बच्चे की मुस्कान सेवा का एक कारण है" },
  { image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1600&q=88", en: "A little kindness can change someone's day", hi: "थोड़ी सी करुणा किसी का दिन बदल सकती है" },
  { image: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=1600&q=88", en: "Young energy can become meaningful action", hi: "युवा ऊर्जा सार्थक सेवा में बदल सकती है" },
  { image: "https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?auto=format&fit=crop&w=1600&q=88", en: "Together, we can make our community stronger", hi: "मिलकर हम अपने समुदाय को मजबूत बना सकते हैं" },
  { image: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?auto=format&fit=crop&w=1600&q=88", en: "Service begins with one willing heart", hi: "सेवा एक इच्छुक हृदय से शुरू होती है" },
  { image: "https://images.unsplash.com/photo-1494386346843-e12284507169?auto=format&fit=crop&w=1600&q=88", en: "Education creates possibilities for tomorrow", hi: "शिक्षा कल के लिए नई संभावनाएं बनाती है" }
];

const sevaIdeas = [
  { icon: HeartPulse, en: "Care", hi: "देखभाल", textEn: "Check on someone who may need support.", textHi: "किसी ऐसे व्यक्ति का हाल पूछें जिसे सहायता की जरूरत हो।", gradient: "from-rose-500 to-pink-500" },
  { icon: Users, en: "Connect", hi: "जुड़ें", textEn: "Invite one person into a positive community action.", textHi: "एक व्यक्ति को सकारात्मक सामुदायिक पहल से जोड़ें।", gradient: "from-sky-500 to-cyan-400" },
  { icon: Leaf, en: "Protect", hi: "संरक्षण", textEn: "Do one small thing for a cleaner environment.", textHi: "स्वच्छ पर्यावरण के लिए एक छोटा कदम उठाएं।", gradient: "from-emerald-600 to-green-400" },
  { icon: HandHeart, en: "Share", hi: "साझा करें", textEn: "Share time, knowledge or encouragement.", textHi: "अपना समय, ज्ञान या प्रोत्साहन साझा करें।", gradient: "from-violet-600 to-fuchsia-500" }
];

const socialFallback = [
  { platform: "twitter", label: "X", url: "https://x.com/rpfoundation15", gradient: "from-slate-800 to-black", icon: Twitter },
  { platform: "youtube", label: "YouTube", url: "https://www.youtube.com/@rpfoundationofficial", gradient: "from-red-500 to-red-700", icon: Youtube },
  { platform: "instagram", label: "Instagram", url: "https://www.instagram.com/rpfoundationofficial/", gradient: "from-pink-500 via-purple-500 to-orange-400", icon: Instagram },
  { platform: "facebook", label: "Facebook", url: "https://www.facebook.com/rpfofficial", gradient: "from-blue-500 to-blue-700", icon: Facebook },
  { platform: "website", label: "Website", url: "https://therpfoundation.org", gradient: "from-sky-400 to-blue-600", icon: Globe }
];

export default function HomeV3() {
  const { lang } = useOutletContext<{ lang: Lang }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { settings, cmsConfig, socialLinks } = useApp();
  const [slide, setSlide] = useState(0);
  const [daily, setDaily] = useState<Daily>({ temp: null, aqi: null, location: "" });
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [selectedSeva, setSelectedSeva] = useState(0);
  const hi = lang === "hi";
  const name = user?.name?.trim().split(/\s+/)[0] || "";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? (hi ? "सुप्रभात" : "Good morning") : hour < 17 ? (hi ? "शुभ दोपहर" : "Good afternoon") : (hi ? "शुभ संध्या" : "Good evening");

  useEffect(() => { const timer = window.setInterval(() => setSlide((s) => (s + 1) % visuals.length), 5500); return () => window.clearInterval(timer); }, []);
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      try {
        const [weatherResponse, locationResponse] = await Promise.all([
          fetch(`/api/public/weather?lat=${coords.latitude}&lon=${coords.longitude}`).then((r) => r.ok ? r.json() : Promise.reject()),
          fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords.latitude}&lon=${coords.longitude}`).then((r) => r.ok ? r.json() : Promise.reject())
        ]);
        let aqi: number | null = null;
        try { const a = await fetch(`https://api.waqi.info/feed/geo:${coords.latitude};${coords.longitude}/?token=83274cc3f5749b4ec7b5b6c7b9f40464debbd6b1`).then((r) => r.json()); if (a?.status === "ok" && Number.isFinite(Number(a.data?.aqi))) aqi = Number(a.data.aqi); } catch { /* optional */ }
        const address = locationResponse?.address || {};
        const location = [address.city || address.town || address.village || address.municipality, address.state].filter(Boolean).join(", ");
        setDaily({ temp: weatherResponse?.data?.current?.temperature_2m == null ? null : Math.round(Number(weatherResponse.data.current.temperature_2m)), aqi, location });
      } catch { /* keep placeholders */ }
    }, () => undefined, { timeout: 7000, maximumAge: 900000 });
  }, []);
  useEffect(() => { fetch("/api/public/quote-of-day").then((r) => r.ok ? r.json() : Promise.reject()).then((d) => setQuote(d.data || null)).catch(() => setQuote(null)); }, []);

  const founderName = cmsConfig.founderName || "Rohit Pandit";
  const founderImg = settings.founderImgUrl || cmsConfig.founderImgUrl || "/assets/founder.png";
  const founderMessage = hi ? settings.founderMessageHi : settings.founderMessageEn;
  const cmsSocial = (socialLinks || []).filter((s) => ["twitter", "youtube", "facebook", "foundation_instagram"].includes(s.platform));
  const social = socialFallback.map((item) => { const found = cmsSocial.find((s) => item.platform === "instagram" ? s.platform === "foundation_instagram" : s.platform === item.platform); return { ...item, url: found?.url || item.url }; });
  const selected = useMemo(() => sevaIdeas[selectedSeva], [selectedSeva]);

  return <main className="min-h-full bg-[#f8fafc] pb-12 text-slate-900"><div className="mx-auto w-full max-w-3xl px-3.5 py-4 sm:px-6 sm:py-5">
    <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-[30px] border border-orange-200/70 bg-white shadow-[0_18px_55px_rgba(0,0,0,.08)]"><div className="h-1.5 bg-gradient-to-r from-[#FF9933] via-[#FDE047] to-[#138808]"/><div className="p-5 sm:p-7"><div className="flex items-center gap-3"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF9933] via-white to-[#138808] p-[2px] shadow-lg"><div className="flex h-full w-full items-center justify-center rounded-[14px] bg-white"><HandHeart className="h-7 w-7 text-[#000080]" /></div></div><div><p className="text-[9px] font-black uppercase tracking-[.2em] text-[#FF9933]">RPF Seva App</p><p className="mt-1 text-[10px] font-bold tracking-[.12em] text-[#000080]">SEVA • SAMARPAN • SANKALP</p></div></div><h1 className="mt-6 text-[28px] font-black leading-tight text-[#000080] sm:text-[34px]">{greeting}{name ? `, ${name}` : ""}</h1><p className="mt-2 text-[13px] leading-5 text-slate-600">{hi ? "जहाँ सेवा एक विचार नहीं, एक संकल्प बनकर जीवन से जुड़ती है।" : "Where service becomes more than an idea — it becomes a shared commitment."}</p><div className="mt-5 flex flex-wrap gap-2.5"><button onClick={() => navigate("/jan-seva-card")} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-gradient-to-r from-[#FF9933] to-[#F59E0B] px-4 py-2.5 text-[12px] font-bold text-white shadow-md"><HeartHandshake className="h-4 w-4" />{hi ? "जन सेवा कार्ड" : "Jan Seva Card"}<ArrowRight className="h-4 w-4" /></button></div></div></motion.section>

    <section className="mt-5 overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm"><div className="grid grid-cols-3 divide-x divide-slate-100"><div className="p-4"><MapPin className="h-5 w-5 text-[#0EA5E9]" /><p className="mt-2 text-[9px] font-black uppercase tracking-wider text-slate-400">{hi ? "स्थान" : "Location"}</p><p className="mt-1 line-clamp-2 text-[11px] font-black text-slate-700">{daily.location || (hi ? "स्थान प्राप्त हो रहा है…" : "Getting your location…")}</p></div><div className="p-4"><CloudSun className="h-5 w-5 text-[#38BDF8]" /><p className="mt-2 text-[9px] font-black uppercase tracking-wider text-slate-400">{hi ? "मौसम" : "Weather"}</p><p className="mt-1 text-[18px] font-black text-[#000080]">{daily.temp == null ? "—" : `${daily.temp}°`}</p></div><div className="p-4"><Wind className="h-5 w-5 text-[#138808]" /><p className="mt-2 text-[9px] font-black uppercase tracking-wider text-slate-400">AQI</p><p className="mt-1 text-[18px] font-black text-[#138808]">{daily.aqi == null ? "—" : daily.aqi}</p></div></div></section>

    <section className="mt-3 rounded-[24px] border border-violet-100 bg-gradient-to-r from-violet-50 via-white to-pink-50 p-4 shadow-sm"><div className="flex items-start gap-3"><Quote className="mt-1 h-5 w-5 shrink-0 text-[#7C3AED]" /><div className="min-w-0 flex-1"><p className="text-[9px] font-black uppercase tracking-[.18em] text-[#7C3AED]">{hi ? "आज का विचार" : "Quote of the Day"}</p><p className="mt-1 text-[13px] font-bold leading-5 text-slate-700">{quote?.quote || (hi ? "आज का विचार उपलब्ध नहीं है।" : "Today's quote is temporarily unavailable.")}</p>{quote?.author && <p className="mt-1 text-[10px] font-black text-slate-400">— {quote.author}</p>}</div><Sparkles className="h-4 w-4 text-[#EC4899]" /></div></section>

    <section className="mt-5 overflow-hidden rounded-[26px] bg-slate-900 shadow-lg"><div className="relative aspect-[16/10] w-full overflow-hidden sm:aspect-[16/9]"><AnimatePresence mode="wait">{visuals.map((item, i) => i === slide && <motion.div key={item.image} initial={{ opacity: 0, scale: 1.03 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: .55 }} className="absolute inset-0"><img src={item.image} alt={hi ? item.hi : item.en} className="block h-full w-full object-cover" loading={i === 0 ? "eager" : "lazy"} onError={(e) => { e.currentTarget.style.visibility = "hidden"; }} /><div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" /><div className="absolute bottom-0 left-0 right-0 p-5 sm:p-7"><p className="max-w-xl text-[19px] font-black leading-tight text-white sm:text-[26px]">{hi ? item.hi : item.en}</p></div></motion.div>)}</AnimatePresence><button aria-label="Previous" onClick={() => setSlide((s) => (s - 1 + visuals.length) % visuals.length)} className="absolute left-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-slate-800 shadow"><span aria-hidden>‹</span></button><button aria-label="Next" onClick={() => setSlide((s) => (s + 1) % visuals.length)} className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-slate-800 shadow"><span aria-hidden>›</span></button></div><div className="flex justify-center gap-1.5 bg-slate-900 py-3">{visuals.map((_, i) => <button aria-label={`Slide ${i + 1}`} key={i} onClick={() => setSlide(i)} className={`h-1.5 rounded-full transition-all ${i === slide ? "w-7 bg-white" : "w-1.5 bg-white/30"}`} />)}</div></section>

    <section className="mt-5 rounded-[25px] border border-emerald-100 bg-white p-5 shadow-sm"><div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF9933] to-[#F59E0B] text-white"><Sparkles className="h-5 w-5" /></span><div><p className="text-[9px] font-black uppercase tracking-[.18em] text-[#138808]">{hi ? "आज का सेवा संकल्प" : "Your Seva Today"}</p><h2 className="mt-1 text-[17px] font-black text-[#000080]">{hi ? "आज आप किस भावना को चुनेंगे?" : "What will you bring to someone today?"}</h2></div></div><div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-4">{sevaIdeas.map((item, i) => { const Icon = item.icon; return <button key={item.en} onClick={() => setSelectedSeva(i)} className={`rounded-2xl border p-3 text-left transition ${selectedSeva === i ? "border-transparent bg-slate-900 text-white shadow-lg" : "border-slate-100 bg-slate-50 text-slate-700"}`}><span className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${item.gradient} text-white`}><Icon className="h-4 w-4" /></span><span className="mt-2 block text-[11px] font-black">{hi ? item.hi : item.en}</span></button>; })}</div><AnimatePresence mode="wait"><motion.div key={selected.en} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-3 rounded-2xl bg-gradient-to-r from-orange-50 via-white to-green-50 p-4"><p className="text-[12px] font-bold leading-5 text-slate-700">{hi ? selected.textHi : selected.textEn}</p><p className="mt-2 text-[9px] font-black uppercase tracking-wider text-[#138808]">{hi ? "यह सुझाव इसी Home screen पर है — कोई redirect नहीं" : "A simple Home-screen intention — no redirect required."}</p></motion.div></AnimatePresence></section>

    <section className="mt-5 overflow-hidden rounded-[25px] border border-orange-200/70 bg-gradient-to-br from-orange-50 via-white to-green-50 shadow-sm"><div className="flex items-center justify-between px-5 pt-5"><div><p className="text-[9px] font-black uppercase tracking-[.18em] text-[#FF9933]">{hi ? "संस्थापक की बात" : "From the founder"}</p><h2 className="mt-1 text-[17px] font-black text-[#000080]">{founderName}</h2></div><ShieldCheck className="h-5 w-5 text-[#138808]" /></div><div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center"><img src={founderImg} alt={founderName} className="mx-auto h-36 w-32 rounded-[20px] border-2 border-white object-cover object-top shadow-lg sm:mx-0"/><div className="flex-1"><p className="text-[11px] font-semibold leading-5 text-slate-600">{founderMessage ? `${founderMessage.slice(0, 230)}${founderMessage.length > 230 ? "…" : ""}` : (hi ? "सेवा, समर्पण और संकल्प के साथ समाज के लिए निरंतर कार्य करने का संदेश।" : "A message of service, dedication and resolve for the community.")}</p><button onClick={() => navigate("/founder-speech")} className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[#000080] px-3.5 py-2.5 text-[10px] font-black text-white">{hi ? "पूरा संदेश पढ़ें" : "Read full speech"}<ArrowRight className="h-4 w-4" /></button></div></div></section>

    <section className="mt-5 rounded-[25px] border border-slate-200 bg-white p-4 shadow-sm"><div className="flex items-center justify-between"><div><p className="text-[9px] font-black uppercase tracking-[.18em] text-slate-400">RPF Foundation</p><h2 className="mt-1 text-[16px] font-black text-[#000080]">{hi ? "हमसे जुड़े रहें" : "Stay connected"}</h2></div><Globe className="h-5 w-5 text-sky-500" /></div><div className="mt-4 flex flex-wrap gap-3">{social.map((item) => { const Icon = item.icon; return <a key={item.platform} href={item.url} target="_blank" rel="noreferrer" aria-label={item.label} className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${item.gradient} text-white shadow-sm transition hover:-translate-y-0.5`}><Icon className="h-5 w-5" /></a>; })}</div></section>
    </div></main>;
}
