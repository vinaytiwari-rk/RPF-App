import { motion } from "motion/react";
import { ArrowLeft, HeartHandshake, Quote } from "lucide-react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useApp } from "../context/AppContext";

export default function FounderSpeech() {
  const navigate = useNavigate();
  const { lang } = useOutletContext<{ lang: "en" | "hi" }>();
  const { settings, cmsConfig } = useApp();
  const hi = lang === "hi";
  const message = hi ? settings.founderMessageHi : settings.founderMessageEn;
  const founderName = cmsConfig.founderName || "Rohit Pandit";
  const designation = cmsConfig.founderDesignation || "Founder, RP FOUNDATION";
  const image = settings.founderImgUrl || cmsConfig.founderImgUrl || "/assets/founder.png";

  return <main className="min-h-full bg-[#f8fafc] pb-12"><div className="mx-auto max-w-3xl px-3.5 py-5 sm:px-6">
    <button onClick={() => navigate(-1)} className="mb-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-[11px] font-black text-slate-600 shadow-sm"><ArrowLeft className="h-4 w-4"/> {hi ? "वापस" : "Back"}</button>
    <motion.article initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-[28px] border border-orange-200/70 bg-white shadow-[0_18px_55px_rgba(0,0,0,.08)]">
      <div className="h-1.5 bg-gradient-to-r from-[#FF9933] via-[#FDE047] to-[#138808]"/>
      <div className="relative p-5 sm:p-8">
        <div className="flex items-center gap-4">
          <img src={image} alt={founderName} className="h-20 w-20 rounded-2xl object-cover shadow-md" />
          <div><p className="text-[9px] font-black uppercase tracking-[.2em] text-[#FF9933]">{hi ? "संस्थापक का संदेश" : "Message from the Founder"}</p><h1 className="mt-1 text-[23px] font-black text-[#000080]">{founderName}</h1><p className="mt-1 text-[11px] font-bold text-slate-500">{designation}</p></div>
        </div>
        <div className="mt-7 flex gap-3 rounded-2xl bg-orange-50/70 p-4"><Quote className="mt-1 h-5 w-5 shrink-0 text-[#FF9933]"/><p className="text-[13px] font-semibold leading-6 text-slate-700">{hi ? "सेवा, समर्पण और संकल्प के साथ समाज के हर व्यक्ति तक पहुंचना हमारा साझा दायित्व है।" : "Our shared responsibility is to reach people with service, dedication and resolve."}</p></div>
        <div className="prose prose-slate mt-7 max-w-none whitespace-pre-line text-[13px] leading-7"><p>{message || (hi ? "संस्थापक का विस्तृत संदेश शीघ्र उपलब्ध होगा।" : "The founder's full message will appear here when published by the foundation.")}</p></div>
        <button onClick={() => navigate("/jan-seva-card")} className="mt-7 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#FF9933] to-[#F59E0B] px-4 py-3 text-[11px] font-black text-white shadow-md"><HeartHandshake className="h-4 w-4"/>{hi ? "जन सेवा कार्ड" : "Jan Seva Card"}</button>
      </div>
    </motion.article>
  </div></main>;
}
