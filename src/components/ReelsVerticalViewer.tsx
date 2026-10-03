import React, { useState, useRef } from "react";
import {
  X,
  ChevronDown,
  Sparkles,
} from "lucide-react";

export interface ReelItem {
  id: string;
  url: string;
  videoUrl?: string;
  videoId?: string;
  embedUrl?: string;
  thumbnailUrl: string;
  title: string;
  caption: string;
  author: string;
  authorAvatar?: string;
  platform?: "youtube" | "instagram" | "x";
}

interface ReelsVerticalViewerProps {
  reels: ReelItem[];
  initialIndex?: number;
  onClose: () => void;
}

function extractYouTubeId(url: string = ""): string | undefined {
  if (!url) return undefined;
  const match = url.match(/(?:shorts\/|watch\?v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/);
  return match ? match[1] : undefined;
}

function extractInstagramShortcode(url: string = ""): string | undefined {
  if (!url) return undefined;
  const permalinkMatch = url.match(/data-instgrm-permalink="([^"]+)"/i);
  const target = permalinkMatch ? permalinkMatch[1] : url;
  const match = target.match(/instagram\.com\/(?:reel|p|tv)\/([A-Za-z0-9_-]+)/i);
  return match ? match[1] : undefined;
}

function extractTwitterId(url: string = ""): string | undefined {
  if (!url) return undefined;
  const match = url.match(/(?:twitter\.com|x\.com)\/(?:#!\/)?[a-zA-Z0-9_]+\/status\/([0-9]+)/i);
  return match ? match[1] : undefined;
}

export default function ReelsVerticalViewer({
  reels,
  initialIndex = 0,
  onClose,
}: ReelsVerticalViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (!containerRef.current) return;
    const height = containerRef.current.clientHeight;
    const scrollTop = containerRef.current.scrollTop;
    const index = Math.round(scrollTop / height);
    if (index !== currentIndex && index >= 0 && index < reels.length) {
      setCurrentIndex(index);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black text-white flex flex-col font-sans selection:bg-orange-500 animate-fadeIn">
      {/* Top Header Bar */}
      <div className="absolute top-0 inset-x-0 z-30 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-[#FF9933] to-[#138808] p-0.5 shadow-md">
            <img
              src="/assets/founder.png"
              alt="RP Foundation"
              className="h-full w-full rounded-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "/assets/rpf-samahit-icon.png";
              }}
            />
          </div>
          <div>
            <p className="text-xs font-black text-white tracking-wide">RP Foundation Live Feed</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-black/40 backdrop-blur-md text-white border border-white/20 active:scale-95 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Vertical Snap Scroll Container — YouTube Shorts first, then Instagram Reels */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 w-full overflow-y-scroll snap-y snap-mandatory scrollbar-none"
        style={{ scrollBehavior: "smooth" }}
      >
        {reels.map((reel, idx) => {
          const isActive = idx === currentIndex;
          const ytId = reel.videoId || extractYouTubeId(reel.videoUrl) || extractYouTubeId(reel.url);
          const igShortcode = extractInstagramShortcode(reel.url) || extractInstagramShortcode(reel.videoUrl);
          const tweetId = extractTwitterId(reel.url) || extractTwitterId(reel.videoUrl);

          const activeEmbedUrl = reel.embedUrl || (
            tweetId
              ? `https://platform.twitter.com/embed/Tweet.html?id=${tweetId}&theme=dark`
              : igShortcode
              ? `https://www.instagram.com/p/${igShortcode}/embed/captioned/`
              : undefined
          );

          return (
            <div
              key={reel.id || idx}
              className="relative w-full h-full snap-start snap-always flex items-center justify-center bg-black overflow-hidden"
            >
              {/* VIDEO PLAYBACK / MEDIA LAYER */}
              {isActive && ytId ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&mute=0&playsinline=1&controls=0&disablekb=1&fs=0&modestbranding=1&rel=0&enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}`}
                    title={reel.title}
                    className="w-full h-full max-w-lg aspect-[9/16] border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    onLoad={(event) => {
                      const iframe = event.currentTarget;
                      iframe.contentWindow?.postMessage(
                        JSON.stringify({ event: "command", func: "unMute", args: [] }),
                        "https://www.youtube-nocookie.com"
                      );
                      iframe.contentWindow?.postMessage(
                        JSON.stringify({ event: "command", func: "setVolume", args: [100] }),
                        "https://www.youtube-nocookie.com"
                      );
                    }}
                  />
                </div>
              ) : isActive && reel.videoUrl && !reel.videoUrl.includes("instagram.com") ? (
                <video
                  src={reel.videoUrl}
                  poster={reel.thumbnailUrl} 
                  autoPlay
                  loop
                  playsInline
                  muted={false}
                  className="absolute inset-0 h-full w-full object-contain bg-black"
                />
              ) : isActive && activeEmbedUrl ? (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-950 p-2 pt-14 pb-20">
                  <iframe
                    src={activeEmbedUrl}
                    title={reel.title}
                    className="w-full h-full max-w-sm aspect-[9/16] border-0 rounded-2xl bg-white shadow-2xl overflow-hidden"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    scrolling="no"
                    sandbox="allow-scripts allow-same-origin allow-forms"
                  />
                </div>
              ) : (
                <img
                  src={reel.thumbnailUrl}
                  alt={reel.title}
                  className="absolute inset-0 h-full w-full object-cover opacity-85"
                  onError={(e) => {
                    e.currentTarget.src = "/assets/founder.png";
                  }}
                />
              )}

              {/* Bottom Caption & Handle Bar */}
              <div className="absolute bottom-6 left-4 right-20 z-20 space-y-2 text-left">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-orange-300 bg-orange-950/80 border border-orange-500/40 px-2.5 py-0.5 rounded-full backdrop-blur-md">
                    <Sparkles className="h-3 w-3 text-amber-300" />
                    RP Foundation Initiative
                  </span>
                </div>
                <h3 className="text-sm font-black text-white font-serif leading-snug line-clamp-2">
                  {reel.title}
                </h3>
                <p className="text-xs font-medium text-slate-200 line-clamp-3 leading-relaxed drop-shadow-sm">
                  {reel.caption}
                </p>
              </div>

              {/* Swipe Guidance Indicator */}
              {idx === 0 && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 text-[10px] font-black uppercase text-amber-300 tracking-widest animate-bounce">
                  <ChevronDown className="h-4 w-4" />
                  Swipe up for next reel
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}
