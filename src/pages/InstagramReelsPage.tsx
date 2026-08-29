import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { ArrowLeft, ChevronDown, ChevronUp, Heart, Instagram, Share2, ExternalLink, Play, Film, Sparkles } from "lucide-react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { toast } from "react-hot-toast";

export interface ReelItem {
  id: string;
  title: string;
  url: string;
  embedUrl?: string;
  caption: string;
  category: string;
  thumbnail?: string;
}

const defaultReels: ReelItem[] = [
  {
    id: "reel-1",
    title: "Mega Free Health Camp & Medicines Distribution",
    url: "https://www.instagram.com/therpfoundation/",
    caption: "Over 1,200 citizens benefitted from specialized health checkups, free medicines & diagnostic support organized by RP Foundation.",
    category: "Healthcare",
    thumbnail: "/assets/mega_camp_banner.png"
  },
  {
    id: "reel-2",
    title: "Pink E-Rickshaw Women Empowerment Launch",
    url: "https://www.instagram.com/therpfoundation/",
    caption: "Empowering women with economic independence and eco-friendly urban mobility ownership across Bhopal & Mumbai.",
    category: "Empowerment",
    thumbnail: "/assets/water_pump_camp.png"
  },
  {
    id: "reel-3",
    title: "Founder Rohit Pandit's Vision & Youth Address",
    url: "https://www.instagram.com/therpfoundation/",
    caption: "“True service begins when we reach out to those in need with humility and unyielding resolve.”",
    category: "Leadership",
    thumbnail: "/assets/founder.png"
  },
  {
    id: "reel-4",
    title: "Jan Seva Card Distribution & Volunteer Support",
    url: "https://www.instagram.com/therpfoundation/",
    caption: "Connecting ground-level citizens directly with welfare benefits and digital identity cards.",
    category: "Ground Action",
    thumbnail: "/assets/donate.jpg"
  }
];

