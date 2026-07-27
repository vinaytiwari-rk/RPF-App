// src/components/InAppWebView.tsx
// ──────────────────────────────────────────────────────────────────────────────
//  Full-screen in-app "webview" modal.
//  • Used instead of window.open()/target="_blank" so social links stay inside
//    the app shell instead of jumping to the external browser.
//  • Attempts an iframe preview first. Many social platforms (Instagram,
//    Facebook, X) send an X-Frame-Options / CSP frame-ancestors header that
//    blocks embedding — this cannot be detected directly from JS, so we use a
//    short load-timeout: if the iframe hasn't fired onload in time, we assume
//    it was blocked and fall back to a friendly "open in browser" card instead
//    of showing an infinite blank/loading screen.
// ──────────────────────────────────────────────────────────────────────────────
import React, { useEffect, useRef, useState } from "react";
import { X, ExternalLink, Loader2, ShieldAlert, Instagram, Facebook, Youtube, Twitter, Globe } from "lucide-react";

interface InAppWebViewProps {
  url: string;
  title?: string;
  platform?: string;
  onClose: () => void;
}

const PLATFORM_ICON: Record<string, React.ElementType> = {
  instagram: Instagram,
  facebook: Facebook,
  youtube: Youtube,
  x: Twitter,
  twitter: Twitter,
};

// Platforms known to disallow iframe embedding of their web pages.
// We skip straight to the fallback card for these instead of waiting out a timeout.
const KNOWN_BLOCKED = ["instagram", "facebook", "x", "twitter"];

export default function InAppWebView({ url, title, platform, onClose }: InAppWebViewProps) {
  const isKnownBlocked = platform ? KNOWN_BLOCKED.includes(platform.toLowerCase()) : false;
  const [status, setStatus] = useState<"loading" | "loaded" | "blocked">(
    isKnownBlocked ? "blocked" : "loading"
  );
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isKnownBlocked) return;
    timeoutRef.current = setTimeout(() => {
      setStatus((prev) => (prev === "loading" ? "blocked" : prev));
    }, 3500);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [url, isKnownBlocked]);

  const Icon = (platform && PLATFORM_ICON[platform.toLowerCase()]) || Globe;

  let hostname = "";
  try {
    hostname = new URL(url).hostname.replace(/^www\./, "");
  } catch {
    hostname = url;
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex flex-col animate-fadeIn">
      {/* Header bar — keeps the person inside the app chrome */}
      <div className="shrink-0 bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3 shadow-sm">
        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-slate-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-black text-slate-900 truncate">{title || hostname}</p>
          <p className="text-[10px] text-slate-400 truncate">{hostname}</p>
        </div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center shrink-0 transition"
          aria-label="Open in browser"
          title="Open in browser"
        >
          <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
        </a>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-slate-900 hover:bg-slate-700 flex items-center justify-center shrink-0 transition"
          aria-label="Close"
        >
          <X className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Content area */}
      <div className="flex-1 relative bg-white">
        {status === "loading" && (
          <div className="absolute inset-0 flex items-center justify-center bg-white">
            <Loader2 className="w-6 h-6 text-slate-300 animate-spin" />
          </div>
        )}

        {status !== "blocked" && (
          <iframe
            src={url}
            title={title || "In-app preview"}
            className="w-full h-full border-0"
            onLoad={() => setStatus("loaded")}
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          />
        )}

        {status === "blocked" && (
          <div className="h-full flex flex-col items-center justify-center text-center px-8 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center">
              <ShieldAlert className="w-7 h-7 text-amber-500" />
            </div>
            <div className="space-y-1.5 max-w-xs">
              <p className="text-sm font-black text-slate-900">
                This page can't be previewed in-app
              </p>
              <p className="text-xs text-slate-500 leading-relaxed">
                {hostname} doesn't allow embedded previews. Open it in your browser to view the full page — you'll come right back here after.
              </p>
            </div>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-[#000080] text-white text-xs font-bold px-5 py-3 rounded-xl shadow-md hover:bg-indigo-900 transition"
            >
              <ExternalLink className="w-4 h-4" />
              Open in Browser
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
