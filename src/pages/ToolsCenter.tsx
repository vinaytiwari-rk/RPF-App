import React from "react";
import { Calculator, ChevronRight, FileScan, HeartPulse, Moon, ScanLine, Sparkles, Timer, Wrench } from "lucide-react";
import { useNavigate, useOutletContext } from "react-router-dom";

type Lang = "en" | "hi";

type Tool = {
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  route: string;
};

export default function ToolsCenter() {
  const { lang } = useOutletContext<{ lang: Lang }>();
  const navigate = useNavigate();
  const hi = lang === "hi";

  const quickTools: Tool[] = [
    { title: hi ? "कैलकुलेटर सेंटर" : "Calculator Center", subtitle: hi ? "100+ कैलकुलेटर" : "100+ calculators", icon: Calculator, route: "/utilities/calculators" },
    { title: hi ? "BMI कैलकुलेटर" : "BMI Calculator", subtitle: hi ? "त्वरित स्वास्थ्य गणना" : "Quick health check", icon: HeartPulse, route: "/utilities/bmi-calculator" },
    { title: hi ? "स्प्लिट बिल" : "Split Bill", subtitle: hi ? "बिल आसानी से बाँटें" : "Split a bill easily", icon: Calculator, route: "/utilities/split-bill" },
    { title: hi ? "पोमोडोरो" : "Pomodoro", subtitle: hi ? "फोकस टाइमर" : "Focus timer", icon: Timer, route: "/utilities/pomodoro" },
    { title: hi ? "ब्रीदिंग" : "Breathing", subtitle: hi ? "शांत और केंद्रित रहें" : "Pause and reset", icon: Moon, route: "/utilities/breathing-meditator" },
    { title: hi ? "डॉक्यूमेंट स्कैनर" : "Document Scanner", subtitle: hi ? "दस्तावेज़ स्कैन करें" : "Scan documents", icon: ScanLine, route: "/doc-scanner" },
  ];

  return (
    <div className="min-h-screen bg-[#F7F8FC] pb-28">
      <div className="mx-auto max-w-3xl px-4 pt-6 sm:px-6">
        <header className="overflow-hidden rounded-[28px] bg-[#07133D] px-5 py-6 text-white shadow-[0_16px_45px_rgba(7,19,61,.16)]">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-[#FFB45B]">
                <Sparkles className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-[.2em]">Samahit Utilities</span>
              </div>
              <h1 className="mt-3 text-2xl font-black tracking-tight">{hi ? "टूल्स" : "Tools & Utilities"}</h1>
              <p className="mt-2 max-w-md text-sm leading-6 text-white/65">
                {hi ? "रोज़मर्रा के उपयोगी डिजिटल टूल्स, एक साफ़ और तेज़ अनुभव में।" : "Useful everyday digital tools, organised for a faster and cleaner experience."}
              </p>
            </div>
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/10 text-[#FFB45B]">
              <Wrench className="h-6 w-6" />
            </div>
          </div>
        </header>

        <section className="mt-6">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[.18em] text-[#FF9933]">Quick access</p>
              <h2 className="mt-1 text-lg font-black text-[#07133D]">{hi ? "अक्सर इस्तेमाल किए जाने वाले" : "Most useful"}</h2>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {quickTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <button
                  key={tool.route}
                  onClick={() => navigate(tool.route)}
                  className="group flex min-h-[88px] items-center gap-3 rounded-3xl border border-slate-200/80 bg-white p-4 text-left shadow-[0_5px_18px_rgba(15,23,42,.035)] transition active:scale-[.985] hover:-translate-y-[1px] hover:shadow-md"
                >
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#07133D]/[.055] text-[#07133D] group-hover:bg-[#07133D] group-hover:text-white transition-colors">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-black text-slate-900">{tool.title}</h3>
                    <p className="mt-1 text-xs font-medium text-slate-500">{tool.subtitle}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 text-slate-300 group-hover:text-[#FF9933]" />
                </button>
              );
            })}
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-[#FF9933]/20 bg-[#FFF8F0] p-4">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#FF9933] text-white">
              <Calculator className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-black text-[#07133D]">{hi ? "पूरा कैलकुलेटर सेंटर" : "Explore the full Calculator Center"}</p>
              <p className="mt-1 text-xs leading-5 text-slate-500">{hi ? "स्वास्थ्य, वित्त, गणित, समय और रोज़मर्रा की जरूरतों के लिए।" : "Health, finance, maths, time and everyday calculations in one place."}</p>
            </div>
            <button onClick={() => navigate("/utilities/calculators")} className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-[#07133D] shadow-sm" aria-label="Open Calculator Center">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-dashed border-slate-200 bg-white/60 p-4">
          <div className="flex items-center gap-3 text-slate-500">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-100"><FileScan className="h-5 w-5" /></div>
            <p className="text-xs leading-5">{hi ? "हर टूल के लिए केवल वही स्क्रीन खोलें जिसकी आपको जरूरत है — बिना अनावश्यक clutter के।" : "Open only the tool you need, without turning the app into a cluttered dashboard."}</p>
          </div>
        </section>
      </div>
    </div>
  );
}
