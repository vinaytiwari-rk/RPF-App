import React, { useMemo, useState } from "react";
import { useOutletContext, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, ExternalLink, Globe, Home, Lock, Plus, RefreshCw, Search, ShieldCheck, X } from "lucide-react";

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
  const isHi = lang === "hi";
  const [url, setUrl] = useState(HOME);
  const [input, setInput] = useState(HOME);
  const [key, setKey] = useState(0);
  const [history, setHistory] = useState<string[]>([HOME]);
  const [index, setIndex] = useState(0);
  const current = history[index] || HOME;
  const canBack = index > 0;
  const canForward = index < history.length - 1;
  const title = useMemo(() => { try { return new URL(current).hostname.replace(/^www\./, ""); } catch { return "RPF Browser"; } }, [current]);

  const open = (value: string, replace = false) => {
    const next = normalize(value);
    setInput(next); setUrl(next); setKey(k => k + 1);
    if (replace) setHistory(h => [...h.slice(0, index), next, ...h.slice(index + 1)]);
    else { const nextHistory = [...history.slice(0, index + 1), next]; setHistory(nextHistory); setIndex(nextHistory.length - 1); }
  };
  const back = () => { if (!canBack) return; const i = index - 1; setIndex(i); setUrl(history[i]); setInput(history[i]); setKey(k => k + 1); };
  const forward = () => { if (!canForward) return; const i = index + 1; setIndex(i); setUrl(history[i]); setInput(history[i]); setKey(k => k + 1); };
  const home = () => open(HOME);

  return <div className="flex flex-col min-h-screen bg-slate-100 pb-24">
    <header className="sticky top-0 z-20 bg-white border-b border-slate-200 shadow-sm">
      <div className="p-3 flex items-center gap-2"><button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full border bg-white flex items-center justify-center"><ArrowLeft className="w-4 h-4"/></button><div className="flex-1 min-w-0"><p className="font-black text-sm text-slate-900 truncate">RPF {isHi ? "इन-ऐप ब्राउज़र" : "In-App Browser"}</p><p className="text-[10px] text-slate-500 truncate">{title}</p></div><ShieldCheck className="w-5 h-5 text-green-600"/></div>
      <form onSubmit={e => { e.preventDefault(); open(input); }} className="px-3 pb-3"><div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"><Lock className="w-3.5 h-3.5 text-green-600 shrink-0"/><input value={input} onChange={e => setInput(e.target.value)} className="bg-transparent outline-none flex-1 text-xs font-semibold" placeholder="Search or enter URL"/><button type="submit"><Search className="w-4 h-4 text-slate-500"/></button><button type="button" onClick={() => setInput("")}><X className="w-4 h-4 text-slate-400"/></button></div></form>
      <div className="px-3 pb-2 flex items-center gap-1"><button disabled={!canBack} onClick={back} className="p-2 disabled:opacity-30"><ChevronLeft className="w-5 h-5"/></button><button disabled={!canForward} onClick={forward} className="p-2 disabled:opacity-30"><ChevronRight className="w-5 h-5"/></button><button onClick={() => open(current, true)} className="p-2"><RefreshCw className="w-4 h-4"/></button><button onClick={home} className="p-2"><Home className="w-4 h-4"/></button><button onClick={() => open(HOME)} className="p-2"><Plus className="w-4 h-4"/></button><a href={current} target="_blank" rel="noopener noreferrer" className="p-2 ml-auto" title="Open externally"><ExternalLink className="w-4 h-4"/></a></div>
    </header>
    <main className="flex-1 bg-white"><iframe key={key} src={url} title={title} className="w-full h-[calc(100vh-150px)] border-0" referrerPolicy="strict-origin-when-cross-origin" /></main>
  </div>;
}
