// src/components/Footer.tsx
import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import InAppWebView from "./InAppWebView";

/** Footer social links prefer the live CMS list and fall back safely. */
export default function Footer() {
  const { socialLinks, cmsConfig } = useApp();
  const [webview, setWebview] = useState<{ url: string; title?: string; platform?: string } | null>(null);
  const liveLinks = Array.isArray((cmsConfig as any)?.socialLinks) && (cmsConfig as any).socialLinks.length
    ? (cmsConfig as any).socialLinks
    : socialLinks;

  const getUrl = (key: string) => {
    const link = liveLinks?.find((l: any) => l?.platform === key);
    return link?.url || "";
  };

  const icons: { key: string; label: string; platform: string; path: string }[] = [
    { key: "founder_instagram", label: "Founder Instagram", platform: "instagram", path: "M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.35 3.608 1.324.975.975 1.262 2.242 1.324 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.35 2.633-1.324 3.608-.975.975-2.242 1.262-3.608 1.324-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.35-3.608-1.324-.975-.975-1.262-2.242-1.324-3.608C2.175 15.747 2.163 15.367 2.163 12s.012-3.584.07-4.85c.062-1.366.35-2.633 1.324-3.608C4.532 2.513 5.799 2.226 7.165 2.164 8.431 2.106 8.811 2.094 12 2.094zM12 0C8.741 0 8.332.013 7.052.072 5.77.13 4.656.425 3.727 1.354c-.928.928-1.222 2.042-1.28 3.324C2.012 5.941 2 6.35 2 9.609v4.782c0 3.259.013 3.668.072 4.948.058 1.282.353 2.395 1.281 3.324.928.928 2.042 1.222 3.324 1.28 1.28.059 1.689.072 4.948.072s3.668-.013 4.948-.072c1.282-.058 2.395-.353 3.324-1.281.928-.928 1.222-2.042 1.28-3.324.059-1.28.072-1.689.072-4.948V9.609c0-3.259-.013-3.668-.072-4.948-.058-1.282-.353-2.395-1.281-3.324-.928-.928-2.042-1.222-3.324-1.28C15.668.013 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a3.999 3.999 0 1 1 0-7.998 3.999 3.999 0 0 1 0 7.998zm6.406-11.845a1.44 1.44 0 1 0-2.88 0 1.44 1.44 0 0 0 2.88 0z" },
    { key: "foundation_instagram", label: "Foundation Instagram", platform: "instagram", path: "M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.35 3.608 1.324.975.975 1.262 2.242 1.324 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.35 2.633-1.324 3.608-.975.975-2.242 1.262-3.608 1.324-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.35-3.608-1.324-.975-.975-1.262-2.242-1.324-3.608C2.175 15.747 2.163 15.367 2.163 12s.012-3.584.07-4.85c.062-1.366.35-2.633 1.324-3.608C4.532 2.513 5.799 2.226 7.165 2.164 8.431 2.106 8.811 2.094 12 2.094zM12 0C8.741 0 8.332.013 7.052.072 5.77.13 4.656.425 3.727 1.354c-.928.928-1.222 2.042-1.28 3.324C2.012 5.941 2 6.35 2 9.609v4.782c0 3.259.013 3.668.072 4.948.058 1.282.353 2.395 1.281 3.324.928.928 2.042 1.222 3.324 1.28 1.28.059 1.689.072 4.948.072s3.668-.013 4.948-.072c1.282-.058 2.395-.353 3.324-1.281.928-.928 1.222-2.042 1.28-3.324.059-1.28.072-1.689.072-4.948V9.609c0-3.259-.013-3.668-.072-4.948-.058-1.282-.353-2.395-1.281-3.324-.928-.928-2.042-1.222-3.324-1.28C15.668.013 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a3.999 3.999 0 1 1 0-7.998 3.999 3.999 0 0 1 0 7.998zm6.406-11.845a1.44 1.44 0 1 0-2.88 0 1.44 1.44 0 0 0 2.88 0z" },
    { key: "facebook", label: "Facebook", platform: "facebook", path: "M22.675 0h-21.35C.595 0 0 .593 0 1.326v21.348C0 23.406.595 24 1.326 24h11.495v-9.294H9.691v-3.622h3.13V8.413c0-3.1 1.893-4.788 4.658-4.788 1.325 0 2.462.099 2.794.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.312h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.325-.594 1.325-1.326V1.326C24 .594 23.406 0 22.675 0z" },
    { key: "twitter", label: "X (Twitter)", platform: "x", path: "M18.244 2H21l-6.03 6.895L22.065 22h-5.554l-4.35-5.688L7.185 22H4.428l6.45-7.37L4.065 2H9.76l3.93 5.194L18.244 2zm-.967 18h1.527L8.93 3.896H7.29L17.277 20z" },
    { key: "youtube", label: "YouTube", platform: "youtube", path: "M23.498 6.186a2.997 2.997 0 0 0-2.108-2.115C19.667 3.6 12 3.6 12 3.6s-7.667 0-9.39.471a2.997 2.997 0 0 0-2.108 2.115C0 7.914 0 12 0 12s0 4.086.502 5.814a2.997 2.997 0 0 0 2.108 2.115C4.333 20.4 12 20.4 12 20.4s7.667 0 9.39-.471a2.997 2.997 0 0 0 2.108-2.115C24 16.086 24 12 24 12s0-4.086-.502-5.814zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" }
  ];

  return <footer className="bg-gray-900 text-white py-6 mt-12"><div className="container mx-auto flex flex-col md:flex-row justify-between items-center px-4"><p className="text-sm mb-4 md:mb-0">© {new Date().getFullYear()} RP Foundation. All rights reserved.</p><div className="flex space-x-4">{icons.map((icon) => { const url = getUrl(icon.key); return <button key={icon.key} disabled={!url} onClick={() => url && setWebview({ url, title: icon.label, platform: icon.platform })} aria-label={icon.label} className="hover:opacity-80 transition disabled:opacity-40"><svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d={icon.path} /></svg></button>; })}</div></div>{webview && <InAppWebView url={webview.url} title={webview.title} platform={webview.platform} onClose={() => setWebview(null)} />}</footer>;
}
