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
    <main className="min-h-screen bg-[#FAF0E6] text-[#2D241E] font-sans pb-28 selection:bg-[#E8DCD1]">
      <div className="mx-auto w-full max-w-md px-4 pt-3 pb-6">

        {/* Header Bar matching Almond Theme */}
        <header className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/profile")}
              className="w-9 h-9 rounded-full bg-[#FFFBF7] border border-[#E8DCD1] flex items-center justify-center text-[#8C5A3C] hover:bg-[#F5ECE2] transition shadow-xs"
            >
              <User className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1">
              <h1 className="font-black text-xl tracking-tight text-[#2D241E] font-serif">Samahit</h1>
              <span className="text-[#8C5A3C] text-sm">🪷</span>
            </div>
          </div>

          <div 
            onClick={() => navigate("/services")}
            className="relative flex-1 max-w-[150px] ml-auto cursor-pointer"
          >
            <div className="w-full bg-[#FFFBF7] border border-[#E8DCD1] rounded-full py-1.5 pl-8 pr-3 text-xs text-[#7A6A5D] font-bold flex items-center shadow-xs">
              {hi ? "खोजें" : "Search"}
            </div>
            <Search className="w-3.5 h-3.5 text-[#8C5A3C] absolute left-2.5 top-2.5" />
          </div>
        </header>

        {/* Hero Banner: RP FOUNDATION VISION (Luxury Almond Warm Card) */}
        <section
          onClick={() => navigate("/vision-goals")}
          className="mt-1 overflow-hidden rounded-3xl bg-gradient-to-br from-[#A67C52] via-[#8C5A3C] to-[#5C3A24] text-white p-6 shadow-lg relative cursor-pointer hover:scale-[1.01] transition-transform duration-300 border border-[#E8DCD1]/50"
        >
          <div className="flex justify-between items-start">
            <div className="space-y-1 max-w-[65%]">
              <p className="text-[11px] font-black tracking-widest text-[#E8DCD1] uppercase">RP</p>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-none text-white font-serif drop-shadow-xs">
                FOUNDATION
              </h2>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-none text-white font-serif drop-shadow-xs flex items-center gap-1.5">
                VISION <span className="text-[#FAF0E6] text-lg">🪷</span>
              </h2>
            </div>

            <div className="w-20 h-20 rounded-2xl overflow-hidden border border-[#E8DCD1]/60 shadow-md shrink-0 bg-[#5C3A24]/40">
              <img
                src="/assets/founder.png"
                alt={founderName}
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
            </div>
          </div>

          <div className="mt-6 pt-3 flex items-center justify-between border-t border-white/20">
            <p className="text-xs font-bold text-[#F5ECE2]">
              {hi ? "राष्ट्र निर्माण एवं जन कल्याण" : "Empowering India Together"}
            </p>
            <button
              type="button"
              className="bg-[#FFFBF7] text-[#5C3A24] text-xs font-black px-4 py-1.5 rounded-full shadow-md hover:bg-white transition"
            >
              {hi ? "विवरण देखें" : "Learn More"}
            </button>
          </div>
        </section>

        {/* Quick Actions (Almond Luxury Icons) */}
        <section className="mt-5 space-y-2.5">
          <h3 className="text-xs font-black text-[#2D241E] tracking-wide uppercase">{hi ? "त्वरित सेवाएं" : "Quick Actions"}</h3>
          
          <div className="grid grid-cols-4 gap-2.5">
            {QUICK_ACTIONS.map((act) => (
              <button
                key={act.id}
                type="button"
                onClick={() => navigate(act.route)}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#FFFBF7] border border-[#E8DCD1] hover:bg-[#F5ECE2] active:scale-95 transition text-center shadow-xs group"
              >
                <div className="w-8 h-8 rounded-xl bg-[#F5ECE2] border border-[#E8DCD1] flex items-center justify-center text-[#8C5A3C] mb-1.5 group-hover:scale-105 transition-transform">
                  <act.icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-black text-[#2D241E] leading-tight line-clamp-1">{hi ? act.labelHi : act.labelEn}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Weather Card (Almond Surface) */}
        <section className="mt-5 bg-[#FFFBF7] rounded-3xl p-5 border border-[#E8DCD1] shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-[#7A6A5D]">{greeting}, {daily.location || "India"}</p>
            <h2 className="text-3xl font-black text-[#2D241E] mt-1">{daily.temp == null ? "28°C" : `${daily.temp}°C`}</h2>
          </div>
          <div className="text-right">
            <CloudSun className="w-9 h-9 text-[#8C5A3C] inline-block mb-1" />
            <p className="text-[10px] font-bold text-[#7A6A5D]">H:31° L:26°</p>
            <p className="text-xs font-bold text-[#2D241E]">Partly Cloudy</p>
          </div>
        </section>

        {/* Impact Today Section (Almond Surfaces) */}
        <section className="mt-5 space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black text-[#2D241E] tracking-wide uppercase">{hi ? "आज का प्रभाव" : "Impact Today"}</h3>
            <button onClick={() => navigate("/impact")} className="text-[10px] font-bold text-[#8C5A3C] flex items-center">
              View All <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div
              onClick={() => navigate("/impact")}
              className="relative h-28 rounded-2xl overflow-hidden bg-[#5C3A24] text-white p-3.5 flex items-end cursor-pointer shadow-xs group"
            >
              <img
                src="/assets/rpf-samahit-icon.png"
                alt="Impact"
                className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:scale-105 transition-transform"
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
              <p className="relative z-10 text-xs font-black leading-snug drop-shadow-md text-[#FFFBF7]">
                Education & Health Project Update
              </p>
            </div>

            <div
              onClick={() => navigate("/impact")}
              className="h-28 rounded-2xl bg-[#FFFBF7] border border-[#E8DCD1] p-3.5 flex flex-col justify-between cursor-pointer shadow-xs"
            >
              <div>
                <p className="text-xs font-black text-[#2D241E] leading-snug">Rojgar Mela & Skill Drives</p>
                <p className="text-[10px] font-bold text-[#8C5A3C] mt-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#A67C52]" /> Active Ground Initiative
                </p>
              </div>
              <div className="flex items-center justify-between text-[10px] font-bold text-[#7A6A5D] pt-1 border-t border-[#E8DCD1]">
                <span>View Details</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#8C5A3C]" />
              </div>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
