import React, { useEffect, useMemo, useState, useRef } from "react";
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { useNavigate, useOutletContext } from "react-router-dom";
import { RadioReceiver, ArrowLeft, Play, Search, Tv, Sparkles, Maximize2, ExternalLink, LayoutGrid, List, Columns } from "lucide-react";
import { LIVE_TV_DEFAULTS, type LiveTvChannel } from "../data/liveTvDefaults";
import { openExternalLink } from "../utils/browser";
import { getMediaSourceType } from "../utils/mediaSourceType";

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
  const [visibleCount, setVisibleCount] = useState(40);
  const [channels, setChannels] = useState<LiveTvChannel[]>(() => canonical(LIVE_TV_DEFAULTS));
  const [active, setActive] = useState<LiveTvChannel | null>(null);
  const [playerError, setPlayerError] = useState("");
  const [, setServerControlled] = useState(false);
  const [layout, setLayout] = useState<"grid" | "list" | "compact" | "theater">("grid");
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/cms", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const configured = data?.cms?.liveTvChannels;
        if (!cancelled && Array.isArray(configured) && configured.length > 0) {
          setChannels(canonical(normalize(configured)));
          setServerControlled(true);
        }
        if (!cancelled && data?.cms?.liveTvLayout) {
          setLayout(data.cms.liveTvLayout);
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
  useEffect(() => { setVisibleCount(40); }, [search]);
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

  // Initialize video.js player for non-YouTube streams.
  // Detect MIME type per URL; a hard-coded HLS type breaks direct MP4/audio URLs.
  useEffect(() => {
    if (!active || !videoRef.current || embed) {
      setPlayerError("");
      return;
    }

    setPlayerError("");
    const srcUrl = active.url;
    const player = videojs(videoRef.current, {
      fluid: true,
      autoplay: true,
      controls: true,
      preload: 'auto',
      html5: {
        vhs: {
          enableLowInitialPlaylist: true,
          smoothQualityChange: true,
          fastReady: true,
          useDeviceAmpSupported: true
        }
      }
    });

    const handlePlayerError = () => {
      const error = player.error();
      setPlayerError(error?.message || "This direct stream could not be played. The stream may be unavailable or blocked by its provider.");
    };

    player.on("error", handlePlayerError);
    player.src({ src: srcUrl, type: getMediaSourceType(srcUrl) });

    return () => {
      player.off("error", handlePlayerError);
      player.dispose();
    };
  }, [active, embed]);

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
                <div className="relative h-full w-full">
                  <video
                    ref={videoRef}
                    className="video-js vjs-default-skin h-full w-full"
                    controls
                  />
                  {playerError && (
                    <div role="alert" className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-slate-950/95 p-5 text-center">
                      <p className="text-sm font-bold text-white">Stream playback failed</p>
                      <p className="max-w-lg text-xs leading-relaxed text-slate-300">{playerError}</p>
                      <p className="max-w-lg text-[11px] leading-relaxed text-slate-400">Some providers block in-app playback (CORS), require a valid session, or may have an offline stream.</p>
                      <button
                        type="button"
                        onClick={() => openExternalLink(active.url, navigate, active.name)}
                        className="rounded-xl bg-orange-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-orange-400"
                      >
                        {hi ? "ब्राउज़र में खोलें" : "Open in Browser"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Main Channels Directory View */
        <div className="mx-auto max-w-4xl px-4 py-5 space-y-4 text-[#14213D]">
          {/* Media Type Toggle */}
          <div className="flex justify-center mb-2">
            <div className="inline-flex items-center rounded-full bg-slate-200/60 p-1 shadow-inner backdrop-blur-md border border-slate-300/30">
              <button
                className="flex items-center gap-1.5 rounded-full px-5 py-2 text-[11px] font-black uppercase tracking-wider text-white bg-gradient-to-r from-orange-500 to-amber-500 shadow-sm transition"
              >
                <Tv className="h-4 w-4" />
                Live TV
              </button>
              <button
                onClick={() => navigate('/internet-radio')}
                className="flex items-center gap-1.5 rounded-full px-5 py-2 text-[11px] font-black uppercase tracking-wider text-slate-500 hover:text-slate-700 transition"
              >
                <RadioReceiver className="h-4 w-4" />
                Radio
              </button>
            </div>
          </div>

          {/* Header Card */}
          <div className="border border-amber-200 bg-gradient-to-br from-[#FFF7E8] via-[#F0FAF4] to-[#FFE5C4] rounded-[24px] p-5 sm:p-6 text-[#243B32] shadow-sm relative overflow-hidden space-y-2">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 backdrop-blur-xs border border-amber-200 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#B36A16]">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                {hi ? "लाइव न्यूज़ एवं ब्रॉडकास्ट" : "Live News & Broadcast"}
              </div>
              <div className="flex items-center gap-2">
                {/* Layout Switcher */}
                <div className="hidden sm:flex items-center gap-1 bg-white/80 p-0.5 rounded-lg border border-amber-200/80">
                  <button
                    onClick={() => setLayout("grid")}
                    className={`p-1 rounded ${layout === "grid" ? "bg-amber-500 text-white" : "text-slate-500 hover:text-slate-900"}`}
                    title="Grid layout"
                  >
                    <LayoutGrid className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setLayout("compact")}
                    className={`p-1 rounded ${layout === "compact" ? "bg-amber-500 text-white" : "text-slate-500 hover:text-slate-900"}`}
                    title="Compact grid"
                  >
                    <Columns className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => setLayout("list")}
                    className={`p-1 rounded ${layout === "list" ? "bg-amber-500 text-white" : "text-slate-500 hover:text-slate-900"}`}
                    title="List layout"
                  >
                    <List className="h-3.5 w-3.5" />
                  </button>
                </div>
                <span className="text-[10px] font-bold bg-white px-2.5 py-0.5 rounded-md border border-amber-200 text-slate-700">
                  {visible.length} {hi ? "चैनल" : "Channels"}
                </span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#243B32]">
              {hi ? "आर.पी.एफ. लाइव टीवी" : "RPF Live TV Channels"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
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
              className="w-full rounded-2xl border border-amber-200/80 bg-white/80 backdrop-blur-md py-3 pl-10 pr-4 text-xs font-semibold outline-none focus:border-[#D97706] focus:bg-white shadow-2xs text-[#14213D] placeholder:text-slate-400"
            />
          </div>

          {/* Channels Layout Display */}
          {layout === "list" ? (
            /* LIST LAYOUT */
            <div className="space-y-2">
              {filtered.slice(0, visibleCount).map((c) => {
                const v = getId(c);
                const thumb = c.logo || (v ? `https://i.ytimg.com/vi/${v}/hqdefault.jpg` : null);
                return (
                  <button
                    key={c.id}
                    onClick={() => openPlayer(c)}
                    className="w-full flex items-center justify-between p-3 rounded-2xl border border-amber-100/80 bg-white/80 backdrop-blur-md shadow-2xs hover:border-amber-300 hover:shadow-xs transition text-left"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="h-12 w-20 rounded-xl overflow-hidden bg-slate-900 shrink-0 relative">
                        {thumb ? (
                          <img src={thumb} alt={c.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-slate-500"><Tv className="h-5 w-5" /></div>
                        )}
                        <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <Play className="h-4 w-4 text-white fill-current" />
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#14213D] truncate">{c.name}</p>
                        <span className="inline-block text-[9.5px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded mt-0.5">
                          {c.category}
                        </span>
                      </div>
                    </div>
                    <span className="flex items-center gap-1 text-[9px] font-bold uppercase text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full shrink-0">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-600 animate-ping" /> LIVE
                    </span>
                  </button>
                );
              })}
            </div>
          ) : layout === "compact" ? (
            /* COMPACT GRID LAYOUT */
            <div className="grid gap-2.5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
              {filtered.slice(0, visibleCount).map((c) => {
                const v = getId(c);
                const thumb = c.logo || (v ? `https://i.ytimg.com/vi/${v}/hqdefault.jpg` : null);
                return (
                  <button
                    key={c.id}
                    onClick={() => openPlayer(c)}
                    className="group overflow-hidden rounded-xl border border-amber-100/80 bg-white/80 backdrop-blur-md text-left shadow-2xs hover:shadow-xs hover:border-amber-300 transition active:scale-[0.98]"
                  >
                    <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
                      {thumb ? (
                        <img src={thumb} alt={c.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-slate-500"><Tv className="h-6 w-6" /></div>
                      )}
                      <span className="absolute bottom-2 left-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/95 text-[#D97706] shadow-sm">
                        <Play className="h-3 w-3 fill-current ml-0.5" />
                      </span>
                    </div>
                    <div className="p-2">
                      <p className="truncate text-[11px] font-bold text-[#14213D]">{c.name}</p>
                      <p className="text-[9px] font-semibold text-slate-500 uppercase">{c.category}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            /* STANDARD 3-COLUMN GRID LAYOUT */
            <div className="grid gap-3.5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.slice(0, visibleCount).map((c) => {
                const v = getId(c);
                const thumb = c.logo || (v ? `https://i.ytimg.com/vi/${v}/hqdefault.jpg` : null);
                return (
                  <button
                    key={c.id}
                    onClick={() => openPlayer(c)}
                    className="group overflow-hidden rounded-2xl border border-amber-100/80 bg-white/80 backdrop-blur-md text-left shadow-2xs hover:shadow-xs hover:border-amber-300/80 transition-all duration-200 active:scale-[0.99]"
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
                      <span className="absolute bottom-3 left-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-[#D97706] shadow-md group-hover:scale-110 transition-transform">
                        <Play className="h-4 h-4 fill-current ml-0.5" />
                      </span>
                      <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-[#DC2626] px-2.5 py-0.5 text-[9px] font-bold uppercase text-white shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                        LIVE
                      </span>
                    </div>

                    <div className="p-3.5 flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold text-[#14213D] leading-tight group-hover:text-[#D97706] transition-colors">
                          {c.name}
                        </p>
                        <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                          {c.category}
                        </p>
                      </div>
                      <Maximize2 className="w-4 h-4 text-slate-400 group-hover:text-[#14213D] transition-colors shrink-0 ml-2" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {visibleCount < filtered.length && (
            <div className="flex justify-center mt-6 mb-4">
              <button onClick={() => setVisibleCount(v => v + 40)} className="px-6 py-2.5 bg-[#FF9933]/10 text-[#FF9933] font-bold text-sm rounded-full border border-[#FF9933]/30 hover:bg-[#FF9933]/20 transition-colors shadow-sm">
                Load More Channels ({filtered.length - visibleCount} left)
              </button>
            </div>
          )}

          {!filtered.length && (
            <div className="py-12 text-center text-xs font-medium text-slate-500 bg-white/80 backdrop-blur-md rounded-2xl border border-amber-100/80 p-6 shadow-2xs">
              {hi ? "कोई चैनल नहीं मिला" : "No channels found matching your search."}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
