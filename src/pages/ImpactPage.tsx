import React, { useState } from "react";
import {
  Play,
  Instagram,
  Heart,
  Share2,
  Users,
  Briefcase,
  Stethoscope,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { useNavigate, useOutletContext } from "react-router-dom";
import InstagramApiFeed from "../components/InstagramApiFeed";
import { openExternalLink } from "../utils/browser";
import { FEATURED_INSTAGRAM_REEL } from "../config/featuredPost";

export default function ImpactPage() {
  const navigate = useNavigate();
  const { lang } = useOutletContext<{ lang: "en" | "hi" }>();
  const isHi = lang === "hi";

  const IMPACT_METRICS = [
    { labelEn: "Rojgar Mela Jobs", labelHi: "रोजगार मेला अवसर", count: "15,000+", icon: Briefcase, color: "text-blue-600 bg-blue-50" },
    { labelEn: "Free Health Camps", labelHi: "निःशुल्क स्वास्थ्य शिविर", count: "50,000+", icon: Stethoscope, color: "text-emerald-600 bg-emerald-50" },
    { labelEn: "Volunteers Active", labelHi: "सक्रिय स्वयंसेवक", count: "8,500+", icon: Users, color: "text-purple-600 bg-purple-50" },
    { labelEn: "Pink E-Rickshaws", labelHi: "पिंक ई-रिक्शा वितरण", count: "500+", icon: Heart, color: "text-rose-600 bg-rose-50" },
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-28 font-sans selection:bg-orange-100 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-pink-600 via-purple-600 to-[#000080] p-6 text-white relative overflow-hidden shadow-md">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-0.5 text-[10px] font-black uppercase tracking-wider backdrop-blur-md border border-white/25 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
            {isHi ? "सामाजिक प्रभाव एवं रील्स" : "Social Impact & Live Reels"}
          </div>
          <h1 className="text-2xl font-black tracking-tight leading-tight">
            {isHi ? "प्रभाव एवं मीडिया गैलरी" : "RP Foundation Impact & Media"}
          </h1>
          <p className="text-xs text-pink-100 font-medium mt-1">
            {isHi ? "लाइव इंस्टाग्राम रील्स, वीडियो अपडेट्स एवं सामाजिक बदलाव की कहानियां।" : "Explore live reels, video documentaries & stories of social transformation."}
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-6">

        {/* Impact Numbers Counter Grid */}
        <section className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">{isHi ? "हमारा सामाजिक प्रभाव" : "Real Ground Impact"}</h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {IMPACT_METRICS.map((m, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${m.color}`}>
                  <m.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-lg font-black text-slate-900 leading-none">{m.count}</p>
                  <p className="text-[10px] font-bold text-slate-500 mt-1 line-clamp-1">{isHi ? m.labelHi : m.labelEn}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Reel Card */}
        <section className="bg-gradient-to-br from-purple-900 to-slate-900 rounded-3xl p-5 text-white shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black uppercase tracking-[.18em] text-pink-400 bg-pink-950/60 px-2.5 py-1 rounded-full border border-pink-500/30">
              Featured Reel
            </span>
            <Instagram className="w-4 h-4 text-pink-400" />
          </div>

          <div>
            <h3 className="text-base font-black leading-snug">
              {isHi ? "पिंक ई-रिक्शा एवं महिला आजीविका पहल" : "Pink E-Rickshaw & Women Empowerment Drive"}
            </h3>
            <p className="text-xs text-slate-300 mt-1 line-clamp-2 font-medium">
              Watch how RP Foundation is empowering women across the region with sustainable green mobility.
            </p>
          </div>

          <button
            onClick={() => openExternalLink(FEATURED_INSTAGRAM_REEL, navigate, "Featured Reel")}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white text-xs font-black py-3 rounded-2xl shadow-md transition active:scale-95 flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>{isHi ? "इंस्टाग्राम पर रील देखें" : "Watch Featured Reel on Instagram"}</span>
          </button>
        </section>

        {/* Live Instagram Feed Grid */}
        <section className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 text-white shadow-sm">
                <Instagram className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">{isHi ? "लाइव रील्स एवं पोस्ट्स" : "Live Instagram Feed"}</h3>
                <p className="text-[10px] text-slate-400 font-bold">@rpfoundationofficial</p>
              </div>
            </div>
            <a
              href="https://www.instagram.com/rpfoundationofficial/"
              target="_blank"
              rel="noreferrer"
              className="text-[10px] font-black text-pink-600 hover:underline flex items-center gap-1"
            >
              Follow <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <InstagramApiFeed />
        </section>

        {/* Vision & Goals Quick Banner */}
        <section 
          onClick={() => navigate("/vision-goals")}
          className="bg-white rounded-3xl border border-orange-200 p-5 shadow-sm hover:shadow-md transition cursor-pointer flex items-center justify-between gap-4"
        >
          <div className="space-y-1">
            <span className="text-[9px] font-black uppercase tracking-[.18em] text-[#FF9933]">About Us</span>
            <h3 className="text-sm font-black text-[#000080]">{isHi ? "आर.पी. फाउंडेशन उद्देश्य एवं संस्थापक संदेश" : "RP Foundation Vision, Goals & Founder Message"}</h3>
            <p className="text-[11px] font-medium text-slate-500 line-clamp-1">Shri Rohit Pandit Ji's mission for employment, sports, women & health.</p>
          </div>
          <div className="w-9 h-9 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0 text-[#FF9933]">
            <ChevronRight className="w-5 h-5" />
          </div>
        </section>

      </div>
    </div>
  );
}
