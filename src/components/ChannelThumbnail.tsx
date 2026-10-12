import React, { useState, useMemo } from "react";
import { Tv } from "lucide-react";
import type { LiveTvChannel } from "../data/liveTvDefaults";

export const getTvVideoId = (c: LiveTvChannel) =>
  c.videoId || c.url?.match(/(?:youtu\.be\/|youtube\.com\/(?:live\/|embed\/|shorts\/|watch\?v=))([^?&/]+)/)?.[1];

export interface ChannelThumbnailProps {
  channel: LiveTvChannel;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export default function ChannelThumbnail({ channel, className = "", size = "md" }: ChannelThumbnailProps) {
  const [hasError, setHasError] = useState(false);
  const videoId = getTvVideoId(channel);

  const initials = useMemo(() => {
    const clean = channel.name.replace(/(\b(HD|TV|Live|Channel|News|India|Hindi|English)\b)/gi, "").trim();
    const parts = (clean || channel.name).split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return (parts[0]?.slice(0, 3) || "TV").toUpperCase();
  }, [channel.name]);

  const gradientClass = useMemo(() => {
    const cat = channel.category?.toLowerCase() || "";
    if (cat.includes("news")) return "from-red-600 to-amber-700";
    if (cat.includes("sport")) return "from-blue-600 to-indigo-800";
    if (cat.includes("movie") || cat.includes("entertainment")) return "from-purple-600 to-pink-700";
    if (cat.includes("religio") || cat.includes("devot")) return "from-amber-600 to-orange-700";
    if (cat.includes("music")) return "from-pink-600 to-rose-700";
    if (cat.includes("kid")) return "from-emerald-500 to-teal-700";
    return "from-slate-700 to-slate-900";
  }, [channel.category]);

  const candidateUrl = useMemo(() => {
    if (channel.logo && !channel.logo.includes("upload.wikimedia.org")) {
      return channel.logo;
    }
    if (videoId) {
      return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    }
    return channel.logo || null;
  }, [channel.logo, videoId]);

  if (hasError || !candidateUrl) {
    return (
      <div className={`flex flex-col items-center justify-center bg-gradient-to-br ${gradientClass} text-white font-black select-none ${className}`}>
        <Tv className={size === "lg" ? "h-8 w-8 mb-1 opacity-80" : size === "sm" ? "h-4 w-4 opacity-80" : "h-6 w-6 mb-0.5 opacity-80"} />
        <span className={size === "lg" ? "text-sm tracking-wider" : size === "sm" ? "text-[10px] tracking-tight" : "text-xs tracking-wide"}>
          {initials}
        </span>
      </div>
    );
  }

  return (
    <img
      src={candidateUrl}
      alt=""
      loading="lazy"
      onError={() => setHasError(true)}
      className={`${className} object-contain`}
    />
  );
}
