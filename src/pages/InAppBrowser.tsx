import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { openExternalLink, isExternalWebUrl } from '../utils/browser';

/**
 * RPF Browser route.
 *
 * Native builds use the native in-app browser layer. Web development/testing
 * deliberately stays inside the current RPF application tab so Chrome/Edge
 * never becomes the test browser's "second tab". Remote sites may refuse
 * iframe embedding; that is a web-platform restriction, not an app redirect.
 */
export default function InAppBrowser() {
  const [params] = useSearchParams();
  const [error, setError] = useState('');
  const rawUrl = (params.get('url') || '').trim();
  const title = params.get('title') || 'RPF Browser';

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
    }
  }, [rawUrl]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white p-8 text-center">
        <p className="max-w-sm text-sm font-medium text-slate-600">{error}</p>
      </div>
    );
  }

  if (Capacitor.isNativePlatform()) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white p-8 text-center">
        <div>
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
          <p className="text-sm font-medium text-slate-600">Opening in RPF Browser…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-white">
      <div className="flex h-12 shrink-0 items-center border-b border-slate-200 bg-white px-3">
        <button
          type="button"
          onClick={() => window.history.back()}
          className="mr-3 rounded px-2 py-1 text-lg text-slate-700"
          aria-label="Back"
        >
          ‹
        </button>
        <div className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-800">{title}</div>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded px-2 py-1 text-sm text-slate-700"
          aria-label="Refresh"
        >
          ↻
        </button>
      </div>
      <iframe
        title={title}
        src={rawUrl}
        className="min-h-0 w-full flex-1 border-0"
        referrerPolicy="strict-origin-when-cross-origin"
        allow="camera; microphone; geolocation; fullscreen; autoplay; clipboard-read; clipboard-write; payment"
      />
    </div>
  );
}
