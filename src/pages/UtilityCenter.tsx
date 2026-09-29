import React from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Calculator, Wrench, Smartphone, Wind, Clock3, HeartPulse, ReceiptIndianRupee, FileScan, Globe, ArrowRight } from "lucide-react";

type Lang = "en" | "hi";
const links = [
  { path: "/utilities/calculators", en: "100+ Calculator Directory", hi: "100+ कैलकुलेटर", desc: "Health, finance, maths, date, internet and more", icon: Calculator },
  { path: "/utilities/calculator", en: "Scientific Calculator", hi: "साइंटिफिक कैलकुलेटर", desc: "On-device calculation", icon: Calculator },
  { path: "/utilities/bmi-calculator", en: "BMI Calculator", hi: "BMI कैलकुलेटर", desc: "Body mass index", icon: HeartPulse },
  { path: "/utilities/gst-calculator", en: "GST Calculator", hi: "GST कैलकुलेटर", desc: "GST and invoice calculations", icon: ReceiptIndianRupee },
  { path: "/utilities/split-bill", en: "Split Bill", hi: "बिल बाँटें", desc: "Share expenses", icon: Calculator },
  { path: "/device-tools", en: "Device Tools", hi: "डिवाइस टूल्स", desc: "Phone utilities", icon: Smartphone },
  { path: "/doc-scanner", en: "Document Scanner", hi: "दस्तावेज़ स्कैनर", desc: "Scan documents", icon: FileScan },
  { path: "/utilities/pomodoro", en: "Focus Timer", hi: "फोकस टाइमर", desc: "Pomodoro", icon: Clock3 },
  { path: "/utilities/breathing-meditator", en: "Breathing Meditator", hi: "श्वास अभ्यास", desc: "Guided breathing", icon: Wind },
  { path: "/browser", en: "In-App Browser", hi: "इन-ऐप ब्राउज़र", desc: "Open useful websites", icon: Globe },
];
export default function UtilityCenter() {
  const { lang } = useOutletContext<{ lang: Lang }>();
  const navigate = useNavigate();
  const hi = lang === "hi";
  return <div className="min-h-screen bg-[#FFF7E8] p-4 pb-28">
    <header className="rounded-3xl bg-[#F0FAF4] p-5">
      <div className="flex items-center gap-2 text-[#245D45]"><Wrench className="h-5 w-5"/><span className="text-xs font-black uppercase tracking-widest">Samahit Utility</span></div>
      <h1 className="mt-2 text-2xl font-black text-[#243B32]">{hi ? "यूटिलिटी और कैलकुलेटर" : "Utilities & Calculators"}</h1>
      <p className="mt-1 text-sm text-[#52685C]">{hi ? "सभी कैलकुलेटर, वेबसाइट लिंक और जरूरी टूल्स एक जगह।" : "All calculators, website links and useful tools in one place."}</p>
    </header>
    <section className="mt-5 grid gap-3 sm:grid-cols-2">
      {links.map(({path,en,hi:hiTitle,desc,icon:Icon}) => <button key={path} type="button" onClick={() => navigate(path)}
        className="flex items-center gap-3 rounded-2xl border border-[#D8E8DB] bg-white p-4 text-left shadow-sm transition hover:border-[#245D45]">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F0FAF4] text-[#245D45]"><Icon className="h-5 w-5"/></span>
        <span className="min-w-0 flex-1"><span className="block text-sm font-extrabold text-[#243B32]">{hi ? hiTitle : en}</span><span className="mt-1 block text-xs text-slate-500">{desc}</span></span>
        <ArrowRight className="h-4 w-4 shrink-0 text-[#245D45]"/>
      </button>)}
    </section>
    <p className="mt-5 text-xs text-[#52685C]">{hi ? "कुछ कैलकुलेटर बाहरी वेबसाइट पर खुलते हैं; उनके परिणाम संबंधित वेबसाइट पर निर्भर हैं।" : "Some calculators open external websites and depend on those services."}</p>
  </div>;
}
