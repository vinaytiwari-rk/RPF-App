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
} from "lucide-react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";

type Lang = "en" | "hi";
type Daily = { temp: number | null; aqi: number | null; location: string };

export default function HomePremium() {
  const { lang } = useOutletContext<{ lang: Lang }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cmsConfig } = useApp();

  const [daily, setDaily] = useState<Daily>({ temp: 28, aqi: 65, location: "Mumbai" });
  const hi = lang === "hi";
  const name = user?.name?.trim().split(/\s+/)[0] || "";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? (hi ? "सुप्रभात" : "Good Morning") : hour < 17 ? (hi ? "शुभ दोपहर" : "Good Afternoon") : (hi ? "शुभ संध्या" : "Good Evening");

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
            temp: weatherResponse?.data?.current?.temperature_2m == null ? 28 : Math.round(Number(weatherResponse.data.current.temperature_2m)),
            aqi: aqi || 65,
            location: address.city || address.town || address.village || address.municipality || "Bhopal",
          });
        } catch {}
      },
      () => undefined,
      { timeout: 7000, maximumAge: 900000 }
    );
  }, []);

  const founderName = cmsConfig.founderName || "Shri Rohit Pandit Ji";

  const QUICK_ACTIONS = [
    { id: "card", labelEn: "Jan Seva Card", labelHi: "जन सेवा कार्ड", icon: HeartHandshake, route: "/jan-seva-card" },
    { id: "blood", labelEn: "Blood Care", labelHi: "ब्लड केयर", icon: HeartPulse, route: "/blood-network" },
    { id: "services", labelEn: "Services", labelHi: "सेवाएं", icon: Wrench, route: "/services" },
    { id: "community", labelEn: "Community", labelHi: "समुदाय", icon: Users, route: "/community" },
    { id: "news", labelEn: "News", labelHi: "समाचार", icon: Newspaper, route: "/news" },
    { id: "sos", labelEn: "SOS Alert", labelHi: "एस.ओ.एस", icon: ShieldAlert, route: "/sos" },
    { id: "radio", labelEn: "Radio Live", labelHi: "रेडियो लाइव", icon: Radio, route: "/internet-radio" },
    { id: "health", labelEn: "Health Care", labelHi: "स्वास्थ्य", icon: Stethoscope, route: "/health-care" },
  ];

  return (
    <main className="min-h-screen bg-[#F7F4EE] text-slate-900 font-sans pb-28 selection:bg-orange-100">
      <div className="mx-auto w-full max-w-md px-4 pt-3 pb-6">

        {/* Header Bar matching image */}
        <header className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/profile")}
              className="w-9 h-9 rounded-full bg-[#EFECE6] border border-slate-200/80 flex items-center justify-center text-slate-700 hover:bg-slate-200 transition"
            >
              <User className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1">
              <h1 className="font-extrabold text-xl tracking-tight text-slate-900 font-serif">Samahit</h1>
              <span className="text-amber-600 text-sm">🪷</span>
            </div>
          </div>

          <div 
            onClick={() => navigate("/services")}
            className="relative flex-1 max-w-[150px] ml-auto cursor-pointer"
          >
            <div className="w-full bg-[#EFECE6] border border-slate-200/80 rounded-full py-1.5 pl-8 pr-3 text-xs text-slate-500 font-bold flex items-center">
              {hi ? "खोजें" : "Search"}
            </div>
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
        </header>

        {/* Hero Banner: RP FOUNDATION VISION (Exact match to uploaded image) */}
        <section
          onClick={() => navigate("/vision-goals")}
          className="mt-1 overflow-hidden rounded-3xl bg-gradient-to-br from-[#D97706] via-[#B45309] to-[#7C2D12] text-white p-6 shadow-xl relative cursor-pointer hover:scale-[1.01] transition-transform duration-300"
        >
          <div className="flex justify-between items-start">
            <div className="space-y-1 max-w-[65%]">
              <p className="text-[11px] font-black tracking-widest text-amber-200 uppercase">RP</p>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-none text-white font-serif drop-shadow-sm">
                FOUNDATION
              </h2>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-none text-white font-serif drop-shadow-sm flex items-center gap-1.5">
                VISION <span className="text-yellow-300 text-lg">🪷</span>
              </h2>
            </div>

            <div className="w-20 h-20 rounded-2xl overflow-hidden border border-white/30 shadow-md shrink-0 bg-amber-950/40">
              <img
                src="/assets/founder.png"
                alt={founderName}
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
            </div>
          </div>

          <div className="mt-6 pt-3 flex items-center justify-between border-t border-white/20">
            <p className="text-xs font-bold text-amber-100">
              {hi ? "राष्ट्र निर्माण एवं जन कल्याण" : "Empowering India Together"}
            </p>
            <button
              type="button"
              className="bg-[#FEF3C7] text-[#7C2D12] text-xs font-black px-4 py-1.5 rounded-full shadow-md hover:bg-white transition"
            >
              {hi ? "विवरण देखें" : "Learn More"}
            </button>
          </div>
        </section>

        {/* Quick Actions (Exact 4x2 Grid matching image) */}
        <section className="mt-5 space-y-2.5">
          <h3 className="text-xs font-black text-slate-900 tracking-wide uppercase">{hi ? "त्वरित सेवाएं" : "Quick Actions"}</h3>
          
          <div className="grid grid-cols-4 gap-2.5">
            {QUICK_ACTIONS.map((act) => (
              <button
                key={act.id}
                type="button"
                onClick={() => navigate(act.route)}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#EFECE6] border border-slate-200/60 hover:bg-[#E7E3DC] active:scale-95 transition text-center shadow-xs"
              >
                <div className="w-7 h-7 flex items-center justify-center text-slate-800 mb-1.5">
                  <act.icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black text-slate-800 leading-tight line-clamp-1">{hi ? act.labelHi : act.labelEn}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Weather Card (Exact match to image) */}
        <section className="mt-5 bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500">{greeting}, {daily.location || "India"}</p>
            <h2 className="text-3xl font-black text-slate-900 mt-1">{daily.temp == null ? "28°C" : `${daily.temp}°C`}</h2>
          </div>
          <div className="text-right">
            <CloudSun className="w-9 h-9 text-amber-500 inline-block mb-1" />
            <p className="text-[10px] font-bold text-slate-400">H:31° L:26°</p>
            <p className="text-xs font-bold text-slate-600">Partly Cloudy</p>
          </div>
        </section>

        {/* Impact Today Section (Exact match to image) */}
        <section className="mt-5 space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-900 tracking-wide uppercase">{hi ? "आज का प्रभाव" : "Impact Today"}</h3>
            <button onClick={() => navigate("/impact")} className="text-[10px] font-bold text-amber-700 flex items-center">
              View All <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div
              onClick={() => navigate("/impact")}
              className="relative h-28 rounded-2xl overflow-hidden bg-slate-900 text-white p-3.5 flex items-end cursor-pointer shadow-sm group"
            >
              <img
                src="/assets/rpf-samahit-icon.png"
                alt="Impact"
                className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-105 transition-transform"
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
              <p className="relative z-10 text-xs font-black leading-snug drop-shadow-md">
                Education & Health Project Update
              </p>
            </div>

            <div
              onClick={() => navigate("/impact")}
              className="h-28 rounded-2xl bg-white border border-slate-200/80 p-3.5 flex flex-col justify-between cursor-pointer shadow-sm"
            >
              <div>
                <p className="text-xs font-black text-slate-900 leading-snug">Rojgar Mela & Skill Drives</p>
                <p className="text-[10px] font-bold text-[#138808] mt-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#FF9933]" /> Active Ground Initiative
                </p>
              </div>
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 pt-1 border-t border-slate-100">
                <span>View Details</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </div>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
