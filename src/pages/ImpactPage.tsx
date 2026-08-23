import React from "react";
import { Instagram, Youtube, ExternalLink, Play, Sparkles, ShieldCheck, ChevronRight } from "lucide-react";
import { useNavigate, useOutletContext } from "react-router-dom";
import InstagramApiFeed from "../components/InstagramApiFeed";
import { openExternalLink } from "../utils/browser";

const INSTAGRAM_URL = "https://www.instagram.com/rpfoundationofficial/";
const YOUTUBE_URL = "https://www.youtube.com/@rpfoundationofficial";

export default function ImpactPage() {
  const navigate = useNavigate();
  const { lang } = useOutletContext<{ lang: "en" | "hi" }>();
  const isHi = lang === "hi";

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-28 font-sans text-slate-800">
      <div className="relative overflow-hidden bg-gradient-to-br from-[#FF9933] via-[#F59E0B] to-[#138808] p-6 text-white shadow-md">
        <div className="absolute right-0 top-0 h-40 w-40 translate-x-10 -translate-y-10 rounded-full bg-white/10 blur-2xl" />
        <div className="relative z-10 mx-auto max-w-2xl">
          <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/20 px-3 py-1 text-[10px] font-black uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            {isHi ? "आधिकारिक मीडिया" : "Official Media"}
          </div>
          <h1 className="font-serif text-2xl font-black leading-tight">{isHi ? "RP Foundation मीडिया" : "RP Foundation Media"}</h1>
          <p className="mt-1 text-xs font-medium text-orange-50">
            {isHi ? "आधिकारिक इंस्टाग्राम और यूट्यूब अपडेट एक ही स्थान पर।" : "Official Instagram and YouTube updates in one place."}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-2xl space-y-5 px-4 py-5">
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button onClick={() => openExternalLink(INSTAGRAM_URL, navigate, "RP Foundation Instagram")} className="min-h-32 rounded-3xl border border-pink-100 bg-white p-5 text-left shadow-xs active:scale-[.99]">
            <div className="flex items-center justify-between"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] text-white"><Instagram className="h-5 w-5" /></div><ExternalLink className="h-4 w-4 text-slate-400" /></div>
            <p className="mt-4 text-sm font-black text-slate-900">Instagram</p>
            <p className="mt-1 text-[11px] font-medium text-slate-500">@rpfoundationofficial</p>
          </button>
          <button onClick={() => openExternalLink(YOUTUBE_URL, navigate, "RP Foundation YouTube")} className="min-h-32 rounded-3xl border border-red-100 bg-white p-5 text-left shadow-xs active:scale-[.99]">
            <div className="flex items-center justify-between"><div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-600 text-white"><Youtube className="h-5 w-5" /></div><ExternalLink className="h-4 w-4 text-slate-400" /></div>
            <p className="mt-4 text-sm font-black text-slate-900">YouTube</p>
            <p className="mt-1 text-[11px] font-medium text-slate-500">@rpfoundationofficial</p>
          </button>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#138808]" /><h2 className="text-xs font-black uppercase tracking-wider text-slate-900">{isHi ? "विश्वसनीय सामग्री" : "Verified content policy"}</h2></div>
          <p className="mt-2 text-xs leading-relaxed text-slate-600">{isHi ? "यहां केवल आधिकारिक स्रोतों से उपलब्ध सामग्री दिखाई जानी चाहिए। डेमो रील, काल्पनिक व्यू, लाइक या फॉलोअर आंकड़े प्रदर्शित नहीं किए जाते।" : "Only content available from official sources should appear here. Demo reels and fabricated view, like, or follower counts are not shown."}</p>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3"><div className="flex items-center gap-2"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#833AB4] via-[#FD1D1D] to-[#FCAF45] text-white"><Instagram className="h-4 w-4" /></div><div><h2 className="text-xs font-black uppercase tracking-wider text-slate-900">{isHi ? "इंस्टाग्राम अपडेट" : "Instagram updates"}</h2><p className="text-[10px] font-bold text-slate-400">@rpfoundationofficial</p></div></div><button onClick={() => openExternalLink(INSTAGRAM_URL, navigate, "RP Foundation Instagram")} className="inline-flex items-center gap-1 text-[10px] font-black text-[#FF9933]">{isHi ? "खोलें" : "Open"}<ExternalLink className="h-3 w-3" /></button></div>
          <InstagramApiFeed />
        </section>

        <section className="rounded-3xl border border-red-100 bg-gradient-to-br from-red-50 to-white p-5 shadow-xs">
          <div className="flex items-start gap-3"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-red-600 text-white"><Play className="h-5 w-5 fill-current" /></div><div className="min-w-0 flex-1"><h2 className="text-sm font-black text-slate-900">{isHi ? "यूट्यूब वीडियो और अपडेट" : "YouTube videos & updates"}</h2><p className="mt-1 text-[11px] leading-relaxed text-slate-500">{isHi ? "नवीनतम वीडियो सीधे आधिकारिक RP Foundation चैनल पर देखें।" : "Watch the latest videos directly on the official RP Foundation channel."}</p><button onClick={() => openExternalLink(YOUTUBE_URL, navigate, "RP Foundation YouTube")} className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-xl bg-red-600 px-4 text-xs font-black text-white"><Youtube className="h-4 w-4" />{isHi ? "आधिकारिक चैनल खोलें" : "Open Official Channel"}</button></div></div>
        </section>

        <button onClick={() => navigate("/vision-goals")} className="flex min-h-16 w-full items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-5 text-left shadow-xs"><div><p className="text-[9px] font-black uppercase tracking-[.18em] text-[#FF9933]">RP Foundation</p><h3 className="mt-1 text-sm font-black text-slate-900">{isHi ? "विजन और फाउंडेशन के बारे में जानें" : "Explore vision & foundation"}</h3></div><ChevronRight className="h-5 w-5 text-[#FF9933]" /></button>
      </div>
    </div>
  );
}
