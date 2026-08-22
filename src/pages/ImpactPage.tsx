import React from "react";
import {
  Play,
  Instagram,
  Heart,
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

  const CORE_INITIATIVES = [
    { labelEn: "Rojgar Mela Jobs", labelHi: "रोजगार मेला आजीविका", descEn: "Employment drives & career melas", descHi: "युवाओं हेतु प्रत्यक्ष रोजगार अवसर", icon: Briefcase },
    { labelEn: "Pink E-Rickshaws", labelHi: "पिंक ई-रिक्शा पहल", descEn: "Women empowerment & green mobility", descHi: "महिला स्वावलंबन एवं हरित यातायात", icon: Heart },
    { labelEn: "Free Health Camps", labelHi: "निःशुल्क स्वास्थ्य शिविर", descEn: "Medical checkups & care services", descHi: "चिकित्सा परामर्श एवं दवा वितरण", icon: Stethoscope },
    { labelEn: "Youth & Sports Support", labelHi: "खेलकूद एवं युवा प्रोत्साहन", descEn: "Athlete aid & local tournaments", descHi: "उदीयमान खिलाड़ियों को राष्ट्रीय मंच", icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen bg-[#FAF0E6] pb-28 font-sans selection:bg-[#E8DCD1] animate-fadeIn text-[#2D241E]">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-[#A67C52] via-[#8C5A3C] to-[#5C3A24] p-6 text-white relative overflow-hidden shadow-md">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl transform translate-x-10 -translate-y-10" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-0.5 text-[10px] font-black uppercase tracking-wider backdrop-blur-md border border-white/20 mb-2 text-[#FAF0E6]">
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
            {isHi ? "सामाजिक प्रभाव एवं रील्स" : "Social Impact & Live Reels"}
          </div>
          <h1 className="text-2xl font-black tracking-tight leading-tight font-serif text-white">
            {isHi ? "प्रभाव एवं मीडिया गैलरी" : "RP Foundation Impact & Media"}
          </h1>
          <p className="text-xs text-[#F5ECE2] font-medium mt-1">
            {isHi ? "लाइव इंस्टाग्राम रील्स, वीडियो अपडेट्स एवं सामाजिक बदलाव की कहानियां।" : "Explore live reels, video documentaries & stories of social transformation."}
          </p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-6">

        {/* Foundation Key Initiatives */}
        <section className="bg-[#FFFBF7] rounded-3xl border border-[#E8DCD1] p-5 shadow-xs space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#8C5A3C]" />
            <h3 className="text-xs font-black uppercase tracking-wider text-[#2D241E]">{isHi ? "फाउंडेशन के प्रमुख कार्यक्षेत्र" : "Core Ground Initiatives"}</h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {CORE_INITIATIVES.map((m, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-[#F5ECE2] border border-[#E8DCD1] flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-[#FFFBF7] border border-[#E8DCD1] text-[#8C5A3C] shadow-xs">
                  <m.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-black text-[#2D241E] leading-snug line-clamp-1">{isHi ? m.labelHi : m.labelEn}</p>
                  <p className="text-[9.5px] font-medium text-[#7A6A5D] mt-0.5 line-clamp-1">{isHi ? m.descHi : m.descEn}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Featured Reel Card */}
        <section className="bg-[#5C3A24] border border-[#8C5A3C]/40 rounded-3xl p-5 text-white shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black uppercase tracking-[.18em] text-[#E8DCD1] bg-[#2D241E]/50 px-2.5 py-1 rounded-full border border-white/10">
              Featured Reel
            </span>
            <Instagram className="w-4 h-4 text-[#E8DCD1]" />
          </div>

          <div>
            <h3 className="text-base font-black leading-snug font-serif text-[#FFFBF7]">
              {isHi ? "पिंक ई-रिक्शा एवं महिला आजीविका पहल" : "Pink E-Rickshaw & Women Empowerment Drive"}
            </h3>
            <p className="text-xs text-[#F5ECE2] mt-1 line-clamp-2 font-medium">
              Watch how RP Foundation is empowering women across the region with sustainable green mobility.
            </p>
          </div>

          <button
            onClick={() => openExternalLink(FEATURED_INSTAGRAM_REEL, navigate, "Featured Reel")}
            className="w-full bg-gradient-to-r from-[#A67C52] to-[#8C5A3C] text-white text-xs font-black py-3 rounded-2xl shadow-md transition active:scale-95 flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>{isHi ? "इंस्टाग्राम पर रील देखें" : "Watch Featured Reel on Instagram"}</span>
          </button>
        </section>

        {/* Live Instagram Feed Grid */}
        <section className="bg-[#FFFBF7] rounded-3xl border border-[#E8DCD1] p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#E8DCD1] pb-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#8C5A3C] text-white shadow-xs">
                <Instagram className="h-4.5 w-4.5" />
              </div>
              <div>
                <h3 className="text-xs font-black text-[#2D241E] uppercase tracking-wider">{isHi ? "लाइव रील्स एवं पोस्ट्स" : "Live Instagram Feed"}</h3>
                <p className="text-[10px] text-[#7A6A5D] font-bold">@rpfoundationofficial</p>
              </div>
            </div>
            <a
              href="https://www.instagram.com/rpfoundationofficial/"
              target="_blank"
              rel="noreferrer"
              className="text-[10px] font-black text-[#8C5A3C] hover:underline flex items-center gap-1"
            >
              Follow <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <InstagramApiFeed />
        </section>

        {/* Vision & Goals Quick Banner */}
        <section 
          onClick={() => navigate("/vision-goals")}
          className="bg-[#FFFBF7] rounded-3xl border border-[#E8DCD1] p-5 shadow-xs hover:shadow-md transition cursor-pointer flex items-center justify-between gap-4"
        >
          <div className="space-y-1">
            <span className="text-[9px] font-black uppercase tracking-[.18em] text-[#8C5A3C]">About Us</span>
            <h3 className="text-sm font-black text-[#2D241E]">{isHi ? "आर.पी. फाउंडेशन उद्देश्य एवं संस्थापक संदेश" : "RP Foundation Vision, Goals & Founder Message"}</h3>
            <p className="text-[11px] font-medium text-[#7A6A5D] line-clamp-1">Shri Rohit Pandit Ji's mission for employment, sports, women & health.</p>
          </div>
          <div className="w-9 h-9 rounded-2xl bg-[#F5ECE2] border border-[#E8DCD1] flex items-center justify-center shrink-0 text-[#8C5A3C]">
            <ChevronRight className="w-5 h-5" />
          </div>
        </section>

      </div>
    </div>
  );
}
