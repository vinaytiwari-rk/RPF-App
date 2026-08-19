import React, { useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { ArrowLeft, ExternalLink, Play, Search, Tv } from "lucide-react";
import { LIVE_TV_DEFAULTS, type LiveTvChannel } from "../data/liveTvDefaults";

type CmsResponse = { cms?: { liveTvChannels?: unknown } };
const normalize = (value: unknown): LiveTvChannel[] => Array.isArray(value) ? value.filter((x: any) => x?.id && x?.name && x?.url).map((x: any, i) => ({ ...x, enabled: x.enabled !== false, order: Number.isFinite(x.order) ? x.order : i })).sort((a,b) => (a.order ?? 0) - (b.order ?? 0)) : [];

export default function LiveTV() {
  const { lang } = useOutletContext<{ lang: "en" | "hi" }>();
  const hi = lang === "hi";
  const [search, setSearch] = useState("");
  const [channels, setChannels] = useState<LiveTvChannel[]>(LIVE_TV_DEFAULTS);
  const [active, setActive] = useState<LiveTvChannel | null>(null);
  const [serverControlled, setServerControlled] = useState(false);

  useEffect(() => { let cancelled = false; fetch("/api/cms", { cache: "no-store" }).then(r => r.ok ? r.json() as Promise<CmsResponse> : null).then(data => { const configured = data?.cms?.liveTvChannels; if (!cancelled && Array.isArray(configured)) { setChannels(normalize(configured)); setServerControlled(true); } }).catch(() => undefined); return () => { cancelled = true; }; }, []);

  useEffect(() => {
    const onPopState = () => setActive(null);
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const visible = useMemo(() => channels.filter(c => c.enabled !== false), [channels]);
  const filtered = useMemo(() => { const q = search.trim().toLowerCase(); return q ? visible.filter(c => `${c.name} ${c.category}`.toLowerCase().includes(q)) : visible; }, [search, visible]);
  const videoId = active?.videoId || active?.url.match(/(?:youtu\.be\/|youtube\.com\/(?:live\/|watch\?v=))([^?&/]+)/)?.[1];
  const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1&rel=0` : null;

  const openPlayer = (channel: LiveTvChannel) => {
    window.history.pushState({ rpfLiveTvPlayer: true }, "");
    setActive(channel);
  };

  const closePlayer = () => {
    if (window.history.state?.rpfLiveTvPlayer) window.history.back();
    else setActive(null);
  };

  return <div className="min-h-full bg-slate-50 pb-10"><div className="mx-auto max-w-5xl px-4 py-5 sm:px-6">
    {active ? <div className="fixed inset-0 z-50 flex min-h-[100dvh] flex-col bg-black text-white">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
        <button onClick={closePlayer} className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-xs font-bold text-white"><ArrowLeft className="h-4 w-4" />{hi ? "वापस" : "Back"}</button>
        <p className="min-w-0 flex-1 truncate text-center text-sm font-black">{active.name}</p>
        <a className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-bold text-slate-900" href={active.url} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" />{hi ? "खोलें" : "Open"}</a>
      </div>
      <div className="flex flex-1 items-center justify-center bg-black">
        <div className="w-full max-w-6xl aspect-video">{embedUrl ? <iframe className="h-full w-full" src={embedUrl} title={active.name} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen /> : <div className="grid h-full place-items-center p-6 text-center text-white"><div><Tv className="mx-auto mb-3 h-10 w-10" /><p className="font-bold">{active.name}</p><a className="mt-4 inline-block rounded-xl bg-white px-4 py-2 text-sm font-bold text-slate-900" href={active.url} target="_blank" rel="noreferrer">Open stream</a></div></div>}</div>
      </div>
      <div className="border-t border-white/10 px-4 py-3 text-center"><p className="text-sm font-black">{active.name}</p><p className="mt-1 text-xs text-white/60">{active.category}{embedUrl ? "" : (hi ? " • एम्बेड उपलब्ध नहीं" : " • Embed unavailable")}</p></div>
    </div> : <><div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-red-50 text-red-600"><Tv className="h-6 w-6" /></div><div><h1 className="text-xl font-black text-slate-900">{hi ? "लाइव टीवी" : "Live TV"}</h1><p className="text-xs text-slate-500">{visible.length} {hi ? "चैनल उपलब्ध" : "channels available"}{serverControlled ? " • Live configuration" : ""}</p></div></div><div className="relative mt-5"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder={hi ? "चैनल खोजें..." : "Search channels..."} className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-slate-400" /></div><div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{filtered.map(channel => <button key={channel.id} onClick={() => openPlayer(channel)} className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-900 text-white"><Play className="h-4 w-4 fill-current" /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-black text-slate-900">{channel.name}</p><p className="mt-0.5 text-[11px] font-semibold text-slate-500">{channel.category}</p></div></button>)}</div>{!filtered.length && <div className="py-16 text-center text-sm text-slate-500">{hi ? "कोई चैनल नहीं मिला" : "No channels found"}</div>}</>}</div></div>;
}
