import { useEffect, useState } from "react";
import { BadgePlus, BriefcaseBusiness, ChevronRight, ClipboardList, CloudSun, HeartPulse, MapPin, UsersRound, Stethoscope, CalendarDays } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// These use project-owned visual assets already present in the app. Replace/add through
// the CMS asset pipeline when the approved campaign posters are uploaded to the repository.
const slides = [
  { image: "/assets/mega_camp_banner.png", eyebrow: "Healthcare", title: "Health Camps & Community Care", copy: "Explore RP Foundation healthcare initiatives and support services.", route: "/health-care" },
  { image: "/assets/water_pump_camp.png", eyebrow: "Community", title: "Service on the Ground", copy: "See initiatives focused on practical community support.", route: "/impact" },
  { image: "/assets/founder.png", eyebrow: "RP Foundation", title: "Service. Commitment. Resolve.", copy: "Discover the people and purpose behind the foundation's work.", route: "/founder-message" },
  { image: "/assets/donate.jpg", eyebrow: "Initiatives", title: "Support, Care & Opportunity", copy: "Explore programmes and services available through the foundation.", route: "/services" },
];

const actions = [
  { title: "Jan Seva Card", icon: BadgePlus, route: "/jan-seva-card", tone: "bg-orange-50 text-[#E67817]" },
  { title: "Healthcare", icon: HeartPulse, route: "/health-care", tone: "bg-rose-50 text-rose-600" },
  { title: "Employment", icon: BriefcaseBusiness, route: "/employment", tone: "bg-green-50 text-[#138808]" },
  { title: "Grievance", icon: ClipboardList, route: "/grievance", tone: "bg-blue-50 text-[#1D5B93]" },
];

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [slide, setSlide] = useState(0);
  const name = user?.name?.trim().split(/\s+/)[0] || "Vinay";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  const current = slides[slide];

  useEffect(() => {
    const timer = window.setInterval(() => setSlide((value) => (value + 1) % slides.length), 5000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <main className="min-h-full bg-[#F8F9F7] text-[#12233D]">
      <div className="mx-auto w-full max-w-3xl px-4 py-3 sm:px-6">
        <section className="mb-4 overflow-hidden rounded-xl border border-[#E8ECE7] bg-white shadow-[0_3px_12px_rgba(15,49,87,.04)]">
          <div className="flex h-9 items-center whitespace-nowrap">
            <span className="shrink-0 bg-[#0F3157] px-3 py-2 text-[9px] font-black uppercase tracking-[.12em] text-white">Thought of the Day</span>
            <div className="min-w-0 overflow-hidden"><div className="animate-[marquee_18s_linear_infinite] pl-5 text-[12px] font-semibold text-slate-600">Work is worship, and service is the greatest religion. &nbsp; • &nbsp; Together, we can build a better and stronger India.</div></div>
          </div>
        </section>

        <section className="mb-4">
          <h1 className="text-[25px] font-black tracking-[-0.04em] text-[#12233D]">Namaste, {name} Ji <span className="text-[22px]">👋</span></h1>
          <p className="mt-0.5 text-[13px] font-bold text-[#667085]">{greeting}</p>
          <div className="mt-3 flex items-center gap-2 overflow-hidden">
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-[#E7ECE7] bg-white px-3 py-2 shadow-[0_2px_8px_rgba(15,49,87,.035)]">
              <MapPin className="h-4 w-4 shrink-0 text-[#E67817]" />
              <span className="truncate text-[11px] font-bold text-slate-600">Your location</span>
            </div>
            <div className="flex shrink-0 items-center gap-2 rounded-xl border border-[#E7ECE7] bg-white px-3 py-2 shadow-[0_2px_8px_rgba(15,49,87,.035)]">
              <CloudSun className="h-4 w-4 text-[#1D5B93]" />
              <span className="text-[11px] font-bold text-slate-600">25°C · Live</span>
            </div>
          </div>
        </section>

        <section className="mt-5">
          <div className="mb-2.5 flex items-end justify-between">
            <div><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#138808]">Discover</p><h2 className="mt-0.5 text-[21px] font-black tracking-[-0.035em] text-[#12233D]">RP Foundation at Work</h2></div>
            <span className="text-[12px] font-black text-slate-400">{slide + 1}/{slides.length}</span>
          </div>
          <motion.article key={slide} initial={{ opacity: 0.35 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="relative h-[270px] overflow-hidden rounded-[24px] bg-[#0F3157] shadow-[0_12px_28px_rgba(15,49,87,.12)]">
            <img src={current.image} alt={current.title} className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#07182C]/95 via-[#07182C]/35 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-4 text-white">
              <span className="inline-flex rounded-full bg-white/16 px-3 py-1 text-[9px] font-black uppercase tracking-[.14em] backdrop-blur">{current.eyebrow}</span>
              <h3 className="mt-2 text-[21px] font-black leading-tight tracking-[-0.03em]">{current.title}</h3>
              <p className="mt-1 max-w-[92%] text-[11px] leading-5 text-slate-200">{current.copy}</p>
              <button onClick={() => navigate(current.route)} className="mt-2 inline-flex items-center gap-1 text-[11px] font-black text-white">Explore <ChevronRight className="h-4 w-4" /></button>
            </div>
          </motion.article>
          <div className="mt-3 flex justify-center gap-2">{slides.map((_, index) => <button key={index} onClick={() => setSlide(index)} aria-label={`Slide ${index + 1}`} className={`h-2 rounded-full transition-all ${slide === index ? "w-7 bg-[#FF9933]" : "w-2 bg-slate-300"}`} />)}</div>
        </section>

        <section className="mt-7">
          <div className="mb-3"><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#E67817]">Quick Access</p><h2 className="mt-0.5 text-[21px] font-black tracking-[-0.03em] text-[#12233D]">What can we help with?</h2></div>
          <div className="grid grid-cols-2 gap-3">{actions.map(({ title, icon: Icon, route, tone }) => <motion.button key={title} whileTap={{ scale: 0.98 }} onClick={() => navigate(route)} className="rounded-2xl border border-[#E5EAE6] bg-white p-4 text-left shadow-[0_4px_16px_rgba(15,49,87,.045)]"><div className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}><Icon className="h-5 w-5" /></div><p className="mt-4 text-[15px] font-black text-[#12233D]">{title}</p><p className="mt-1 text-[10px] font-semibold leading-4 text-slate-500">{title === "Grievance" ? "Submit and track an issue" : title === "Employment" ? "Jobs, skills and opportunities" : title === "Healthcare" ? "Health services and support" : "Your digital service identity"}</p></motion.button>)}</div>
        </section>

        <section className="mt-7 pb-2">
          <div className="mb-3"><p className="text-[10px] font-black uppercase tracking-[.16em] text-[#138808]">Our Impact</p><h2 className="mt-0.5 text-[21px] font-black tracking-[-0.03em] text-[#12233D]">RP Foundation Metrics</h2></div>
          <div className="grid grid-cols-3 overflow-hidden rounded-2xl border border-[#E5EAE6] bg-white shadow-[0_4px_16px_rgba(15,49,87,.04)]">{[{ icon: UsersRound, value: "Community", label: "People first" }, { icon: Stethoscope, value: "Care", label: "Health initiatives" }, { icon: CalendarDays, value: "Active", label: "Foundation work" }].map(({ icon: Icon, value, label }) => <div key={label} className="border-r border-[#EEF1EE] px-2 py-4 text-center last:border-r-0"><Icon className="mx-auto h-4 w-4 text-[#138808]" /><p className="mt-2 text-[14px] font-black text-[#0F3157]">{value}</p><p className="mt-0.5 text-[8px] font-bold text-slate-400">{label}</p></div>)}</div>
        </section>
      </div>
    </main>
  );
}
