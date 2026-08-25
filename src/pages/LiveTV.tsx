import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { ArrowLeft, Play, Search, Tv, Sparkles, ShieldCheck, Maximize2, ExternalLink } from "lucide-react";
import { LIVE_TV_DEFAULTS, type LiveTvChannel } from "../data/liveTvDefaults";
import { openExternalLink } from "../utils/browser";

type CmsResponse = { cms?: { liveTvChannels?: unknown } };

const U: Record<string, string> = {
  aajtak: "Nq2wYlWFucg",
  news18: "FUq2yNcvlDg",
  "news 18 india": "FUq2yNcvlDg",
  "cnn news 18": "FUq2yNcvlDg",
  "india tv": "26RLYAam9B8",
  "ndtv india": "DqOXmLNdw7w",
  "times now navbharat": "77qMaUtV030",
  "times now hindi": "77qMaUtV030",
  "republic bharat": "WpU7xbSUnjc",
  "tv9 bharatvarsh": "nSpwwcHVp80",
  news24: "hu20-r1oe2g",
  wion: "vfszY1JYbMc",
  france24: "HvZt-nh9sGg",
  "france 24": "HvZt-nh9sGg",
  "euro news": "pykpO5kQJ98",
  euronews: "pykpO5kQJ98",
  "republic world": "Cb1IpjEmozs",
  cnn: "GotlA1KKWoo",
  ndtv: "CQSJGYd6myg",
  "al jazeera": "gCNeDWCI0vo",
  bloomberg: "f39oHo6vFLg",
  "abp news": "nyd-xznCpJc",
  "zee news": "uAM4XUA_WmQ",
};

const normalize = (v: unknown): LiveTvChannel[] =>
  Array.isArray(v)
    ? v
        .filter((x: any) => x?.id && x?.name && x?.url)
        .map((x: any, i) => ({
          ...x,
          enabled: x.enabled !== false,
          order: Number.isFinite(x.order) ? x.order : i,
        }))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    : [];

const yt = (id: string) => `https://www.youtube.com/live/${id}`;

const canonical = (items: LiveTvChannel[]) =>
  items
    .filter((c) => !["ani", "ians"].includes(c.name.trim().toLowerCase()))
    .map((c) => {
      const id = U[c.name.trim().toLowerCase()];
      return id ? { ...c, url: yt(id), videoId: id } : c;
    });

const getId = (c: LiveTvChannel) =>
  c.videoId || c.url.match(/(?:youtu\.be\/|youtube\.com\/(?:live\/|watch\?v=))([^?&/]+)/)?.[1];

