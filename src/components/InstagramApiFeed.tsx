import React, { useEffect, useState } from 'react';
import { Instagram, AlertTriangle, Play, ExternalLink, Sparkles } from 'lucide-react';
import { openExternalLink } from '../utils/browser';
import { useNavigate } from 'react-router-dom';
import ReelsVerticalViewer, { ReelItem } from './ReelsVerticalViewer';

interface InstagramApiFeedProps {
  sourceUrl?: string;
}

const FALLBACK_INSTAGRAM_POSTS: ReelItem[] = [
  {
    id: "post-1",
    url: "https://www.instagram.com/rpfoundationofficial/",
    thumbnailUrl: "/assets/rpf-samahit-icon.png",
    title: "RP Foundation Youth & Welfare Drive",
    caption: "RP Foundation - Transforming community welfare & empowerment across India. #Samahit #RPFoundation",
    likes: "1.2k",
    author: "RP Foundation"
  },
  {
    id: "post-2",
    url: "https://www.instagram.com/rpfoundationofficial/",
    thumbnailUrl: "/assets/logo.png",
    title: "Jan Seva Card Digital Empowerment",
    caption: "Jan Seva Card initiative empowering citizens with digital identity & welfare benefits.",
    likes: "850",
    author: "RP Foundation"
  },
  {
    id: "post-3",
    url: "https://www.instagram.com/rpfoundationofficial/",
    thumbnailUrl: "/assets/founder.png",
    title: "Leadership Message by Shri Rohit Pandit Ji",
    caption: "Message from Founder Rohit Pandit on community leadership, employment & public service.",
    likes: "2.4k",
    author: "Shri Rohit Pandit Ji"
  }
];

export default function InstagramApiFeed({ sourceUrl = "https://rpf-app-dusky.vercel.app/api/social?action=instagram" }: InstagramApiFeedProps) {
  const navigate = useNavigate();
  const [media, setMedia] = useState<ReelItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeReelIndex, setActiveReelIndex] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchFeed = async () => {
      try {
        const res = await fetch(sourceUrl, { signal: AbortSignal.timeout(5000) });
        if (res.ok) {
          const data = await res.json();
          if (data.items && Array.isArray(data.items) && data.items.length > 0) {
            const formattedMedia: ReelItem[] = data.items.slice(0, 6).map((item: any, idx: number) => ({
              id: item.id || `reel-${idx}`,
              url: item.url || "https://www.instagram.com/rpfoundationofficial/",
              thumbnailUrl: item.image || item.thumbnail || "/assets/rpf-samahit-icon.png",
              title: item.title || "RP Foundation Live Update",
              caption: item.title || item.content_text || "RP Foundation Official Ground Initiative",
              likes: item.likes || "1.5k",
              author: "RP Foundation"
            }));
            if (isMounted) setMedia(formattedMedia);
            return;
          }
        }
        if (isMounted) setMedia(FALLBACK_INSTAGRAM_POSTS);
      } catch {
        if (isMounted) setMedia(FALLBACK_INSTAGRAM_POSTS);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchFeed();
    return () => { isMounted = false; };
  }, [sourceUrl]);

  if (loading) {
    return (
      <div className="grid grid-cols-3 gap-2.5">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse aspect-square bg-slate-100 rounded-2xl flex items-center justify-center border border-slate-200">
            <Instagram className="h-5 w-5 text-slate-300" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2.5">
        {media.map((item, idx) => (
          <button 
            key={item.id} 
            type="button"
            onClick={() => setActiveReelIndex(idx)}
            className="group relative aspect-square block overflow-hidden rounded-2xl bg-white shadow-xs border border-slate-200 text-left active:scale-95 transition hover:shadow-md"
          >
            <img 
              src={item.thumbnailUrl || "/assets/rpf-samahit-icon.png"} 
              alt={item.title} 
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              onError={(e) => {
                e.currentTarget.src = "/assets/rpf-samahit-icon.png";
              }}
            />
            
            {/* Instagram Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 transition-opacity group-hover:opacity-100 flex flex-col justify-between p-2">
              <div className="self-end">
                <span className="inline-flex items-center gap-1 text-[8px] font-black uppercase text-white bg-gradient-to-r from-[#FF9933] to-rose-600 px-1.5 py-0.5 rounded-full backdrop-blur-sm shadow-xs">
                  <Play className="h-2 w-2 fill-white" /> Reel
                </span>
              </div>
              <p className="text-white text-[9px] font-bold line-clamp-2 leading-tight drop-shadow-sm">
                {item.caption || "RP Foundation Update"}
              </p>
            </div>
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between pt-1">
        <a 
          href="https://www.instagram.com/rpfoundationofficial/" 
          target="_blank" 
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 text-xs font-black text-[#FF9933] hover:underline transition"
        >
          <Instagram className="h-3.5 w-3.5" />
          @rpfoundationofficial
        </a>
        <span className="text-[10px] font-bold text-slate-400">Swipeable Vertical Feed</span>
      </div>

      {/* Full Screen Vertical Reels Swipe Viewer Modal */}
      {activeReelIndex !== null && (
        <ReelsVerticalViewer
          reels={media}
          initialIndex={activeReelIndex}
          onClose={() => setActiveReelIndex(null)}
        />
      )}
    </div>
  );
}
