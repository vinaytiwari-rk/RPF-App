import React, { useEffect, useState } from "react";
import { Instagram, Play, Heart, ChevronRight, Youtube, Radio, ExternalLink, Loader2 } from "lucide-react";
import axios from "axios";
import ReelsVerticalViewer, { ReelItem } from "./ReelsVerticalViewer";
import { openExternalLink } from "../utils/browser";

interface InstagramApiFeedProps {
  sourceUrl?: string;
}

const AUTHENTIC_FEED_ITEMS: ReelItem[] = [
  {
    id: "yt-1",
    url: "https://www.youtube.com/shorts/W3lZc8dLDAU",
    videoId: "W3lZc8dLDAU",
    thumbnailUrl: "https://i.ytimg.com/vi/W3lZc8dLDAU/hqdefault.jpg",
    title: "विश्व हिन्दू परिषद के पूर्व अंतरराष्ट्रीय अध्यक्ष श्रद्धेय अशोक सिंघल जी की जयंती",
    caption: "श्रद्धेय अशोक सिंघल जी की पावन जयंती पर आर.पी. फाउंडेशन का कोटि-कोटि नमन।",
    author: "RP Foundation",
    platform: "youtube" as const
  },
  {
    id: "yt-2",
    url: "https://www.youtube.com/shorts/o1BWTKwe1ow",
    videoId: "o1BWTKwe1ow",
    thumbnailUrl: "https://i.ytimg.com/vi/o1BWTKwe1ow/hqdefault.jpg",
    title: "देहदान, महादान | RP Foundation प्रेरणादायक संदेश",
    caption: "मानव कल्याण हेतु देहदान व अंगदान का महान संकल्प।",
    author: "RP Foundation",
    platform: "youtube" as const
  },
  {
    id: "yt-3",
    url: "https://www.youtube.com/shorts/o0WGrCyBzOs",
    videoId: "o0WGrCyBzOs",
    thumbnailUrl: "https://i.ytimg.com/vi/o0WGrCyBzOs/hqdefault.jpg",
    title: "राष्ट्रीय स्वयंसेवक संघ के सरसंघचालक डॉ. मोहन भागवत जी से आत्मीय भेंट",
    caption: "पूज्य सरसंघचालक डॉ. मोहन भागवत जी से समाज सेवा एवं राष्ट्र निर्माण पर पावन मार्गदर्शन।",
    author: "RP Foundation",
    platform: "youtube" as const
  },
  {
    id: "yt-4",
    url: "https://www.youtube.com/shorts/JOQOorTNSiQ",
    videoId: "JOQOorTNSiQ",
    thumbnailUrl: "https://i.ytimg.com/vi/JOQOorTNSiQ/hqdefault.jpg",
    title: "पीपुल्स कैंपस, भोपाल में विराजमान विघ्नहर्ता श्री गणेश जी की महाआरती",
    caption: "पीपुल्स कैंपस, भोपाल में विघ्नहर्ता मंगलकर्ता श्री गणेश जी की दिव्य महाआरती।",
    author: "RP Foundation",
    platform: "youtube" as const
  },
  {
    id: "yt-5",
    url: "https://www.youtube.com/shorts/aY7tCqTHIdE",
    videoId: "aY7tCqTHIdE",
    thumbnailUrl: "https://i.ytimg.com/vi/aY7tCqTHIdE/hqdefault.jpg",
    title: "स्वस्थ समाज, मजबूत समाज की पहली पहचान है | RP Foundation",
    caption: "निःशुल्क स्वास्थ्य शिविर एवं जन कल्याणकारी चिकित्सा सेवा अभियान।",
    author: "RP Foundation",
    platform: "youtube" as const
  },
  {
    id: "yt-6",
    url: "https://www.youtube.com/shorts/6FStdeG4FAw",
    videoId: "6FStdeG4FAw",
    thumbnailUrl: "https://i.ytimg.com/vi/6FStdeG4FAw/hqdefault.jpg",
    title: "जहाँ हुनर को मिला मंच… और मेहनत को मिली पहचान",
    caption: "प्रतिभावान युवाओं एवं नागरिकों को सम्मान व स्वावलंबन का मंच।",
    author: "RP Foundation",
    platform: "youtube" as const
  },
  {
    id: "yt-7",
    url: "https://www.youtube.com/shorts/cmH_37saJmY",
    videoId: "cmH_37saJmY",
    thumbnailUrl: "https://i.ytimg.com/vi/cmH_37saJmY/hqdefault.jpg",
    title: "कैंसर से जंग… RP Foundation बना सहारा",
    caption: "गंभीर बीमारी से पीड़ित जरूरतमंदों के इलाज में आर.पी. फाउंडेशन का संबल।",
    author: "RP Foundation",
    platform: "youtube" as const
  },
  {
    id: "yt-8",
    url: "https://www.youtube.com/shorts/Gx70OKHXylw",
    videoId: "Gx70OKHXylw",
    thumbnailUrl: "https://i.ytimg.com/vi/Gx70OKHXylw/hqdefault.jpg",
    title: "सेवा वही, जो किसी के चेहरे पर मुस्कान लाए | #JanSewaCard",
    caption: "जन सेवा कार्ड एवं नागरिक सहायता केंद्र के जरिए परिवारों को सीधे राहत।",
    author: "RP Foundation",
    platform: "youtube" as const
  },
  {
    id: "yt-9",
    url: "https://www.youtube.com/shorts/IIvLOFc8iLM",
    videoId: "IIvLOFc8iLM",
    thumbnailUrl: "https://i.ytimg.com/vi/IIvLOFc8iLM/hqdefault.jpg",
    title: "राष्ट्रीय नारी सशक्तिकरण संघ द्वारा आयोजित National Icon Award-2026",
    caption: "महिला सशक्तिकरण एवं सामाजिक सेवा हेतु National Icon Award 2026।",
    author: "RP Foundation",
    platform: "youtube" as const
  },
  {
    id: "yt-10",
    url: "https://www.youtube.com/shorts/SUQQ919wFs0",
    videoId: "SUQQ919wFs0",
    thumbnailUrl: "https://i.ytimg.com/vi/SUQQ919wFs0/hqdefault.jpg",
    title: "Youth National Goalball Championship 2026 में सहभागिता हेतु सहयोग",
    caption: "RP Foundation द्वारा दिव्यांग खिलाड़ियों को राष्ट्रीय प्रतियोगिता हेतु सहयोग प्रदान किया गया।",
    author: "RP Foundation",
    platform: "youtube" as const
  },
  {
    id: "yt-11",
    url: "https://www.youtube.com/shorts/k4Id3sdnK08",
    videoId: "k4Id3sdnK08",
    thumbnailUrl: "https://i.ytimg.com/vi/k4Id3sdnK08/hqdefault.jpg",
    title: "मानसरोवर धाम स्थित प्रसिद्ध महादेव मंदिर दर्शन",
    caption: "आर.पी. फाउंडेशन द्वारा श्रद्धालुओं को महादेव मंदिर के दर्शन कराए गए।",
    author: "RP Foundation",
    platform: "youtube" as const
  },
  {
    id: "yt-12",
    url: "https://www.youtube.com/shorts/zyfJ_wpX9hY",
    videoId: "zyfJ_wpX9hY",
    thumbnailUrl: "https://i.ytimg.com/vi/zyfJ_wpX9hY/hqdefault.jpg",
    title: "भोपाल स्थित गुफा मंदिर में प्रसाद वितरण सेवा",
    caption: "आर.पी. फाउंडेशन द्वारा गुफा मंदिर में प्रसाद वितरण सेवा का भव्य आयोजन।",
    author: "RP Foundation",
    platform: "youtube" as const
  },
  {
    id: "ig-cm-meet",
    url: "https://www.instagram.com/p/Dd6j8dOMRHi/",
    thumbnailUrl: "https://images.weserv.nl/?url=instagram.com/p/Dd6j8dOMRHi/media/?size=l",
    title: "मुख्यमंत्री निवास कार्यालय में माननीय मुख्यमंत्री डॉ. मोहन यादव जी से भेंट",
    caption: "आर पी फाउंडेशन के संस्थापक तथा पीपुल्स ग्रुप के उपाध्यक्ष एवं प्रबंध निदेशक श्री रोहित पंडित जी ने मध्यप्रदेश के माननीय मुख्यमंत्री डॉ. मोहन यादव जी से भेंट की।",
    author: "@rpfoundationofficial",
    platform: "instagram" as const,
    embedUrl: "https://www.instagram.com/p/Dd6j8dOMRHi/embed/captioned/"
  }
];

