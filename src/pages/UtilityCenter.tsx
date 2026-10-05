import React from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Calculator, Wrench, Smartphone, Wind, Clock3, FileScan, Globe, ArrowRight, FileText, Image, QrCode, CalendarDays, NotebookPen, LockKeyhole, Bell, ArrowLeftRight } from "lucide-react";

type Lang = "en" | "hi";
const links = [
  { path: "/utilities/everyday/pdf-compress", en: "PDF Optimizer", hi: "PDF ऑप्टिमाइज़र", desc: "Lossless PDF structure compression", icon: FileText },
  { path: "/utilities/everyday/reminders", en: "Reminders", hi: "रिमाइंडर", desc: "Offline reminders, visible when app opens", icon: Bell },
  { path: "/utilities/everyday/converter", en: "Unit Converter", hi: "यूनिट कन्वर्टर", desc: "Length and weight offline", icon: ArrowLeftRight },
  { path: "/utilities/everyday/notes", en: "Notes & Checklist", hi: "नोट्स और चेकलिस्ट", desc: "Saved offline on your device", icon: NotebookPen },
  { path: "/utilities/everyday/image", en: "Image Resize & Convert", hi: "फोटो Resize और Convert", desc: "Offline JPG conversion", icon: Image },
  { path: "/utilities/everyday/image-pdf", en: "Images to PDF", hi: "फोटो से PDF", desc: "Create PDF without upload", icon: FileText },
  { path: "/utilities/everyday/pdf-merge", en: "Merge PDFs", hi: "PDF जोड़ें", desc: "Combine documents offline", icon: FileText },
  { path: "/utilities/everyday/pdf-split", en: "Split PDF", hi: "PDF अलग करें", desc: "Download individual pages", icon: FileText },
  { path: "/utilities/everyday/qr", en: "QR Generator", hi: "QR कोड बनाएं", desc: "Create QR offline", icon: QrCode },
  { path: "/utilities/everyday/date", en: "Date Difference", hi: "तारीख का अंतर", desc: "Count days between dates", icon: CalendarDays },
  { path: "/utilities/everyday/password", en: "Password Generator", hi: "पासवर्ड जनरेटर", desc: "Secure offline passwords", icon: LockKeyhole },
  { path: "/utilities/calculators", en: "Calculator Center", hi: "कैलकुलेटर सेंटर", desc: "All calculators in one clean local catalog", icon: Calculator },
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
      {Array.from(new Map(links.map(item => [item.path, item])).values()).map(({path,en,hi:hiTitle,desc,icon:Icon}) => <button key={path} type="button" onClick={() => navigate(path)}
        className="flex items-center gap-3 rounded-2xl border border-[#D8E8DB] bg-white p-4 text-left shadow-sm transition hover:border-[#245D45]">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F0FAF4] text-[#245D45]"><Icon className="h-5 w-5"/></span>
        <span className="min-w-0 flex-1"><span className="block text-sm font-extrabold text-[#243B32]">{hi ? hiTitle : en}</span><span className="mt-1 block text-xs text-slate-500">{desc}</span></span>
        <ArrowRight className="h-4 w-4 shrink-0 text-[#245D45]"/>
      </button>)}
    </section>
    <p className="mt-5 text-xs text-[#52685C]">{hi ? "कैलकुलेटर अब एक ही Calculator Center में रखे गए हैं, ताकि एक ही टूल कई जगह दोबारा न दिखे।" : "Calculators are kept in one Calculator Center so the same tool does not appear in multiple places."}</p>
  </div>;
}
