import React, { useEffect, useState } from 'react';
import { Instagram, AlertTriangle, Play, LayoutGrid, Rss } from 'lucide-react';

interface InstagramApiFeedProps {
  sourceUrl: string; // The URL to the JSON feed (e.g. RSS.app JSON endpoint)
}

export default function InstagramApiFeed({ sourceUrl }: InstagramApiFeedProps) {
  const [media, setMedia] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sourceUrl) {
      setError("Data source URL is missing.");
      setLoading(false);
      return;
    }

    const fetchFeed = async () => {
      try {
        const res = await fetch(sourceUrl);
        const data = await res.json();

        if (data.error) {
          throw new Error(data.error.message || "Failed to load feed");
        }

        // Handle RSS.app JSON v1.1 format
        if (data.items && Array.isArray(data.items)) {
          const formattedMedia = data.items.slice(0, 6).map((item: any) => ({
            id: item.id,
            permalink: item.url,
            media_url: item.image,
            thumbnail_url: item.image,
            caption: item.title || item.content_text || "",
            media_type: item.attachments?.length ? "VIDEO" : "IMAGE" // Guess type based on standard formats
          }));
          setMedia(formattedMedia);
          return;
        }

        // Handle standard Meta Graph API format (fallback if they ever get an official token)
        if (data.data && Array.isArray(data.data)) {
          setMedia(data.data.slice(0, 6));
          return;
        }
        
        throw new Error("Unexpected API response format");
        
      } catch (err: any) {
        setError(err.message || "Network Error while fetching the feed");
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, [sourceUrl]);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="animate-pulse aspect-square bg-slate-100 rounded-2xl flex items-center justify-center">
            <Instagram className="h-6 w-6 text-slate-300 opacity-50" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-5 bg-rose-50 border border-rose-200 rounded-3xl shadow-sm">
        <div className="flex items-center gap-2 text-rose-700 font-black tracking-wide text-sm mb-2 uppercase">
          <AlertTriangle className="h-4 w-4" /> Live Feed Error
        </div>
        <p className="text-[13px] text-rose-600 font-medium leading-relaxed">
          Unable to fetch the latest updates from the source.
        </p>
        <div className="mt-3 p-3 bg-white/60 rounded-xl border border-rose-100 font-mono text-[10px] text-rose-800 break-all">
          {error}
        </div>
      </div>
    );
  }

  if (!media.length) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {media.map((item) => (
        <a 
          key={item.id} 
          href={item.permalink} 
          target="_blank" 
          rel="noreferrer" 
          className="group relative aspect-square block overflow-hidden rounded-2xl bg-slate-100 shadow-sm border border-slate-100"
        >
          {item.thumbnail_url || item.media_url ? (
            <img 
              src={item.thumbnail_url || item.media_url} 
              alt="Instagram Post" 
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              onError={(e) => {
                // Hide broken images from 3rd party scrapers gracefully
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement?.classList.add('flex', 'items-center', 'justify-center', 'bg-slate-50');
              }}
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-slate-50">
               <Instagram className="text-slate-300 h-8 w-8" />
            </div>
          )}
          
          {/* Overlay gradient & Text */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-end p-3">
            <p className="text-white text-[10px] font-medium line-clamp-3 leading-tight drop-shadow-md">
              {item.caption || "View on Instagram"}
            </p>
          </div>
        </a>
      ))}
    </div>
  );
}
