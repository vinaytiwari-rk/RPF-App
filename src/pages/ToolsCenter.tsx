import React from "react";
import { ChevronRight, Wrench, LayoutGrid, Calculator } from "lucide-react";
import { useNavigate, useOutletContext } from "react-router-dom";

type Lang = "en" | "hi";

export default function ToolsCenter() {
  const { lang } = useOutletContext<{ lang: Lang }>();
  const navigate = useNavigate();
  const hi = lang === "hi";

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-28">
      <header className="pt-3">
        <div className="flex items-center gap-2 text-[#000080]">
          <Wrench className="h-5 w-5" />
          <span className="text-xs font-black uppercase tracking-widest">RPF Tools</span>
        </div>
        <h1 className="mt-1 text-2xl font-black text-slate-900">{hi ? "टूल्स" : "Tools"}</h1>
        <p className="mt-1 text-sm text-slate-500">{hi ? "उपयोगी डिजिटल टूल्स एक जगह" : "Useful digital tools in one place"}</p>
      </header>

      <section className="mt-7 space-y-3">
        <button onClick={() => navigate("/utilities/calculators")} className="flex w-full items-center gap-4 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-left shadow-sm">
          <Calculator className="h-6 w-6 text-blue-800" /><span className="flex-1 font-extrabold text-blue-950">{hi ? "Calculator Center — सभी कैलकुलेटर" : "Calculator Center — All Calculators"}</span><ChevronRight className="h-5 w-5 text-blue-800" />
        </button>
        <button onClick={() => navigate("/utilities")} className="flex w-full items-center gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-left shadow-sm">
          <LayoutGrid className="h-6 w-6 text-emerald-800" /><span className="flex-1 font-extrabold text-emerald-950">{hi ? "फाइल टूल्स — PDF, Image, Excel, Word, Video, Audio" : "File Tools — PDF, Image, Excel, Word, Video & Audio"}</span><ChevronRight className="h-5 w-5 text-emerald-800" />
        </button>
      </section>
    </div>
  );
}
