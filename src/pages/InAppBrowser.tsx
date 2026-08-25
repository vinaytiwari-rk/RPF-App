import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  RotateCw,
  Share2,
  ExternalLink,
  Smartphone,
  Monitor,
  ChevronLeft,
  ChevronRight,
  Compass,
  Globe,
  Lock,
} from 'lucide-react';
import { isExternalWebUrl, normalizeExternalWebUrl } from '../utils/browser';
import { RPF_WEB_ORIGIN } from '../config/browserPolicy';
import { Capacitor } from '@capacitor/core';
import BrandLoader from '../components/BrandLoader';

const DEFAULT_TITLE = 'RPF Web View';

export default function InAppBrowser() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const rawUrl = normalizeExternalWebUrl(params.get('url') || '') || '';
  const pageTitle = params.get('title') || DEFAULT_TITLE;

  const frameRef = useRef<HTMLIFrameElement>(null);
  const hideTimerRef = useRef<number | null>(null);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [controls, setControls] = useState(false); // Hidden by default for full-screen view
  const [isDesktop, setIsDesktop] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setError(!rawUrl || !isExternalWebUrl(rawUrl) ? 'Invalid or unsupported web portal.' : '');
    setLoading(true);
    setTimedOut(false);
  }, [rawUrl]);

  const proxyPath = rawUrl ? `/api/gov/web-proxy?url=${encodeURIComponent(rawUrl)}` : '';
  const proxyUrl = proxyPath ? (Capacitor.isNativePlatform() ? `${RPF_WEB_ORIGIN}${proxyPath}` : proxyPath) : '';

  useEffect(() => {
    if (!rawUrl || error) return;
    const timer = window.setTimeout(() => {
      setTimedOut(true);
      setLoading(false);
      setControls(true); // Automatically show controls if website gets delayed loading
    }, 6000);
    return () => window.clearTimeout(timer);
  }, [rawUrl, error]);

  const triggerControlsTemporarily = () => {
    setControls(true);
    if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    hideTimerRef.current = window.setTimeout(() => {
      setControls(false);
    }, 3200);
  };

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    };
  }, []);

  const reload = () => {
    setLoading(true);
    setTimedOut(false);
    if (frameRef.current) {
      try {
        frameRef.current.src = proxyUrl;
      } catch {
        frameRef.current.removeAttribute('src');
        frameRef.current.setAttribute('src', proxyUrl);
      }
    }
  };

  const handleShare = async () => {
    if (!rawUrl) return;
    try {
      if (navigator.share) {
        await navigator.share({ title: pageTitle, url: rawUrl });
      } else {
        await navigator.clipboard.writeText(rawUrl);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      }
    } catch {}
  };

  const frameHistory = (action: 'back' | 'forward') => {
    try {
      if (action === 'back') frameRef.current?.contentWindow?.history.back();
      else frameRef.current?.contentWindow?.history.forward();
    } catch {
      reload();
    }
  };

  const openDirectExternal = () => {
    window.open(rawUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex min-h-[100dvh] flex-col overflow-hidden bg-[#FAF9F6] font-sans selection:bg-orange-100"
      onClick={() => { setControls(v=>!v); triggerControlsTemporarily(); }}
      onTouchStart={() => { setControls(v=>!v); triggerControlsTemporarily(); }}
    >
      {/* Auto-Hiding Top Header (Hidden by default unless screen touched or load delayed) */}
      <header
        onClick={(e) => e.stopPropagation()}
        className={`fixed top-3 inset-x-3.5 z-40 mx-auto max-w-2xl transition-all duration-300 ${
          controls || timedOut || error ? 'translate-y-0 opacity-100' : '-translate-y-16 opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex h-12 items-center justify-between gap-2.5 rounded-2xl border border-slate-200 bg-white/95 px-3.5 shadow-xl backdrop-blur-2xl">
          <button
            onClick={() => navigate(-1)}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-800 hover:bg-slate-100 active:scale-95 transition"
            aria-label="Back to App"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          {/* Title Banner */}
          <div className="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl bg-orange-50 px-3 py-1 text-center border border-orange-100">
            <Lock className="h-3 w-3 text-[#FF9933] shrink-0" />
            <span className="truncate text-xs font-black text-[#000080]">{pageTitle}</span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={reload}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100 active:scale-95"
              title="Refresh Portal"
            >
              <RotateCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-[#FF9933]' : ''}`} />
            </button>
            <button
              onClick={handleShare}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100 active:scale-95"
              title="Share"
            >
              <Share2 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={openDirectExternal}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100 active:scale-95"
              title="Open External"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Web View Area */}
      <main className="relative flex-1 w-full bg-white overflow-hidden">
        {!rawUrl ? (
          /* Invalid URL State Card */
          <div className="flex h-full flex-col items-center justify-center p-6 text-center bg-[#FAF9F6]">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-[#FF9933] mb-4 border border-orange-200 shadow-xs">
              <Globe className="h-8 w-8" />
            </div>
            <h2 className="text-base font-black text-slate-900 font-serif">{pageTitle}</h2>
            <p className="mt-1.5 text-xs text-slate-500 max-w-sm leading-relaxed font-medium">
              Invalid or unsupported portal link.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => navigate(-1)}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 shadow-xs"
              >
                Back to App
              </button>
            </div>
          </div>
        ) : (
          /* Direct In-App Browser Iframe for ALL Portals */
          <>
            <iframe
              ref={frameRef}
              title="RPF Web View"
              src={proxyUrl}
              onLoad={() => {
                setLoading(false);
                setTimedOut(false);
              }}
              onError={() => {
                setLoading(false);
                setControls(true);
              }}
              className="h-full w-full border-0 bg-white"
              style={
                isDesktop
                  ? { width: '250%', height: '250%', transform: 'scale(.4)', transformOrigin: 'top left' }
                  : undefined
              }
              allow="autoplay; clipboard-read; clipboard-write; encrypted-media; fullscreen; geolocation; microphone; camera; picture-in-picture"
              allowFullScreen
            />

            {/* Light Loader */}
            {loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#FAF9F6]/95 backdrop-blur-sm">
                <BrandLoader size="lg" label="Connecting to Portal..." />
                <p className="mt-3 text-xs font-bold text-slate-600">Connecting to Portal...</p>
              </div>
            )}

            {/* Floating Banner on Delay/Timeout */}
            {timedOut && !loading && (
              <div className="absolute bottom-16 left-1/2 z-30 -translate-x-1/2 flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-orange-200 bg-white/95 px-4 py-2.5 text-xs text-slate-800 shadow-2xl backdrop-blur-md max-w-sm">
                <div className="flex items-center gap-1.5 font-medium">
                  <Compass className="h-4 w-4 text-[#FF9933] shrink-0" />
                  <span>Portal loading restricted?</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={reload}
                    className="rounded-xl border border-orange-200 bg-orange-50 px-2.5 py-1 text-[11px] font-bold text-[#FF9933] hover:bg-orange-100"
                  >
                    Refresh
                  </button>
                  <button
                    onClick={openDirectExternal}
                    className="rounded-xl bg-[#27AE60] px-3 py-1 text-[11px] font-black text-white hover:bg-emerald-600 shadow-xs"
                  >
                    Open Direct
                  </button>
                </div>
              </div>
            )}

            {/* Toast */}
            {copied && (
              <div className="absolute top-16 left-1/2 z-40 -translate-x-1/2 rounded-full bg-slate-900/90 px-4 py-1.5 text-xs font-bold text-white shadow-xl backdrop-blur-md">
                Link copied
              </div>
            )}
          </>
        )}
      </main>

      {/* Auto-Hiding Bottom Navigation Controls */}
      <footer
        onClick={(e) => e.stopPropagation()}
        className={`fixed bottom-3 inset-x-3.5 z-40 mx-auto max-w-sm transition-all duration-300 ${
          controls || timedOut || error ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex h-11 items-center justify-between rounded-2xl border border-slate-200 bg-white/95 px-4 shadow-xl backdrop-blur-2xl text-xs font-bold text-slate-600">
          <div className="flex items-center gap-2">
            <button
              onClick={() => frameHistory('back')}
              className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-slate-100 active:scale-95"
              title="Back"
            >
              <ChevronLeft className="h-4 w-4 text-slate-800" />
            </button>
            <button
              onClick={() => frameHistory('forward')}
              className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-slate-100 active:scale-95"
              title="Forward"
            >
              <ChevronRight className="h-4 w-4 text-slate-800" />
            </button>
          </div>

          <button
            onClick={reload}
            className="flex items-center gap-1 text-[10px] font-black text-[#FF9933] uppercase tracking-wider hover:underline"
          >
            <RotateCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Page
          </button>

          <button
            onClick={() => setIsDesktop((v) => !v)}
            className="flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:text-slate-900"
          >
            {isDesktop ? <Smartphone className="h-3.5 w-3.5 text-[#FF9933]" /> : <Monitor className="h-3.5 w-3.5" />}
            {isDesktop ? 'Mobile' : 'Desktop'}
          </button>
        </div>
      </footer>
    </div>
  );
}
