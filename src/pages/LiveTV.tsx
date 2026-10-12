import React, { useEffect, useMemo, useState, useRef } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import { useLocation, useNavigate, useOutletContext } from "react-router-dom";
import { RadioReceiver, ArrowLeft, Play, Search, Tv, Sparkles, Maximize2 as MaximizeIcon, ExternalLink, LayoutGrid, List, Columns, RefreshCw, VolumeX, RotateCw } from "lucide-react";
import { LIVE_TV_DEFAULTS, mergeTvCatalogue, type LiveTvChannel } from "../data/liveTvDefaults";
import { openExternalLink } from "../utils/browser";
import { getMediaSourceType } from "../utils/mediaSourceType";
import { resolveMediaUrl } from "../utils/media";

import ChannelThumbnail, { getTvVideoId as getId } from "../components/ChannelThumbnail";

export const CATEGORIES = [
  { id: "all", labelEn: "All Channels", labelHi: "सभी चैनल" },
  { id: "News", labelEn: "News", labelHi: "समाचार" },
  { id: "Entertainment", labelEn: "Entertainment", labelHi: "मनोरंजन" },
  { id: "Movies", labelEn: "Movies", labelHi: "फ़िल्में" },
  { id: "Music", labelEn: "Music", labelHi: "संगीत" },
  { id: "Sports", labelEn: "Sports", labelHi: "खेल" },
  { id: "Kids", labelEn: "Kids", labelHi: "बच्चे/कार्टून" },
  { id: "Religious", labelEn: "Devotional", labelHi: "भक्ति/धार्मिक" },
  { id: "Documentary", labelEn: "Knowledge", labelHi: "ज्ञान/विज्ञान" },
  { id: "Education", labelEn: "Education", labelHi: "शिक्षा" },
  { id: "YouTube", labelEn: "YouTube Live", labelHi: "YouTube लाइव" },
  { id: "Weather", labelEn: "Weather", labelHi: "मौसम" },
];

interface DirectStreamPlayerProps {
  url: string;
  name: string;
  onOpenExternal: () => void;
  langHi: boolean;
}

