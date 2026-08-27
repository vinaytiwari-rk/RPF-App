import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { ArrowLeft, ChevronDown, ChevronUp, Heart, Instagram, Share2, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { extractInstagramEmbedUrl, InstagramPost } from "./AdminInstagram";

const fallbackReels: InstagramPost[] = [
  {
    id: "fb-1",
    title: "RP Foundation Social Initiatives & Health Camps",
    url: "https://www.instagram.com/therpfoundation/",
    caption: "Serving the community through ground-level initiatives, health checkups & digital empowerment.",
    category: "RP Foundation",
    active: true,
    order: 0
  }
];

export default function InstagramReelsPage() {
  const navigate = useNavigate();
  const [reels, setReels] = useState<InstagramPost[]>(fallbackReels);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [liked, setLiked] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    axios.get("/api/cms").then((res) => {
      const list = res.data?.cms?.instagramPosts;
      if (Array.isArray(list) && list.length > 0) {
        const activeOnly = list.filter((item: any) => item.active !== false);
        if (activeOnly.length > 0) {
          setReels(activeOnly.sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0)));
        }
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const currentReel = reels[currentIndex] || reels[0];
  const { embedUrl } = extractInstagramEmbedUrl(currentReel?.url || "");

  const goNext = () => {
    if (currentIndex < reels.length - 1) {
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

    if (diffY > 40) {
      goNext();
    } else if (diffY < -40) {
      goPrev();
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.deltaY > 30) goNext();
    else if (e.deltaY < -30) goPrev();
  };

  const toggleLike = (id: string) => {
    setLiked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const shareReel = (reel: InstagramPost) => {
    if (navigator.share) {
      navigator.share({ title: reel.title, url: reel.url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(reel.url);
      toast.success("Link copied to clipboard!");
    }
  };

  return (
    <main
      className="relative flex h-screen w-full flex-col overflow-hidden bg-slate-950 text-white select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
    >
      <header className="absolute top-0 inset-x-0 z-30 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        <button
          onClick={() => navigate(-1)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 active:scale-95 transition-all"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2 rounded-full bg-rose-500/20 border border-rose-500/30 px-3.5 py-1.5 backdrop-blur-md">
          <Instagram className="h-4 w-4 text-rose-400" />
          <span className="text-xs font-black text-rose-200">Reels & Updates</span>
        </div>
        <span className="text-xs font-black text-white/80 bg-white/10 px-3 py-1 rounded-full backdrop-blur-md">
          {`${currentIndex + 1} / ${reels.length}`}
        </span>
      </header>

      <div className="relative flex-1 w-full h-full flex items-center justify-center pt-14 pb-24">
        {embedUrl ? (
          <iframe
            key={currentReel.id}
            src={embedUrl}
            title={currentReel.title}
            className="w-full max-w-md h-full max-h-[640px] rounded-2xl border-0 bg-black shadow-2xl"
            allowTransparency
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <Instagram className="h-16 w-16 text-rose-500 animate-pulse" />
            <h2 className="mt-4 text-lg font-black">{currentReel?.title || "Instagram Post"}</h2>
            <p className="mt-2 text-xs text-slate-400 max-w-xs">{currentReel?.caption || "Explore RP Foundation Instagram community updates."}</p>
            <a
              href={currentReel?.url || "https://www.instagram.com/"}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-rose-500 to-amber-500 px-5 py-3 text-xs font-black text-white shadow-lg"
            >
              <ExternalLink className="h-4 w-4" /> Open on Instagram
            </a>
          </div>
        )}

        <div className="absolute right-4 bottom-28 z-30 flex flex-col items-center gap-4">
          <button
            onClick={() => toggleLike(currentReel.id)}
            className={`flex h-12 w-12 items-center justify-center rounded-full backdrop-blur-md border border-white/20 transition-all ${
              liked[currentReel.id] ? "bg-rose-600 text-white" : "bg-black/50 text-white hover:bg-black/70"
            }`}
          >
            <Heart className={`h-6 w-6 ${liked[currentReel.id] ? "fill-white" : ""}`} />
          </button>
          <button
            onClick={() => shareReel(currentReel)}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white hover:bg-black/70 transition-all"
          >
            <Share2 className="h-5 w-5" />
          </button>
          {currentReel?.url && (
            <a
              href={currentReel.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white shadow-lg active:scale-95 transition-all"
            >
              <ExternalLink className="h-5 w-5" />
            </a>
          )}
        </div>

        <div className="absolute left-4 bottom-28 z-30 flex flex-col gap-2">
          <button
            onClick={goPrev}
            disabled={currentIndex === 0}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white disabled:opacity-30"
          >
            <ChevronUp className="h-5 w-5" />
          </button>
          <button
            onClick={goNext}
            disabled={currentIndex === reels.length - 1}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white disabled:opacity-30"
          >
            <ChevronDown className="h-5 w-5" />
          </button>
        </div>
      </div>

      <footer className="absolute bottom-0 inset-x-0 z-30 p-4 bg-gradient-to-t from-black/95 via-black/70 to-transparent">
        <div className="max-w-md mx-auto space-y-1">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-rose-500/30 border border-rose-500/40 px-2 py-0.5 text-[10px] font-black uppercase text-rose-300">
              {currentReel?.category || "RP Foundation"}
            </span>
            <span className="text-[10px] text-slate-400">Swipe Up 👆 for Next Reel</span>
          </div>
          <h2 className="text-base font-black truncate">{currentReel?.title}</h2>
          {currentReel?.caption && (
            <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">{currentReel.caption}</p>
          )}
        </div>
      </footer>
    </main>
  );
}