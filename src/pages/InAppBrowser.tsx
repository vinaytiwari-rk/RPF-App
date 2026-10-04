import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCw, Share2, ExternalLink, ChevronLeft, ChevronRight, Globe, Lock, Search, Home } from 'lucide-react';
import { normalizeExternalWebUrl } from '../utils/browser';
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
  const hideTimerRef = useRef<number | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [controls, setControls] = useState(false);
  const [copied, setCopied] = useState(false);
  const [frameTimedOut, setFrameTimedOut] = useState(false);
  const frameRef = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    const valid = normalizeExternalWebUrl(params.get('url') || '') || '';
    if (!valid) {
      setError(!initialUrl ? 'Invalid or unsupported website.' : '');
      setLoading(false);
      return;
    }
    setCurrentUrl(valid);
    setAddressInput(valid);
    setError('');
    setFrameTimedOut(false);
    setLoading(true);
    const timer = window.setTimeout(() => {
      setLoading(false);
      setFrameTimedOut(true);
    }, 9000);
    return () => window.clearTimeout(timer);
  }, [params]);


  const showControlsTemporarily = () => {
    setControls(true);
    if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    hideTimerRef.current = window.setTimeout(() => setControls(false), 5000);
  };

  useEffect(() => () => { if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current); }, []);

  const reload = () => {
    if (!currentUrl) return;
    setError('');
    setLoading(true);
    showControlsTemporarily();
    window.location.assign(currentUrl);
  };

  useEffect(() => {
    const onRefresh = () => reload();
    window.addEventListener('rpf-browser-refresh', onRefresh);
    return () => window.removeEventListener('rpf-browser-refresh', onRefresh);
  }, [currentUrl]);

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
      window.location.assign(normalized);
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
    if (action === 'back') window.history.back();
    else window.history.forward();
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
            <iframe
              ref={frameRef}
              key={currentUrl}
              src={currentUrl}
              title={pageTitle}
              className="h-full w-full border-0 bg-white"
              allow="accelerometer; autoplay; camera; clipboard-read; clipboard-write; display-capture; fullscreen; geolocation; microphone; payment; picture-in-picture; usb"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              onLoad={() => { setLoading(false); setFrameTimedOut(false); setError(''); }}
            />
            {(loading || frameTimedOut) && (
              <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center">
                <div className="mt-16 max-w-sm rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 text-center shadow-lg backdrop-blur">
                  {loading && !frameTimedOut ? (
                    <>
                      <BrandLoader compact />
                      <p className="mt-2 text-xs font-semibold text-slate-600">Loading website…</p>
                    </>
                  ) : (
                    <>
                      <Globe className="mx-auto h-8 w-8 text-[#C2410C]" />
                      <p className="mt-2 text-xs font-semibold text-slate-700">This website does not allow embedded viewing or is taking too long.</p>
                      <button
                        type="button"
                        className="pointer-events-auto mt-3 rounded-xl bg-[#C2410C] px-4 py-2 text-xs font-bold text-white"
                        onClick={() => window.location.assign(currentUrl)}
                      >
                        Open Website Directly
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* CONTROLS: hidden by default; double-tap the page to reveal temporarily */}
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
            onClick={() => navigate("/")}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 hover:text-[#C2410C] active:scale-95 transition"
            aria-label="Home"
            title="Samahit App Home"
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