export default function InstagramApiFeed({ sourceUrl = "/api/public/social-feed" }: InstagramApiFeedProps) {
  const [reels, setReels] = useState<ReelItem[]>(AUTHENTIC_FEED_ITEMS);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<"all" | "youtube" | "instagram">("all");
  const [activeReelIndex, setActiveReelIndex] = useState<number | null>(null);

  useEffect(() => {
    let alive = true;
    axios
      .get(sourceUrl)
      .then((res) => {
        if (!alive) return;
        if (res.data?.success && Array.isArray(res.data?.data)) {
          const items: ReelItem[] = res.data.data.map((item: any, idx: number) => {
            const rawUrl = item.link || item.url || "";
            const ytMatch = String(rawUrl).match(/(?:youtube\.com\/(?:shorts\/|watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/i);
            const videoId = item.videoId || (ytMatch ? ytMatch[1] : undefined);
            const thumb = item.thumbnailUrl || (videoId ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg` : "/assets/founder.png");

            return {
              id: item.id || `social-${idx}`,
              url: rawUrl || "https://www.youtube.com/@rpfoundationofficial",
              videoId,
              videoUrl: item.videoUrl,
              embedUrl: item.embedUrl,
              thumbnailUrl: thumb,
              title: item.title || "RP Foundation Update",
              caption: item.description || item.caption || "Official update from RP Foundation.",
              author: item.author || (item.platform === "youtube" ? "RP Foundation" : item.platform === "x" ? "@rpfoundation15" : "@rpfoundationofficial"),
              platform: item.platform || (videoId ? "youtube" : "instagram")
            };
          });

          // Keep the UX deterministic: all YouTube Shorts first, then Instagram Reels.
          const ordered = [...items].sort((a, b) => {
            const rank = (item: ReelItem) => item.platform === "youtube" ? 0 : item.platform === "instagram" ? 1 : 2;
            return rank(a) - rank(b);
          });
          setReels(ordered);
        }
      })
      .catch((err) => {
        console.warn("Could not load live social feed, trying CMS directly:", err);
        axios
          .get("/api/cms")
          .then((cmsRes) => {
            if (!alive) return;
            const list = cmsRes.data?.cms?.instagramPosts;
            if (Array.isArray(list)) {
              const activePosts = list.filter((p: any) => p && p.active !== false);
              const cmsItems: ReelItem[] = activePosts.map((post: any, idx: number) => {
                const pUrl = post.url || post.videoUrl || "";
                const ytMatch = String(pUrl).match(/(?:youtube\.com\/(?:shorts\/|watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/i);
                const vId = post.videoId || (ytMatch ? ytMatch[1] : undefined);
                const pThumb = post.thumbnail || post.thumbnailUrl || (vId ? `https://i.ytimg.com/vi/${vId}/hqdefault.jpg` : "/assets/founder.png");
                const platform = post.platform || (vId ? "youtube" : "instagram");
                return {
                  id: post.id || `cms-fallback-${idx}`,
                  url: pUrl,
                  videoId: vId,
                  videoUrl: post.videoUrl,
                  embedUrl: post.embedUrl,
                  thumbnailUrl: pThumb,
                  title: post.title || "RP Foundation Update",
                  caption: post.caption || post.title || "Official update from RP Foundation.",
                  author: platform === "youtube" ? "RP Foundation" : "@rpfoundationofficial",
                  platform
                };
              });
              setReels(cmsItems);
            }
          })
          .catch(() => {});
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [sourceUrl]);

  // Filter out any X / Twitter items completely
  const displayList = reels.filter(
    (i) => i.platform !== "x" && !String(i.url || "").includes("twitter.com") && !String(i.url || "").includes("x.com")
  );

  const ytCount = displayList.filter((i) => i.platform === "youtube").length;
  const igCount = displayList.filter((i) => i.platform === "instagram" || (!i.platform && !i.videoId)).length;

  const filtered = activeFilter === "all"
    ? displayList
    : displayList.filter((item) => item.platform === activeFilter);

  return (
    <div className="space-y-3.5 font-sans">
      {/* FILTER TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveFilter("all")}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeFilter === "all"
              ? "bg-slate-900 text-white shadow-xs"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
          }`}
        >
          <span>All Media</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeFilter === "all" ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
            }`}
          >
            {displayList.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter("youtube")}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeFilter === "youtube"
              ? "bg-rose-600 text-white shadow-xs"
              : "bg-rose-50 text-rose-700 hover:bg-rose-100/80 border border-rose-100"
          }`}
        >
          <Youtube className="h-3.5 w-3.5 fill-current" />
          <span>YouTube</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeFilter === "youtube" ? "bg-white/20 text-white" : "bg-rose-200/70 text-rose-800"
            }`}
          >
            {ytCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter("instagram")}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeFilter === "instagram"
              ? "bg-gradient-to-r from-amber-500 via-rose-500 to-fuchsia-600 text-white shadow-xs"
              : "bg-fuchsia-50 text-fuchsia-700 hover:bg-fuchsia-100/80 border border-fuchsia-100"
          }`}
        >
          <Instagram className="h-3.5 w-3.5" />
          <span>Instagram</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
              activeFilter === "instagram" ? "bg-white/20 text-white" : "bg-fuchsia-200/70 text-fuchsia-800"
            }`}
          >
            {igCount}
          </span>
        </button>
      </div>

      {/* HORIZONTAL SWIPEABLE REELS & VIDEO SHOWCASE */}
      {loading ? (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="w-[148px] sm:w-[165px] aspect-[9/16] shrink-0 rounded-2xl bg-slate-100 animate-pulse border border-slate-200 flex items-center justify-center text-slate-400 text-xs font-bold"
            >
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-8 text-center">
          <p className="text-xs font-bold text-slate-700">No {activeFilter === "all" ? "" : activeFilter.toUpperCase()} posts currently available</p>
          <p className="mt-1 text-[11px] text-slate-400">Admin can add or publish reels from Admin Control Center.</p>
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2 pt-0.5 px-0.5 scrollbar-none snap-x snap-mandatory">
          {filtered.map((item, idx) => {
            const isYt = item.platform === "youtube";
            const rawCaption = (item.caption || "").trim();
            const rawTitle = (item.title || "").trim();
            const isDuplicate = !rawCaption || rawCaption === rawTitle || (rawTitle.length > 10 && rawCaption.startsWith(rawTitle.slice(0, 15)));
            const displayCaption = isDuplicate
              ? (isYt ? "YouTube • RP Foundation" : "Instagram • @rpfoundationofficial")
              : rawCaption;

            return (
              <div
                key={item.id || idx}
                onClick={() => setActiveReelIndex(idx)}
                className="group relative w-[148px] sm:w-[165px] aspect-[9/16] shrink-0 cursor-pointer overflow-hidden rounded-2xl bg-slate-950 border border-slate-200/90 shadow-sm snap-start active:scale-95 transition-all duration-300 hover:shadow-xl hover:border-amber-400"
              >
                {/* Real Media Background */}
                <img
                  src={item.thumbnailUrl}
                  alt={item.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src = "/assets/founder.png";
                  }}
                />

                {/* Top Subtle Vignette */}
                <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />

                {/* Bottom Cinematic Gradient */}
                <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent pointer-events-none" />

                {/* Top Glass Badge */}
                <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between z-10">
                  <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[8.5px] font-bold text-white bg-black/50 backdrop-blur-md border border-white/20 shadow-xs">
                    {isYt ? (
                      <>
                        <Youtube className="h-2.5 w-2.5 fill-rose-500 text-rose-500" />
                        <span>Shorts</span>
                      </>
                    ) : (
                      <>
                        <Instagram className="h-2.5 w-2.5 text-pink-400" />
                        <span>Reel</span>
                      </>
                    )}
                  </span>
                  <span className="h-5 w-5 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/20 text-white/90 shadow-xs">
                    <Play className="h-2.5 w-2.5 fill-white ml-0.2" />
                  </span>
                </div>

                {/* Elegant Centered Play Button */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/25 backdrop-blur-md text-white border border-white/40 shadow-lg group-hover:scale-110 group-active:scale-95 transition-all">
                    <Play className="h-5 w-5 fill-white ml-0.5 drop-shadow-sm" />
                  </div>
                </div>

                {/* Bottom Title & Details */}
                <div className="absolute bottom-2.5 inset-x-2.5 z-10 space-y-0.5 text-left">
                  <p className="text-[11px] font-bold text-white leading-snug line-clamp-2 drop-shadow-sm">
                    {item.title}
                  </p>
                  <p className="text-[9px] font-medium text-slate-300 line-clamp-1 leading-tight drop-shadow-xs">
                    {displayCaption}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* FOOTER HINT & FULLSCREEN ACTION */}
      <div className="flex items-center justify-between pt-0.5 px-1 text-slate-500">
        <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
          <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
          <span>Tap to watch in fullscreen</span>
        </div>
        <button
          type="button"
          onClick={() => setActiveReelIndex(0)}
          className="inline-flex items-center gap-1 text-xs font-bold text-[#D97706] hover:text-[#B45309] hover:underline cursor-pointer transition-colors"
        >
          <span>Fullscreen Player</span>
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
