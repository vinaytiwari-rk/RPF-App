import { useEffect, useState } from "react";
import { ArrowRight, BadgePlus, BriefcaseBusiness, CalendarDays, ChevronRight, ClipboardPlus, HeartPulse, MapPin, Sparkles, Stethoscope, UsersRound } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const slides = [
  { image: "/assets/education_all.png", eyebrow: "Education & Opportunity", title: "Building stronger futures together", copy: "Discover programmes, initiatives and opportunities from RP Foundation.", route: "/services" },
  { image: "/assets/donate.jpg", eyebrow: "Care in Action", title: "Service that reaches people", copy: "Healthcare, support and community initiatives designed around real needs.", route: "/services" },
  { image: "/assets/founder.png", eyebrow: "RP Foundation", title: "Seva. Samarpan. Sankalp.", copy: "A shared commitment to meaningful social impact.", route: "/impact" },
];
const actions = [
  { title: "Jan Seva Card", copy: "Benefits and application", icon: BadgePlus, route: "/jan-seva-card", tone: "bg-orange-50 text-[#C86C10] border-orange-100" },
  { title: "Healthcare", copy: "Camps and assistance", icon: HeartPulse, route: "/services", tone: "bg-rose-50 text-rose-600 border-rose-100" },
  { title: "Employment", copy: "Jobs and skill support", icon: BriefcaseBusiness, route: "/services", tone: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  { title: "Grievance", copy: "Submit or track a case", icon: ClipboardPlus, route: "/grievance", tone: "bg-blue-50 text-[#0F3157] border-blue-100" },
];
const highlights = [
  { icon: UsersRound, value: "5,00,000+", label: "People reached" },
  { icon: BadgePlus, value: "14,000+", label: "Jan Seva Cards" },
  { icon: Stethoscope, value: "Care", label: "Healthcare support" },
];

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [slide, setSlide] = useState(0);
  const name = user?.name?.trim().split(/\s+/)[0] || "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  useEffect(() => { const timer = window.setInterval(() => setSlide((value) => (value + 1) % slides.length), 5200); return () => window.clearInterval(timer); }, []);
  const current = slides[slide];
  return <main className="min-h-full bg-[#FAF9F6] pb-6 text-slate-900"><div className="mx-auto w-full max-w-3xl px-3.5 py-5 sm:px-6">
    <section className="mb-5"><div className="flex items-end justify-between gap-4"><div><p className="text-sm font-medium text-slate-500">{greeting},</p><h1 className="mt-1 text-[28px] font-black tracking-[-0.04em] text-[#182536] sm:text-[34px]">{name} <span className="inline-block">👋</span></h1><p className="mt-1 text-[13px] leading-5 text-slate-500">Everything you need to explore RP Foundation services and initiatives.</p></div><button onClick={() => navigate("/notifications")} className="shrink-0 rounded-2xl border border-orange-100 bg-white px-3 py-2 text-[11px] font-black text-[#B36A16] shadow-sm">Updates</button></div></section>
    <motion.section initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="relative min-h-[310px] overflow-hidden rounded-[30px] border border-slate-200 bg-[#0F3157] shadow-[0_20px_45px_rgba(15,49,87,.16)]"><img key={current.image} src={current.image} alt="RP Foundation initiative" className="absolute inset-0 h-full w-full object-cover opacity-55 transition-opacity duration-500" onError={(e) => { e.currentTarget.style.display = "none"; }} /><div className="absolute inset-0 bg-gradient-to-r from-[#0A2540] via-[#0A2540]/82 to-[#0A2540]/18" /><div className="relative flex min-h-[310px] flex-col justify-end p-6 sm:p-8"><div className="max-w-[78%]"><span className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-3 py-1.5 text-[10px] font-black uppercase tracking-[.12em] text-orange-200 backdrop-blur"><Sparkles className="h-3.5 w-3.5" /> {current.eyebrow}</span><h2 className="mt-4 text-[29px] font-black leading-[1.05] tracking-[-0.04em] text-white sm:text-[38px]">{current.title}</h2><p className="mt-3 text-[13px] leading-5 text-slate-200">{current.copy}</p><button onClick={() => navigate(current.route)} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-[12px] font-black text-[#0F3157] shadow-lg">Explore initiative <ArrowRight className="h-4 w-4" /></button></div><div className="absolute bottom-5 right-5 flex gap-1.5">{slides.map((_, index) => <button key={index} onClick={() => setSlide(index)} aria-label={`Slide ${index + 1}`} className={`h-2 rounded-full transition-all ${index === slide ? "w-6 bg-[#FF9933]" : "w-2 bg-white/45"}`} />)}</div></div></motion.section>
    <section className="mt-6"><div className="mb-3 flex items-center justify-between"><div><p className="text-[10px] font-black uppercase tracking-[.15em] text-[#B36A16]">Quick access</p><h2 className="mt-1 text-[20px] font-black tracking-[-0.03em]">Services at a glance</h2></div><button onClick={() => navigate("/services")} className="inline-flex items-center gap-1 text-[12px] font-black text-[#0F3157]">View all <ChevronRight className="h-4 w-4" /></button></div><div className="grid grid-cols-2 gap-3">{actions.map(({ title, copy, icon: Icon, route, tone }) => <motion.button key={title} whileTap={{ scale: 0.98 }} onClick={() => navigate(route)} className="rounded-2xl border bg-white p-4 text-left shadow-[0_4px_18px_rgba(15,49,87,.05)]"><div className={`flex h-11 w-11 items-center justify-center rounded-xl border ${tone}`}><Icon className="h-5 w-5" /></div><h3 className="mt-3 text-[14px] font-black text-slate-900">{title}</h3><p className="mt-1 text-[10px] leading-4 text-slate-500">{copy}</p></motion.button>)}</div></section>
    <section className="mt-6 rounded-[26px] border border-orange-100 bg-white p-5 shadow-[0_4px_20px_rgba(15,49,87,.04)]"><div className="flex items-start justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-[.15em] text-[#B36A16]">Our impact</p><h2 className="mt-1 text-[20px] font-black tracking-[-0.03em]">RP Foundation at work</h2></div><button onClick={() => navigate("/impact")} className="rounded-xl bg-[#0F3157] px-3 py-2 text-[10px] font-black text-white">View activity</button></div><div className="mt-5 grid grid-cols-3 divide-x divide-slate-100">{highlights.map(({ icon: Icon, value, label }) => <div key={label} className="px-2 text-center first:pl-0 last:pr-0"><Icon className="mx-auto h-5 w-5 text-[#C86C10]" /><p className="mt-2 text-[17px] font-black tracking-[-0.03em] text-[#0F3157]">{value}</p><p className="mt-1 text-[9px] font-bold leading-3 text-slate-500">{label}</p></div>)}</div></section>
    <section className="mt-6 grid gap-3 sm:grid-cols-2"><button onClick={() => navigate("/events")} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-[#C86C10]"><CalendarDays className="h-6 w-6" /></div><div><h3 className="text-[14px] font-black">Events & Camps</h3><p className="mt-1 text-[10px] text-slate-500">See what is coming up next.</p></div><ChevronRight className="ml-auto h-5 w-5 text-slate-400" /></button><button onClick={() => navigate("/services")} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm"><div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><MapPin className="h-6 w-6" /></div><div><h3 className="text-[14px] font-black">Find Support</h3><p className="mt-1 text-[10px] text-slate-500">Explore programmes near you.</p></div><ChevronRight className="ml-auto h-5 w-5 text-slate-400" /></button></section>
  </div></main>;
}
