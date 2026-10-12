import {ArrowLeft,ArrowRight,Briefcase,GraduationCap,HeartHandshake,HeartPulse,Quote,Sparkles,Users} from "lucide-react";
import {motion} from "motion/react";
import {useNavigate,useOutletContext} from "react-router-dom";

type Lang = "en" | "hi";

const beliefs = [
  { icon: Users, title: "People first", text: "Social change begins by understanding the real barriers communities face." },
  { icon: HeartPulse, title: "Dignity in service", text: "Support should be rooted in respect, empathy, and care for every life touched." },
  { icon: HeartHandshake, title: "Service beyond status", text: "We work with humility and practical action, without discrimination or hierarchy." },
  { icon: Briefcase, title: "Skills for livelihoods", text: "A stronger society grows when dignity, opportunity, and skill-building move together." },
  { icon: GraduationCap, title: "Learning for all", text: "Education is a public good and a foundation for communities to rise together." },
];

export default function FounderMessage() {
  const nav = useNavigate();
  const { lang } = useOutletContext<{ lang: Lang }>();
  const hi = lang === "hi";

  return (
    <main className="min-h-full bg-[#fff9e9] pb-28 text-[#14213D]">
      <div className="mx-auto max-w-3xl px-4 pt-4 sm:px-6">
        <button
          type="button"
          onClick={() => nav(-1)}
          className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-white/80 px-3 py-1.5 text-[11px] font-bold text-[#14213D] shadow-xs"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {hi ? "वापस" : "Back"}
        </button>

        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="mt-4 overflow-hidden rounded-[28px] border border-amber-200/70 bg-white/80 shadow-sm backdrop-blur-sm"
        >
          <div className="relative bg-gradient-to-br from-[#FFF7E8] via-[#F0FAF4] to-[#FFE5C4] p-5 sm:p-7">
            <div className="absolute right-4 top-4 rounded-full bg-white/70 p-2 text-amber-600 shadow-sm">
              <Sparkles className="h-4 w-4" />
            </div>

            <div className="max-w-2xl">
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#D97706]">
                {hi ? "संस्थापक संदेश" : "Founder’s Message"}
              </p>
              <h1 className="mt-2 text-2xl font-black tracking-tight text-[#14213D] sm:text-3xl">
                {hi ? "सद्भाव, सेवा और संकल्प" : "Compassion, Service & Resolve"}
              </h1>
              <div className="mt-4 flex items-center gap-3 rounded-2xl border border-amber-200 bg-white/70 p-3 shadow-xs">
                <div className="h-12 w-12 overflow-hidden rounded-full border border-amber-300 bg-slate-100">
                  <img
                    src="/assets/founder.png"
                    alt="Rohit Pandit"
                    className="h-full w-full object-cover object-top"
                  />
                </div>
                <div>
                  <p className="text-sm font-black text-[#14213D]">Rohit Pandit</p>
                  <p className="text-[11px] font-semibold text-slate-600">
                    {hi ? "संस्थापक, आर.पी. फाउंडेशन" : "Founder, RP Foundation"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 p-5 sm:p-7">
            <blockquote className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 text-[14px] font-medium leading-relaxed text-slate-700 sm:text-[15px]">
              <Quote className="mb-2 h-4 w-4 text-[#D97706]" />
              {hi
                ? "हमारी सेवा तभी सार्थक होती है जब वह लोगों के जीवन में सच्ची सहानुभूति, वास्तविक समाधान और सम्मान के साथ पहुंचती है।" 
                : "Our service becomes meaningful only when it reaches people with genuine empathy, practical solutions, and lasting dignity."}
            </blockquote>

            <div className="space-y-4">
              <h2 className="text-lg font-black text-[#14213D]">
                {hi ? "हमारे मूल विचार" : "Our Core Beliefs"}
              </h2>

              <div className="grid gap-3 sm:grid-cols-2">
                {beliefs.map(({ icon: Icon, title, text }) => (
                  <motion.div
                    key={title}
                    whileHover={{ y: -2 }}
                    className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5"
                  >
                    <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-[#D97706]">
                      <Icon className="h-4 w-4" />
                    </div>
                    <h3 className="text-sm font-black text-[#14213D]">{title}</h3>
                    <p className="mt-1 text-[12px] leading-relaxed text-slate-600">{text}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4">
              <p className="text-[12px] font-bold uppercase tracking-[0.18em] text-[#167C5A]">
                {hi ? "हमारा दृष्टिकोण" : "Our approach"}
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-slate-700">
                {hi
                  ? "आर.पी. फाउंडेशन का उद्देश्य केवल सहायता देना नहीं है; बल्कि समुदायों को सक्षम बनाना, अवसर देना और जीवन की गुणवत्ता को स्थायी रूप से बढ़ाना है।"
                  : "RP Foundation is not only about relief—it is about strengthening communities, creating opportunity, and improving the quality of life in a sustainable way."}
              </p>
            </div>

            <button
              type="button"
              onClick={() => nav("/vision-goals")}
              className="inline-flex items-center gap-2 rounded-full bg-[#D97706] px-4 py-2.5 text-[11px] font-black uppercase tracking-[0.12em] text-white shadow-sm transition hover:bg-[#c76b05]"
            >
              {hi ? "दृष्टि देखें" : "Explore Our Vision"}
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </motion.section>
      </div>
    </main>
  );
}
