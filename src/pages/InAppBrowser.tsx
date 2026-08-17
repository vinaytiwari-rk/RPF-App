import React, { useMemo, useState } from "react";
import { useOutletContext, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, Home, Lock, RefreshCw, ShieldCheck } from "lucide-react";

type Lang = "en" | "hi";
const HOME = "https://www.google.com";

function normalize(value: string) {
  const v = value.trim();
  if (!v) return HOME;
  if (/^https?:\/\//i.test(v)) return v;
  if (/^[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(v)) return `https://${v}`;
  return `https://www.google.com/search?q=${encodeURIComponent(v)}`;
}

export default function InAppBrowser() {
  const { lang } = useOutletContext<{ lang: Lang }>();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const isHi = lang === "hi";
  const initial = normalize(params.get("url") || HOME);
  const [history, setHistory] = useState<string[]>([initial]);
  const [index, setIndex] = useState(0);
  const [key, setKey] = useState(0);
  const current = history[index] || HOME;
  const canBack = index > 0;
  const canForward = index < history.length - 1;
  const title = useMemo(() => {
    try { return new URL(current).hostname.replace(/^www\./, ""); }
    catch { return "RPF"; }
  }, [current]);

  const open = (value: string, replace = false) => {
    const next = normalize(value);
    setKey(k => k + 1);
    if (replace) setHistory(h => [...h.slice(0, index), next, ...h.slice(index + 1)]);
    else {
      const nextHistory = [...history.slice(0, index + 1), next];
      setHistory(nextHistory);
      setIndex(nextHistory.length - 1);
    }
  };
  const back = () => { if (!canBack) return; const i = index - 1; setIndex(i); setKey(k => k + 1); };
  const forward = () => { if (!canForward) return; const i = index + 1; setIndex(i); setKey(k => k + 1); };

  return <div className="flex min-h-screen flex-col bg-white pb-24">
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
      <div className="flex items-center gap-2 px-3 py-2">
        <button onClick={() => navigate(-1)} aria-label="Back to RPF" className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-black text-slate-900">{isHi ? "RPF रीडिंग मोड" : "RPF Reading Mode"}</p>
          <p className="truncate text-[10px] text-slate-500">{title}</p>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-emerald-700" title={isHi ? "सुरक्षित कनेक्शन" : "Secure connection"}>
          <Lock className="h-3 w-3" /><span className="text-[9px] font-bold">HTTPS</span>
        </div>
        <ShieldCheck className="h-5 w-5 text-emerald-600" />
      </div>
      <div className="flex items-center gap-1 px-3 pb-2">
        <button disabled={!canBack} onClick={back} aria-label="Previous page" className="p-2 disabled:opacity-30"><ChevronLeft className="h-5 w-5" /></button>
        <button disabled={!canForward} onClick={forward} aria-label="Next page" className="p-2 disabled:opacity-30"><ChevronRight className="h-5 w-5" /></button>
        <button onClick={() => open(current, true)} aria-label="Refresh" className="p-2"><RefreshCw className="h-4 w-4" /></button>
        <button onClick={() => open(HOME)} aria-label="Home" className="p-2"><Home className="h-4 w-4" /></button>
        <span className="ml-auto text-[9px] font-semibold text-slate-400">{isHi ? "क्लीन रीडिंग मोड" : "Clean Reading Mode"}</span>
      </div>
    </header>
    <main className="min-h-0 flex-1 bg-white">
      <iframe key={key} src={current} title={title} className="h-[calc(100vh-112px)] w-full border-0" referrerPolicy="strict-origin-when-cross-origin" />
    </main>
  </div>;
}
