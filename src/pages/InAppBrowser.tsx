import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCw, Share2, ExternalLink, ChevronLeft, ChevronRight, Compass, Globe, Lock } from 'lucide-react';
import { isExternalWebUrl, normalizeExternalWebUrl } from '../utils/browser';
import { RPF_WEB_ORIGIN } from '../config/browserPolicy';
import { Capacitor } from '@capacitor/core';
import BrandLoader from '../components/BrandLoader';

const DEFAULT_TITLE = 'Samahit Views';

export default function InAppBrowser() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const rawUrl = normalizeExternalWebUrl(params.get('url') || '') || '';
  const pageTitle = params.get('title') || DEFAULT_TITLE;
  const frameRef = useRef<HTMLIFrameElement>(null);
  const hideTimerRef = useRef<number | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [controls, setControls] = useState(true);
  const [timedOut, setTimedOut] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setError(!rawUrl || !isExternalWebUrl(rawUrl) ? 'Invalid or unsupported website.' : '');
    setLoading(true); setTimedOut(false);
  }, [rawUrl]);

  const proxyPath = rawUrl ? `/api/gov/web-proxy?url=${encodeURIComponent(rawUrl)}` : '';
  const proxyUrl = proxyPath ? (Capacitor.isNativePlatform() ? `${RPF_WEB_ORIGIN}${proxyPath}` : proxyPath) : '';

  useEffect(() => {
    if (!rawUrl || error) return;
    const timer = window.setTimeout(() => { setTimedOut(true); setLoading(false); setControls(true); }, 8000);
    return () => window.clearTimeout(timer);
  }, [rawUrl, error]);

  const showControlsTemporarily = () => {
    setControls(true);
    if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    hideTimerRef.current = window.setTimeout(() => setControls(false), 4000);
  };

  useEffect(() => () => { if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current); }, []);

  const reload = () => {
    setLoading(true); setTimedOut(false); showControlsTemporarily();
    if (frameRef.current) frameRef.current.src = proxyUrl;
  };

  const handleShare = async () => {
    if (!rawUrl) return;
    try {
      if (navigator.share) await navigator.share({ title: pageTitle, url: rawUrl });
      else { await navigator.clipboard.writeText(rawUrl); setCopied(true); window.setTimeout(() => setCopied(false), 2000); }
    } catch {}
  };

  const frameHistory = (action: 'back' | 'forward') => {
    try {
      if (action === 'back') frameRef.current?.contentWindow?.history.back();
      else frameRef.current?.contentWindow?.history.forward();
    } catch { reload(); }
  };

  const openDirectExternal = () => window.open(rawUrl, '_blank', 'noopener,noreferrer');

  return (
    <div className="fixed inset-0 z-[90] flex min-h-[100dvh] flex-col overflow-hidden bg-[#FFF9F0] font-sans">
      <header className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${controls || timedOut || error ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0 pointer-events-none'}`}>
        <div className="flex h-16 items-center gap-2 border-b border-slate-200 bg-[#FFF9F0]/98 px-3 shadow-sm backdrop-blur-xl">
          <button onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-xl text-[#14213D] active:scale-95" aria-label="Back to Samahit"><ArrowLeft className="h-5 w-5" /></button>
          <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
            <Lock className="h-3.5 w-3.5 shrink-0 text-[#167C5A]" />
            <div className="min-w-0"><p className="truncate text-xs font-bold text-[#14213D]">{pageTitle}</p><p className="truncate text-[10px] text-slate-500">{rawUrl}</p></div>
          </div>
          <button onClick={reload} className="flex h-10 w-10 items-center justify-center rounded-xl text-[#14213D] active:scale-95" aria-label="Refresh"><RotateCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /></button>
          <button onClick={handleShare} className="flex h-10 w-10 items-center justify-center rounded-xl text-[#14213D] active:scale-95" aria-label="Share"><Share2 className="h-4 w-4" /></button>
          <button onClick={openDirectExternal} className="flex h-10 w-10 items-center justify-center rounded-xl text-[#14213D] active:scale-95" aria-label="Open externally"><ExternalLink className="h-4 w-4" /></button>
        </div>
      </header>

      <main className="relative flex-1 w-full overflow-hidden bg-white" onDoubleClick={showControlsTemporarily}>
        {!rawUrl ? <div className="flex h-full flex-col items-center justify-center p-6 text-center bg-[#FFF9F0]"><div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-[#D97706] border border-amber-100"><Globe className="h-8 w-8" /></div><h2 className="text-base font-bold text-[#14213D]">{pageTitle}</h2><p className="mt-1.5 text-xs text-slate-500">Invalid or unsupported website link.</p><button onClick={() => navigate(-1)} className="mt-6 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-[#14213D]">Back to Samahit</button></div> : <>
          <iframe ref={frameRef} title="Samahit Views" src={proxyUrl} onLoad={() => { setLoading(false); setTimedOut(false); if (!error) showControlsTemporarily(); }} onError={() => { setLoading(false); setControls(true); }} className="h-full w-full border-0 bg-white" allow="autoplay; clipboard-read; clipboard-write; encrypted-media; fullscreen; geolocation; microphone; camera; picture-in-picture" allowFullScreen />
          {loading && <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#FFF9F0]/95 backdrop-blur-sm"><BrandLoader size="lg" label="Opening website…" /><p className="mt-3 text-xs font-semibold text-slate-600">Opening website…</p></div>}
          {timedOut && !loading && <div className="absolute bottom-20 left-1/2 z-30 -translate-x-1/2 flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-amber-100 bg-white/95 px-4 py-3 text-xs text-slate-800 shadow-xl backdrop-blur-md max-w-sm"><div className="flex items-center gap-1.5 font-medium"><Compass className="h-4 w-4 text-[#D97706] shrink-0" /><span>This website is taking longer than expected.</span></div><button onClick={reload} className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-1.5 text-[11px] font-semibold text-[#D97706]">Try again</button><button onClick={openDirectExternal} className="rounded-xl bg-[#14213D] px-3 py-1.5 text-[11px] font-semibold text-white">Open externally</button></div>}
          {copied && <div className="absolute top-20 left-1/2 z-40 -translate-x-1/2 rounded-full bg-[#14213D]/95 px-4 py-2 text-xs font-semibold text-white">Link copied</div>}
        </>}
      </main>

      <footer className={`fixed bottom-0 inset-x-0 z-40 transition-all duration-300 ${controls || timedOut || error ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}>
        <div className="flex h-16 items-center justify-around border-t border-slate-200 bg-[#FFF9F0]/98 px-5 shadow-sm backdrop-blur-xl">
          <button onClick={() => frameHistory('back')} className="flex h-10 w-10 items-center justify-center rounded-xl text-[#14213D] active:scale-95" aria-label="Back"><ChevronLeft className="h-5 w-5" /></button>
          <button onClick={() => frameHistory('forward')} className="flex h-10 w-10 items-center justify-center rounded-xl text-[#14213D] active:scale-95" aria-label="Forward"><ChevronRight className="h-5 w-5" /></button>
          <button onClick={reload} className="flex h-10 w-10 items-center justify-center rounded-xl text-[#14213D] active:scale-95" aria-label="Refresh"><RotateCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} /></button>
        </div>
      </footer>
    </div>
  );
}
