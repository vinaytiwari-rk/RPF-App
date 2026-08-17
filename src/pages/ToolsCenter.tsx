import React from "react";
import { Calculator, ChevronRight, Wrench } from "lucide-react";
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

      <section className="mt-7">
        <button
          onClick={() => navigate("/utilities/calculators")}
          className="flex w-full items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 text-left shadow-sm transition active:scale-[.98] hover:shadow-md"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700">
            <Calculator className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-extrabold text-slate-900">{hi ? "कैलकुलेटर सेंटर" : "Calculator Center"}</h3>
            <p className="mt-1 text-xs font-medium text-slate-500">{hi ? "100+ कैलकुलेटर और गणना टूल" : "100+ calculators and calculation tools"}</p>
          </div>
          <ChevronRight className="h-5 w-5 text-slate-300" />
        </button>
      </section>
    </div>
  );
}
