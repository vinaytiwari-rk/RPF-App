import React from "react";
import { CheckCircle2, ExternalLink } from "lucide-react";
import { useNavigate, useOutletContext } from "react-router-dom";

type Lang = "en" | "hi";

const SOURCES = [
  { name: "Google Fact Check Explorer", url: "https://toolbox.google.com/factcheck/explorer/search/list:recent;hl=en", description: "Search and review recent fact-checks." },
  { name: "Originality.ai Automated Fact Checker", url: "https://originality.ai/automated-fact-checker", description: "Check claims with an automated fact-checking tool." },
];

export default function FactCheck() {
  const { lang } = useOutletContext<{ lang: Lang }>();
  const navigate = useNavigate();
  const hi = lang === "hi";
  return (
    <main className="min-h-full bg-slate-50 pb-28">
      <div className="mx-auto w-full max-w-3xl px-4 py-6">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"><CheckCircle2 className="h-6 w-6" /></div>
            <div><h1 className="text-2xl font-black text-[#000080]">{hi ? "फैक्ट चेक" : "Fact Check"}</h1><p className="mt-1 text-xs text-slate-500">{hi ? "दावों और खबरों की तथ्य-जांच के लिए उपयोगी स्रोत" : "Useful sources for checking claims and news"}</p></div>
          </div>
          <div className="mt-6 space-y-3">
            {SOURCES.map(source => (
              <button key={source.url} type="button" onClick={() => navigate(`/browser?url=${encodeURIComponent(source.url)}`)} className="flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:bg-white hover:shadow-sm active:scale-[.99]">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm"><ExternalLink className="h-5 w-5" /></div>
                <div className="min-w-0 flex-1"><h2 className="text-sm font-black text-slate-800">{source.name}</h2><p className="mt-1 text-xs text-slate-500">{source.description}</p></div>
              </button>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
