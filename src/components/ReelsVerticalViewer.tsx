import React, { useState, useRef, useEffect } from "react";
import {
  X,
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
  const [loaded, setLoaded] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setLoaded({});
  }, [currentIndex]);

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
      {/* Minimal top bar */}
      <div className="absolute top-0 right-0 z-30 p-4">
        <button
          onClick={onClose}
          aria-label="Close Reels"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-black/40 backdrop-blur-md text-white border border-white/20 active:scale-95 cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Vertical Snap Scroll Container */}
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
              {!loaded[reel.id] && isActive && (
                <div className="absolute z-20 rounded-full bg-black/60 px-4 py-2 text-xs font-bold text-white backdrop-blur-md">
                  Loading…
                </div>
              )}
              {isActive && ytId ? (
                <div className="absolute inset-0 flex items-center justify-center bg-black">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&mute=0&playsinline=1&controls=0&disablekb=1&fs=0&modestbranding=1&rel=0&enablejsapi=1&origin=${encodeURIComponent(window.location.origin)}`}
                    title={reel.title}
                    className="w-full h-full max-w-lg aspect-[9/16] border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    onLoad={(event) => {
                      setLoaded((prev) => ({ ...prev, [reel.id]: true }));
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
                  preload="auto"
                  onCanPlay={(event) => {
                    setLoaded((prev) => ({ ...prev, [reel.id]: true }));
                    event.currentTarget.volume = 1;
                    void event.currentTarget.play().catch(() => undefined);
                  }}
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
                    onLoad={() => setLoaded((prev) => ({ ...prev, [reel.id]: true }))}
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

              {/* Single clean caption/title */}
              {(reel.title || reel.caption) && (
                <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/85 via-black/35 to-transparent px-4 pb-8 pt-20 pointer-events-none">
                  <p className="mx-auto max-w-lg text-center text-sm font-bold leading-snug text-white drop-shadow-lg line-clamp-3">
                    {reel.title || reel.caption}
                  </p>
                </div>
              )}

              {/* No extra platform labels, author text, counters, or initiative badges */}

            </div>
          );
        })}
      </div>

    </div>
  );
}

