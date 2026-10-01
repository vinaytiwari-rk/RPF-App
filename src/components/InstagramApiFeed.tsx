import React, { useEffect, useState } from "react";
import { Instagram, Play, Heart, ChevronRight, Youtube, Radio, ExternalLink, Loader2 } from "lucide-react";
import axios from "axios";
import ReelsVerticalViewer, { ReelItem } from "./ReelsVerticalViewer";
import { openExternalLink } from "../utils/browser";

interface InstagramApiFeedProps {
  sourceUrl?: string;
}

export default function InstagramApiFeed({ sourceUrl = "/api/public/social-feed" }: InstagramApiFeedProps) {
  const [reels, setReels] = useState<ReelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<"all" | "youtube" | "instagram">("all");
  const [activeReelIndex, setActiveReelIndex] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    axios
      .get(sourceUrl)
      .then((res) => {
        if (!alive) return;
        if (res.data?.success && Array.isArray(res.data?.data)) {
          const items: ReelItem[] = res.data.data
            .filter((item: any) => item.platform === "youtube" || item.platform === "instagram")
            .map((item: any, idx: number) => {
              const videoId = item.videoId || (item.link?.includes("watch?v=") ? item.link.split("watch?v=")[1]?.split("&")[0] : undefined);
              const thumb = item.thumbnailUrl || (videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : "/assets/founder.png");

              return {
                id: item.id || `social-${idx}`,
                url: item.link || "https://www.youtube.com/@rpfoundationofficial",
                videoId,
                videoUrl: item.videoUrl,
                embedUrl: item.embedUrl,
                thumbnailUrl: thumb,
                title: item.title || "RP Foundation Update",
                caption: item.description || "Official update from RP Foundation.",
                likes: item.platform === "youtube" ? "Live Video" : "Verified",
                author: item.author || "RP Foundation",
                platform: item.platform
              };
            });

          if (items.length > 0) {
            setReels(items);
            return;
          }
        }
      })
      .catch((err) => {
        console.warn("Could not load live social feed:", err);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [sourceUrl]);

  // Fallback authentic data if offline
  const displayList = reels.length > 0 ? reels : [
    {
      id: "yt-1",
      url: "https://www.youtube.com/shorts/SUQQ919wFs0",
      videoId: "SUQQ919wFs0",
      thumbnailUrl: "https://i.ytimg.com/vi/SUQQ919wFs0/hqdefault.jpg",
      title: "Youth National Goalball Championship 2026 में सहभागिता हेतु सहयोग",
      caption: "RP Foundation द्वारा खिलाड़ियों को प्रतियोगिता में भाग लेने हेतु सहयोग प्रदान किया गया।",
      likes: "Live Video",
      author: "RP Foundation",
      platform: "youtube" as const
    },
    {
      id: "yt-2",
      url: "https://www.youtube.com/shorts/k4Id3sdnK08",
      videoId: "k4Id3sdnK08",
      thumbnailUrl: "https://i.ytimg.com/vi/k4Id3sdnK08/hqdefault.jpg",
      title: "मानसरोवर धाम स्थित प्रसिद्ध महादेव मंदिर दर्शन",
      caption: "आर.पी. फाउंडेशन द्वारा श्रद्धालुओं को महादेव मंदिर के दर्शन कराए गए।",
      likes: "Live Video",
      author: "RP Foundation",
      platform: "youtube" as const
    },
    {
      id: "yt-3",
      url: "https://www.youtube.com/shorts/zyfJ_wpX9hY",
      videoId: "zyfJ_wpX9hY",
      thumbnailUrl: "https://i.ytimg.com/vi/zyfJ_wpX9hY/hqdefault.jpg",
      title: "भोपाल स्थित गुफा मंदिर में प्रसाद वितरण सेवा",
      caption: "आर.पी. फाउंडेशन द्वारा गुफा मंदिर में प्रसाद वितरण सेवा का भव्य आयोजन।",
      likes: "Live Video",
      author: "RP Foundation",
      platform: "youtube" as const
    },
    {
      id: "ig-1",
      url: "https://www.instagram.com/rpfoundationofficial/",
      thumbnailUrl: "/assets/founder.png",
      title: "RP Foundation Community & Health Camp",
      caption: "Free medical camp and community empowerment drives in Bhopal.",
      likes: "Verified",
      author: "RP Foundation",
      platform: "instagram" as const
    }
  ];

  const filtered = activeFilter === "all"
    ? displayList
    : displayList.filter((item) => item.platform === activeFilter);

  return (
    <div className="space-y-3 font-sans">
      {/* FILTER TABS & LIVE BADGE */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setActiveFilter("all")}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeFilter === "all"
                ? "bg-[#14213D] text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All Live Media ({displayList.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("youtube")}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeFilter === "youtube"
                ? "bg-rose-600 text-white shadow-xs"
                : "bg-rose-50 text-rose-700 hover:bg-rose-100"
            }`}
          >
            <Youtube className="h-3.5 w-3.5 fill-current" />
            YouTube
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("instagram")}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
              activeFilter === "instagram"
                ? "bg-pink-600 text-white shadow-xs"
                : "bg-pink-50 text-pink-700 hover:bg-pink-100"
            }`}
          >
            <Instagram className="h-3.5 w-3.5" />
            Instagram
          </button>
        </div>

        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full shrink-0">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live RSS Feed
        </span>
      </div>

      {/* HORIZONTAL SWIPEABLE REELS & VIDEO SHOWCASE */}
      {loading ? (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-64 w-44 shrink-0 rounded-3xl bg-slate-100 animate-pulse border border-slate-200 flex items-center justify-center text-slate-400 text-xs font-bold"
            >
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x snap-mandatory">
          {filtered.map((item, idx) => {
            const isYt = item.platform === "youtube";
            return (
              <div
                key={item.id || idx}
                onClick={() => setActiveReelIndex(idx)}
                className="group relative h-64 w-44 shrink-0 cursor-pointer overflow-hidden rounded-3xl bg-slate-900 border border-slate-200 shadow-sm snap-start active:scale-95 transition-all hover:shadow-xl hover:border-orange-400"
              >
                {/* Real Media Background */}
                <img
                  src={item.thumbnailUrl}
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  onError={(e) => {
                    e.currentTarget.src = "/assets/founder.png";
                  }}
                />

                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/30 to-transparent" />

                {/* Top Badge */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[8.5px] font-black uppercase tracking-wider backdrop-blur-md border ${
                      isYt
                        ? "bg-rose-600/90 text-white border-rose-400/50"
                        : "bg-pink-600/90 text-white border-pink-400/50"
                    }`}
                  >
                    {isYt ? (
                      <>
                        <Youtube className="h-2.5 w-2.5 fill-white" /> YouTube
                      </>
                    ) : (
                      <>
                        <Instagram className="h-2.5 w-2.5" /> Reel
                      </>
                    )}
                  </span>
                  <span className="flex items-center gap-1 text-[9px] font-bold text-white bg-black/40 backdrop-blur-md px-1.5 py-0.5 rounded-full border border-white/20">
                    <Play className="h-2 w-2 fill-white" /> Play
                  </span>
                </div>

                {/* Play Circle Icon */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/25 backdrop-blur-md text-white border border-white/40 group-hover:scale-110 transition-transform shadow-lg">
                    <Play className="h-6 w-6 fill-white ml-0.5" />
                  </div>
                </div>

                {/* Bottom Caption Overlay */}
                <div className="absolute bottom-3 inset-x-3 z-10 space-y-1 text-left">
                  <p className="text-[11px] font-black text-white font-serif leading-snug line-clamp-2">
                    {item.title}
                  </p>
                  <p className="text-[9px] font-medium text-slate-300 line-clamp-1 leading-tight">
                    {item.caption}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QUICK LAUNCH BAR */}
      <div className="flex items-center justify-between rounded-2xl bg-gradient-to-r from-orange-50 via-rose-50 to-pink-50 border border-orange-200/80 px-4 py-2.5 shadow-2xs">
        <div className="flex items-center gap-2">
          <a
            href="https://www.youtube.com/@rpfoundationofficial"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-black text-rose-700 hover:underline"
          >
            <Youtube className="h-4 w-4 fill-rose-600" />
            YouTube
          </a>
          <span className="text-slate-300">•</span>
          <a
            href="https://www.instagram.com/rpfoundationofficial/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-black text-pink-700 hover:underline"
          >
            <Instagram className="h-4 w-4 text-pink-600" />
            Instagram
          </a>
        </div>

        <button
          type="button"
          onClick={() => setActiveReelIndex(0)}
          className="inline-flex items-center gap-1 text-[11px] font-bold text-[#14213D] hover:underline cursor-pointer"
        >
          <span>Watch Fullscreen</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* FULLSCREEN VERTICAL VIDEO / REEL VIEWER */}
      {activeReelIndex !== null && (
        <ReelsVerticalViewer
          reels={filtered}
          initialIndex={activeReelIndex}
          onClose={() => setActiveReelIndex(null)}
        />
      )}
    </div>
  );
}
