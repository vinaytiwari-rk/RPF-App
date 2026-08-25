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
  Quote,
  Share2,
  TrendingUp,
} from "lucide-react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";

type Lang = "en" | "hi";
type Daily = {
  temp: number | null;
  aqi: number | null;
  location: string;
  conditionText?: string;
  conditionIcon?: string;
};

const WEATHER_API_KEY = "f54f6cb62e264dabb1990414262508";

// Standard Indian CPCB AQI Calculation from PM2.5 concentration (ug/m3)
function getIndianAqi(pm25?: number, pm10?: number): number {
  if (pm25 == null || isNaN(pm25)) {
    if (pm10 != null && !isNaN(pm10)) {
      if (pm10 <= 50) return Math.round((50 / 50) * pm10);
      if (pm10 <= 100) return Math.round(50 + ((100 - 50) / (100 - 50)) * (pm10 - 50));
      if (pm10 <= 250) return Math.round(100 + ((200 - 100) / (250 - 100)) * (pm10 - 100));
      return Math.round(200 + ((300 - 200) / (350 - 250)) * (pm10 - 250));
    }
    return 65;
  }
  if (pm25 <= 30) return Math.round((50 / 30) * pm25);
  if (pm25 <= 60) return Math.round(50 + ((100 - 50) / (30)) * (pm25 - 30));
  if (pm25 <= 90) return Math.round(100 + ((200 - 100) / (30)) * (pm25 - 60));
  if (pm25 <= 120) return Math.round(200 + ((300 - 200) / (30)) * (pm25 - 90));
  if (pm25 <= 250) return Math.round(300 + ((400 - 300) / (130)) * (pm25 - 120));
  return Math.round(400 + ((500 - 400) / (130)) * (pm25 - 250));
}

