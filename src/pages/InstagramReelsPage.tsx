import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ReelsVerticalViewer, { ReelItem } from "../components/ReelsVerticalViewer";

export default function InstagramReelsPage() {
  const navigate = useNavigate();
  const [reels, setReels] = useState<ReelItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;

    const mapItems = (data: any[]): ReelItem[] =>
      data
        .filter(
          (item: any) =>
            item &&
            item.platform !== "x" &&
            !String(item.link || item.url || "").includes("twitter.com") &&
            !String(item.link || item.url || "").includes("x.com")
        )
        .map((item: any, idx: number) => {
          const rawUrl = String(item.link || item.url || "");
          const ytMatch = rawUrl.match(
            /(?:youtube\.com\/(?:shorts\/|watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/i
          );
          const videoId = item.videoId || (ytMatch ? ytMatch[1] : undefined);
          const platform = item.platform || (videoId ? "youtube" : "instagram");
          const igMatch = rawUrl.match(/instagram\.com\/(?:reel|p|tv)\/([A-Za-z0-9_-]+)/i);
          const shortcode = igMatch ? igMatch[1] : undefined;

          return {
            id: item.id || `reel-${idx}`,
            url: rawUrl || "https://www.youtube.com/@rpfoundationofficial",
            videoUrl: item.videoUrl,
            videoId,
            embedUrl:
              item.embedUrl ||
              (videoId
                ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=1&playsinline=1&modestbranding=1&rel=0`
                : shortcode
                ? `https://www.instagram.com/p/${shortcode}/embed/captioned/`
                : undefined),
            thumbnailUrl:
              item.thumbnailUrl ||
              item.thumbnail ||
              (videoId
                ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
                : "/assets/founder.png"),
            title: item.title || "RP Foundation Update",
            caption:
              item.description ||
              item.caption ||
              "Official update from RP Foundation.",
            author:
              item.author ||
              (platform === "youtube"
                ? "RP Foundation"
                : "@rpfoundationofficial"),
            platform
          };
        })
        .sort(() => Math.random() - 0.5);

    axios
      .get("/api/public/social-feed")
      .then((res) => {
        if (!alive) return;
        if (res.data?.success && Array.isArray(res.data.data)) {
          setReels(mapItems(res.data.data));
        }
      })
      .catch(() => {
        // If the public feed is temporarily unavailable, use the CMS endpoint.
        return axios.get("/api/cms").then((res) => {
          if (!alive) return;
          const list = res.data?.cms?.instagramPosts;
          if (Array.isArray(list)) setReels(mapItems(list));
        });
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  if (loading) {
    return (
      <main className="fixed inset-0 z-[100] flex items-center justify-center bg-black text-white">
        <div className="text-sm font-bold">Loading RP Foundation reels…</div>
      </main>
    );
  }

  if (reels.length === 0) {
    return (
      <main className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-black px-6 text-center text-white">
        <p className="text-sm font-bold">No reels are currently available.</p>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="rounded-xl bg-white/10 px-4 py-2 text-xs font-bold"
        >
          Go Back
        </button>
      </main>
    );
  }

  return (
    <ReelsVerticalViewer
      reels={reels}
      initialIndex={0}
      onClose={() => navigate(-1)}
    />
  );
}
