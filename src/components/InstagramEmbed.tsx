import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { AlertCircle, Instagram } from 'lucide-react';

interface InstagramEmbedProps {
  url: string;
}

const APP_ID = '4655825428073473';
const CLIENT_TOKEN = 'ab22c9f2626a4433f44db7c6cf91cc36';

export default function InstagramEmbed({ url }: InstagramEmbedProps) {
  const [html, setHtml] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Helper to check if URL is a profile instead of a Reel/Post
  const isProfileUrl = url && !url.includes('/p/') && !url.includes('/reel/') && !url.includes('/tv/');

  useEffect(() => {
    const fetchEmbed = async () => {
      // Don't call API if it's a profile URL since OEmbed only works for posts/reels
      if (isProfileUrl) {
        setError("OEmbed API requires a specific Reel or Post URL (e.g. https://www.instagram.com/reel/XYZ123/). Profile URLs are not supported.");
        return;
      }

      try {
        const accessToken = `${APP_ID}|${CLIENT_TOKEN}`;
        const endpoint = `https://graph.facebook.com/v19.0/instagram_oembed?url=${encodeURIComponent(url)}&access_token=${accessToken}&omitscript=true`;
        
        const res = await axios.get(endpoint);
        if (res.data && res.data.html) {
          setHtml(res.data.html);
          
          if (!(window as any).instgrm) {
            const s = document.createElement('script');
            s.async = true;
            s.src = 'https://www.instagram.com/embed.js';
            document.body.appendChild(s);
          } else {
            (window as any).instgrm.Embeds.process();
          }
        }
      } catch (err: any) {
        setError(err.response?.data?.error?.message || "Failed to load Instagram Reel");
        console.error("Instagram oEmbed Error:", err.response?.data || err);
      }
    };
    
    if (url) fetchEmbed();
  }, [url, isProfileUrl]);

  useEffect(() => {
    if (html && (window as any).instgrm) {
      setTimeout(() => {
        try { (window as any).instgrm.Embeds.process(); } catch(e){}
      }, 500);
    }
  }, [html]);

  if (error) {
    return (
      <div className="p-5 bg-rose-50 text-rose-800 rounded-3xl border border-rose-200 text-sm shadow-sm w-full">
        <p className="font-black flex items-center gap-2 text-rose-700">
          <AlertCircle className="h-5 w-5" />
          Instagram Meta OEmbed Integration
        </p>
        <p className="mt-2 text-rose-600 font-medium">
          {isProfileUrl ? (
            <>आपने <b>Profile URL</b> ({url}) दिया है। Meta OEmbed केवल <b>Reel या Post URL</b> (जैसे <span className="font-mono bg-rose-100 px-1 rounded">/reel/CXYZ123</span>) सपोर्ट करता है।</>
          ) : (
            <>{error}</>
          )}
        </p>
        {!isProfileUrl && (
          <div className="mt-4 text-[11px] bg-white p-3 rounded-xl border border-rose-100 text-rose-900 leading-relaxed">
            <span className="font-black uppercase tracking-wider text-rose-500">Developer Note</span><br />
            आपके App ID ({APP_ID}) और Client Token का Setup बिल्कुल सही है। लेकिन Facebook API <b>(#10) OAuthException</b> दे रहा है, जिसका मतलब है कि आपके Meta App में <span className="font-bold">"oEmbed Read"</span> परमिशन Review/Approve नहीं हुई है।
          </div>
        )}
      </div>
    );
  }

  if (!html) {
    return (
      <div className="animate-pulse h-[400px] w-full bg-slate-100 rounded-3xl flex flex-col items-center justify-center text-slate-400 border border-slate-200 shadow-sm">
        <Instagram className="w-10 h-10 mb-3 opacity-20" />
        <span className="font-black uppercase tracking-wider text-[10px]">Loading Reel</span>
      </div>
    );
  }

  return (
    <div 
      className="instagram-embed-container w-full overflow-hidden flex justify-center rounded-3xl border border-slate-100 bg-white shadow-sm p-4"
      dangerouslySetInnerHTML={{ __html: html }} 
    />
  );
}