export default function HomePremium() {
  const { lang } = useOutletContext<{ lang: Lang }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cmsConfig } = useApp();

  const [daily, setDaily] = useState<Daily>({
    temp: 27,
    aqi: 65,
    location: "Bhopal",
    conditionText: "Partly Cloudy",
  });
  const hi = lang === "hi";
  const rawName = user?.name?.trim().split(/\s+/)[0] || "";
  const displayName = rawName ? rawName : (hi ? "नागरिक" : "Citizen");
  const hour = new Date().getHours();
  const greeting = hour < 12 ? (hi ? "सुप्रभात" : "Good Morning") : hour < 17 ? (hi ? "शुभ दोपहर" : "Good Afternoon") : (hi ? "शुभ संध्या" : "Good Evening");

  useEffect(() => {
    const fetchWeather = async (query: string) => {
      try {
        const res = await fetch(
          `https://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(query)}&aqi=yes`
        );
        if (res.ok) {
          const data = await res.json();
          if (data?.current && data?.location) {
            const pm25 = data.current.air_quality?.pm2_5;
            const pm10 = data.current.air_quality?.pm10;
            const calcAqi = getIndianAqi(pm25, pm10);

            const iconUrl = data.current.condition?.icon
              ? data.current.condition.icon.startsWith("//")
                ? `https:${data.current.condition.icon}`
                : data.current.condition.icon
              : undefined;

            setDaily({
              temp: Math.round(data.current.temp_c),
              aqi: calcAqi,
              location: data.location.name || "Bhopal",
              conditionText: data.current.condition?.text || "Partly Cloudy",
              conditionIcon: iconUrl,
            });
          }
        }
      } catch (e) {
        console.warn("WeatherAPI live fetch fallback:", e);
      }
    };

    fetchWeather("Bhopal,India");

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          fetchWeather(`${coords.latitude},${coords.longitude}`);
        },
        () => undefined,
        { timeout: 7000, maximumAge: 900000 }
      );
    }
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

        {/* Hero Banner: RP FOUNDATION VISION (Harmonized Off-White & Saffron Card) */}
        <section
          onClick={() => navigate("/vision-goals")}
          className="mt-3.5 overflow-hidden rounded-3xl bg-white text-slate-900 p-5 sm:p-6 shadow-xs relative cursor-pointer hover:shadow-md transition-all duration-300 border border-orange-200/80 group"
        >
          {/* Top Tricolor Accent Line */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#FF9933] via-[#F59E0B] to-[#138808]" />

          <div className="flex justify-between items-start gap-3">
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 border border-orange-200 px-2.5 py-0.5 text-[9.5px] font-black uppercase tracking-wider text-[#FF9933]">
                <Sparkles className="w-3 h-3 text-[#FF9933]" />
                RP Foundation Vision
              </div>

              <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-tight text-slate-900 font-serif">
                {hi ? "आर.पी. फाउंडेशन विज़न" : "RP Foundation Vision"}
              </h2>

              <p className="text-xs font-bold text-[#FF9933] leading-snug">
                {hi ? "श्री रोहित पंडित जी का नेतृत्व एवं विचार" : "Pioneered by Shri Rohit Pandit Ji"}
              </p>

              <p className="text-[10.5px] font-medium text-slate-600 leading-relaxed pt-0.5 line-clamp-2">
                {hi ? "रोजगार मेला • महिला स्वावलंबन • निःशुल्क स्वास्थ्य • खेलकूद प्रोत्साहन" : "Rojgar Melas • Pink E-Rickshaws • Health Camps • Youth Sports"}
              </p>
            </div>

            {/* Founder Portrait Box */}
            <div className="relative shrink-0">
              <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl overflow-hidden border-2 border-orange-200/80 shadow-md bg-orange-50 group-hover:scale-105 transition-transform duration-300">
                <img
                  src="/assets/founder.png"
                  alt={founderName}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
              </div>
              <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 bg-[#FF9933] text-white text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full shadow-md whitespace-nowrap">
                Founder
              </span>
            </div>
          </div>

          {/* Card Footer Bar */}
          <div className="bg-orange-50/70 border-t border-orange-100 -mx-5 -mb-5 sm:-mx-6 sm:-mb-6 px-5 py-3 flex items-center justify-between mt-4">
            <p className="text-xs font-black text-slate-800">
              {hi ? "राष्ट्र निर्माण एवं जन कल्याण" : "Nation Building & Public Welfare"}
            </p>
            <button
              type="button"
              className="bg-[#FF9933] text-white text-xs font-black px-4 py-1.5 rounded-xl shadow-xs hover:bg-orange-600 transition flex items-center gap-1"
            >
              <span>{hi ? "विवरण देखें" : "Learn More"}</span>
              <ChevronRight className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        </section>

        {/* Quote of the Day (Daily Seva Thought by Shri Rohit Pandit Ji) */}
        <section className="mt-4 bg-[#FFFDF7] rounded-3xl p-5 border border-amber-200/90 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between pb-2.5 border-b border-amber-100 mb-3">
            <div className="flex items-center gap-2">
              <Quote className="w-4 h-4 text-[#FF9933]" />
              <span className="text-[11px] font-black uppercase tracking-wider text-[#FF9933]">
                {hi ? "दैनिक सेवा विचार" : "Quote of the Day"}
              </span>
            </div>
            <span className="text-[9px] font-black text-amber-700/80 uppercase tracking-widest bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
              RP Foundation
            </span>
          </div>
          <blockquote className="text-xs font-bold text-slate-800 leading-relaxed italic font-serif">
            "{cmsConfig.quoteOfTheDayEn || "True public service lies in empowering every citizen with dignity, self-reliance, and accessible welfare."}"
          </blockquote>
          <div className="mt-3 flex items-center justify-between pt-2.5 border-t border-amber-100/70">
            <p className="text-[10px] font-black text-[#D97706] uppercase tracking-wider">
              — {founderName}
            </p>
            <button
              type="button"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: "Daily Seva Thought",
                    text: `"${cmsConfig.quoteOfTheDayEn || "True public service lies in empowering every citizen with dignity, self-reliance, and accessible welfare."}" — ${founderName}`,
                    url: window.location.href,
                  }).catch(() => undefined);
                }
              }}
              className="text-[10px] font-extrabold text-[#FF9933] bg-orange-50 hover:bg-orange-100 border border-orange-200 px-3 py-1 rounded-xl transition flex items-center gap-1.5"
            >
              <Share2 className="w-3 h-3 text-[#FF9933]" />
              <span>{hi ? "साझा करें" : "Share Quote"}</span>
            </button>
          </div>
        </section>

        {/* Live Seva Impact Metrics Bar */}
        <section className="mt-4 bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-600 rounded-3xl p-4 text-white shadow-md">
          <div className="flex items-center justify-between pb-2 border-b border-white/20">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-amber-200" />
              <span className="text-[10px] font-black uppercase tracking-wider text-white">
                {hi ? "RP Foundation का लाइव प्रभाव" : "RP Foundation Live Impact"}
              </span>
            </div>
            <span className="text-[9px] font-bold text-amber-100 bg-white/20 px-2 py-0.5 rounded-full">100% Real Impact</span>
          </div>
          <div className="grid grid-cols-4 gap-2 mt-3 text-center">
            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-2 border border-white/20">
              <p className="text-sm sm:text-base font-black text-amber-200">5,000+</p>
              <p className="text-[8px] font-extrabold uppercase text-white/90 leading-tight mt-0.5">{hi ? "रोजगार अवसर" : "Jobs Provided"}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-2 border border-white/20">
              <p className="text-sm sm:text-base font-black text-rose-200">150+</p>
              <p className="text-[8px] font-extrabold uppercase text-white/90 leading-tight mt-0.5">{hi ? "पिंक रिक्शा" : "Pink Rickshaws"}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-2 border border-white/20">
              <p className="text-sm sm:text-base font-black text-emerald-200">50,000+</p>
              <p className="text-[8px] font-extrabold uppercase text-white/90 leading-tight mt-0.5">{hi ? "स्वास्थ्य लाभ" : "Health Aid"}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-2 border border-white/20">
              <p className="text-sm sm:text-base font-black text-sky-200">1,000+</p>
              <p className="text-[8px] font-extrabold uppercase text-white/90 leading-tight mt-0.5">{hi ? "युवा प्रतिभा" : "Youth Sports"}</p>
            </div>
          </div>
        </section>

        {/* Quick Actions (Clean NGO Service Badges) */}
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
                <div className={`w-10 h-10 rounded-2xl ${act.color} flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform overflow-hidden`}>
                  <act.icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black text-slate-800 leading-tight line-clamp-1">{hi ? act.labelHi : act.labelEn}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Weather Card (Live Real-Time Feed via WeatherAPI.com) */}
        <section className="mt-5 bg-gradient-to-br from-white via-orange-50/20 to-orange-50/40 rounded-3xl p-5 border border-orange-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-black text-slate-600">{daily.location || "Bhopal"}</p>
            <h2 className="text-3xl font-black text-slate-900 mt-0.5">{daily.temp == null ? "27°C" : `${daily.temp}°C`}</h2>
          </div>
          <div className="text-right flex flex-col items-end">
            {daily.conditionIcon ? (
              <img src={daily.conditionIcon} alt="Weather" className="w-10 h-10 object-contain -mb-1" />
            ) : (
              <CloudSun className="w-9 h-9 text-[#FF9933] inline-block mb-1" />
            )}
            <p className="text-[10px] font-extrabold text-slate-400">AQI: {daily.aqi || 159}</p>
            <p className="text-xs font-black text-slate-800">{daily.conditionText || "Partly Cloudy"}</p>
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
