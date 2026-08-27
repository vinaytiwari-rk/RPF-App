import React, { useState, useRef } from "react";
import {
  X,
  Heart,
  Share2,
  Volume2,
  VolumeX,
  Play,
  Instagram,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { openExternalLink } from "../utils/browser";
import { useNavigate } from "react-router-dom";

export interface ReelItem {
  id: string;
  url: string;
  videoUrl?: string;
  thumbnailUrl: string;
  title: string;
  caption: string;
  likes: string;
  shares?: string;
  author: string;
  authorAvatar?: string;
}

interface ReelsVerticalViewerProps {
  reels: ReelItem[];
  initialIndex?: number;
  onClose: () => void;
}

export default function ReelsVerticalViewer({
  reels,
  initialIndex = 0,
  onClose,
}: ReelsVerticalViewerProps) {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isMuted, setIsMuted] = useState(false);
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
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

  const toggleLike = (id: string) => {
    setLikedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleShare = async (reel: ReelItem) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: reel.title,
          text: reel.caption,
          url: reel.url,
        });
      } else {
        await navigator.clipboard.writeText(reel.url);
        alert("Reel link copied to clipboard!");
      }
    } catch {}
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
            <p className="text-xs font-black text-white tracking-wide">RP Foundation Live Reels</p>
            <p className="text-[10px] text-orange-300 font-semibold">@rpfoundationofficial</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMuted((m) => !m)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-black/40 backdrop-blur-md text-white border border-white/20 active:scale-95"
          >
            {isMuted ? <VolumeX className="h-4.5 w-4.5" /> : <Volume2 className="h-4.5 w-4.5" />}
          </button>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-black/40 backdrop-blur-md text-white border border-white/20 active:scale-95"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Vertical Snap Scroll Container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 w-full overflow-y-scroll snap-y snap-mandatory scrollbar-none"
        style={{ scrollBehavior: "smooth" }}
      >
        {reels.map((reel, idx) => {
          const isLiked = likedMap[reel.id];
          return (
            <div
              key={reel.id || idx}
              className="relative w-full h-full snap-start snap-always flex items-center justify-center bg-black overflow-hidden"
            >
              {/* Thumbnail / Video Stream */}
              <img
                src={reel.thumbnailUrl}
                alt={reel.title}
                className="absolute inset-0 h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/assets/rpf-samahit-icon.png";
                }}
              />

              {/* Dark Gradient Overlay for High Contrast */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/90" />

              {/* Play Badge Icon */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 animate-pulse">
                  <Play className="h-8 w-8 fill-white ml-1" />
                </div>
              </div>

              {/* Right Action Bar (Instagram Reels Style) */}
              <div className="absolute right-4 bottom-24 z-20 flex flex-col items-center gap-5">
                {/* Like Button */}
                <button
                  onClick={() => toggleLike(reel.id)}
                  className="flex flex-col items-center gap-1 group active:scale-125 transition-transform"
                >
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-full backdrop-blur-md border ${
                      isLiked
                        ? "bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-600/50"
                        : "bg-black/40 border-white/20 text-white"
                    }`}
                  >
                    <Heart className={`h-6 w-6 ${isLiked ? "fill-white" : ""}`} />
                  </div>
                  <span className="text-[10px] font-black tracking-wider text-white shadow-xs">
                    {reel.likes}
                  </span>
                </button>

                {/* Share Button */}
                <button
                  onClick={() => handleShare(reel)}
                  className="flex flex-col items-center gap-1 active:scale-95 transition"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-white">
                    <Share2 className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-black tracking-wider text-white">Share</span>
                </button>

                {/* Open in App Player */}
                <button
                  onClick={() => {
                    onClose();
                    navigate("/instagram");
                  }}
                  className="flex flex-col items-center gap-1 active:scale-95 transition"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-tr from-[#FF9933] to-[#138808] text-white shadow-lg">
                    <Instagram className="h-5 w-5" />
                  </div>
                  <span className="text-[9px] font-black tracking-wider text-orange-300">Reels</span>
                </button>
              </div>

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