export default function InstagramReelsPage() {
  const navigate = useNavigate();
  const outletContext = useOutletContext<{ lang?: "en" | "hi" }>();
  const hi = outletContext?.lang === "hi";

  const [reels, setReels] = useState<ReelItem[]>(defaultReels);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    axios
      .get("/api/cms")
      .then((res) => {
        const list = res.data?.cms?.instagramPosts;
        if (Array.isArray(list) && list.length > 0) {
          const activeOnly = list
            .filter((item: any) => item.active !== false)
            .map((item: any, idx: number) => ({
              id: item.id || `cms-${idx}`,
              title: item.title || "RP Foundation Reel",
              url: item.url || "https://www.instagram.com/therpfoundation/",
              caption: item.caption || item.title || "RP Foundation Social Initiative",
              category: item.category || "General",
              thumbnail: item.thumbnail || defaultReels[idx % defaultReels.length].thumbnail
            }));
          if (activeOnly.length > 0) {
            setReels(activeOnly);
          }
        }
      })
      .catch(() => {});
  }, []);

  const categories = ["all", "Healthcare", "Empowerment", "Leadership", "Ground Action"];

  const filteredReels = selectedCategory === "all"
    ? reels
    : reels.filter((r) => r.category.toLowerCase() === selectedCategory.toLowerCase());

  const currentReel = filteredReels[currentIndex] || filteredReels[0] || reels[0];

  const goNext = () => {
    if (currentIndex < filteredReels.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const diffY = touchStartY.current - e.changedTouches[0].clientY;
    touchStartY.current = null;

    if (diffY > 40) goNext();
    else if (diffY < -40) goPrev();
  };

  const toggleLike = (id: string) => {
    setLiked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const shareReel = (reel: ReelItem) => {
    if (navigator.share) {
      navigator.share({ title: reel.title, url: reel.url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(reel.url);
      toast.success(hi ? "लिंक कॉपी हो गया!" : "Link copied to clipboard!");
    }
  };

  return (
    <main
      className="relative flex h-[92vh] w-full flex-col overflow-hidden bg-slate-950 text-white select-none rounded-[28px]"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Header Bar */}
      <header className="absolute top-0 inset-x-0 z-30 flex items-center justify-between p-4 bg-gradient-to-b from-black/90 via-black/50 to-transparent">
        <button
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md text-white hover:bg-white/20 active:scale-95 transition-all"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2">
          <Instagram className="h-5 w-5 text-pink-500" />
          <span className="text-sm font-extrabold tracking-wider text-white">
            @therpfoundation
          </span>
        </div>

        <button
          onClick={() => shareReel(currentReel)}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md text-white hover:bg-white/20 active:scale-95 transition-all"
        >
          <Share2 className="h-5 w-5" />
        </button>
      </header>

      {/* Category Pills */}
      <div className="absolute top-16 inset-x-0 z-30 flex items-center justify-center gap-1.5 px-4 overflow-x-auto no-scrollbar py-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setSelectedCategory(cat);
              setCurrentIndex(0);
            }}
            className={`rounded-full px-3 py-1 text-[11px] font-bold transition-all shrink-0 ${
              selectedCategory === cat
                ? "bg-pink-600 text-white shadow-sm"
                : "bg-black/50 text-slate-300 backdrop-blur-md hover:bg-black/70"
            }`}
          >
            {cat === "all" ? (hi ? "सभी रील्स" : "All Reels") : cat}
          </button>
        ))}
      </div>

      {/* Reel Card Viewport */}
      <div className="relative flex-1 w-full h-full flex items-center justify-center bg-slate-900 overflow-hidden">
        <img
          src={currentReel?.thumbnail || "/assets/founder.png"}
          alt={currentReel?.title}
          className="absolute inset-0 h-full w-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

        {/* Play Icon / Open Trigger */}
        <a
          href={currentReel?.url}
          target="_blank"
          rel="noopener noreferrer"
          className="z-20 flex flex-col items-center gap-3 rounded-2xl bg-black/60 backdrop-blur-md p-6 border border-white/10 hover:scale-105 transition-all shadow-xl text-center max-w-xs"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 text-white shadow-lg">
            <Play className="h-7 w-7 fill-current ml-1" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-snug">
              {currentReel?.title}
            </p>
            <p className="mt-1 text-[11px] text-pink-300 font-semibold inline-flex items-center gap-1">
              Watch on Instagram <ExternalLink className="h-3.5 w-3.5" />
            </p>
          </div>
        </a>
      </div>

      {/* Bottom Info Overlay & Floating Controls */}
      <div className="absolute bottom-4 inset-x-0 z-30 p-4 space-y-3">
        <div className="flex items-end justify-between gap-4">
          <div className="space-y-1.5 flex-1">
            <span className="inline-flex items-center gap-1 rounded-md bg-pink-600/30 border border-pink-500/40 px-2.5 py-0.5 text-[10px] font-bold text-pink-300">
              <Film className="h-3 w-3" /> {currentReel?.category}
            </span>
            <h2 className="text-base sm:text-lg font-bold text-white leading-tight">
              {currentReel?.title}
            </h2>
            <p className="text-xs text-slate-300 font-medium line-clamp-2 leading-relaxed">
              {currentReel?.caption}
            </p>
          </div>

          {/* Action Buttons Side Column */}
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={() => toggleLike(currentReel?.id)}
              className="flex flex-col items-center gap-1 text-white"
            >
              <div className={`flex h-11 w-11 items-center justify-center rounded-full backdrop-blur-md transition-all ${
                liked[currentReel?.id] ? "bg-pink-600 text-white" : "bg-white/10 text-white hover:bg-white/20"
              }`}>
                <Heart className={`h-6 w-6 ${liked[currentReel?.id] ? "fill-current" : ""}`} />
              </div>
              <span className="text-[10px] font-bold">
                {liked[currentReel?.id] ? "Liked" : "Like"}
              </span>
            </button>

            <a
              href={currentReel?.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1 text-white"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 to-pink-600 text-white shadow-md">
                <Instagram className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-bold">Open</span>
            </a>
          </div>
        </div>

        {/* Up/Down Navigation Controls */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs font-semibold text-slate-400">
          <span>
            {currentIndex + 1} of {filteredReels.length} Reels
          </span>
          <div className="flex gap-2">
            <button
              onClick={goPrev}
              disabled={currentIndex === 0}
              className="p-1.5 rounded-lg bg-white/10 disabled:opacity-30 hover:bg-white/20 transition-all"
            >
              <ChevronUp className="h-4 w-4 text-white" />
            </button>
            <button
              onClick={goNext}
              disabled={currentIndex === filteredReels.length - 1}
              className="p-1.5 rounded-lg bg-white/10 disabled:opacity-30 hover:bg-white/20 transition-all"
            >
              <ChevronDown className="h-4 w-4 text-white" />
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}