export default function LiveTV() {
  const { lang } = useOutletContext<{ lang: "en" | "hi" }>();
  const navigate = useNavigate();
  const hi = lang === "hi";

  const [search, setSearch] = useState("");
  const [channels, setChannels] = useState<LiveTvChannel[]>(() => canonical(LIVE_TV_DEFAULTS));
  const [active, setActive] = useState<LiveTvChannel | null>(null);
  const [serverControlled, setServerControlled] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/cms", { cache: "no-store" })
      .then((r) => (r.ok ? (r.json() as Promise<CmsResponse>) : null))
      .then((data) => {
        const configured = data?.cms?.liveTvChannels;
        if (!cancelled && Array.isArray(configured)) {
          setChannels(canonical(normalize(configured)));
          setServerControlled(true);
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const f = () => setActive(null);
    window.addEventListener("popstate", f);
    return () => window.removeEventListener("popstate", f);
  }, []);

  const visible = useMemo(() => channels.filter((c) => c.enabled !== false), [channels]);
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? visible.filter((c) => `${c.name} ${c.category}`.toLowerCase().includes(q)) : visible;
  }, [search, visible]);

  const id = active ? getId(active) : undefined;
  const embed = id ? `https://www.youtube.com/embed/${id}?autoplay=1&playsinline=1&rel=0` : null;

  const openPlayer = (c: LiveTvChannel) => {
    window.history.pushState({ rpfLiveTvPlayer: true }, "");
    setActive(c);
  };

  const close = () => {
    if (window.history.state?.rpfLiveTvPlayer) window.history.back();
    else setActive(null);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-28 font-sans text-slate-800 selection:bg-orange-100">
      {active ? (
        /* Fullscreen Player Modal */
        <div className="fixed inset-0 z-50 flex min-h-[100dvh] flex-col bg-black text-white">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 bg-slate-900/90 backdrop-blur-md">
            <button
              onClick={close}
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3.5 py-2 text-xs font-black text-white hover:bg-white/20 transition active:scale-95"
            >
              <ArrowLeft className="h-4 w-4" />
              {hi ? "वापस" : "Back"}
            </button>
            <p className="min-w-0 flex-1 truncate text-center text-sm font-black font-serif px-2">
              {active.name}
            </p>
            <button
              onClick={() => openExternalLink(active.url, navigate, active.name)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-orange-500/20 text-orange-300 border border-orange-400/30 px-3 py-1.5 text-xs font-bold hover:bg-orange-500/30 transition"
              title="Open External"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{hi ? "ब्राउज़र" : "Browser"}</span>
            </button>
          </div>

          <div className="flex flex-1 items-center justify-center bg-black p-2 sm:p-4">
            <div className="w-full max-w-5xl aspect-video rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-slate-950 relative">
              {embed ? (
                <iframe
                  className="h-full w-full border-0"
                  src={embed}
                  title={active.name}
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  allowFullScreen
                />
              ) : (
                <div className="grid h-full place-items-center p-6 text-center text-white">
                  <div>
                    <Tv className="mx-auto mb-3 h-12 w-12 text-orange-400 animate-pulse" />
                    <p className="font-bold text-lg">{active.name}</p>
                    <button
                      onClick={() => openExternalLink(active.url, navigate, active.name)}
                      className="mt-4 rounded-2xl bg-gradient-to-r from-[#FF9933] to-[#F59E0B] px-5 py-2.5 text-xs font-black text-white shadow-lg active:scale-95"
                    >
                      {hi ? "RPF ब्राउज़र में खोलें" : "Open in RPF Browser"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Main Channels Directory View */
        <div className="mx-auto max-w-4xl px-4 py-5 space-y-5">
          {/* Saffron-Gold Header Card */}
          <div className="bg-gradient-to-br from-[#FF9933] via-[#F59E0B] to-[#D97706] rounded-3xl p-5 text-white shadow-lg relative overflow-hidden border border-amber-200/40 space-y-2">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 px-3 py-0.5 text-[10px] font-black uppercase tracking-wider text-white">
                <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                {hi ? "लाइव न्यूज़ एवं ब्रॉडकास्ट" : "Live News & Broadcast"}
              </div>
              <span className="text-[10px] font-bold bg-white/20 px-2.5 py-0.5 rounded-md border border-white/30">
                {visible.length} {hi ? "चैनल" : "Channels"}
              </span>
            </div>

            <h1 className="text-2xl font-black tracking-tight font-serif text-white">
              {hi ? "आर.पी.एफ. लाइव टीवी" : "RPF Live TV Channels"}
            </h1>
            <p className="text-xs text-amber-100 font-medium">
              {hi
                ? "राष्ट्रीय एवं अंतर्राष्ट्रीय लाइव समाचार चैनल एक ही स्थान पर निःशुल्क देखें।"
                : "Watch live national & international news channels directly in HD."}
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={hi ? "चैनल खोजें..." : "Search live channels..."}
              className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-xs font-bold outline-none focus:border-[#FF9933] shadow-xs text-slate-800 placeholder:text-slate-400"
            />
          </div>

          {/* Channels Grid */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c) => {
              const v = getId(c);
              const thumb = v ? `https://i.ytimg.com/vi/${v}/hqdefault.jpg` : null;
              return (
                <button
                  key={c.id}
                  onClick={() => openPlayer(c)}
                  className="group overflow-hidden rounded-3xl border border-slate-200/80 bg-white text-left shadow-xs hover:shadow-md hover:border-[#FF9933]/60 transition-all duration-200 active:scale-[0.99]"
                >
                  <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
                    {thumb ? (
                      <img
                        src={thumb}
                        alt={c.name}
                        loading="lazy"
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-slate-800 text-slate-400">
                        <Tv className="h-10 w-10" />
                      </div>
                    )}
                    <span className="absolute bottom-3 left-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-[#FF9933] shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="h-4 h-4 fill-current ml-0.5" />
                    </span>
                    <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-red-600 px-2.5 py-0.5 text-[9px] font-black uppercase text-white shadow-md">
                      <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                      LIVE
                    </span>
                  </div>

                  <div className="p-4 flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-black text-slate-900 leading-tight">
                        {c.name}
                      </p>
                      <p className="mt-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                        {c.category}
                      </p>
                    </div>
                    <Maximize2 className="w-4 h-4 text-slate-300 group-hover:text-[#FF9933] transition-colors shrink-0 ml-2" />
                  </div>
                </button>
              );
            })}
          </div>

          {!filtered.length && (
            <div className="py-16 text-center text-xs font-bold text-slate-500 bg-white rounded-3xl border border-slate-200 p-6">
              {hi ? "कोई चैनल नहीं मिला" : "No channels found matching your search."}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
