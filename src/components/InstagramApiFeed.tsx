import React, { useEffect, useState } from 'react';
import { Instagram, AlertTriangle, Play, ExternalLink, Sparkles } from 'lucide-react';
import { openExternalLink } from '../utils/browser';
import { useNavigate } from 'react-router-dom';

interface InstagramApiFeedProps {
  sourceUrl?: string;
}

const FALLBACK_INSTAGRAM_POSTS = [
  {
    id: "post-1",
    permalink: "https://www.instagram.com/rpfoundationofficial/",
    media_url: "/assets/rpf-samahit-icon.png",
    caption: "RP Foundation - Transforming community welfare across India. #Samahit #RPFoundation",
    likes: "1.2k"
  },
  {
    id: "post-2",
    permalink: "https://www.instagram.com/rpfoundationofficial/",
    media_url: "/assets/logo.png",
    caption: "Jan Seva Card initiative empowering citizens with digital identity & welfare benefits.",
    likes: "850"
  },
  {
    id: "post-3",
    permalink: "https://www.instagram.com/rpfoundationofficial/",
    media_url: "/assets/founder.png",
    caption: "Message from Founder Rohit Pandit on community leadership & public service.",
    likes: "2.4k"
  }
];

export default function InstagramApiFeed({ sourceUrl = "https://rpf-app-dusky.vercel.app/api/social?action=instagram" }: InstagramApiFeedProps) {
  const navigate = useNavigate();
  const [media, setMedia] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchFeed = async () => {
      try {
        const res = await fetch(sourceUrl, { signal: AbortSignal.timeout(5000) });
        if (res.ok) {
          const data = await res.json();
          if (data.items && Array.isArray(data.items) && data.items.length > 0) {
            const formattedMedia = data.items.slice(0, 6).map((item: any) => ({
              id: item.id || item.url,
              permalink: item.url || "https://www.instagram.com/rpfoundationofficial/",
              media_url: item.image || item.thumbnail || "/assets/rpf-samahit-icon.png",
              thumbnail_url: item.image || item.thumbnail,
              caption: item.title || item.content_text || "RP Foundation Official Update",
              likes: item.likes || "500+"
            }));
            if (isMounted) setMedia(formattedMedia);
            return;
          }
          if (data.data && Array.isArray(data.data) && data.data.length > 0) {
            if (isMounted) setMedia(data.data.slice(0, 6));
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
        {media.map((item) => (
          <button 
            key={item.id} 
            type="button"
            onClick={() => openExternalLink(item.permalink, navigate, "Instagram Post")}
            className="group relative aspect-square block overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-200 text-left active:scale-95 transition"
          >
            <img 
              src={item.media_url || item.thumbnail_url || "/assets/rpf-samahit-icon.png"} 
              alt="Instagram Post" 
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              onError={(e) => {
                e.currentTarget.src = "/assets/rpf-samahit-icon.png";
              }}
            />
            
            {/* Instagram Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 transition-opacity group-hover:opacity-100 flex flex-col justify-between p-2">
              <div className="self-end">
                <span className="inline-flex items-center gap-1 text-[8px] font-black uppercase text-white bg-pink-600/80 px-1.5 py-0.5 rounded-full backdrop-blur-sm">
                  <Instagram className="h-2.5 w-2.5" /> IG
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
          className="inline-flex items-center gap-1.5 text-xs font-black text-pink-600 hover:text-pink-700 transition"
        >
          <Instagram className="h-3.5 w-3.5" />
          @rpfoundationofficial
        </a>
        <span className="text-[10px] font-bold text-slate-400">Live Updates</span>
      </div>
    </div>
  );
}
