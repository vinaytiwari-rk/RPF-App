import React from "react";
import {
  Bell,
  Calculator,
  Camera,
  ChevronRight,
  FileText,
  MapPin,
  CalendarDays,
  ShieldCheck,
  Smartphone,
  Wrench,
} from "lucide-react";
import { useNavigate, useOutletContext } from "react-router-dom";

type Lang = "en" | "hi";

type Tool = {
  title: string;
  titleHi: string;
  description: string;
  descriptionHi: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
};

const tools: Tool[] = [
  {
    title: "Calculator Center",
    titleHi: "कैलकुलेटर सेंटर",
    description: "Calculation tools in one place",
    descriptionHi: "गणना के उपयोगी टूल्स एक जगह",
    path: "/utilities/calculators",
    icon: Calculator,
  },
  {
    title: "Document Scanner",
    titleHi: "डॉक्यूमेंट स्कैनर",
    description: "Scan and export documents as image or PDF",
    descriptionHi: "दस्तावेज़ स्कैन करें और इमेज या PDF में सेव करें",
    path: "/doc-scanner",
    icon: Camera,
    badge: "On device",
  },
  {
    title: "Notes & Reminders",
    titleHi: "नोट्स और रिमाइंडर",
    description: "Keep private notes and reminder lists on this device",
    descriptionHi: "निजी नोट्स और रिमाइंडर सूची इस डिवाइस पर रखें",
    path: "/local-planner",
    icon: Bell,
    badge: "Local",
  },
  {
    title: "Resume Builder",
    titleHi: "रिज़्यूमे बिल्डर",
    description: "Create and export your resume",
    descriptionHi: "अपना रिज़्यूमे बनाएं और एक्सपोर्ट करें",
    path: "/resume-builder",
    icon: FileText,
  },
  {
    title: "Calendar",
    titleHi: "कैलेंडर",
    description: "Calendar and date information",
    descriptionHi: "कैलेंडर और तारीख से जुड़ी जानकारी",
    path: "/hindu-calendar",
    icon: CalendarDays,
  },
  {
    title: "Device Tools",
    titleHi: "डिवाइस टूल्स",
    description: "Useful tools for your device",
    descriptionHi: "आपके डिवाइस के लिए उपयोगी टूल्स",
    path: "/device-tools",
    icon: Smartphone,
  },
  {
    title: "Location Tools",
    titleHi: "लोकेशन टूल्स",
    description: "Use location only when you choose to share it",
    descriptionHi: "लोकेशन केवल आपकी अनुमति पर इस्तेमाल होगी",
    path: "/device-tools",
    icon: MapPin,
    badge: "Permission first",
  },
];

export default function ToolsCenter() {
  const { lang } = useOutletContext<{ lang: Lang }>();
  const navigate = useNavigate();
  const hi = lang === "hi";

  return (
    <main className="min-h-screen bg-[var(--rp-page,#f8fafc)] px-4 pb-28 pt-5 sm:px-6">
      <header className="mx-auto max-w-4xl">
        <div className="flex items-center gap-2 text-[var(--rp-primary,#000080)]">
          <Wrench className="h-5 w-5" />
          <span className="text-xs font-black uppercase tracking-[0.18em]">RPF Utility Hub</span>
        </div>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">
          {hi ? "यूटिलिटी हब" : "Utility Hub"}
        </h1>
        <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
          {hi
            ? "रोज़मर्रा के उपयोगी टूल्स एक जगह। जहाँ संभव हो, आपका निजी डेटा आपके डिवाइस पर ही रहता है।"
            : "Useful everyday tools in one place. Where possible, your private data stays on your device."}
        </p>
      </header>

      <section className="mx-auto mt-7 max-w-4xl" aria-labelledby="utility-tools-heading">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 id="utility-tools-heading" className="text-base font-black text-slate-900">
            {hi ? "उपयोगी टूल्स" : "Useful tools"}
          </h2>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700">
            <ShieldCheck className="h-3.5 w-3.5" />
            {hi ? "प्राइवेसी पहले" : "Privacy first"}
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.title}
                onClick={() => navigate(tool.path)}
                className="group flex min-h-[104px] w-full items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:scale-[.99]"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-[var(--rp-primary,#000080)]">
                  <Icon className="h-6 w-6" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-extrabold text-slate-900">{hi ? tool.titleHi : tool.title}</h3>
                    {tool.badge && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-500">
                        {tool.badge}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    {hi ? tool.descriptionHi : tool.description}
                  </p>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-slate-300 transition group-hover:text-slate-500" />
              </button>
            );
          })}
        </div>
      </section>
    </main>
  );
}
