import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { ArrowLeft, ChevronDown, ChevronUp, Heart, Instagram, Share2, Play, Film, Sparkles, Youtube, Volume2, VolumeX } from "lucide-react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { toast } from "react-hot-toast";
import InAppWebView from "../components/InAppWebView";

export interface ReelItem {
  id: string;
  title: string;
  url: string;
  videoUrl?: string;
  embedUrl?: string;
  videoId?: string;
  tweetId?: string;
  platform?: "instagram" | "youtube" | "x";
  caption: string;
  category: string;
  thumbnail?: string;
}

const defaultReels: ReelItem[] = [
  {
    id: "ig-cm-meet",
    title: "Hon'ble CM Mohan Yadav ji Meeting with Founder Rohit Pandit",
    url: "https://www.instagram.com/p/DFaL81yvM_w/",
    caption: "फाउंडर रोहित पंडित जी ने माननीय मुख्यमंत्री डॉ. मोहन यादव जी से सौजन्य भेंट कर आरपी फाउंडेशन के सामाजिक सेवा प्रकल्पों की जानकारी दी।",
    category: "Leadership",
    thumbnail: "/assets/founder.png"
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
  const [inAppUrl, setInAppUrl] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    let alive = true;
    axios
      .get("/api/cms")
      .then((res) => {
        if (!alive) return;
        const list = res.data?.cms?.instagramPosts;
        if (Array.isArray(list)) {
          const activeOnly = list
            .filter((item: any) => item && item.active !== false && item.platform !== "x" && !String(item.url || "").includes("twitter.com") && !String(item.url || "").includes("x.com"))
            .map((item: any, idx: number) => {
              const postUrl = item.url || item.videoUrl || "https://www.instagram.com/rpfoundationofficial/";
              const ytMatch = String(postUrl).match(/(?:youtube\.com\/(?:shorts\/|watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/i);
              const videoId = item.videoId || (ytMatch ? ytMatch[1] : undefined);
              const igMatch = String(postUrl).match(/instagram\.com\/(?:reel|p|tv)\/([A-Za-z0-9_-]+)/i);
              const shortcode = igMatch ? igMatch[1] : undefined;

              const platform = item.platform || (videoId ? "youtube" : "instagram");
              const embedUrl = item.embedUrl || (
                videoId
                  ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&playsinline=1&modestbranding=1&rel=0`
                  : shortcode
                  ? `https://www.instagram.com/p/${shortcode}/embed/captioned/`
                  : undefined
              );

              return {
                id: item.id || `cms-${idx}`,
                title: item.title || "RP Foundation Reel",
                url: postUrl,
                videoUrl: item.videoUrl,
                embedUrl,
                videoId,
                platform,
                caption: item.caption || item.title || "RP Foundation Social Initiative",
                category: item.category || (platform === "youtube" ? "Healthcare" : "Leadership"),
                thumbnail: item.thumbnail || (videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : "/assets/founder.png")
              };
            });
          setReels(activeOnly);
          return;
        }
        // Fallback to /api/public/social-feed only if CMS posts not initialized
        return axios.get("/api/public/social-feed").then((feedRes) => {
          if (!alive) return;
          if (feedRes.data?.success && Array.isArray(feedRes.data.data) && feedRes.data.data.length > 0) {
            const feedItems = feedRes.data.data
              .filter((item: any) => item.platform !== "x" && !String(item.link || "").includes("twitter.com") && !String(item.link || "").includes("x.com"))
              .map((item: any, idx: number) => ({
                id: item.id || `feed-${idx}`,
                title: item.title || "RP Foundation Update",
                url: item.link || "https://www.youtube.com/@rpfoundationofficial",
                videoUrl: item.videoUrl,
                embedUrl: item.embedUrl,
                videoId: item.videoId,
                platform: item.platform,
                caption: item.description || "Official update from RP Foundation.",
                category: item.category || "General",
                thumbnail: item.thumbnailUrl || "/assets/founder.png"
              }));
            setReels(feedItems);
          }
        });
      })
      .catch(() => {});

    return () => {
      alive = false;
    };
  }, []);

  const categories = ["all", "Healthcare", "Empowerment", "Leadership", "Ground Action"];

  const filteredReels = selectedCategory === "all"
    ? reels
    : reels.filter((r) => r.category.toLowerCase() === selectedCategory.toLowerCase());

  const currentReel = filteredReels[currentIndex] || filteredReels[0] || reels[0];
  const ytMatch = String(currentReel?.url || "").match(/(?:youtube\.com\/(?:shorts\/|watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/i);
  const ytId = currentReel?.videoId || (ytMatch ? ytMatch[1] : undefined);
  const isDirectVideo = Boolean(currentReel?.videoUrl && !currentReel.videoUrl.includes("instagram.com"));

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

        <div className="flex items-center gap-2">
          {isDirectVideo && (
            <button
              type="button"
              onClick={() => setIsMuted((m) => !m)}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md text-white hover:bg-white/20 active:scale-95 transition-all cursor-pointer"
            >
              {isMuted ? <VolumeX className="h-4.5 w-4.5" /> : <Volume2 className="h-4.5 w-4.5" />}
            </button>
          )}
          <button
            type="button"
            onClick={() => shareReel(currentReel)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md text-white hover:bg-white/20 active:scale-95 transition-all cursor-pointer"
          >
            <Share2 className="h-5 w-5" />
          </button>
        </div>
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
        {filteredReels.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center max-w-sm">
            <Film className="h-16 w-16 text-slate-600 mb-4 animate-pulse" />
            <p className="text-base font-bold text-slate-300">
              {hi ? "कोई रील उपलब्ध नहीं है" : "No Reels Available"}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {hi ? "एडमिन द्वारा कोई रील पोस्ट नहीं की गई है।" : "No active reels have been added by admin yet."}
            </p>
          </div>
        ) : ytId ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <iframe
              key={ytId}
              src={`https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&playsinline=1&modestbranding=1&rel=0`}
              title={currentReel?.title}
              className="w-full h-full max-w-md aspect-[9/16] border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : isDirectVideo ? (
          <video
            key={currentReel.id + currentReel.videoUrl}
            src={currentReel.videoUrl}
            poster={currentReel.thumbnail}
            controls
            autoPlay
            loop
            playsInline
            muted={isMuted}
            className="absolute inset-0 h-full w-full object-contain bg-black"
          />
        ) : currentReel?.embedUrl ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950 p-2 pt-16 pb-24">
            <iframe
              key={currentReel.id}
              src={currentReel.embedUrl}
              title={currentReel?.title}
              className="w-full h-full max-w-sm aspect-[9/16] border-0 rounded-2xl bg-white shadow-2xl overflow-hidden"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              scrolling="no"
            />
          </div>
        ) : (
          <>
            <img
              src={currentReel?.thumbnail || "/assets/founder.png"}
              alt={currentReel?.title}
              className="absolute inset-0 h-full w-full object-cover opacity-80"
              onError={(e) => {
                e.currentTarget.src = "/assets/founder.png";
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

            {/* Play Trigger / In-App Modal Open */}
            <button
              type="button"
              onClick={() => setInAppUrl(currentReel?.url)}
              className="z-20 flex flex-col items-center gap-3 rounded-2xl bg-black/60 backdrop-blur-md p-6 border border-white/10 hover:scale-105 active:scale-95 transition-all shadow-xl text-center max-w-xs cursor-pointer"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 via-pink-500 to-purple-600 text-white shadow-lg">
                <Play className="h-7 w-7 fill-current ml-1" />
              </div>
              <div>
                <p className="text-sm font-bold text-white leading-snug">
                  {currentReel?.title}
                </p>
                <p className="mt-1 text-[11px] text-pink-300 font-semibold inline-flex items-center gap-1">
                  Tap to Watch In-App
                </p>
              </div>
            </button>
          </>
        )}
      </div>

      {/* Bottom Info Overlay & Floating Controls */}
      {currentReel && (
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

              <button
                type="button"
                onClick={() => setInAppUrl(currentReel?.url)}
                className="flex flex-col items-center gap-1 text-white hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 to-pink-600 text-white shadow-md">
                  {currentReel?.platform === "youtube" ? (
                    <Youtube className="h-5 w-5 fill-white" />
                  ) : (
                    <Instagram className="h-5 w-5" />
                  )}
                </div>
                <span className="text-[10px] font-bold">Watch</span>
              </button>
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
      )}

      {/* In-App WebView Modal for 100% Contained Playback */}
      {inAppUrl && (
        <InAppWebView
          url={inAppUrl}
          title={currentReel?.title || "RP Foundation Media"}
          onClose={() => setInAppUrl(null)}
        />
      )}
    </main>
  );
}