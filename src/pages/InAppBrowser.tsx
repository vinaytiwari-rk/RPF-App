import React, { useMemo, useRef, useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';

/**
 * RPF Internal Browser — Iframe fallback.
 *
 * This page is shown ONLY when the popup window was blocked by the user's
 * browser (e.g. strict popup blocker). In that case we try to load the site
 * in an iframe via our server-side proxy. If the site blocks iframes too,
 * we show a clean "Open in New Tab" button so the user can still access it.
 */

function getProxyUrl(url: string) {
  return `/api/gov/web-proxy?url=${encodeURIComponent(url)}&clean=1`;
}

const CLEAN_CSS = `
footer,header,[role="contentinfo"],
[aria-label*="cookie" i],[id*="cookie" i],[class*="cookie" i],
[id*="consent" i],[class*="consent" i],[id*="advert" i],[class*="advert" i],
[id*="banner" i],[class*="banner" i],[id*="popup" i],[class*="popup" i],
[class*="modal" i]{display:none!important;visibility:hidden!important}
nav,[role="navigation"]{display:none!important}
body{margin:0!important;background:#fff!important}
main,article,[role="main"],.content,.main-content{max-width:100%!important;width:100%!important;margin:0 auto!important}
`;

function installClean(frame: HTMLIFrameElement) {
  try {
    const doc = frame.contentDocument;
    if (!doc) return false;
    if (!doc.getElementById('rpf-clean')) {
      const s = doc.createElement('style');
      s.id = 'rpf-clean';
      s.textContent = CLEAN_CSS;
      doc.head?.appendChild(s);
    }
    return true;
  } catch {
    return false;
  }
}

export default function InAppBrowser() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const frameRef = useRef<HTMLIFrameElement | null>(null);
  const rawUrl = params.get('url') || '';
  const frameUrl = useMemo(() => (rawUrl ? getProxyUrl(rawUrl) : ''), [rawUrl]);
  const [iframeBlocked, setIframeBlocked] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Refresh handler called from MainLayout header
  useEffect(() => {
    const handleRefresh = () => {
      if (frameRef.current) {
        const src = frameRef.current.src;
        frameRef.current.src = '';
        setTimeout(() => {
          if (frameRef.current) frameRef.current.src = src;
        }, 50);
      }
    };
    window.addEventListener('rpf-browser-refresh', handleRefresh);
    return () => window.removeEventListener('rpf-browser-refresh', handleRefresh);
  }, []);

  const onLoad = () => {
    setLoaded(true);
    // Try to detect if the iframe actually loaded content or was blocked
    try {
      const doc = frameRef.current?.contentDocument;
      if (!doc || !doc.body || doc.body.innerHTML.trim() === '') {
        setIframeBlocked(true);
        return;
      }
      installClean(frameRef.current!);
    } catch {
      // Cross-origin error means the site loaded but blocked iframe access
      // This is actually OK — it means the site IS showing (browser renders it)
      setIframeBlocked(false);
    }
  };

  if (!rawUrl) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8 text-center text-slate-400">
        <p>No URL provided.</p>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-white">
      {iframeBlocked && (
        <div className="flex flex-col items-center justify-center gap-4 p-8 text-center">
          <p className="text-sm text-slate-600">
            यह website in-app browser में नहीं खुल सकती (security restriction)।
          </p>
          <a
            href={rawUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl bg-[#000080] px-6 py-3 font-bold text-white"
          >
            <ExternalLink className="h-4 w-4" />
            नए Tab में खोलें
          </a>
        </div>
      )}

      {!iframeBlocked && (
        <main className="min-h-0 flex-1">
          {!loaded && (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#000080] border-t-transparent" />
            </div>
          )}
          <iframe
            ref={frameRef}
            key={frameUrl}
            src={frameUrl}
            title="RPF Web Content"
            className={`h-[calc(100vh-140px)] w-full border-0 ${loaded ? '' : 'invisible'}`}
            referrerPolicy="strict-origin-when-cross-origin"
            onLoad={onLoad}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads"
          />
        </main>
      )}
    </div>
  );
}
