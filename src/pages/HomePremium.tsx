import React, { useEffect, useMemo, useState } from "react";
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
  Briefcase,
  AlertTriangle,
  Stethoscope,
  ChevronRight,
  ShieldAlert,
  Building2,
  Trophy,
  Award,
  Medal,
} from "lucide-react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";

type Lang = "en" | "hi";
type Daily = { temp: number | null; aqi: number | null; location: string };
type QuoteData = { quote: string; author: string; link?: string };

const QUICK_ACTIONS = [
  { id: "card", titleEn: "Jan Seva Card", titleHi: "जन सेवा कार्ड", descEn: "Citizen ID & Schemes", descHi: "नागरिक आईडी", icon: HeartHandshake, color: "bg-orange-500 text-white", route: "/jan-seva-card" },
  { id: "blood", titleEn: "Blood Network", titleHi: "ब्लड नेटवर्क", descEn: "Emergency Donors", descHi: "आपातकालीन रक्तदान", icon: HeartPulse, color: "bg-rose-600 text-white", route: "/blood-network" },
  { id: "health", titleEn: "Health Care", titleHi: "स्वास्थ्य सेवा", descEn: "Ayushman & Doctors", descHi: "आयुष्मान एवं डॉक्टर", icon: Stethoscope, color: "bg-emerald-600 text-white", route: "/health-care" },
  { id: "jobs", titleEn: "Jobs Portal", titleHi: "रोजगार पोर्टल", descEn: "Rojgar Mela & Careers", descHi: "करियर और नौकरियां", icon: Briefcase, color: "bg-blue-600 text-white", route: "/jobs" },
  { id: "grievance", titleEn: "Grievances", titleHi: "शिकायत पोर्टल", descEn: "Civic Complaints", descHi: "नागरिक शिकायतें", icon: AlertTriangle, color: "bg-amber-600 text-white", route: "/grievance" },
  { id: "radio", titleEn: "Internet Radio", titleHi: "इंटरनेट रेडियो", descEn: "AIR & Akashvani", descHi: "लाइव रेडियो प्रसारण", icon: Radio, color: "bg-purple-600 text-white", route: "/internet-radio" },
  { id: "tv", titleEn: "Live Broadcast", titleHi: "लाइव टीवी", descEn: "News & Culture", descHi: "लाइव समाचार चैनल", icon: Tv, color: "bg-indigo-600 text-white", route: "/live-tv" },
  { id: "epaper", titleEn: "E-Paper Kiosk", titleHi: "ई-पेपर कियोस्क", descEn: "Daily Newspapers", descHi: "दैनिक समाचार पत्र", icon: Newspaper, color: "bg-sky-600 text-white", route: "/epaper" },
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

  const founderName = cmsConfig.founderName || "Shri Rohit Pandit Ji";
  const founderImg = settings.founderImgUrl || cmsConfig.founderImgUrl || "/assets/founder.png";
  const founderMessage = hi ? settings.founderMessageHi : settings.founderMessageEn;

  const cmsSocial = (socialLinks || []).filter((s) => ["twitter", "youtube", "facebook", "foundation_instagram"].includes(s.platform));
  const social = socialFallback.map((item) => {
    const found = cmsSocial.find((s) => (item.platform === "instagram" ? s.platform === "foundation_instagram" : s.platform === item.platform));
    return { ...item, url: found?.url || item.url };
  });

  return (
    <main className="min-h-full bg-[#FAF9F6] pb-28 text-slate-900 font-sans selection:bg-orange-100">
      <div className="mx-auto w-full max-w-3xl px-4 py-4 sm:px-6">
        
        {/* Top Super-App Header */}
        <header className="mb-4 flex items-center justify-between border-b border-slate-200/60 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
              <img src="/assets/logo.png" alt="RP Foundation" className="h-full w-full object-contain" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.18em] text-[#000080]">Samahit Super-App</p>
              <h2 className="text-xs font-black text-slate-900 tracking-wider">RP Foundation India</h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/sos")}
              className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full shadow-md active:scale-95 transition"
            >
              <ShieldAlert className="h-3.5 w-3.5" />
              SOS Alert
            </button>
          </div>
        </header>

        {/* Hero Banner: Dedicated RP Foundation Vision, Motive & Goals */}
        <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-orange-50/40 to-blue-50/30 shadow-sm p-5 sm:p-6">
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#FF9933] via-[#000080] to-[#138808]" />
          
          <div className="flex items-center justify-between">
            <div>
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-[.18em] text-[#000080] bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                <Sparkles className="w-3 h-3 text-[#FF9933]" />
                {hi ? "आर.पी. फाउंडेशन दृष्टि एवं उद्देश्य" : "RP Foundation Vision & Mission"}
              </span>
              <h1 className="text-2xl font-black leading-tight text-[#000080] mt-2 sm:text-3xl">
                {greeting}{name ? `, ${name}` : ""}
              </h1>
              <p className="mt-1 text-xs leading-relaxed text-slate-600 font-medium max-w-lg">
                {hi 
                  ? "रोजगार मेला, महिला सशक्तिकरण (पिंक ई-रिक्शा), स्वास्थ्य शिविर, खेलकूद संवर्धन एवं सांस्कृतिक विरासत का राष्ट्रीय संकल्प।"
                  : "Empowering citizens through Rojgar Melas, Pink E-Rickshaws, Free Health Camps, Sports & Cultural Heritage."}
              </p>
            </div>
          </div>

          {/* Vision & Motive CTA Button */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => navigate("/vision-goals")}
              className="w-full flex items-center justify-between rounded-2xl bg-gradient-to-r from-[#000080] to-[#138808] p-3.5 text-xs font-bold text-white shadow-md active:scale-95 transition"
            >
              <div className="flex items-center gap-2.5">
                <Award className="h-5 w-5 text-yellow-300 shrink-0" />
                <div className="text-left">
                  <p className="font-black leading-tight">{hi ? "फाउंडेशन का उद्देश्य और विजन देखें" : "Explore Foundation Vision & Motive"}</p>
                  <p className="text-[10px] text-blue-100 font-medium leading-none mt-0.5">Rojgar Mela, Women, Youth & Health</p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-white" />
            </button>
          </div>
        </section>

        {/* Live Weather & Location Bar */}
        <section className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="grid grid-cols-3 divide-x divide-slate-100">
            <div className="p-3">
              <div className="flex items-center gap-1 text-slate-400 mb-0.5">
                <MapPin className="h-3 w-3 text-[#FF9933]" />
                <span className="text-[8.5px] font-black uppercase tracking-wider">{hi ? "स्थान" : "Location"}</span>
              </div>
              <p className="truncate text-xs font-black text-slate-800">{daily.location || (hi ? "पता कर रहे हैं…" : "Locating…")}</p>
            </div>
            <div className="p-3">
              <div className="flex items-center gap-1 text-slate-400 mb-0.5">
                <CloudSun className="h-3 w-3 text-sky-500" />
                <span className="text-[8.5px] font-black uppercase tracking-wider">{hi ? "मौसम" : "Weather"}</span>
              </div>
              <p className="text-sm font-black text-[#000080]">{daily.temp == null ? "—" : `${daily.temp}°C`}</p>
            </div>
            <div className="p-3">
              <div className="flex items-center gap-1 text-slate-400 mb-0.5">
                <Wind className="h-3 w-3 text-emerald-600" />
                <span className="text-[8.5px] font-black uppercase tracking-wider">AQI</span>
              </div>
              <p className="text-sm font-black text-[#138808]">{daily.aqi == null ? "—" : daily.aqi}</p>
            </div>
          </div>
        </section>

        {/* Super-App Quick Action Grid (4x2 Grid) */}
        <section className="mt-4">
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-xs font-black text-[#000080] uppercase tracking-wider">{hi ? "प्रमुख सेवाएं" : "Core Super-App Services"}</h3>
            <button onClick={() => navigate("/services")} className="text-[11px] font-black text-[#FF9933] hover:underline flex items-center gap-0.5">
              {hi ? "सभी देखें" : "View All"} <ChevronRight className="h-3 w-3" />
            </button>
          </div>

          <div className="grid grid-cols-4 gap-2.5">
            {QUICK_ACTIONS.map((act) => (
              <button
                key={act.id}
                type="button"
                onClick={() => navigate(act.route)}
                className="group flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-orange-200 active:scale-95 transition text-center"
              >
                <div className={`w-10 h-10 rounded-2xl ${act.color} flex items-center justify-center mb-2 shadow-sm transition-transform group-hover:scale-110`}>
                  <act.icon className="w-5 h-5" />
                </div>
                <p className="text-[11px] font-black text-slate-800 leading-tight line-clamp-1">{hi ? act.titleHi : act.titleEn}</p>
                <p className="text-[9px] font-bold text-slate-400 leading-none mt-0.5 truncate w-full">{hi ? act.descHi : act.descEn}</p>
              </button>
            ))}
          </div>
        </section>

        {/* Impact & Reels Banner (Redirect to Impact Tab) */}
        <section 
          onClick={() => navigate("/impact")}
          className="mt-4 bg-gradient-to-r from-pink-600 via-purple-600 to-[#000080] rounded-3xl p-5 text-white shadow-md cursor-pointer hover:shadow-lg transition flex items-center justify-between gap-4"
        >
          <div className="space-y-1">
            <span className="text-[9px] font-black uppercase tracking-[.18em] text-pink-200 bg-white/20 px-2 py-0.5 rounded-full">
              Live Reels & Media
            </span>
            <h3 className="text-sm font-black">{hi ? "इंस्टाग्राम रील्स एवं सोशल इम्पैक्ट देखें" : "Watch Instagram Reels & Social Impact"}</h3>
            <p className="text-[11px] text-pink-100 font-medium">Explore live videos, ground transformation & stories.</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shrink-0">
            <ChevronRight className="w-5 h-5 text-white" />
          </div>
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

        {/* Founder & Managing Leadership Section */}
        <section className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 overflow-hidden rounded-2xl border-2 border-[#FF9933] bg-slate-100 shadow-sm shrink-0">
              <img src={founderImg} alt={founderName} className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.visibility = "hidden"; }} />
            </div>
            <div>
              <p className="text-[9px] font-black uppercase tracking-[.18em] text-[#FF9933]">{hi ? "संस्थापक एवं प्रेरणास्रोत" : "Founder & Managing Leadership"}</p>
              <h2 className="text-sm font-black text-[#000080]">{founderName}</h2>
              <p className="text-[10px] font-bold text-slate-500">Vice Chairman & MD, People's Group</p>
            </div>
          </div>
          <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-slate-600 font-medium">
            {founderMessage || (hi ? "संस्थापक का संदेश शीघ्र उपलब्ध होगा।" : "The founder's message will be available shortly.")}
          </p>
          <button onClick={() => navigate("/vision-goals")} className="mt-3 inline-flex items-center gap-1.5 text-xs font-black text-[#000080]">
            {hi ? "विजन और संदेश विस्तार से पढ़ें" : "Read full vision & message"} <ArrowRight className="h-3.5 w-3.5" />
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
