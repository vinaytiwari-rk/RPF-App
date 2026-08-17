import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { openExternalLink, isExternalWebUrl } from '../utils/browser';

/**
 * RPF Browser route.
 *
 * Native builds use the real native in-app browser layer. The old iframe/
 * server-proxy implementation is intentionally removed: it cannot reproduce
 * normal browser behaviour for cookies, authentication, CSP, redirects,
 * JavaScript, PDFs and sites that reject framing.
 */
export default function InAppBrowser() {
  const [params] = useSearchParams();
  const [error, setError] = useState('');
  const rawUrl = (params.get('url') || '').trim();

  useEffect(() => {
    if (!rawUrl) {
      setError('No URL provided.');
      return;
    }

    if (!isExternalWebUrl(rawUrl)) {
      setError('Invalid or unsupported web URL.');
      return;
    }

    if (Capacitor.isNativePlatform()) {
      void openExternalLink(rawUrl).catch((err) => {
        console.error('[RPF Browser] Unable to open URL:', err);
        setError('Website could not be opened inside RPF Browser.');
      });
    } else {
      // Browser/dev preview is not the native app. Keep this route safe and
      // deterministic instead of using the old proxy/iframe workaround.
      setError('RPF Native Browser is available in the Android/iOS app build.');
    }
  }, [rawUrl]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-8 text-center">
      {!error ? (
        <div>
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
          <p className="text-sm font-medium text-slate-600">Opening in RPF Browser…</p>
        </div>
      ) : (
        <p className="max-w-sm text-sm font-medium text-slate-600">{error}</p>
      )}
    </div>
  );
}