function DirectStreamPlayer({
  url,
  name,
  onOpenExternal,
  langHi,
}: DirectStreamPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isBuffering, setIsBuffering] = useState<boolean>(true);
  const fallbackDirectAttemptedRef = useRef<boolean>(false);

  // Cross-origin IPTV streams MUST be routed via our proxy to ensure HTTPS mixed-content pass & CORS *
  const getPlayableSrc = (raw: string) => {
    if (!raw) return "";
    if (raw.includes("/api/iptv/proxy") || raw.includes("youtube.com") || raw.includes("youtu.be")) {
      return raw;
    }
    return resolveMediaUrl(`/api/iptv/proxy?url=${encodeURIComponent(raw)}`);
  };

  const [currentSrc, setCurrentSrc] = useState<string>(() => getPlayableSrc(url));

  useEffect(() => {
    setCurrentSrc(getPlayableSrc(url));
    fallbackDirectAttemptedRef.current = false;
    setErrorMsg(null);
    setIsBuffering(true);
  }, [url]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !currentSrc) return;

    setErrorMsg(null);
    setIsBuffering(true);

    const videoElement = document.createElement("video-js");
    videoElement.className = "video-js vjs-fill w-full h-full";
    videoElement.setAttribute("playsinline", "true");
    videoElement.setAttribute("webkit-playsinline", "true");
    videoElement.setAttribute("autoplay", "autoplay");
    container.appendChild(videoElement);

    const sourceType = getMediaSourceType(currentSrc) || "application/x-mpegURL";

    const player = videojs(videoElement, {
      controls: true,
      autoplay: "any",
      bigPlayButton: false,
      preload: "auto",
      responsive: true,
      fill: true,
      fluid: false,
      playsinline: true,
      html5: {
        vhs: {
          enableLowInitialPlaylist: true,
          smoothQualityChange: true,
          fastReady: true,
          maxBufferLength: 8,
          maxMaxBufferLength: 16,
          experimentalBufferBasedABR: true,
          overrideNative: true,
        },
      },
      sources: [
        {
          src: currentSrc,
          type: sourceType,
        },
      ],
    });

    playerRef.current = player;

    player.ready(() => {
      const playPromise = player.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log("Direct stream autoplay started");
          })
          .catch((err: any) => {
            console.warn("Unmuted autoplay restricted, playing muted:", err);
            player.muted(true);
            setIsMuted(true);
            player.play().catch((e: any) => console.warn("Muted autoplay failed:", e));
          });
      }
    });

    player.on("playing", () => setIsBuffering(false));
    player.on("canplay", () => setIsBuffering(false));
    player.on("waiting", () => setIsBuffering(true));
    player.on("volumechange", () => {
      if (player && !player.isDisposed()) {
        setIsMuted(player.muted());
      }
    });

    // 14-second watchdog timer for hung streams
    const watchdogTimer = setTimeout(() => {
      if (isBuffering && !errorMsg) {
        console.warn("Stream taking long to buffer:", currentSrc);
        if (!fallbackDirectAttemptedRef.current && currentSrc.includes("/api/iptv/proxy") && url.startsWith("https://")) {
          fallbackDirectAttemptedRef.current = true;
          setCurrentSrc(url);
        }
      }
    }, 14000);

    player.on("error", () => {
      clearTimeout(watchdogTimer);
      console.warn("Video.js playback error for:", currentSrc);
      if (!fallbackDirectAttemptedRef.current && currentSrc.includes("/api/iptv/proxy") && url.startsWith("https://")) {
        fallbackDirectAttemptedRef.current = true;
        console.log("Switching to direct HTTPS stream fallback:", url);
        setCurrentSrc(url);
        return;
      }
      setIsBuffering(false);
      setErrorMsg(
        langHi
          ? "यह डायरेक्ट स्ट्रीम वर्तमान में अनुपलब्ध है या प्रदाता द्वारा ब्लॉक की गई है।"
          : "This live stream is temporarily unavailable from its source broadcast."
      );
    });

    return () => {
      clearTimeout(watchdogTimer);
      try {
        if (player && !player.isDisposed()) {
          player.dispose();
        }
      } catch (e) {
        console.warn("Video.js disposal caught safely:", e);
      } finally {
        playerRef.current = null;
        if (videoElement.parentNode === container) {
          container.removeChild(videoElement);
        }
      }
    };
  }, [currentSrc, url, langHi]);

  return (
    <div
      className="relative h-full w-full bg-black flex items-center justify-center overflow-hidden"
      onClick={() => {
        if (isMuted && playerRef.current && !playerRef.current.isDisposed()) {
          playerRef.current.muted(false);
          setIsMuted(false);
        }
      }}
    >
      <div ref={containerRef} className="h-full w-full vjs-fill" data-vjs-player />

      {/* Starting stream / Buffering status indicator */}
      {isBuffering && !errorMsg && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-[2px] pointer-events-none">
          <div className="flex items-center gap-2.5 rounded-full bg-slate-900/85 px-4 py-2 border border-white/15 text-white shadow-2xl">
            <RefreshCw className="h-4 w-4 animate-spin text-amber-400" />
            <span className="text-xs font-bold tracking-wide">
              {langHi ? "लाइव स्ट्रीम शुरू हो रही है..." : "Starting Live Stream..."}
            </span>
          </div>
        </div>
      )}

      {/* Floating unmute notification if browser enforced muted initial autoplay */}
      {isMuted && !errorMsg && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (playerRef.current && !playerRef.current.isDisposed()) {
              playerRef.current.muted(false);
              setIsMuted(false);
            }
          }}
          className="absolute top-3 right-3 z-30 flex items-center gap-1.5 rounded-full bg-black/80 backdrop-blur-md border border-white/20 px-3.5 py-1.5 text-xs font-bold text-white shadow-xl hover:bg-black/95 active:scale-95 transition"
        >
          <VolumeX className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>{langHi ? "आवाज़ चालू करें (टैप करें)" : "Tap to Unmute"}</span>
        </button>
      )}

      {errorMsg && (
        <div
          role="alert"
          className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-slate-950/95 p-5 text-center"
        >
          <p className="text-sm font-bold text-white">
            {langHi ? "स्ट्रीम प्लेबैक विफल" : "Stream playback failed"}
          </p>
          <p className="max-w-lg text-xs leading-relaxed text-slate-300">{errorMsg}</p>
          <div className="flex items-center gap-3 mt-2">
            <button
              type="button"
              onClick={() => {
                setErrorMsg(null);
                fallbackDirectAttemptedRef.current = false;
                setCurrentSrc(getPlayableSrc(url));
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-400 active:scale-95 transition"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              {langHi ? "पुनः प्रयास करें" : "Retry"}
            </button>
            <button
              type="button"
              onClick={onOpenExternal}
              className="rounded-xl bg-white/10 border border-white/20 px-4 py-2 text-xs font-bold text-white hover:bg-white/20 active:scale-95 transition"
            >
              {langHi ? "ब्राउज़र में खोलें" : "Open in Browser"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LiveTV() {
  const { lang } = useOutletContext<{ lang: "en" | "hi" }>();
  const navigate = useNavigate();
  const hi = lang === "hi";

  const location = useLocation();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [visibleCount, setVisibleCount] = useState(40);
  const [channels, setChannels] = useState<LiveTvChannel[]>(() => LIVE_TV_DEFAULTS);
  const [active, setActive] = useState<LiveTvChannel | null>(null);
  const playerModalRef = useRef<HTMLDivElement>(null);
  const [, setServerControlled] = useState(false);
  const [layout, setLayout] = useState<"grid" | "list" | "compact" | "theater">("grid");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const targetId = params.get("ch") || params.get("play");
    if (targetId && channels.length > 0) {
      const found = channels.find(
        (c) => c.id === targetId || c.name.toLowerCase() === targetId.toLowerCase()
      );
      if (found) {
        setActive(found);
      }
    }
  }, [location.search, channels]);

  useEffect(() => {
    let cancelled = false;
    fetch(resolveMediaUrl("/api/cms"), { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        const configured = data?.cms?.liveTvChannels;
        if (!cancelled && Array.isArray(configured) && configured.length > 0) {
          setChannels(mergeTvCatalogue(configured));
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

  const visible = useMemo(() => channels
    .filter((c) => c.enabled !== false || c.id.startsWith("gov-swayam-"))
    .sort((a, b) => {
      const aSwayam = a.id.startsWith("gov-swayam-");
      const bSwayam = b.id.startsWith("gov-swayam-");
      if (aSwayam !== bSwayam) return aSwayam ? -1 : 1;
      return (a.order ?? 0) - (b.order ?? 0);
    }), [channels]);
  
  useEffect(() => {
    setVisibleCount(40);
  }, [search, selectedCategory]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return visible.filter((c) => {
      const matchesCategory = selectedCategory === "all"
        || (selectedCategory === "YouTube" ? Boolean(getId(c)) : c.category.toLowerCase() === selectedCategory.toLowerCase());
      if (!matchesCategory) return false;
      if (!q) return true;
      return `${c.name} ${c.category}`.toLowerCase().includes(q);
    });
  }, [search, selectedCategory, visible]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: visible.length, YouTube: visible.filter((c) => Boolean(getId(c))).length };
    visible.forEach((c) => {
      counts[c.category] = (counts[c.category] || 0) + 1;
    });
    return counts;
  }, [visible]);

  const id = active ? getId(active) : undefined;
  const embed = id ? `https://www.youtube.com/embed/${id}?autoplay=1&playsinline=1&rel=0&controls=1&fs=1&modestbranding=1` : null;

  const openPlayer = (c: LiveTvChannel) => {
    window.history.pushState({ rpfLiveTvPlayer: true }, "");
    setActive(c);
  };

  const close = () => {
    try { (screen as any).orientation?.unlock?.(); } catch {}
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    if (window.history.state?.rpfLiveTvPlayer) window.history.back();
    else setActive(null);
  };

  const toggleLandscapeFullscreen = async () => {
    const target = playerModalRef.current;
    if (!target) return;
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        try { (screen as any).orientation?.unlock?.(); } catch {}
      } else {
        await (target as any).requestFullscreen?.();
        try { await (screen as any).orientation?.lock?.("landscape"); } catch {
          // Some browsers/WebViews do not expose orientation locking; fullscreen still works.
        }
      }
    } catch (error) {
      console.warn("Landscape fullscreen is not available in this WebView:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-28 font-sans text-slate-800 selection:bg-orange-100">
      {active ? (
        /* Fullscreen Player Modal */
        <div ref={playerModalRef} className="fixed inset-0 z-50 flex min-h-[100dvh] flex-col bg-black text-white">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 bg-slate-900/90 backdrop-blur-md">
            <button
              onClick={close}
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-3.5 py-2 text-xs font-black text-white hover:bg-white/20 transition active:scale-95"
            >
              <ArrowLeft className="h-4 w-4" />
              {hi ? "वापस" : "Back"}
            </button>
            <div className="min-w-0 flex-1 px-3 text-center">
              <p className="truncate text-sm font-black font-serif text-white">
                {active.name}
              </p>
              <span className="inline-block text-[10px] font-semibold text-amber-400">
                {active.category} • India & Regional
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={toggleLandscapeFullscreen}
                className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 text-white border border-white/20 px-2.5 py-1.5 text-xs font-bold hover:bg-white/20 transition active:scale-95"
                title={hi ? "लैंडस्केप में देखें" : "Landscape / Fullscreen"}
              >
                <RotateCw className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{hi ? "लैंडस्केप" : "Landscape"}</span>
              </button>
              <button
                onClick={() => openExternalLink(active.url, navigate, active.name)}
                className="inline-flex items-center gap-1.5 rounded-xl bg-orange-500/20 text-orange-300 border border-orange-400/30 px-3 py-1.5 text-xs font-bold hover:bg-orange-500/30 transition"
                title="Open External"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{hi ? "ब्राउज़र" : "Browser"}</span>
              </button>
            </div>
          </div>

          <div className="flex min-h-0 flex-1 items-center justify-center bg-black p-0 sm:p-4">
            <div className="w-full max-w-5xl max-h-full aspect-video sm:rounded-2xl overflow-hidden shadow-2xl border-y sm:border border-white/10 bg-slate-950 relative flex items-center justify-center">
              {embed ? (
                <iframe
                  className="h-full w-full border-0"
                  src={embed}
                  title={active.name}
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  allowFullScreen
                />
              ) : (
                <DirectStreamPlayer
                  url={active.url}
                  name={active.name}
                  onOpenExternal={() => openExternalLink(active.url, navigate, active.name)}
                  langHi={hi}
                />
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
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                {hi ? "राष्ट्रीय एवं अंतर्राष्ट्रीय लाइव टीवी" : "National & International Live TV"}
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
                  {visible.length} {hi ? "चैनल (भारत प्राथमिक)" : "Channels (India Priority)"}
                </span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#243B32]">
              {hi ? "आर.पी.एफ. लाइव टीवी एवं समाचार" : "RPF Live TV Broadcast"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
              {hi
                ? "भारत के प्रमुख राष्ट्रीय, प्रांतीय, समाचार, खेल, मनोरंजन, भक्ति एवं फ़िल्मी चैनल उच्च गुणवत्ता में निःशुल्क देखें।"
                : "Watch 700+ verified Indian national, regional, news, sports, entertainment, devotional, and movie channels in high definition."}
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={hi ? "चैनल या भाषा खोजें (उदा. Aaj Tak, DD Sports, Zee, ABP)..." : "Search channels (e.g., Aaj Tak, DD Sports, Movies, Music)..."}
              className="w-full rounded-2xl border border-amber-200/80 bg-white/80 backdrop-blur-md py-3 pl-10 pr-4 text-xs font-semibold outline-none focus:border-[#D97706] focus:bg-white shadow-2xs text-[#14213D] placeholder:text-slate-400"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => {
              const count = categoryCounts[cat.id] ?? 0;
              const isSelected = selectedCategory === cat.id;
              if (cat.id !== "all" && count === 0) return null;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-bold transition shrink-0 ${
                    isSelected
                      ? "bg-amber-600 text-white shadow-sm"
                      : "bg-white/80 text-slate-600 border border-slate-200/80 hover:bg-amber-50 hover:text-amber-700"
                  }`}
                >
                  <span>{hi ? cat.labelHi : cat.labelEn}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[9px] font-black ${
                      isSelected
                        ? "bg-white/25 text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Channels Layout Display */}
          {layout === "list" ? (
            /* LIST LAYOUT */
            <div className="space-y-2">
              {filtered.slice(0, visibleCount).map((c) => {
                return (
                  <button
                    key={c.id}
                    onClick={() => openPlayer(c)}
                    className="w-full flex items-center justify-between p-3 rounded-2xl border border-amber-100/80 bg-white/80 backdrop-blur-md shadow-2xs hover:border-amber-300 hover:shadow-xs transition text-left"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className="h-12 w-20 rounded-xl overflow-hidden bg-slate-900 shrink-0 relative flex items-center justify-center p-1">
                        <ChannelThumbnail channel={c} size="sm" className="h-full w-full" />
                        <span className="absolute inset-0 flex items-center justify-center bg-black/25">
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
                return (
                  <button
                    key={c.id}
                    onClick={() => openPlayer(c)}
                    className="group overflow-hidden rounded-xl border border-amber-100/80 bg-white/80 backdrop-blur-md text-left shadow-2xs hover:shadow-xs hover:border-amber-300 transition active:scale-[0.98]"
                  >
                    <div className="relative aspect-video w-full overflow-hidden bg-slate-900 flex items-center justify-center p-2">
                      <ChannelThumbnail channel={c} size="md" className="h-full w-full" />
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
                return (
                  <button
                    key={c.id}
                    onClick={() => openPlayer(c)}
                    className="group overflow-hidden rounded-2xl border border-amber-100/80 bg-white/80 backdrop-blur-md text-left shadow-2xs hover:shadow-xs hover:border-amber-300/80 transition-all duration-200 active:scale-[0.99]"
                  >
                    <div className="relative aspect-video w-full overflow-hidden bg-slate-900 flex items-center justify-center p-3">
                      <ChannelThumbnail
                        channel={c}
                        size="lg"
                        className="h-full w-full group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute bottom-3 left-3 flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-[#D97706] shadow-md group-hover:scale-110 transition-transform">
                        <Play className="h-4 w-4 fill-current ml-0.5" />
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
                      <MaximizeIcon className="w-4 h-4 text-slate-400 group-hover:text-[#14213D] transition-colors shrink-0 ml-2" />
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {visibleCount < filtered.length && (
            <div className="flex justify-center mt-6 mb-4">
              <button
                onClick={() => setVisibleCount((v) => v + 40)}
                className="px-6 py-2.5 bg-[#FF9933]/10 text-[#FF9933] font-bold text-xs rounded-full border border-[#FF9933]/30 hover:bg-[#FF9933]/20 transition-colors shadow-sm"
              >
                {hi
                  ? `और चैनल लोड करें (${filtered.length - visibleCount} शेष)`
                  : `Load More Channels (${filtered.length - visibleCount} remaining)`}
              </button>
            </div>
          )}

          {!filtered.length && (
            <div className="py-12 text-center text-xs font-medium text-slate-500 bg-white/80 backdrop-blur-md rounded-2xl border border-amber-100/80 p-6 shadow-2xs">
              {hi ? "इस श्रेणी में कोई चैनल नहीं मिला" : "No channels found in this category."}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
