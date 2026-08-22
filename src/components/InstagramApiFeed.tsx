import React, { useEffect, useState } from 'react';
import { Instagram, AlertTriangle, Play, LayoutGrid } from 'lucide-react';

interface InstagramApiFeedProps {
  apiKey: string;
}

export default function InstagramApiFeed({ apiKey }: InstagramApiFeedProps) {
  const [media, setMedia] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!apiKey) {
      setError("API Key is missing.");
      setLoading(false);
      return;
    }

    const fetchFeed = async () => {
      try {
        // Attempting to hit the official Instagram Basic Display API 
        // (If the token is from socialapis.io, it will throw an error and we will know to switch the endpoint)
        const endpoint = `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&access_token=${apiKey}&limit=6`;
        const res = await fetch(endpoint);
        const data = await res.json();

        if (data.error) {
          throw new Error(data.error.message || data.error.type || "Invalid API Key or Token format");
        }

        if (data.data) {
          setMedia(data.data);
        } else if (Array.isArray(data)) {
          // Fallback if the API returns a direct array (e.g., some 3rd party APIs)
          setMedia(data.slice(0,6));
        } else {
          throw new Error("Unexpected API response format");
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFeed();
  }, [apiKey]);

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
          <AlertTriangle className="h-4 w-4" /> Connection Error
        </div>
        <p className="text-[13px] text-rose-600 font-medium leading-relaxed">
          The API returned an error. This usually means the API Key is invalid or expired.
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
          className="group relative aspect-square block overflow-hidden rounded-2xl bg-slate-100 shadow-sm"
        >
          <img 
            src={item.thumbnail_url || item.media_url} 
            alt={item.caption?.substring(0, 30) || "Instagram post"} 
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute top-2 right-2 drop-shadow-md">
            {item.media_type === "VIDEO" ? (
               <Play className="h-5 w-5 text-white fill-white" />
            ) : item.media_type === "CAROUSEL_ALBUM" ? (
               <LayoutGrid className="h-5 w-5 text-white fill-white" />
            ) : null}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 flex items-end p-3">
            <p className="text-white text-[10px] font-medium line-clamp-2 leading-tight drop-shadow-md">
              {item.caption || "View on Instagram"}
            </p>
          </div>
        </a>
      ))}
    </div>
  );
}
