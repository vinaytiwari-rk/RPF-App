import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { openExternalLink, isExternalWebUrl, normalizeExternalWebUrl } from '../utils/browser';

/** Unified RPF Browser surface. Web stays in the current app tab; native uses the native WebView layer. */
export default function InAppBrowser() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const rawUrl = normalizeExternalWebUrl(params.get('url') || '') || '';
  const title = params.get('title') || 'RPF Browser';
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(Boolean(rawUrl));

  useEffect(() => {
    if (!rawUrl) {
      setError('Invalid or unsupported web URL.');
      setLoading(false);
      return;
    }
    if (!isExternalWebUrl(rawUrl)) {
      setError('Invalid or unsupported web URL.');
      setLoading(false);
      return;
    }
    if (Capacitor.isNativePlatform()) {
      void openExternalLink(rawUrl, navigate, title).catch((err) => {
        console.error('[RPF Browser] Native open failed:', err);
        setError('Website could not be opened inside RPF Browser.');
        setLoading(false);
      });
    }
  }, [rawUrl, navigate, title]);

  const goBack = () => navigate(-1);
  const reload = () => window.location.reload();

  if (error) {
    return <div className="flex min-h-screen items-center justify-center bg-white p-8 text-center"><p className="max-w-md text-sm font-medium text-slate-600">{error}</p></div>;
  }

  if (Capacitor.isNativePlatform()) {
    return <div className="flex min-h-screen items-center justify-center bg-white p-8 text-center"><div><div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" /><p className="text-sm font-medium text-slate-600">Opening in RPF Browser…</p></div></div>;
  }

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-white">
      <div className="flex h-12 shrink-0 items-center gap-2 border-b border-slate-200 bg-white px-3">
        <button type="button" onClick={goBack} className="rounded px-2 py-1 text-lg text-slate-700" aria-label="Back">‹</button>
        <button type="button" onClick={() => window.history.forward()} className="rounded px-2 py-1 text-lg text-slate-700" aria-label="Forward">›</button>
        <button type="button" onClick={reload} className="rounded px-2 py-1 text-sm text-slate-700" aria-label="Refresh">↻</button>
        <button type="button" onClick={() => navigate('/')} className="rounded px-2 py-1 text-sm text-slate-700" aria-label="Home">⌂</button>
        <div className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-800">{title}</div>
      </div>
      {loading && <div className="h-1 w-full animate-pulse bg-slate-400" />}
      <iframe
        title={title}
        src={rawUrl}
        className="min-h-0 w-full flex-1 border-0"
        referrerPolicy="strict-origin-when-cross-origin"
        allow="camera; microphone; geolocation; fullscreen; autoplay; clipboard-read; clipboard-write; payment"
        onLoad={() => setLoading(false)}
        onError={() => { setLoading(false); setError('This website does not allow embedding in web preview. Native APK/IPA uses the native WebView layer.'); }}
      />
    </div>
  );
}
