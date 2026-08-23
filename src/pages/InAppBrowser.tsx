import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCw, Share2, ExternalLink, Smartphone, Monitor, ChevronLeft, ChevronRight, Compass, Globe, Lock, Info } from 'lucide-react';
import { isExternalWebUrl, normalizeExternalWebUrl } from '../utils/browser';
import { RPF_WEB_ORIGIN } from '../config/browserPolicy';
import { Capacitor } from '@capacitor/core';
import BrandLoader from '../components/BrandLoader';

const DEFAULT_TITLE = 'Samahit Browser';
const GOV_NOTICE_KEY = '@samahit_gov_link_notice_hidden';

function isGovernmentDomain(rawUrl: string) {
  try {
    const host = new URL(rawUrl).hostname.toLowerCase();
    return host === 'gov.in' || host.endsWith('.gov.in') || host === 'nic.in' || host.endsWith('.nic.in');
  } catch { return false; }
}

export default function InAppBrowser() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const rawUrl = normalizeExternalWebUrl(params.get('url') || '') || '';
  const pageTitle = params.get('title') || DEFAULT_TITLE;
  const governmentPortal = isGovernmentDomain(rawUrl);
  const [noticeOpen, setNoticeOpen] = useState(() => governmentPortal && localStorage.getItem(GOV_NOTICE_KEY) !== '1');
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const hideTimerRef = useRef<number | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [controls, setControls] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [frameFailed, setFrameFailed] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setError(!rawUrl || !isExternalWebUrl(rawUrl) ? 'Invalid or unsupported web portal.' : '');
    setLoading(true); setTimedOut(false); setFrameFailed(false);
    setNoticeOpen(isGovernmentDomain(rawUrl) && localStorage.getItem(GOV_NOTICE_KEY) !== '1');
  }, [rawUrl]);

  const proxyPath = rawUrl ? `/api/gov/web-proxy?url=${encodeURIComponent(rawUrl)}` : '';
  const proxyUrl = proxyPath ? (Capacitor.isNativePlatform() ? `${RPF_WEB_ORIGIN}${proxyPath}` : proxyPath) : '';

  useEffect(() => {
    if (!rawUrl || error || noticeOpen) return;
    const timer = window.setTimeout(() => { setTimedOut(true); setLoading(false); setControls(true); }, 6000);
    return () => window.clearTimeout(timer);
  }, [rawUrl, error, noticeOpen]);

  const triggerControlsTemporarily = () => { setControls(true); if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current); hideTimerRef.current = window.setTimeout(() => setControls(false), 3200); };
  useEffect(() => () => { if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current); }, []);
  const reload = () => { if (noticeOpen) return; setLoading(true); setTimedOut(false); setFrameFailed(false); if (frameRef.current) frameRef.current.src = proxyUrl; };
  const handleShare = async () => { if (!rawUrl) return; try { if (navigator.share) await navigator.share({ title: pageTitle, url: rawUrl }); else { await navigator.clipboard.writeText(rawUrl); setCopied(true); window.setTimeout(() => setCopied(false), 2000); } } catch {} };
  const frameHistory = (action: 'back' | 'forward') => { try { if (action === 'back') frameRef.current?.contentWindow?.history.back(); else frameRef.current?.contentWindow?.history.forward(); } catch { reload(); } };
  const openDirectExternal = () => window.open(rawUrl, '_blank', 'noopener,noreferrer');
  const continueToPortal = () => { if (dontShowAgain) localStorage.setItem(GOV_NOTICE_KEY, '1'); setNoticeOpen(false); };
  const domain = (() => { try { return new URL(rawUrl).hostname; } catch { return rawUrl; } })();

  return (
    <div className="fixed inset-0 z-[90] flex min-h-[100dvh] flex-col overflow-hidden bg-[#FAF9F6] font-sans selection:bg-orange-100" onClick={() => { setControls(v => !v); triggerControlsTemporarily(); }} onTouchStart={() => { setControls(v => !v); triggerControlsTemporarily(); }}>
      <header onClick={(e) => e.stopPropagation()} className={`fixed top-3 inset-x-3.5 z-40 mx-auto max-w-2xl transition-all duration-300 ${controls || timedOut || error || frameFailed ? 'translate-y-0 opacity-100' : '-translate-y-16 opacity-0 pointer-events-none'}`}>
        <div className="flex h-12 items-center justify-between gap-2.5 rounded-2xl border border-slate-200 bg-white/95 px-3.5 shadow-xl backdrop-blur-2xl">
          <button onClick={() => navigate(-1)} className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-800 hover:bg-slate-100 active:scale-95 transition" aria-label="Back to App"><ArrowLeft className="h-4 w-4" /></button>
          <div className="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-xl bg-orange-50 px-3 py-1 text-center border border-orange-100"><Lock className="h-3 w-3 text-[#FF9933] shrink-0" /><span className="truncate text-xs font-black text-[#000080]">{pageTitle}</span></div>
          <div className="flex items-center gap-1 shrink-0"><button onClick={reload} className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100" title="Refresh Portal"><RotateCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-[#FF9933]' : ''}`} /></button><button onClick={handleShare} className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100" title="Share"><Share2 className="h-3.5 w-3.5" /></button><button onClick={openDirectExternal} className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100" title="Open External"><ExternalLink className="h-3.5 w-3.5" /></button></div>
        </div>
      </header>
      <main className="relative flex-1 w-full bg-white overflow-hidden">
        {!rawUrl ? <div className="flex h-full flex-col items-center justify-center p-6 text-center bg-[#FAF9F6]"><div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-[#FF9933] mb-4 border border-orange-200 shadow-xs"><Globe className="h-8 w-8" /></div><h2 className="text-base font-black text-slate-900">{pageTitle}</h2><p className="mt-1.5 text-xs text-slate-500">Invalid or unsupported portal link.</p><button onClick={() => navigate(-1)} className="mt-6 rounded-2xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700">Back to App</button></div> : <>
          {!noticeOpen && <iframe ref={frameRef} title="Samahit Browser" src={proxyUrl} onLoad={() => { setLoading(false); setTimedOut(false); setFrameFailed(false); }} onError={() => { setLoading(false); setFrameFailed(true); setControls(true); }} className="h-full w-full border-0 bg-white" style={isDesktop ? { width: '250%', height: '250%', transform: 'scale(.4)', transformOrigin: 'top left' } : undefined} allow="autoplay; clipboard-read; clipboard-write; encrypted-media; fullscreen; picture-in-picture" allowFullScreen />}
          {loading && !noticeOpen && <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#FAF9F6]/95 backdrop-blur-sm"><BrandLoader size="lg" label="Connecting to Portal..." /><p className="mt-3 text-xs font-bold text-slate-600">Connecting to Portal...</p></div>}
          {(timedOut || frameFailed) && !loading && !noticeOpen && <div className="absolute bottom-16 left-1/2 z-30 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-2xl border border-orange-200 bg-white/95 px-4 py-3 text-xs text-slate-800 shadow-2xl"><div className="flex items-start gap-3"><Compass className="mt-0.5 h-4 w-4 text-[#FF9933] shrink-0" /><div className="min-w-0 flex-1"><p className="font-semibold">{frameFailed ? 'This portal could not open inside the app.' : 'Page loading is taking longer than expected.'}</p><p className="mt-1 text-[11px] text-slate-500">You can refresh or open the official portal directly.</p><div className="mt-2 flex gap-2"><button onClick={reload} className="rounded-xl border border-orange-200 bg-orange-50 px-2.5 py-1.5 text-[11px] font-bold text-[#FF9933]">Refresh</button><button onClick={openDirectExternal} className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-700">Open Official Site</button></div></div></div></div>}
          {copied && <div className="absolute top-16 left-1/2 z-40 -translate-x-1/2 rounded-full bg-slate-900/90 px-4 py-1.5 text-xs font-bold text-white shadow-xl">Link copied</div>}
        </>}
      </main>
      {noticeOpen && governmentPortal && <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center bg-slate-950/45 p-3 backdrop-blur-sm" onClick={(e) => e.stopPropagation()}><section className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-5 shadow-2xl"><div className="flex items-center gap-2 text-[#000080]"><Info className="h-5 w-5 text-[#FF9933]"/><h2 className="text-base font-black">Entering Samahit Browser</h2></div><p className="mt-3 text-xs leading-5 text-slate-600">You are opening an external official website.</p><div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-3"><p className="text-xs font-black text-slate-900">{pageTitle}</p><p className="mt-1 break-all text-[11px] text-slate-500">{domain}</p></div><p className="mt-3 text-[11px] leading-5 text-slate-500">Samahit is independent and not affiliated with any Government authority.</p><label className="mt-3 flex items-center gap-2 text-[11px] font-semibold text-slate-600"><input type="checkbox" checked={dontShowAgain} onChange={(e) => setDontShowAgain(e.target.checked)} className="h-4 w-4"/>Don't show again for government links</label><div className="mt-4 grid grid-cols-2 gap-2"><button onClick={() => navigate(-1)} className="min-h-11 rounded-2xl border border-slate-200 bg-white px-4 text-xs font-black text-slate-700">Cancel</button><button onClick={continueToPortal} className="min-h-11 rounded-2xl bg-[#000080] px-4 text-xs font-black text-white">Continue</button></div></section></div>}
      <footer onClick={(e) => e.stopPropagation()} className={`fixed bottom-3 inset-x-3.5 z-40 mx-auto max-w-sm transition-all duration-300 ${controls || timedOut || error || frameFailed ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0 pointer-events-none'}`}><div className="flex h-11 items-center justify-between rounded-2xl border border-slate-200 bg-white/95 px-4 shadow-xl text-xs font-bold text-slate-600"><div className="flex items-center gap-2"><button onClick={() => frameHistory('back')} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100" title="Back"><ChevronLeft className="h-4 w-4 text-slate-800" /></button><button onClick={() => frameHistory('forward')} className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100" title="Forward"><ChevronRight className="h-4 w-4 text-slate-800" /></button></div><button onClick={reload} className="flex items-center gap-1 text-[10px] font-black text-[#FF9933] uppercase tracking-wider"><RotateCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh</button><button onClick={() => setIsDesktop(v => !v)} className="flex h-8 items-center gap-1 text-[11px] font-bold text-slate-600">{isDesktop ? <Smartphone className="h-3.5 w-3.5 text-[#FF9933]" /> : <Monitor className="h-3.5 w-3.5" />}{isDesktop ? 'Mobile' : 'Desktop'}</button></div></footer>
    </div>
  );
}
