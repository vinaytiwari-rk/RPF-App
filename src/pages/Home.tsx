import { useMemo } from "react";
import { ArrowRight, ChevronRight, HeartHandshake, Megaphone, Sparkles, HandHeart, Users, BookOpen, HeartPulse, Leaf, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";

type Lang = "en" | "hi";

const sevaCards = [
  { icon: HeartPulse, en: "Care for people", hi: "लोगों की सेवा", textEn: "Health, blood and essential support", textHi: "स्वास्थ्य, रक्त और जरूरी सहायता", route: "/services", gradient: "from-[#FF9933] to-[#F97316]" },
  { icon: BookOpen, en: "Build futures", hi: "भविष्य बनाएं", textEn: "Education, youth and opportunity", textHi: "शिक्षा, युवा और अवसर", route: "/services", gradient: "from-[#000080] to-[#2563EB]" },
  { icon: Leaf, en: "Protect tomorrow", hi: "कल को सुरक्षित करें", textEn: "Environment and community action", textHi: "पर्यावरण और सामुदायिक पहल", route: "/services", gradient: "from-[#138808] to-[#22C55E]" },
];

export default function Home() {
  const { lang } = useOutletContext<{ lang: Lang }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cmsConfig, globalSettings, announcements } = useApp();
  const name = user?.name?.trim().split(/\s+/)[0] || "";
  const alert = lang === "hi" ? cmsConfig?.alertBannerHi : cmsConfig?.alertBannerEn;
  const announcement = useMemo(() => Array.isArray(announcements) ? announcements[0] : null, [announcements]);
  const h = new Date().getHours();
  const greeting = h < 12 ? (lang === "hi" ? "सुप्रभात" : "Good morning") : h < 17 ? (lang === "hi" ? "शुभ दोपहर" : "Good afternoon") : (lang === "hi" ? "शुभ संध्या" : "Good evening");

  return (
    <main className="min-h-full bg-[#f8fafc] pb-10 text-slate-900">
      <div className="mx-auto w-full max-w-3xl px-3.5 py-4 sm:px-6 sm:py-5">
        <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .55 }} className="relative overflow-hidden rounded-[30px] border border-orange-200/70 bg-white shadow-[0_18px_55px_rgba(0,0,0,.08)]">
          <div className="h-1.5 w-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" />
          <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-[#FF9933]/15 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-[#138808]/15 blur-3xl" />
          <div className="relative p-5 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <motion.div animate={{ y: [0, -4, 0], rotate: [0, 2, 0, -2, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF9933] via-white to-[#138808] p-[2px] shadow-lg shadow-orange-100">
                  <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-white"><HandHeart className="h-7 w-7 text-[#000080]" /></div>
                </motion.div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-[.2em] text-[#FF9933]">RPF Seva App</p>
                  <p className="mt-1 text-[10px] font-bold tracking-[.12em] text-[#000080]">SEVA • SAMARPAN • SANKALP</p>
                </div>
              </div>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="hidden h-12 w-12 rounded-full border border-dashed border-orange-200 sm:block" />
            </div>
            <h1 className="mt-6 text-[28px] font-black leading-tight tracking-[-0.035em] text-[#000080] sm:text-[34px]">{greeting}{name ? `, ${name}` : ""}</h1>
            <p className="mt-2 max-w-xl text-[13px] leading-5 text-slate-600">{lang === "hi" ? "जहाँ सेवा एक विचार नहीं, एक संकल्प बनकर जीवन से जुड़ती है।" : "Where service becomes more than an idea — it becomes a shared commitment."}</p>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <motion.button whileTap={{ scale: .97 }} whileHover={{ y: -2 }} onClick={() => navigate("/services")} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#000080] px-4 py-2.5 text-[12px] font-bold text-white shadow-md shadow-blue-200">{lang === "hi" ? "सेवा से जुड़ें" : "Join the seva"}<ArrowRight className="h-4 w-4" /></motion.button>
              <motion.button whileTap={{ scale: .97 }} whileHover={{ y: -2 }} onClick={() => navigate("/community")} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-orange-200 bg-white px-4 py-2.5 text-[12px] font-bold text-[#000080]">{lang === "hi" ? "हमारा प्रभाव" : "See our impact"}</motion.button>
            </div>
            <div className="mt-6 grid grid-cols-3 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50/80 text-center">
              <div className="border-r border-slate-200 py-2.5"><span className="block text-[10px] font-black text-[#FF9933]">SEVA</span><span className="text-[9px] text-slate-500">{lang === "hi" ? "सेवा" : "Service"}</span></div>
              <div className="border-r border-slate-200 py-2.5"><span className="block text-[10px] font-black text-[#000080]">SAMARPAN</span><span className="text-[9px] text-slate-500">{lang === "hi" ? "समर्पण" : "Dedication"}</span></div>
              <div className="py-2.5"><span className="block text-[10px] font-black text-[#138808]">SANKALP</span><span className="text-[9px] text-slate-500">{lang === "hi" ? "संकल्प" : "Commitment"}</span></div>
            </div>
          </div>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .12 }} className="mt-5 overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div><p className="text-[9px] font-black uppercase tracking-[.18em] text-[#FF9933]">{lang === "hi" ? "आज की प्रेरणा" : "A reason to care"}</p><h2 className="mt-1 text-[17px] font-black text-[#000080]">{lang === "hi" ? "आपकी छोटी पहल, किसी की बड़ी उम्मीद" : "A small act can become someone's big hope"}</h2></div>
            <Sparkles className="h-5 w-5 text-[#FF9933]" />
          </div>
          <div className="grid gap-2.5 p-3 sm:grid-cols-3">
            {sevaCards.map(({ icon: Icon, en, hi, textEn, textHi, route, gradient }, i) => (
              <motion.button key={en} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .16 + i * .08 }} whileHover={{ y: -4 }} whileTap={{ scale: .98 }} onClick={() => navigate(route)} className="group rounded-2xl border border-slate-100 bg-slate-50/60 p-4 text-left shadow-sm transition-shadow hover:shadow-md">
                <motion.span animate={{ y: [0, -2, 0] }} transition={{ duration: 2.8, delay: i * .2, repeat: Infinity, ease: "easeInOut" }} className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${gradient} shadow-sm`}><Icon className="h-5 w-5 text-white" /></motion.span>
                <p className="mt-3 text-[12px] font-black text-slate-800">{lang === "hi" ? hi : en}</p>
                <p className="mt-1 text-[10px] leading-4 text-slate-500">{lang === "hi" ? textHi : textEn}</p>
                <ChevronRight className="mt-3 h-4 w-4 text-slate-300 transition group-hover:translate-x-1" />
              </motion.button>
            ))}
          </div>
        </motion.section>

        <motion.section initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: .25 }} className="mt-5 overflow-hidden rounded-[25px] border border-orange-200/70 bg-gradient-to-br from-orange-50 via-white to-green-50 shadow-sm">
          <div className="flex items-center justify-between px-5 pt-5"><div><p className="text-[9px] font-black uppercase tracking-[.18em] text-[#FF9933]">{lang === "hi" ? "संस्थापक की बात" : "From the founder"}</p><h2 className="mt-1 text-[17px] font-black text-[#000080]">{lang === "hi" ? "सेवा, समर्पण और संकल्प" : "Seva, Samarpan & Sankalp"}</h2></div><ShieldCheck className="h-5 w-5 text-[#138808]" /></div>
          <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
            <motion.div whileHover={{ scale: 1.03 }} className="relative mx-auto shrink-0 sm:mx-0"><div className="absolute inset-0 rounded-[22px] bg-gradient-to-br from-[#FF9933] via-white to-[#138808] blur-sm" /><img src="/assets/founder.png" alt="Rohit Pandit, Founder of RP Foundation" className="relative h-36 w-32 rounded-[20px] border-2 border-white object-cover object-top shadow-lg" /></motion.div>
            <div className="flex-1"><p className="text-[13px] font-black text-slate-900">{lang === "hi" ? "रोहित पंडित" : "Rohit Pandit"}</p><p className="mt-0.5 text-[10px] font-bold text-[#000080]">{lang === "hi" ? "संस्थापक, आरपी फाउंडेशन" : "Founder, RP Foundation"}</p><p className="mt-3 text-[12px] leading-5 text-slate-600">{lang === "hi" ? "सच्ची सेवा वही है जो समाज के सबसे कमजोर व्यक्ति तक पहुंचे और उसके जीवन में सकारात्मक परिवर्तन लाए।" : "True social service reaches the most vulnerable and creates meaningful positive change in their lives."}</p><motion.button whileTap={{ scale: .97 }} onClick={() => navigate("/community")} className="mt-4 inline-flex items-center gap-1 text-[11px] font-black text-[#000080]">{lang === "hi" ? "पूरा संदेश पढ़ें" : "Read the full message"}<ArrowRight className="h-3.5 w-3.5" /></motion.button></div>
          </div>
        </motion.section>

        {alert && <motion.section initial={{ opacity: 0, scale: .98 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="mt-5 rounded-2xl border border-orange-200 bg-orange-50/70 p-4"><div className="flex gap-3"><Megaphone className="h-5 w-5 shrink-0 text-[#FF9933]" /><div><p className="text-[9px] font-black uppercase tracking-wider text-[#FF9933]">{lang === "hi" ? "महत्वपूर्ण सूचना" : "Important update"}</p><p className="mt-1 text-[13px] font-semibold text-slate-800">{alert}</p></div></div></motion.section>}

        {globalSettings?.show_notices !== false && announcement && <motion.section initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-5 rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5"><h2 className="text-[14px] font-black text-[#000080]">{lang === "hi" ? "समुदाय से जुड़ें" : "Stay connected"}</h2><Megaphone className="h-4 w-4 text-[#FF9933]" /></div><div className="px-4 py-4"><p className="text-[13px] font-bold text-slate-800">{announcement?.title}</p>{announcement?.content && <p className="mt-1 text-[11px] leading-5 text-slate-500">{announcement.content}</p>}<button onClick={() => navigate("/notifications")} className="mt-3 text-[10px] font-black text-[#000080]">{lang === "hi" ? "सभी अपडेट देखें" : "View all updates"} <ChevronRight className="inline h-3.5 w-3.5" /></button></div></motion.section>}

        <motion.button whileHover={{ y: -2 }} whileTap={{ scale: .99 }} onClick={() => navigate("/donations")} className="mt-5 flex min-h-16 w-full items-center justify-between rounded-2xl border border-orange-200 bg-white px-5 py-4 text-left shadow-sm"><span><span className="block text-[13px] font-black text-[#000080]">{lang === "hi" ? "संकल्प को सहयोग दें" : "Stand behind the sankalp"}</span><span className="mt-1 block text-[10px] text-slate-500">{lang === "hi" ? "समय, सेवा या सहयोग — हर योगदान मायने रखता है।" : "Time, service or support — every contribution matters."}</span></span><HeartHandshake className="h-5 w-5 text-[#138808]" /></motion.button>
      </div>
    </main>
  );
}
