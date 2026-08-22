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

  // Clean the URL to ensure it doesn't have existing query parameters that break the embed format
  const cleanUrl = url ? url.split('?')[0] : '';
  const isProfileUrl = url && !url.includes('/p/') && !url.includes('/reel/') && !url.includes('/tv/');

  useEffect(() => {
    if (isProfileUrl) {
      setError("OEmbed requires a specific Reel or Post URL (e.g. https://www.instagram.com/reel/XYZ123/). Profile URLs are not supported.");
      return;
    }

    // Since Meta API often requires App Review (#10 OAuthException), 
    // we can bypass the API and directly construct the native Instagram embed blockquote.
    // This allows immediate rendering without waiting for Facebook Developer approval.
    const fallbackHtml = `
      <blockquote 
        class="instagram-media" 
        data-instgrm-captioned 
        data-instgrm-permalink="${cleanUrl}?utm_source=ig_embed&amp;utm_campaign=loading" 
        data-instgrm-version="14" 
        style="background:#FFF; border:0; border-radius:3px; box-shadow:0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15); margin: 1px; max-width:540px; min-width:326px; padding:0; width:99.375%; width:-webkit-calc(100% - 2px); width:calc(100% - 2px);"
      >
        <div style="padding:16px;">
          <a href="${cleanUrl}?utm_source=ig_embed&amp;utm_campaign=loading" style="background:#FFFFFF; line-height:0; padding:0 0; text-align:center; text-decoration:none; width:100%;" target="_blank">
            <div style="display: flex; flex-direction: row; align-items: center;">
              <div style="background-color: #F4F4F4; border-radius: 50%; height: 40px; margin-right: 14px; width: 40px;"></div>
              <div style="display: flex; flex-direction: column; flex-grow: 1; justify-content: center;">
                <div style="background-color: #F4F4F4; border-radius: 4px; height: 14px; margin-bottom: 6px; width: 100px;"></div>
                <div style="background-color: #F4F4F4; border-radius: 4px; height: 14px; width: 60px;"></div>
              </div>
            </div>
            <div style="padding: 19% 0;"></div>
            <div style="display:block; height:50px; margin:0 auto 12px; width:50px;">
              <svg width="50px" height="50px" viewBox="0 0 60 60" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
                <g stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
                  <g transform="translate(-511.000000, -20.000000)" fill="#000000">
                    <g><path d="M556.869,30.41 C554.814,30.41 553.148,32.076 553.148,34.131 C553.148,36.186 554.814,37.852 556.869,37.852 C558.924,37.852 560.59,36.186 560.59,34.131 C560.59,32.076 558.924,30.41 556.869,30.41 M541,60.657 C535.114,60.657 530.342,55.887 530.342,50 C530.342,44.114 535.114,39.342 541,39.342 C546.887,39.342 551.658,44.114 551.658,50 C551.658,55.887 546.887,60.657 541,60.657 M541,33.886 C532.1,33.886 524.886,41.1 524.886,50 C524.886,58.899 532.1,66.113 541,66.113 C549.9,66.113 557.115,58.899 557.115,50 C557.115,41.1 549.9,33.886 541,33.886"></path></g>
                  </g>
                </g>
              </svg>
            </div>
            <div style="padding-top: 8px;">
              <div style="color:#3897f0; font-family:Arial,sans-serif; font-size:14px; font-weight:550; line-height:18px;">View this post on Instagram</div>
            </div>
          </a>
        </div>
      </blockquote>
    `;

    // Always attempt API first, but if it fails (due to app review #10), use our perfect fallback blockquote.
    const fetchEmbed = async () => {
      try {
        const accessToken = `${APP_ID}|${CLIENT_TOKEN}`;
        const endpoint = `https://graph.facebook.com/v19.0/instagram_oembed?url=${encodeURIComponent(cleanUrl)}&access_token=${accessToken}&omitscript=true`;
        
        const res = await axios.get(endpoint);
        if (res.data && res.data.html) {
          setHtml(res.data.html);
        }
      } catch (err: any) {
        console.warn("Instagram oEmbed API restricted, using direct blockquote fallback.");
        setHtml(fallbackHtml);
      }
    };
    
    if (url) fetchEmbed();
  }, [url, isProfileUrl, cleanUrl]);

  // Load and process the embed script
  useEffect(() => {
    if (html) {
      if (!(window as any).instgrm) {
        const s = document.createElement('script');
        s.async = true;
        s.src = 'https://www.instagram.com/embed.js';
        s.onload = () => {
          try { (window as any).instgrm.Embeds.process(); } catch(e){}
        };
        document.body.appendChild(s);
      } else {
        setTimeout(() => {
          try { (window as any).instgrm.Embeds.process(); } catch(e){}
        }, 500);
      }
    }
  }, [html]);

  if (error) {
    return (
      <div className="p-5 bg-rose-50 text-rose-800 rounded-3xl border border-rose-200 text-sm shadow-sm w-full">
        <p className="font-black flex items-center gap-2 text-rose-700">
          <AlertCircle className="h-5 w-5" />
          Instagram Embed Error
        </p>
        <p className="mt-2 text-rose-600 font-medium">{error}</p>
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
