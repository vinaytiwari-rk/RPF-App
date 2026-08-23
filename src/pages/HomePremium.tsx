import React, { useEffect, useState } from "react";
import {
  User,
  Search,
  CloudSun,
  HeartHandshake,
  HeartPulse,
  Wrench,
  Users,
  Newspaper,
  ShieldAlert,
  Radio,
  Stethoscope,
  ChevronRight,
  Sparkles,
  Landmark,
  ExternalLink,
  MapPin,
  RefreshCw,
} from "lucide-react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";

type Lang = "en" | "hi";
type Daily = { temp: number | null; aqi: number | null; location: string | null; condition: string | null };

export default function HomePremium() {
  const { lang } = useOutletContext<{ lang: Lang }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cmsConfig } = useApp();
  const [daily, setDaily] = useState<Daily>({ temp: null, aqi: null, location: null, condition: null });
  const [weatherStatus, setWeatherStatus] = useState<"idle" | "loading" | "ready" | "unavailable">("idle");

  const hi = lang === "hi";
  const rawName = user?.name?.trim().split(/\s+/)[0] || "";
  const displayName = rawName || (hi ? "नागरिक" : "Citizen");
  const hour = new Date().getHours();
  const greeting = hour < 12 ? (hi ? "सुप्रभात" : "Good Morning") : hour < 17 ? (hi ? "शुभ दोपहर" : "Good Afternoon") : (hi ? "शुभ संध्या" : "Good Evening");

  const loadLocalConditions = () => {
    if (!navigator.geolocation) {
      setWeatherStatus("unavailable");
      return;
    }
    setWeatherStatus("loading");
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const [weatherResponse, locationResponse] = await Promise.all([
            fetch(`/api/public/weather?lat=${coords.latitude}&lon=${coords.longitude}`).then((r) => (r.ok ? r.json() : null)),
            fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords.latitude}&lon=${coords.longitude}`).then((r) => (r.ok ? r.json() : null)),
          ]);
          let aqi: number | null = null;
          try {
            const a = await fetch(`https://api.waqi.info/feed/geo:${coords.latitude};${coords.longitude}/?token=83274cc3f5749b4ec7b5b6c7b9f40464debbd6b1`).then((r) => r.json());
            if (a?.status === "ok" && Number.isFinite(Number(a.data?.aqi))) aqi = Number(a.data.aqi);
          } catch {}
          const current = weatherResponse?.data?.current;
          const address = locationResponse?.address || {};
          const temp = current?.temperature_2m == null ? null : Math.round(Number(current.temperature_2m));
          const location = address.city || address.town || address.village || address.municipality || null;
          setDaily({ temp, aqi, location, condition: current?.weather_text || null });
          setWeatherStatus(temp !== null || location || aqi !== null ? "ready" : "unavailable");
        } catch {
          setWeatherStatus("unavailable");
        }
      },
      () => setWeatherStatus("unavailable"),
      { timeout: 7000, maximumAge: 900000 }
    );
  };

  useEffect(() => {
    loadLocalConditions();
  }, []);

  const founderName = cmsConfig.founderName || "Shri Rohit Pandit Ji";

  const QUICK_ACTIONS = [
    { id: "card", labelEn: "Jan Seva Card", labelHi: "जन सेवा कार्ड", icon: HeartHandshake, route: "/jan-seva-card", color: "from-orange-400 to-amber-500" },
    { id: "services", labelEn: "Govt Services", labelHi: "सरकारी सेवाएं", icon: Landmark, route: "/services", color: "from-blue-500 to-indigo-600" },
    { id: "blood", labelEn: "Blood Care", labelHi: "ब्लड केयर", icon: HeartPulse, route: "/blood-network", color: "from-rose-500 to-red-600" },
    { id: "health", labelEn: "Health Care", labelHi: "स्वास्थ्य", icon: Stethoscope, route: "/health-care", color: "from-teal-500 to-emerald-600" },
    { id: "community", labelEn: "Community", labelHi: "समुदाय", icon: Users, route: "/community", color: "from-purple-500 to-violet-600" },
    { id: "news", labelEn: "News", labelHi: "समाचार", icon: Newspaper, route: "/news", color: "from-amber-500 to-yellow-600" },
    { id: "radio", labelEn: "Radio Live", labelHi: "रेडियो लाइव", icon: Radio, route: "/internet-radio", color: "from-emerald-500 to-green-600" },
    { id: "sos", labelEn: "Emergency", labelHi: "आपातकाल", icon: ShieldAlert, route: "/sos", color: "from-red-600 to-rose-700" },
  ];

  return (
    <main className="min-h-screen bg-[#FAF9F6] text-slate-800 font-sans pb-28 selection:bg-orange-100">
      <div className="mx-auto w-full max-w-md px-4 pt-3 pb-6 space-y-5">
        <header className="flex items-center justify-between pb-3.5 border-b border-orange-100/80">
          <div className="flex items-center gap-3">
            <button aria-label={hi ? "प्रोफ़ाइल" : "Profile"} onClick={() => navigate("/profile")} className="w-11 h-11 rounded-full bg-gradient-to-br from-orange-100 to-amber-50 border border-orange-200 flex items-center justify-center text-[#FF9933] hover:scale-105 transition shadow-xs">
              <User className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-extrabold text-sm text-slate-900 tracking-tight flex items-center gap-1.5"><span>{greeting}, {displayName}</span><span>👋</span></h1>
              <p className="text-[10px] font-black uppercase tracking-wider text-[#FF9933] flex items-center gap-1 mt-0.5"><Sparkles className="w-3 h-3" />समाहित • RP Foundation</p>
            </div>
          </div>
          <button type="button" onClick={() => navigate("/services")} className="min-h-11 bg-white border border-orange-200/90 rounded-full px-3.5 text-xs text-slate-600 font-bold flex items-center gap-1.5 shadow-xs hover:border-[#FF9933] transition">
            <Search className="w-4 h-4 text-[#FF9933]" /><span>{hi ? "खोजें" : "Search"}</span>
          </button>
        </header>

        <section onClick={() => navigate("/vision-goals")} className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#FF9933] via-[#F59E0B] to-[#D97706] text-white p-5 shadow-lg relative cursor-pointer border border-amber-200/50 group">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />
          <div className="flex justify-between items-start gap-3">
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 border border-white/30 px-2.5 py-1 text-[9px] font-black uppercase tracking-wider"><Sparkles className="w-3 h-3 text-amber-200" />RP Foundation</div>
              <h2 className="text-xl font-black tracking-tight leading-tight font-serif">{hi ? "आर.पी. फाउंडेशन विज़न" : "RP Foundation Vision"}</h2>
              <p className="text-xs font-bold text-amber-100">{hi ? "श्री रोहित पंडित जी का नेतृत्व एवं विचार" : "Pioneered by Shri Rohit Pandit Ji"}</p>
              <p className="text-[10.5px] font-medium text-white/95 leading-relaxed">{hi ? "राष्ट्र निर्माण एवं जन कल्याण के लिए एकीकृत सेवा मंच" : "An integrated service platform for nation building and public welfare"}</p>
            </div>
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-white/80 shadow-xl bg-white"><img src="/assets/founder.png" alt={founderName} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} /></div>
              <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-white text-[#D97706] text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full shadow-md whitespace-nowrap border border-amber-200">Founder</span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-5 pt-3 border-t border-white/20"><p className="text-xs font-bold">{hi ? "विस्तार से जानें" : "Explore the vision"}</p><ChevronRight className="w-4 h-4" /></div>
        </section>

        <section className="space-y-2.5">
          <div className="flex items-end justify-between"><div><p className="text-[10px] font-black tracking-widest text-[#FF9933] uppercase">{hi ? "शुरुआत करें" : "Start here"}</p><h3 className="text-base font-black text-slate-900">{hi ? "आपको किस सेवा की आवश्यकता है?" : "What do you need help with?"}</h3></div><button onClick={() => navigate("/services")} className="text-[11px] font-black text-[#D97706] flex items-center">{hi ? "सभी सेवाएं" : "All services"}<ChevronRight className="w-4 h-4" /></button></div>
          <div className="grid grid-cols-4 gap-2.5">
            {QUICK_ACTIONS.map((act) => (
              <button key={act.id} type="button" onClick={() => navigate(act.route)} className="min-h-[96px] flex flex-col items-center justify-center p-2 rounded-2xl bg-white border border-orange-100/80 hover:border-[#FF9933]/50 active:scale-95 transition text-center shadow-xs group">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${act.color} text-white flex items-center justify-center mb-1.5 shadow-sm group-hover:scale-105 transition-transform`}><act.icon className="w-5 h-5" /></div>
                <span className="text-[9.5px] font-black text-slate-800 leading-tight">{hi ? act.labelHi : act.labelEn}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-3xl bg-white border border-orange-100 p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3"><div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-[#FF9933]" /><div><p className="text-xs font-black text-slate-800">{daily.location || (hi ? "स्थानीय जानकारी" : "Local conditions")}</p><p className="text-[10px] text-slate-500">{hi ? "आपकी अनुमति से वर्तमान स्थान के आधार पर" : "Based on your location, with permission"}</p></div></div><button aria-label={hi ? "ताज़ा करें" : "Refresh"} onClick={loadLocalConditions} className="w-10 h-10 rounded-xl border border-orange-100 flex items-center justify-center text-[#D97706]"><RefreshCw className={`w-4 h-4 ${weatherStatus === "loading" ? "animate-spin" : ""}`} /></button></div>
          {weatherStatus === "ready" ? <div className="flex items-end justify-between"><div><p className="text-3xl font-black text-slate-900">{daily.temp === null ? "—" : `${daily.temp}°C`}</p><p className="text-[11px] font-bold text-slate-500">{daily.condition || (hi ? "वर्तमान मौसम" : "Current conditions")}</p></div><div className="text-right"><CloudSun className="w-8 h-8 text-[#FF9933] inline-block mb-1" />{daily.aqi !== null && <p className="text-[10px] font-bold text-slate-500">AQI: {daily.aqi}</p>}</div></div> : <p className="text-xs font-medium text-slate-500">{weatherStatus === "loading" ? (hi ? "वर्तमान जानकारी लोड हो रही है…" : "Loading current conditions…") : (hi ? "स्थान या लाइव मौसम डेटा उपलब्ध नहीं है।" : "Location or live weather data is unavailable.")}</p>}
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between"><div><p className="text-[10px] font-black tracking-widest text-[#138808] uppercase">{hi ? "सरकार पहले" : "Government first"}</p><h3 className="text-base font-black text-slate-900">{hi ? "आधिकारिक सेवाओं तक पहुँचें" : "Access official services"}</h3></div><Landmark className="w-5 h-5 text-[#138808]" /></div>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => navigate("/services")} className="text-left min-h-28 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 p-4"><Landmark className="w-6 h-6 text-blue-700 mb-3" /><p className="text-xs font-black text-slate-900">{hi ? "सरकारी सेवाएं" : "Government Services"}</p><p className="text-[10px] font-medium text-slate-500 mt-1">{hi ? "एक जगह से खोजें" : "Find services in one place"}</p></button>
            <button onClick={() => navigate("/blood-network")} className="text-left min-h-28 rounded-2xl bg-gradient-to-br from-rose-50 to-red-50 border border-rose-100 p-4"><HeartPulse className="w-6 h-6 text-rose-700 mb-3" /><p className="text-xs font-black text-slate-900">{hi ? "ब्लड डोनेशन सहायता" : "Blood Donation Help"}</p><p className="text-[10px] font-medium text-slate-500 mt-1">{hi ? "सरकारी और RPF संसाधन" : "Government and RPF resources"}</p></button>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3">
          <button onClick={() => navigate("/impact")} className="rounded-2xl bg-gradient-to-br from-[#138808] to-[#15803D] text-white p-4 text-left min-h-28"><p className="text-[10px] font-black uppercase tracking-wider text-emerald-100">RPF Media</p><p className="mt-2 text-sm font-black leading-snug">{hi ? "वीडियो और सोशल अपडेट" : "Video & social updates"}</p><span className="mt-3 inline-flex items-center gap-1 text-[10px] font-bold">{hi ? "देखें" : "Explore"}<ChevronRight className="w-3.5 h-3.5" /></span></button>
          <button onClick={() => navigate("/community")} className="rounded-2xl bg-white border border-orange-100 p-4 text-left min-h-28"><Users className="w-6 h-6 text-[#FF9933]" /><p className="mt-3 text-sm font-black text-slate-900">{hi ? "RPF समुदाय" : "RPF Community"}</p><span className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-[#D97706]">{hi ? "जुड़ें" : "Connect"}<ExternalLink className="w-3.5 h-3.5" /></span></button>
        </section>
      </div>
    </main>
  );
}
