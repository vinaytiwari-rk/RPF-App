import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CloudSun,
  Facebook,
  Globe,
  HandHeart,
  HeartHandshake,
  HeartPulse,
  Instagram,
  Leaf,
  MapPin,
  Quote,
  ShieldCheck,
  Sparkles,
  Twitter,
  Users,
  Wind,
  Youtube,
  Radio,
  Tv,
  Newspaper,
} from "lucide-react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";

type Lang = "en" | "hi";
type Daily = { temp: number | null; aqi: number | null; location: string };
type QuoteData = { quote: string; author: string; link?: string };

const sevaCards = [
  { icon: HeartPulse, title: "Care", hi: "देखभाल", text: "Be there for someone who needs support.", textHi: "किसी जरूरतमंद के लिए सहारा बनें।", tone: "rose" },
  { icon: Users, title: "Connect", hi: "जुड़ें", text: "Bring one person closer to a positive community.", textHi: "एक व्यक्ति को सकारात्मक समुदाय से जोड़ें।", tone: "sky" },
  { icon: Leaf, title: "Protect", hi: "संरक्षण", text: "Take one meaningful step for our environment.", textHi: "पर्यावरण के लिए एक सार्थक कदम उठाएं।", tone: "green" },
  { icon: HandHeart, title: "Share", hi: "साझा करें", text: "Share time, knowledge or encouragement.", textHi: "समय, ज्ञान या प्रोत्साहन साझा करें।", tone: "purple" },
];

const socialFallback = [
  { platform: "twitter", label: "X", url: "https://x.com/rpfoundation15", gradient: "from-slate-800 to-black", icon: Twitter },
  { platform: "youtube", label: "YouTube", url: "https://www.youtube.com/@rpfoundationofficial", gradient: "from-red-600 to-red-800", icon: Youtube },
  { platform: "instagram", label: "Instagram", url: "https://www.instagram.com/rpfoundationofficial/", gradient: "from-pink-500 via-purple-500 to-orange-400", icon: Instagram },
  { platform: "facebook", label: "Facebook", url: "https://www.facebook.com/rpfofficial", gradient: "from-blue-600 to-blue-800", icon: Facebook },
  { platform: "website", label: "Website", url: "https://therpfoundation.org", gradient: "from-sky-500 to-blue-700", icon: Globe },
];

