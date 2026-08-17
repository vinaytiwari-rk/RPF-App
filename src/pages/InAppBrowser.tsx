import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { openExternalLink, isExternalWebUrl, normalizeExternalWebUrl } from '../utils/browser';

/** Unified RPF Browser surface. Native uses the native WebView layer; web cannot embed sites that forbid iframes. */
export default function InAppBrowser() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const rawUrl = normalizeExternalWebUrl(params.get('url') || '') || '';
  const title = params.get('title') || 'RPF Browser';
  const [error, setError] = useState('');

  useEffect(() => {
    if (!rawUrl || !isExternalWebUrl(rawUrl)) {
      setError('Invalid or unsupported web URL.');
      return;
    }

    if (Capacitor.isNativePlatform()) {
      void openExternalLink(rawUrl, navigate, title).catch((err) => {
        console.error('[RPF Browser] Native open failed:', err);
        setError('Website could not be opened inside RPF Browser.');
      });
      return;
    }

    // A normal web page cannot provide a real embedded browser engine. Many
    // publishers explicitly block iframe embedding with X-Frame-Options/CSP.
    // Loading those pages in an iframe produces the user's "Refused to connect"
    // error. Keep the web preview in the same Brave/Chrome tab instead of using
    // an iframe or opening a second tab. APK/IPA continues to use native WebView.
    window.location.assign(rawUrl);
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
    <div className="flex min-h-screen flex-col items-center justify-center bg-white p-8 text-center">
      <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
      <p className="text-sm font-medium text-slate-600">Opening {title}…</p>
      <div className="mt-5 flex gap-2">
        <button type="button" onClick={goBack} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700">Back</button>
        <button type="button" onClick={reload} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700">Retry</button>
      </div>
    </div>
  );
}
