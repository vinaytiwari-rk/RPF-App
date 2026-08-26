import { useEffect, useState } from "react";
import { BadgePlus, BriefcaseBusiness, ChevronRight, HeartPulse, MapPin, CloudSun, UsersRound, Stethoscope } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const slides = [
  { image: "/assets/founder.png", eyebrow: "RP Foundation", title: "Service. Commitment. Resolve.", copy: "Real initiatives and real people at the heart of our work.", route: "/impact" },
  { image: "/assets/donate.jpg", eyebrow: "Community Care", title: "Healthcare and support that reaches people", copy: "Explore camps, assistance and community programmes.", route: "/services" },
  { image: "/assets/founder.png", eyebrow: "Jan Seva Card", title: "Support, benefits and opportunities", copy: "Discover services designed to make help easier to access.", route: "/jan-seva-card" },
];
const actions = [
  { title: "Jan Seva Card", icon: BadgePlus, route: "/jan-seva-card", tone: "text-[#D97706] bg-orange-50" },
  { title: "Healthcare", icon: HeartPulse, route: "/services", tone: "text-rose-600 bg-rose-50" },
  { title: "Employment", icon: BriefcaseBusiness, route: "/services", tone: "text-[#138808] bg-green-50" },
];

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [slide, setSlide] = useState(0);
  const name = user?.name?.trim().split(/\s+/)[0] || "Vinay";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  const current = slides[slide];
  useEffect(() => { const timer = window.setInterval(() => setSlide((value) => (value + 1) % slides.length), 5000); return () => window.clearInterval(timer); }, []);

  return <main className="min-h-full bg-[#FCFCFA] pb-5 text-slate-900"><div className="mx-auto w-full max-w-3xl px-4 py-3 sm:px-6">
    <section className="mb-3 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm"><div className="flex h-9 items-center whitespace-nowrap"><span className="shrink-0 bg-[#0F3157] px-3 py-2 text-[10px] font-black uppercase tracking-[.12em] text-white">Thought of the Day</span><div className="min-w-0 overflow-hidden"><div className="animate-[marquee_18s_linear_infinite] pl-5 text-[12px] font-semibold text-slate-600">Work is worship, and service is the greatest religion. &nbsp; • &nbsp; Together, we can build a better and stronger India.</div></div></div></section>
    <section className="mb-4"><p className="text-[12px] font-semibold text-slate-500">{greeting} 👋</p><h1 className="mt-0.5 text-[27px] font-black tracking-[-0.04em] text-[#12233D]">Namaste, {name} Ji</h1></section>
    <section className="mb-5 grid grid-cols-2 gap-2.5"><div className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-white px-3 py-2.5 shadow-sm"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-[#E67817]"><MapPin className="h-4 w-4" /></div><div className="min-w-0"><p className="text-[9px] font-black uppercase tracking-[.12em] text-slate-400">Location</p><p className="truncate text-[12px] font-bold text-slate-700">Your location</p></div></div><div className="flex items-center gap-2.5 rounded-xl border border-slate-100 bg-white px-3 py-2.5 shadow-sm"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[#1D5B93]"><CloudSun className="h-4 w-4" /></div><div><p className="text-[9px] font-black uppercase tracking-[.12em] text-slate-400">Weather</p><p className="text-[12px] font-bold text-slate-700">25°C · Clear</p></div></div></section>
    <section><div className="mb-2.5 flex items-end justify-between"><div><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#138808]">Discover</p><h2 className="mt-0.5 text-[22px] font-black tracking-[-0.035em] text-[#12233D]">RP Foundation at Work</h2></div><span className="text-[12px] font-black text-slate-400">{slide + 1}/{slides.length}</span></div><motion.article key={slide} initial={{ opacity: 0.35 }} animate={{ opacity: 1 }} className="relative h-[300px] overflow-hidden rounded-[26px] bg-[#0F3157] shadow-[0_12px_28px_rgba(15,49,87,.14)]"><img src={current.image} alt={current.title} className="absolute inset-0 h-full w-full object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-[#07182C] via-[#07182C]/35 to-transparent" /><div className="absolute inset-x-0 bottom-0 p-5 text-white"><span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-[9px] font-black uppercase tracking-[.14em] backdrop-blur">{current.eyebrow}</span><h3 className="mt-2 text-[23px] font-black leading-tight tracking-[-0.03em]">{current.title}</h3><p className="mt-1.5 max-w-[92%] text-[12px] leading-5 text-slate-200">{current.copy}</p><button onClick={() => navigate(current.route)} className="mt-3 inline-flex items-center gap-1 text-[11px] font-black text-white">Explore <ChevronRight className="h-4 w-4" /></button></div></motion.article><div className="mt-3 flex justify-center gap-2">{slides.map((_, index) => <button key={index} onClick={() => setSlide(index)} aria-label={`Slide ${index + 1}`} className={`h-2 rounded-full transition-all ${slide === index ? "w-7 bg-[#FF9933]" : "w-2 bg-slate-200"}`} />)}</div></section>
    <section className="mt-6"><div className="mb-3 flex items-center justify-between"><h2 className="text-[20px] font-black tracking-[-0.03em] text-[#12233D]">Quick Access</h2><button onClick={() => navigate("/services")} className="text-[11px] font-black text-[#0F3157]">View all</button></div><div className="grid grid-cols-3 gap-2.5">{actions.map(({ title, icon: Icon, route, tone }) => <motion.button key={title} whileTap={{ scale: 0.97 }} onClick={() => navigate(route)} className="rounded-2xl border border-slate-100 bg-white px-2 py-4 text-center shadow-sm"><div className={`mx-auto flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}><Icon className="h-5 w-5" /></div><p className="mt-2 text-[10px] font-black leading-4 text-slate-700">{title}</p></motion.button>)}</div></section>
    <section className="mt-5 grid grid-cols-3 divide-x divide-slate-100 rounded-2xl border border-slate-100 bg-white py-4 shadow-sm">{[{ icon: UsersRound, value: "5,000+", label: "Beneficiaries" }, { icon: BadgePlus, value: "Jan Seva", label: "Community support" }, { icon: Stethoscope, value: "Care", label: "Health initiatives" }].map(({ icon: Icon, value, label }) => <div key={label} className="px-2 text-center"><Icon className="mx-auto h-4 w-4 text-[#138808]" /><p className="mt-1 text-[13px] font-black text-[#0F3157]">{value}</p><p className="mt-0.5 text-[8px] font-bold text-slate-400">{label}</p></div>)}</section>
  </div></main>;
}
