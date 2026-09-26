import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCw, Share2, ExternalLink, ChevronLeft, ChevronRight, Globe, Lock, Search, Home } from 'lucide-react';
import { normalizeExternalWebUrl } from '../utils/browser';
import { RPF_WEB_ORIGIN } from '../config/browserPolicy';
import { Capacitor } from '@capacitor/core';
import BrandLoader from '../components/BrandLoader';

const DEFAULT_TITLE = 'Samahit Views';

export default function InAppBrowser() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const initialUrl = normalizeExternalWebUrl(params.get('url') || '') || '';
  const pageTitle = params.get('title') || DEFAULT_TITLE;

  const [currentUrl, setCurrentUrl] = useState(initialUrl);
  const [addressInput, setAddressInput] = useState(initialUrl);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const hideTimerRef = useRef<number | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [controls, setControls] = useState(true);
  const [copied, setCopied] = useState(false);
  const [frameVersion, setFrameVersion] = useState(0);

  useEffect(() => {
    const valid = normalizeExternalWebUrl(params.get('url') || '') || '';
    if (valid) {
      setCurrentUrl(valid);
      setAddressInput(valid);
      setError('');
    } else {
      setError(!initialUrl ? 'Invalid or unsupported website.' : '');
    }
    setLoading(true);
  }, [params]);

  const proxyPath = currentUrl ? `/api/gov/web-proxy?url=${encodeURIComponent(currentUrl)}` : '';
  const proxyUrl = proxyPath ? (Capacitor.isNativePlatform() ? `${RPF_WEB_ORIGIN}${proxyPath}` : proxyPath) : '';

  const showControlsTemporarily = () => {
    setControls(true);
    if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    hideTimerRef.current = window.setTimeout(() => setControls(false), 5000);
  };

  useEffect(() => () => { if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current); }, []);

  const reload = () => {
    setError('');
    setLoading(true);
    showControlsTemporarily();
    setFrameVersion(version => version + 1);
  };

  useEffect(() => {
    const onRefresh = () => reload();
    window.addEventListener('rpf-browser-refresh', onRefresh);
    return () => window.removeEventListener('rpf-browser-refresh', onRefresh);
  }, []);

  useEffect(() => {
    if (!currentUrl || !loading) return;
    const timer = window.setTimeout(() => {
      setLoading(false);
      setControls(true);
      setError('This website is taking too long to load. Try opening it directly.');
    }, 18000);
    return () => window.clearTimeout(timer);
  }, [currentUrl, loading, frameVersion]);

  const handleNavigateAddress = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    let target = addressInput.trim();
    if (!target) return;
    if (!/^https?:\/\//i.test(target)) {
      if (target.includes('.') && !target.includes(' ')) {
        target = 'https://' + target;
      } else {
        target = 'https://www.google.com/search?q=' + encodeURIComponent(target);
      }
    }
    const normalized = normalizeExternalWebUrl(target);
    if (normalized) {
      setCurrentUrl(normalized);
      setAddressInput(normalized);
      setIsEditingAddress(false);
      setParams({ url: normalized, title: normalized });
      setLoading(true);
    }
  };

  const handleShare = async () => {
    if (!currentUrl) return;
    try {
      if (navigator.share) {
        await navigator.share({ title: pageTitle, url: currentUrl });
      } else {
        await navigator.clipboard.writeText(currentUrl);
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
    if (!currentUrl) return;
    window.open(currentUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-[90] flex min-h-[100dvh] flex-col overflow-hidden bg-[#F8FAFC] font-sans text-slate-800">
      {/* TOP TRICOLOR BAR */}
      <div className="h-1 w-full bg-gradient-to-r from-[#C2410C] via-white to-[#166534] shadow-xs shrink-0" />

      {/* FLOATING HEADER CONTROLS */}
      <header className={`fixed top-1 inset-x-0 z-40 transition-all duration-300 ${controls || error ? 'translate-y-0 opacity-100' : '-translate-y-24 opacity-0 pointer-events-none'}`}>
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-2 border-b border-slate-200/90 bg-white/95 px-3 shadow-md backdrop-blur-xl sm:rounded-b-2xl">
          <button
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[#0A192F] hover:bg-slate-100 active:scale-95 transition"
            aria-label="Back to Samahit"
            title="Back to App"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>

          {/* EDITABLE ADDRESS BAR */}
          <form onSubmit={handleNavigateAddress} className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/90 px-3 py-1.5 focus-within:bg-white focus-within:border-[#C2410C] focus-within:ring-1 focus-within:ring-[#C2410C]/20 transition">
            <Lock className="h-3.5 w-3.5 shrink-0 text-[#166534]" />
            <input
              type="text"
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              onFocus={() => setIsEditingAddress(true)}
              onBlur={() => { if (!addressInput) setAddressInput(currentUrl); }}
              placeholder="Search or enter website address..."
              className="w-full bg-transparent text-xs font-semibold text-[#0A192F] outline-none placeholder:text-slate-400"
            />
            {isEditingAddress && (
              <button
                type="submit"
                className="shrink-0 rounded-lg bg-[#C2410C] px-2 py-0.5 text-[10px] font-black text-white hover:bg-[#EA580C] transition"
              >
                Go
              </button>
            )}
          </form>

          <button
            onClick={reload}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100 active:scale-95 transition"
            aria-label="Refresh page"
            title="Refresh"
          >
            <RotateCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-[#C2410C]' : ''}`} />
          </button>

          <button
            onClick={handleShare}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100 active:scale-95 transition"
            aria-label="Share page"
            title="Share"
          >
            <Share2 className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={openDirectExternal}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100 hover:text-[#C2410C] active:scale-95 transition"
            aria-label="Open in external browser"
            title="Open in new window"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </button>
        </div>
      </header>

      {/* MAIN VIEWPORT */}
      <main className="relative flex-1 w-full overflow-hidden bg-white" onDoubleClick={showControlsTemporarily}>
        {!currentUrl ? (
          <div className="flex h-full flex-col items-center justify-center p-6 text-center bg-[#F8FAFC]">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-orange-50 text-[#C2410C] border border-orange-200 shadow-sm">
              <Globe className="h-8 w-8" />
            </div>
            <h2 className="text-base font-bold text-[#0A192F]">{pageTitle}</h2>
            <p className="mt-1.5 text-xs text-slate-500">Invalid or unsupported website link.</p>
            <button
              onClick={() => navigate(-1)}
              className="mt-6 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-[#0A192F] hover:bg-slate-50 shadow-xs transition"
            >
              Back to Samahit
            </button>
          </div>
        ) : (
          <>
            {/* IFRAME WITH HARDENED SANDBOX (Omit allow-top-navigation to prevent any parent window hijacking) */}
            <iframe
              ref={frameRef}
              title="Samahit Views"
              key={`${proxyUrl}:${frameVersion}`}
              src={proxyUrl}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads allow-modals"
              onLoad={() => {
                setLoading(false);
                if (!error) showControlsTemporarily();
              }}
              onError={() => {
                setLoading(false);
                setControls(true);
                setError("Unable to load this website inside Samahit. Open it directly.");
              }}
              className="h-full w-full border-0 bg-white"
              allow="autoplay; clipboard-read; clipboard-write; encrypted-media; fullscreen; geolocation; microphone; camera; picture-in-picture"
              allowFullScreen
            />

            {error && <div role="alert" className="absolute inset-x-4 top-20 z-30 rounded-xl border border-amber-200 bg-[#FFF7E8] p-4 text-sm text-slate-800 shadow-md"><p>{error}</p><button onClick={openDirectExternal} className="mt-2 rounded-lg bg-[#B9E5CC] px-3 py-2 font-bold">Open website directly</button><button onClick={reload} className="ml-2 rounded-lg border px-3 py-2">Retry</button></div>}

            {/* SMOOTH LOADING OVERLAY */}
            {loading && (
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center bg-white/90 backdrop-blur-xs">
                <BrandLoader size="lg" label="Loading portal…" />
                <p className="mt-3 text-xs font-bold text-[#0A192F]">Opening secure view…</p>
                <p className="text-[11px] text-slate-400 mt-0.5 max-w-xs text-center truncate">{currentUrl}</p>
              </div>
            )}

            {/* COPIED TOAST */}
            {copied && (
              <div className="absolute top-20 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#0A192F] px-4 py-2 text-xs font-bold text-white shadow-lg">
                Link copied to clipboard
              </div>
            )}
          </>
        )}
      </main>

      {/* FLOATING BOTTOM CONTROLS */}
      <footer className={`fixed bottom-0 inset-x-0 z-40 transition-all duration-300 ${controls || error ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0 pointer-events-none'}`}>
        <div className="mx-auto flex h-14 max-w-md items-center justify-around border-t border-slate-200/90 bg-white/95 px-5 shadow-lg backdrop-blur-xl sm:rounded-t-2xl">
          <button
            onClick={() => frameHistory('back')}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-[#0A192F] hover:bg-slate-100 active:scale-95 transition"
            aria-label="Back"
            title="Back"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            onClick={() => {
              if (initialUrl) {
                setCurrentUrl(initialUrl);
                setAddressInput(initialUrl);
                setLoading(true);
              }
            }}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 hover:text-[#C2410C] active:scale-95 transition"
            aria-label="Home"
            title="Reset to Initial Page"
          >
            <Home className="h-4 w-4" />
          </button>

          <button
            onClick={reload}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 active:scale-95 transition"
            aria-label="Reload"
            title="Reload"
          >
            <RotateCw className={`h-4 w-4 ${loading ? 'animate-spin text-[#C2410C]' : ''}`} />
          </button>

          <button
            onClick={() => frameHistory('forward')}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-[#0A192F] hover:bg-slate-100 active:scale-95 transition"
            aria-label="Forward"
            title="Forward"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <button
            onClick={openDirectExternal}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 hover:text-[#C2410C] active:scale-95 transition"
            aria-label="Open in new window"
            title="Open in new window"
          >
            <ExternalLink className="h-4 w-4" />
          </button>
        </div>
      </footer>
    </div>
  );
}
