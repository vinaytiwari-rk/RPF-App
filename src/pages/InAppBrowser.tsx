import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Share2,
  ExternalLink,
  ShieldCheck,
  Globe,
  Monitor,
  Smartphone,
  Sparkles,
  Lock,
  Compass,
} from 'lucide-react';
import BrandLoader from '../components/BrandLoader';
import { isExternalWebUrl, normalizeExternalWebUrl } from '../utils/browser';

const RPF_WEB_ORIGIN = 'https://appapi.therpfoundation.org';

export default function InAppBrowser() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const rawUrl = normalizeExternalWebUrl(params.get('url') || '') || '';
  const pageTitle = params.get('title') || 'Web Portal';

  const frameRef = useRef<HTMLIFrameElement>(null);
  const hideTimerRef = useRef<number | null>(null);

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [controls, setControls] = useState(false); // Hidden by default for full-screen view
  const [isDesktop, setIsDesktop] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [copied, setCopied] = useState(false);
  const [frameBlocked, setFrameBlocked] = useState(false);

  useEffect(() => {
    setError(!rawUrl || !isExternalWebUrl(rawUrl) ? 'Invalid or unsupported web portal.' : '');
    setLoading(true);
    setTimedOut(false);
    setFrameBlocked(false);
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
      // Keep controls visible if website is delayed or errored
      if (!timedOut && !error && !frameBlocked && !loading) {
        setControls(false);
      }
    }, 3200);
  };

  const reload = () => {
    setLoading(true);
    setTimedOut(false);
    setError('');
    setFrameBlocked(false);
    const f = frameRef.current;
    if (f) f.src = proxyUrl;
  };

  const frameHistory = (d: 'back' | 'forward') => {
    try {
      if (d === 'back') frameRef.current?.contentWindow?.history.back();
      else frameRef.current?.contentWindow?.history.forward();
    } catch {}
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: pageTitle, url: rawUrl });
      } else {
        await navigator.clipboard.writeText(rawUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {}
  };

  const openDirectExternal = () => {
    window.open(rawUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex min-h-[100dvh] flex-col overflow-hidden bg-[#FAF0E6] font-sans selection:bg-[#E8DCD1]"
      onClick={() => { setControls(v=>!v); triggerControlsTemporarily(); }}
      onTouchStart={() => { setControls(v=>!v); triggerControlsTemporarily(); }}
    >
      {/* Auto-Hiding Top Header (Hidden by default unless screen touched or load delayed) */}
      <header
        onClick={(e) => e.stopPropagation()}
        className={`fixed top-3 inset-x-3.5 z-40 mx-auto max-w-2xl transition-all duration-300 ${
          controls || timedOut || error || frameBlocked ? 'translate-y-0 opacity-100' : '-translate-y-16 opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex h-12 items-center justify-between gap-2.5 rounded-2xl border border-[#E8DCD1] bg-[#FFFBF7]/95 px-3.5 shadow-xl backdrop-blur-2xl">
          <button
            onClick={() => navigate(-1)}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-[#2D241E] hover:bg-[#F5ECE2] active:scale-95 transition"
            aria-label="Back to App"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          {/* Title Banner */}
          <div className="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl bg-[#F5ECE2] px-3 py-1 text-center border border-[#E8DCD1]">
            <Lock className="h-3 w-3 text-[#8C5A3C] shrink-0" />
            <span className="truncate text-xs font-black text-[#2D241E]">{pageTitle}</span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={reload}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-[#8C5A3C] hover:bg-[#F5ECE2] active:scale-95"
              title="Refresh Portal"
            >
              <RotateCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-[#8C5A3C]' : ''}`} />
            </button>
            <button
              onClick={handleShare}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-[#8C5A3C] hover:bg-[#F5ECE2] active:scale-95"
              title="Share"
            >
              <Share2 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={openDirectExternal}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-[#8C5A3C] hover:bg-[#F5ECE2] active:scale-95"
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
        ) : frameBlocked || rawUrl.includes(".gov.in") || rawUrl.includes(".nic.in") || rawUrl.includes("jamanetwork") || rawUrl.includes("nejm.org") || rawUrl.includes("dynamed") || rawUrl.includes("zocdoc") || rawUrl.includes("drugs.com") || Boolean(error) ? (
          /* Medical Journal / Government Security / Frame Blocked Fallback Card */
          <div className="flex h-full flex-col items-center justify-center p-6 text-center bg-[#FAF9F6] selection:bg-orange-100">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white shadow-md border border-orange-200 text-[#FF9933] mb-4">
              <ShieldCheck className="h-8 w-8 text-[#FF9933]" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[.18em] text-[#FF9933] bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-100">
              {rawUrl.includes("jamanetwork") || rawUrl.includes("nejm") || rawUrl.includes("dynamed") ? "Verified Medical Journal" : "Verified Official Portal"}
            </span>
            <h2 className="mt-2 text-lg font-black text-slate-900 font-serif">{pageTitle}</h2>
            <p className="mt-2 text-xs text-slate-500 max-w-sm leading-relaxed font-medium">
              This official portal ({new URL(rawUrl).hostname}) enforces strict frame security headers. Tap below to launch securely in a direct window.
            </p>
            <div className="mt-6 space-y-2.5 w-full max-w-xs">
              <button
                onClick={openDirectExternal}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#FF9933] to-[#D97706] py-3.5 text-xs font-black text-white shadow-lg active:scale-95 transition hover:brightness-110"
              >
                <Sparkles className="h-4 w-4 text-amber-200" />
                Launch Portal Securely (Direct View)
              </button>
              <button
                onClick={() => navigate(-1)}
                className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Return to Samahit
              </button>
            </div>
          </div>
        ) : error ? (
          /* General Error Card */
          <div className="flex h-full flex-col items-center justify-center p-6 text-center bg-[#FAF9F6]">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-[#FF9933] mb-4 border border-orange-200 shadow-xs">
              <Globe className="h-8 w-8" />
            </div>
            <h2 className="text-base font-black text-slate-900 font-serif">{pageTitle}</h2>
            <p className="mt-1.5 text-xs text-slate-500 max-w-sm leading-relaxed font-medium">
              This portal prefers external window view.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => navigate(-1)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-xs"
              >
                Back to App
              </button>
              <button
                onClick={openDirectExternal}
                className="rounded-2xl bg-[#FF9933] px-5 py-2.5 text-xs font-bold text-white shadow-md active:scale-95"
              >
                Launch Portal
              </button>
            </div>
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
                setFrameBlocked(true);
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
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#FAF0E6]/95 backdrop-blur-sm">
                <BrandLoader size="lg" label="Connecting to Portal..." />
                <p className="mt-3 text-xs font-bold text-[#7A6A5D]">Connecting to Portal...</p>
              </div>
            )}

            {/* Floating Banner on Delay/Timeout */}
            {timedOut && !loading && (
              <div className="absolute bottom-16 left-1/2 z-30 -translate-x-1/2 flex items-center gap-3 rounded-2xl border border-[#E8DCD1] bg-[#FFFBF7]/95 px-4 py-2.5 text-xs text-[#2D241E] shadow-2xl backdrop-blur-md">
                <Compass className="h-4 w-4 text-[#8C5A3C] shrink-0" />
                <span className="font-medium">Page loading delayed?</span>
                <button
                  onClick={reload}
                  className="rounded-xl border border-[#E8DCD1] bg-[#F5ECE2] px-2.5 py-1 text-[11px] font-bold text-[#8C5A3C] hover:bg-[#E8DCD1]"
                >
                  Refresh Page
                </button>
                <button
                  onClick={openDirectExternal}
                  className="rounded-xl bg-[#8C5A3C] px-3 py-1 text-[11px] font-bold text-white shadow-xs"
                >
                  Direct View
                </button>
              </div>
            )}

            {/* Toast */}
            {copied && (
              <div className="absolute top-16 left-1/2 z-40 -translate-x-1/2 rounded-full bg-[#2D241E]/90 px-4 py-1.5 text-xs font-bold text-white shadow-xl backdrop-blur-md">
                Link copied
              </div>
            )}
          </>
        )}
      </main>

      {/* Auto-Hiding Bottom Navigation Controls (Hidden by default unless screen touched or load delayed) */}
      <footer
        onClick={(e) => e.stopPropagation()}
        className={`fixed bottom-3 inset-x-3.5 z-40 mx-auto max-w-sm transition-all duration-300 ${
          controls || timedOut || error || frameBlocked ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex h-11 items-center justify-between rounded-2xl border border-[#E8DCD1] bg-[#FFFBF7]/95 px-4 shadow-xl backdrop-blur-2xl text-xs font-bold text-[#7A6A5D]">
          <div className="flex items-center gap-2">
            <button
              onClick={() => frameHistory('back')}
              className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-[#F5ECE2] active:scale-95"
              title="Back"
            >
              <ChevronLeft className="h-4 w-4 text-[#2D241E]" />
            </button>
            <button
              onClick={() => frameHistory('forward')}
              className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-[#F5ECE2] active:scale-95"
              title="Forward"
            >
              <ChevronRight className="h-4 w-4 text-[#2D241E]" />
            </button>
          </div>

          <button
            onClick={reload}
            className="flex items-center gap-1 text-[10px] font-black text-[#8C5A3C] uppercase tracking-wider hover:underline"
          >
            <RotateCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Page
          </button>

          <button
            onClick={() => setIsDesktop((v) => !v)}
            className="flex items-center gap-1 text-[11px] font-bold text-[#7A6A5D] hover:text-[#2D241E]"
          >
            {isDesktop ? <Smartphone className="h-3.5 w-3.5 text-[#8C5A3C]" /> : <Monitor className="h-3.5 w-3.5" />}
            {isDesktop ? 'Mobile' : 'Desktop'}
          </button>
        </div>
      </footer>
    </div>
  );
}
