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
  const pageTitle = params.get('title') || 'RPF Smart Browser';

  const frameRef = useRef<HTMLIFrameElement>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [controls, setControls] = useState(true);
  const [isDesktop, setIsDesktop] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [copied, setCopied] = useState(false);
  const [frameBlocked, setFrameBlocked] = useState(false);

  // Extract hostname cleanly for UI
  let domain = 'portal';
  try {
    domain = new URL(rawUrl).hostname.replace(/^www\./, '');
  } catch {}

  useEffect(() => {
    setError(!rawUrl || !isExternalWebUrl(rawUrl) ? 'Invalid or unsupported web URL.' : '');
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
    }, 10000);
    return () => window.clearTimeout(timer);
  }, [rawUrl, error]);

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
    <div
      className="fixed inset-0 z-[90] flex min-h-[100dvh] flex-col overflow-hidden bg-slate-50 font-sans selection:bg-orange-100"
      onClick={() => setControls(v=>!v)}
    >
      {/* Invisible Floating Header (Glassmorphic & Minimal - Auto-Hides) */}
      <header
        onClick={(e) => e.stopPropagation()}
        className={`fixed top-3 inset-x-3.5 z-40 mx-auto max-w-2xl transition-all duration-300 ${
          controls ? 'translate-y-0 opacity-100' : '-translate-y-16 opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex h-12 items-center justify-between gap-2.5 rounded-2xl border border-slate-200/80 bg-white/95 px-3 shadow-lg backdrop-blur-xl">
          <button
            onClick={() => navigate(-1)}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-700 hover:bg-orange-50 hover:text-[#000080] active:scale-95 transition"
            aria-label="Back to App"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          {/* Minimal Domain Pill (App-Integrated Branding) */}
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl bg-slate-100/80 px-2.5 py-1">
            <Lock className="h-3 w-3 text-emerald-600 shrink-0" />
            <span className="truncate text-xs font-bold text-slate-800">{domain}</span>
            <span className="ml-auto text-[9px] font-black uppercase tracking-wider text-[#FF9933] bg-orange-50 px-1.5 py-0.5 rounded-md border border-orange-100 shrink-0">
              Samahit Safe
            </span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={reload}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 active:scale-95"
              title="Refresh"
            >
              <RotateCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-[#000080]' : ''}`} />
            </button>
            <button
              onClick={handleShare}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 active:scale-95"
              title="Share"
            >
              <Share2 className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={openDirectExternal}
              className="flex h-8 w-8 items-center justify-center rounded-xl text-emerald-700 hover:bg-emerald-50 active:scale-95"
              title="External Browser"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Full-Screen Web View Container */}
      <main className="relative flex-1 w-full bg-white overflow-hidden">
        {error || !rawUrl ? (
          /* Error State Card */
          <div className="flex h-full flex-col items-center justify-center p-6 text-center bg-white">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-rose-50 text-rose-600 mb-4 border border-rose-100">
              <Globe className="h-8 w-8" />
            </div>
            <h2 className="text-base font-black text-slate-900">{pageTitle || 'Web Portal'}</h2>
            <p className="mt-1.5 text-xs text-slate-500 max-w-sm leading-relaxed">
              {error || 'This external portal cannot be embedded directly.'}
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => navigate(-1)}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm"
              >
                Back to App
              </button>
              <button
                onClick={openDirectExternal}
                className="rounded-2xl bg-gradient-to-r from-[#FF9933] to-[#138808] px-5 py-2.5 text-xs font-bold text-white shadow-md active:scale-95"
              >
                Open Official Portal
              </button>
            </div>
          </div>
        ) : frameBlocked ? (
          /* Frame Blocked / X-Frame-Options Fallback Card (NO White Screen) */
          <div className="flex h-full flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-orange-50/40 via-white to-slate-50">
            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white shadow-md border border-orange-100 text-[#000080] mb-4">
              <ShieldCheck className="h-8 w-8 text-[#FF9933]" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-[.18em] text-[#000080]">Protected Portal</span>
            <h2 className="mt-1 text-lg font-black text-slate-900">{pageTitle}</h2>
            <p className="mt-2 text-xs text-slate-500 max-w-xs leading-relaxed">
              This official portal prefers dedicated window view for security and login features.
            </p>
            <div className="mt-6 space-y-2.5 w-full max-w-xs">
              <button
                onClick={openDirectExternal}
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#000080] to-[#138808] py-3 text-xs font-bold text-white shadow-lg active:scale-95 transition"
              >
                <Sparkles className="h-4 w-4 text-[#FF9933]" />
                Launch Portal Securely
              </button>
              <button
                onClick={() => navigate(-1)}
                className="w-full rounded-2xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Return to Samahit
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

            {/* Light Glassmorphic Loader */}
            {loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm">
                <BrandLoader size="lg" label="Connecting to Portal..." />
                <p className="mt-3 text-xs font-bold text-slate-500">Securing Samahit Web Session</p>
              </div>
            )}

            {/* Smart Floating Bottom Action Bar (Appears when timed out or user taps) */}
            {timedOut && !loading && (
              <div className="absolute bottom-16 left-1/2 z-30 -translate-x-1/2 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/95 px-4 py-2.5 text-xs text-slate-800 shadow-2xl backdrop-blur-md">
                <Compass className="h-4 w-4 text-[#FF9933] shrink-0" />
                <span className="font-medium">Page loading slowly?</span>
                <button
                  onClick={reload}
                  className="rounded-xl border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-200"
                >
                  Retry
                </button>
                <button
                  onClick={openDirectExternal}
                  className="rounded-xl bg-[#000080] px-3 py-1 text-[11px] font-bold text-white shadow-sm"
                >
                  Direct View
                </button>
              </div>
            )}

            {/* Copy Link Toast Notification */}
            {copied && (
              <div className="absolute top-16 left-1/2 z-40 -translate-x-1/2 rounded-full bg-slate-900/90 px-4 py-1.5 text-xs font-bold text-white shadow-xl backdrop-blur-md">
                Link copied to clipboard
              </div>
            )}
          </>
        )}
      </main>

      {/* Invisible Floating Bottom Navigation Pill (Auto-Hides) */}
      <footer
        onClick={(e) => e.stopPropagation()}
        className={`fixed bottom-3 inset-x-3.5 z-40 mx-auto max-w-sm transition-all duration-300 ${
          controls ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex h-11 items-center justify-between rounded-2xl border border-slate-200/80 bg-white/95 px-4 shadow-lg backdrop-blur-xl text-xs font-bold text-slate-600">
          <div className="flex items-center gap-2">
            <button
              onClick={() => frameHistory('back')}
              className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-slate-100 active:scale-95"
              title="Back"
            >
              <ChevronLeft className="h-4 w-4 text-slate-700" />
            </button>
            <button
              onClick={() => frameHistory('forward')}
              className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-slate-100 active:scale-95"
              title="Forward"
            >
              <ChevronRight className="h-4 w-4 text-slate-700" />
            </button>
          </div>

          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1 text-[11px] font-bold text-[#000080] hover:text-blue-700"
          >
            <Copy className="h-3.5 w-3.5" /> Copy Link
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
