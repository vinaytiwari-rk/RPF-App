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

  const [daily, setDaily] = useState<Daily>({ temp: 28, aqi: 65, location: "Bhopal" });
  const hi = lang === "hi";
  const rawName = user?.name?.trim().split(/\s+/)[0] || "";
  const displayName = rawName ? rawName : (hi ? "नागरिक" : "Citizen");
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
    { id: "card", labelEn: "Jan Seva Card", labelHi: "जन सेवा कार्ड", icon: HeartHandshake, route: "/jan-seva-card", color: "bg-[#FFF9E6] border border-amber-200 text-amber-700 shadow-xs" },
    { id: "blood", labelEn: "Blood Care", labelHi: "ब्लड केयर", icon: HeartPulse, route: "/blood-network", color: "bg-[#FFEEEE] border border-rose-200 text-rose-600 shadow-xs" },
    { id: "services", labelEn: "Services", labelHi: "सेवाएं", icon: Wrench, route: "/services", color: "bg-[#EAF8EE] border border-emerald-200 text-emerald-700 shadow-xs" },
    { id: "community", labelEn: "Community", labelHi: "समुदाय", icon: Users, route: "/community", color: "bg-[#F3E8FF] border border-purple-200 text-purple-700 shadow-xs" },
    { id: "news", labelEn: "News", labelHi: "समाचार", icon: Newspaper, route: "/news", color: "bg-[#FFF2E5] border border-orange-200 text-orange-700 shadow-xs" },
    { id: "sos", labelEn: "SOS Alert", labelHi: "एस.ओ.एस", icon: ShieldAlert, route: "/sos", color: "bg-red-50 border border-red-200 text-red-600 shadow-xs" },
    { id: "radio", labelEn: "Radio Live", labelHi: "रेडियो लाइव", icon: Radio, route: "/internet-radio", color: "bg-emerald-50 border border-emerald-200 text-emerald-700 shadow-xs" },
    { id: "health", labelEn: "Health Care", labelHi: "स्वास्थ्य", icon: Stethoscope, route: "/health-care", color: "bg-teal-50 border border-teal-200 text-teal-700 shadow-xs" },
  ];

  return (
    <main className="min-h-screen bg-[#FAF9F6] text-slate-800 font-sans pb-28 selection:bg-orange-100">
      <div className="mx-auto w-full max-w-md px-4 pt-3 pb-6">

        {/* Personalized Header Bar (Good Morning/Afternoon/Evening, Name) */}
        <header className="flex items-center justify-between pb-3.5 border-b border-orange-100/80">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/profile")}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-100 to-amber-50 border border-orange-200 flex items-center justify-center text-[#FF9933] hover:scale-105 transition shadow-xs"
            >
              <User className="w-5 h-5 text-[#FF9933]" />
            </button>
            <div>
              <h1 className="font-extrabold text-sm text-slate-900 tracking-tight flex items-center gap-1.5">
                <span>{greeting}, {displayName}</span>
                <span className="text-sm">👋</span>
              </h1>
              <p className="text-[10px] font-black uppercase tracking-wider text-[#FF9933] flex items-center gap-1 mt-0.5">
                <Sparkles className="w-3 h-3 text-[#FF9933]" />
                Samahit • An Initiative of RP Foundation
              </p>
            </div>
          </div>

          <div 
            onClick={() => navigate("/services")}
            className="relative cursor-pointer"
          >
            <div className="bg-white border border-orange-200/90 rounded-full py-1.5 px-3.5 text-xs text-slate-500 font-bold flex items-center gap-1.5 shadow-xs hover:border-[#FF9933] transition">
              <Search className="w-3.5 h-3.5 text-[#FF9933]" />
              <span>{hi ? "खोजें" : "Search"}</span>
            </div>
          </div>
        </header>

        {/* Hero Banner: RP FOUNDATION VISION (Vibrant Saffron-Gold Tricolor Card) */}
        <section
          onClick={() => navigate("/vision-goals")}
          className="mt-3.5 overflow-hidden rounded-3xl bg-gradient-to-br from-[#FF9933] via-[#F59E0B] to-[#D97706] text-white p-5 sm:p-6 shadow-lg relative cursor-pointer hover:scale-[1.008] transition-all duration-300 border border-amber-200/50 group"
        >
          {/* Top Tricolor Strip */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />

          <div className="flex justify-between items-start gap-3">
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 border border-white/30 px-2.5 py-0.5 text-[9.5px] font-black uppercase tracking-wider text-white backdrop-blur-md">
                <Sparkles className="w-3 h-3 text-amber-200" />
                RP Foundation
              </div>

              <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-tight text-white font-serif drop-shadow-xs">
                {hi ? "आर.पी. फाउंडेशन विज़न" : "RP Foundation Vision"}
              </h2>

              <p className="text-xs font-bold text-amber-100 leading-snug">
                {hi ? "श्री रोहित पंडित जी का नेतृत्व एवं विचार" : "Pioneered by Shri Rohit Pandit Ji"}
              </p>

              <p className="text-[10.5px] font-medium text-white/95 leading-relaxed pt-0.5 line-clamp-2">
                {hi ? "रोजगार मेला • महिला स्वावलंबन • निःशुल्क स्वास्थ्य • खेलकूद प्रोत्साहन" : "Rojgar Melas • Pink E-Rickshaws • Health Camps • Youth Sports"}
              </p>
            </div>

            {/* Founder Portrait Box */}
            <div className="relative shrink-0">
              <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl overflow-hidden border-2 border-white/80 shadow-xl bg-white group-hover:scale-105 transition-transform duration-300">
                <img
                  src="/assets/founder.png"
                  alt={founderName}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
              </div>
              <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-white text-[#D97706] text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full shadow-md whitespace-nowrap border border-amber-200">
                Founder
              </span>
            </div>
          </div>

          {/* Card Footer Bar */}
          <div className="bg-white/15 border-t border-white/20 -mx-5 -mb-5 sm:-mx-6 sm:-mb-6 px-5 py-3 flex items-center justify-between backdrop-blur-xs mt-4">
            <p className="text-xs font-bold text-white">
              {hi ? "राष्ट्र निर्माण एवं जन कल्याण" : "Nation Building & Public Welfare"}
            </p>
            <button
              type="button"
              className="bg-white text-[#D97706] text-xs font-black px-4 py-1.5 rounded-xl shadow-md hover:bg-amber-50 transition flex items-center gap-1"
            >
              <span>{hi ? "विवरण देखें" : "Learn More"}</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#D97706]" />
            </button>
          </div>
        </section>

        {/* Quick Actions (Realistic Icon Badges) */}
        <section className="mt-5 space-y-2.5">
          <h3 className="text-xs font-black text-slate-800 tracking-wide uppercase">{hi ? "त्वरित सेवाएं" : "Quick Actions"}</h3>
          
          <div className="grid grid-cols-4 gap-2.5">
            {QUICK_ACTIONS.map((act) => (
              <button
                key={act.id}
                type="button"
                onClick={() => navigate(act.route)}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-orange-100/80 hover:border-[#FF9933]/50 active:scale-95 transition text-center shadow-xs group"
              >
                <div className={`w-9 h-9 rounded-xl ${act.color} flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform`}>
                  <act.icon className="w-4.5 h-4.5" />
                </div>
                <span className="text-[10px] font-black text-slate-800 leading-tight line-clamp-1">{hi ? act.labelHi : act.labelEn}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Weather Card */}
        <section className="mt-5 bg-gradient-to-br from-white to-orange-50/30 rounded-3xl p-5 border border-orange-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500">{daily.location || "Bhopal, India"}</p>
            <h2 className="text-3xl font-black text-slate-900 mt-1">{daily.temp == null ? "28°C" : `${daily.temp}°C`}</h2>
          </div>
          <div className="text-right">
            <CloudSun className="w-9 h-9 text-[#FF9933] inline-block mb-1" />
            <p className="text-[10px] font-bold text-slate-400">AQI: {daily.aqi || 65}</p>
            <p className="text-xs font-bold text-slate-700">Partly Cloudy</p>
          </div>
        </section>

        {/* Key Welfare Initiatives Section */}
        <section className="mt-5 space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-800 tracking-wide uppercase">{hi ? "प्रमुख समाज कल्याण योजनाएं" : "Key Welfare Initiatives"}</h3>
            <button onClick={() => navigate("/vision-goals")} className="text-[10px] font-bold text-[#FF9933] flex items-center">
              {hi ? "सभी जानें" : "Explore All"} <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div
              onClick={() => navigate("/vision-goals")}
              className="relative h-28 rounded-2xl overflow-hidden bg-gradient-to-br from-[#FF9933] to-[#D97706] text-white p-3.5 flex flex-col justify-between cursor-pointer shadow-xs group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-black uppercase tracking-wider text-white bg-white/20 px-2 py-0.5 rounded-full">
                  Foundation
                </span>
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <p className="relative z-10 text-xs font-black leading-snug drop-shadow-xs text-white font-serif">
                {hi ? "आर.पी. फाउंडेशन विज़न एवं उद्देश्य" : "RP Foundation Vision & Mission"}
              </p>
            </div>

            <div
              onClick={() => navigate("/impact")}
              className="h-28 rounded-2xl bg-gradient-to-br from-[#138808] to-[#15803D] text-white p-3.5 flex flex-col justify-between cursor-pointer shadow-xs hover:brightness-105 transition"
            >
              <div>
                <p className="text-xs font-black text-white leading-snug">{hi ? "सोशल मीडिया एवं लाइव रील्स" : "Live Media & Reels Gallery"}</p>
                <p className="text-[10px] font-bold text-emerald-100 mt-1 flex items-center gap-1">
                  @rpfoundationofficial
                </p>
              </div>
              <div className="flex items-center justify-between text-[10px] font-bold text-white pt-1 border-t border-white/20">
                <span>{hi ? "रील्स देखें" : "Watch Reels"}</span>
                <ChevronRight className="w-3.5 h-3.5 text-white" />
              </div>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