export default function HomePremium() {
  const { lang } = useOutletContext<{ lang: Lang }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { settings, cmsConfig, socialLinks } = useApp();

  const [daily, setDaily] = useState<Daily>({ temp: null, aqi: null, location: "" });
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [selectedSeva, setSelectedSeva] = useState(0);

  const hi = lang === "hi";
  const name = user?.name?.trim().split(/\s+/)[0] || "";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? (hi ? "सुप्रभात" : "Good morning") : hour < 17 ? (hi ? "शुभ दोपहर" : "Good afternoon") : (hi ? "शुभ संध्या" : "Good evening");

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const [weatherResponse, locationResponse] = await Promise.all([
            fetch(`/api/public/weather?lat=${coords.latitude}&lon=${coords.longitude}`).then((r) => (r.ok ? r.json() : Promise.reject())),
            fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords.latitude}&lon=${coords.longitude}`).then((r) => (r.ok ? r.json() : Promise.reject())),
          ]);
          let aqi: number | null = null;
          try {
            const a = await fetch(`https://api.waqi.info/feed/geo:${coords.latitude};${coords.longitude}/?token=83274cc3f5749b4ec7b5b6c7b9f40464debbd6b1`).then((r) => r.json());
            if (a?.status === "ok" && Number.isFinite(Number(a.data?.aqi))) aqi = Number(a.data.aqi);
          } catch {}
          const address = locationResponse?.address || {};
          setDaily({
            temp: weatherResponse?.data?.current?.temperature_2m == null ? null : Math.round(Number(weatherResponse.data.current.temperature_2m)),
            aqi,
            location: address.city || address.town || address.village || address.municipality || "",
          });
        } catch {}
      },
      () => undefined,
      { timeout: 7000, maximumAge: 900000 }
    );
  }, []);

  useEffect(() => {
    fetch("/api/public/quote-of-day")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((d) => setQuote(d.data || null))
      .catch(() => setQuote(null));
  }, []);

  const founderName = cmsConfig.founderName || "Rohit Pandit";
  const founderImg = settings.founderImgUrl || cmsConfig.founderImgUrl || "/assets/founder.png";
  const founderMessage = hi ? settings.founderMessageHi : settings.founderMessageEn;

  const cmsSocial = (socialLinks || []).filter((s) => ["twitter", "youtube", "facebook", "foundation_instagram"].includes(s.platform));
  const social = socialFallback.map((item) => {
    const found = cmsSocial.find((s) => (item.platform === "instagram" ? s.platform === "foundation_instagram" : s.platform === item.platform));
    return { ...item, url: found?.url || item.url };
  });

  const selected = useMemo(() => sevaCards[selectedSeva], [selectedSeva]);

  return (
    <main className="min-h-full bg-[#FAF9F6] pb-28 text-slate-900 font-sans selection:bg-orange-100">
      <div className="mx-auto w-full max-w-3xl px-4 py-4 sm:px-6">
        {/* Top Branding Banner Header */}
        <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm p-6">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#FF9933] via-[#FDE047] to-[#138808]" />
          
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
                <img src="/assets/logo.png" alt="RP Foundation" className="h-full w-full object-contain" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[.18em] text-[#000080]">RP Foundation</p>
                <h2 className="text-xs font-black text-slate-900 tracking-wider">समाहित सुपर-ऐप</h2>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active
            </span>
          </div>

          <div className="mt-5">
            <h1 className="text-2xl font-black leading-tight text-[#000080] sm:text-3xl">
              {greeting}{name ? `, ${name}` : ""}
            </h1>
            <p className="mt-1.5 text-xs leading-relaxed text-slate-600 font-medium">
              {hi ? "जहाँ सेवा एक विचार नहीं, एक संकल्प बनकर जीवन से जुड़ती है।" : "Where service becomes more than an idea — a shared commitment to national progress."}
            </p>
          </div>

          <div className="mt-5 flex items-center gap-3">
            <button
              onClick={() => navigate("/jan-seva-card")}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#FF9933] to-[#F59E0B] px-4 py-2.5 text-xs font-bold text-white shadow-md active:scale-95 transition"
            >
              <HeartHandshake className="h-4 w-4" />
              {hi ? "जन सेवा कार्ड आवेदन" : "Jan Seva Card"}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </section>

        {/* Live Weather & Location Bar */}
        <section className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="grid grid-cols-3 divide-x divide-slate-100">
            <div className="p-3.5">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <MapPin className="h-3.5 w-3.5 text-[#FF9933]" />
                <span className="text-[9px] font-black uppercase tracking-wider">{hi ? "स्थान" : "Location"}</span>
              </div>
              <p className="truncate text-xs font-black text-slate-800">{daily.location || (hi ? "पता कर रहे हैं…" : "Locating…")}</p>
            </div>
            <div className="p-3.5">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <CloudSun className="h-3.5 w-3.5 text-sky-500" />
                <span className="text-[9px] font-black uppercase tracking-wider">{hi ? "मौसम" : "Weather"}</span>
              </div>
              <p className="text-sm font-black text-[#000080]">{daily.temp == null ? "—" : `${daily.temp}°C`}</p>
            </div>
            <div className="p-3.5">
              <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                <Wind className="h-3.5 w-3.5 text-emerald-600" />
                <span className="text-[9px] font-black uppercase tracking-wider">AQI</span>
              </div>
              <p className="text-sm font-black text-[#138808]">{daily.aqi == null ? "—" : daily.aqi}</p>
            </div>
          </div>
        </section>

        {/* Media & Feature Shortcuts */}
        <section className="mt-4 grid grid-cols-3 gap-2.5">
          <button
            onClick={() => navigate("/internet-radio")}
            className="flex items-center gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-3 text-left hover:bg-emerald-100/50 transition active:scale-95"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white shrink-0 shadow-sm">
              <Radio className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black text-emerald-950 truncate">Radio</p>
              <p className="text-[9px] font-bold text-emerald-700 truncate">Live AIR</p>
            </div>
          </button>

          <button
            onClick={() => navigate("/live-tv")}
            className="flex items-center gap-2.5 rounded-2xl border border-rose-200 bg-rose-50/60 p-3 text-left hover:bg-rose-100/50 transition active:scale-95"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-600 text-white shrink-0 shadow-sm">
              <Tv className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black text-rose-950 truncate">Live TV</p>
              <p className="text-[9px] font-bold text-rose-700 truncate">Broadcast</p>
            </div>
          </button>

          <button
            onClick={() => navigate("/epaper")}
            className="flex items-center gap-2.5 rounded-2xl border border-blue-200 bg-blue-50/60 p-3 text-left hover:bg-blue-100/50 transition active:scale-95"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#000080] text-white shrink-0 shadow-sm">
              <Newspaper className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black text-blue-950 truncate">E-Paper</p>
              <p className="text-[9px] font-bold text-blue-700 truncate">Daily News</p>
            </div>
          </button>
        </section>

        {/* Quote of the Day */}
        <section className="mt-4 rounded-2xl border border-purple-100 bg-gradient-to-r from-purple-50/60 via-white to-pink-50/60 p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-600 text-white shrink-0">
              <Quote className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-black uppercase tracking-[.18em] text-purple-700">{hi ? "आज का विचार" : "Quote of the Day"}</p>
              <p className="mt-1 text-xs font-bold leading-relaxed text-slate-800">
                {quote?.quote || (hi ? "सेवा ही परमो धर्मः - स्वामी विवेकानंद" : "Service to others is the highest expression of humanity.")}
              </p>
              {quote?.author && <p className="mt-1 text-[10px] font-black text-slate-400">— {quote.author}</p>}
            </div>
            <Sparkles className="h-4 w-4 text-purple-500 shrink-0" />
          </div>
        </section>

        {/* Small Steps to Serve */}
        <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[.18em] text-[#FF9933]">{hi ? "सेवा के छोटे कदम" : "Ways to Serve"}</p>
              <h2 className="text-sm font-black text-[#000080]">{hi ? selected.hi : selected.title}</h2>
            </div>
            <selected.icon className="h-5 w-5 text-[#FF9933]" />
          </div>
          <p className="mt-2.5 text-xs leading-relaxed text-slate-600 font-medium">{hi ? selected.textHi : selected.text}</p>
          <div className="mt-3.5 grid grid-cols-4 gap-2">
            {sevaCards.map((item, index) => (
              <button
                key={item.title}
                onClick={() => setSelectedSeva(index)}
                aria-label={hi ? item.hi : item.title}
                className={`flex h-11 items-center justify-center rounded-xl border transition active:scale-95 ${
                  selectedSeva === index ? "border-orange-300 bg-orange-50 text-[#FF9933] shadow-inner font-bold" : "border-slate-100 bg-slate-50 text-slate-500"
                }`}
              >
                <item.icon className="h-4 w-4" />
              </button>
            ))}
          </div>
        </section>

        {/* Founder's Message */}
        <section className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 overflow-hidden rounded-xl border-2 border-[#FF9933] bg-slate-100 shadow-sm shrink-0">
              <img src={founderImg} alt={founderName} className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.visibility = "hidden"; }} />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-[.18em] text-[#FF9933]">{hi ? "संस्थापक का संदेश" : "Founder's Message"}</p>
              <h2 className="text-sm font-black text-[#000080]">{founderName}</h2>
            </div>
          </div>
          <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-slate-600 font-medium">
            {founderMessage || (hi ? "संस्थापक का संदेश शीघ्र उपलब्ध होगा।" : "The founder's message will be available shortly.")}
          </p>
          <button onClick={() => navigate("/founder-speech")} className="mt-3 inline-flex items-center gap-1.5 text-xs font-black text-[#000080]">
            {hi ? "पूरा संदेश पढ़ें" : "Read full message"} <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </section>

        {/* Social Channels Connect */}
        <section className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck className="h-4 w-4 text-[#138808]" />
            <h3 className="text-xs font-black text-[#000080] uppercase tracking-wider">{hi ? "हमसे जुड़े रहें" : "Connect with Us"}</h3>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {social.map((item) => (
              <a
                key={item.platform}
                href={item.url}
                target="_blank"
                rel="noreferrer"
                aria-label={item.label}
                className={`flex h-11 items-center justify-center rounded-xl bg-gradient-to-br ${item.gradient} text-white shadow-sm transition active:scale-95`}
              >
                <item.icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
