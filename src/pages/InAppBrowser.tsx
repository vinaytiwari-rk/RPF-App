import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Share2,
  Copy,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Monitor,
  Smartphone,
  X,
  Globe,
} from 'lucide-react';
import { isExternalWebUrl, normalizeExternalWebUrl } from '../utils/browser';
import BrandLoader from '../components/BrandLoader';

const RPF_WEB_ORIGIN = 'https://appapi.therpfoundation.org';

export default function InAppBrowser() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const rawUrl = normalizeExternalWebUrl(params.get('url') || '') || '';
  const pageTitle = params.get('title') || 'RPF Browser';

  const frameRef = useRef<HTMLIFrameElement>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [controls, setControls] = useState(true);
  const [isDesktop, setIsDesktop] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setError(!rawUrl || !isExternalWebUrl(rawUrl) ? 'Invalid or unsupported web URL.' : '');
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
    }, 12000);
    return () => window.clearTimeout(timer);
  }, [rawUrl, error]);

  const reload = () => {
    setLoading(true);
    setTimedOut(false);
    setError('');
    const f = frameRef.current;
    if (f) f.src = proxyUrl;
  };

  const frameHistory = (d: 'back' | 'forward') => {
    try {
      if (d === 'back') frameRef.current?.contentWindow?.history.back();
      else frameRef.current?.contentWindow?.history.forward();
    } catch {}
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(rawUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: pageTitle, url: rawUrl });
      } else {
        await handleCopyLink();
      }
    } catch {}
  };

  const openDirectExternal = () => {
    window.open(rawUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-[90] flex min-h-[100dvh] flex-col overflow-hidden bg-white selection:bg-orange-100" onClick={() => setControls(v=>!v)}>
      {/* Top Floating Browser Toolbar */}
      <header
        onClick={(e) => e.stopPropagation()}
        className={`sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b border-slate-200 bg-white/95 px-3 shadow-sm backdrop-blur-md transition-transform duration-200 ${
          controls ? 'translate-y-0' : '-translate-y-full absolute inset-x-0'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <button
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-700 hover:bg-slate-100 active:scale-95 transition"
            aria-label="Back to App"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <h1 className="truncate text-xs font-bold text-slate-900">{pageTitle || "RPF Web View"}</h1>
            </div>
            <p className="truncate text-[10px] text-slate-400 font-mono">{rawUrl}</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => frameHistory('back')}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 active:scale-95"
            title="Back"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => frameHistory('forward')}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 active:scale-95"
            title="Forward"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            onClick={reload}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 active:scale-95"
            title="Reload"
          >
            <RotateCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleCopyLink}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 active:scale-95"
            title="Copy Link"
          >
            <Copy className="h-4 w-4" />
          </button>
          <button
            onClick={handleShare}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 active:scale-95"
            title="Share Link"
          >
            <Share2 className="h-4 w-4" />
          </button>
          <button
            onClick={openDirectExternal}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-emerald-700 hover:bg-emerald-50 active:scale-95"
            title="Open in System Browser"
          >
            <ExternalLink className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Main View Container */}
      <main className="relative flex-1 bg-slate-50 overflow-hidden">
        {error || !rawUrl ? (
          <div className="flex h-full flex-col items-center justify-center p-6 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-50 text-rose-600 mb-4">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <h2 className="text-base font-bold text-slate-900">Page Unavailable</h2>
            <p className="mt-1 text-xs text-slate-500 max-w-sm">{error || 'The requested web page could not be loaded.'}</p>
            <button
              onClick={() => navigate(-1)}
              className="mt-5 rounded-2xl bg-[#000080] px-5 py-2.5 text-xs font-bold text-white shadow-md active:scale-95 transition"
            >
              Return to App
            </button>
          </div>
        ) : (
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
                setError('This website could not be displayed inside the container.');
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

            {/* Loader Overlay */}
            {loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm">
                <BrandLoader size="lg" label="Opening Web Portal..." />
                <p className="mt-3 text-xs font-bold text-slate-500">Securing connection to portal</p>
              </div>
            )}

            {/* Fallback Banner for Slow / Restricted Sites */}
            {timedOut && !loading && (
              <div className="absolute bottom-5 left-1/2 z-20 -translate-x-1/2 flex items-center gap-3 rounded-2xl bg-slate-900/95 px-4 py-3 text-xs text-white shadow-2xl backdrop-blur-md">
                <Globe className="h-4 w-4 text-[#FF9933] shrink-0" />
                <span>Taking longer than expected?</span>
                <button
                  onClick={reload}
                  className="rounded-lg bg-white/20 px-2.5 py-1 text-[11px] font-semibold hover:bg-white/30"
                >
                  Retry
                </button>
                <button
                  onClick={openDirectExternal}
                  className="rounded-lg bg-[#FF9933] px-2.5 py-1 text-[11px] font-bold text-slate-900 hover:bg-orange-400"
                >
                  Open Direct
                </button>
              </div>
            )}

            {/* Toast for Copied Link */}
            {copied && (
              <div className="absolute top-4 left-1/2 z-30 -translate-x-1/2 rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white shadow-lg">
                Link copied to clipboard
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer Navigation Bar */}
      <footer className="flex h-10 shrink-0 items-center justify-between border-t border-slate-200 bg-white px-4 text-[11px] font-medium text-slate-500">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span>Samahit Protected Session</span>
        </div>
        <button
          onClick={() => setIsDesktop((v) => !v)}
          className="flex items-center gap-1 hover:text-[#000080] font-bold"
        >
          {isDesktop ? (
            <>
              <Smartphone className="h-3.5 w-3.5" /> Mobile View
            </>
          ) : (
            <>
              <Monitor className="h-3.5 w-3.5" /> Desktop View
            </>
          )}
        </button>
      </footer>
    </div>
  );
}
