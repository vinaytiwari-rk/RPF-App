import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { openExternalLink, isExternalWebUrl, normalizeExternalWebUrl } from '../utils/browser';

/**
 * Invisible navigation bridge for external web content.
 * Browser chrome stays hidden; navigation remains controlled by the app/native layer.
 */
export default function InAppBrowser() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const rawUrl = normalizeExternalWebUrl(params.get('url') || '') || '';
  const title = params.get('title') || 'Web content';
  const [error, setError] = useState('');

  useEffect(() => {
    if (!rawUrl || !isExternalWebUrl(rawUrl)) {
      setError('Invalid or unsupported web URL.');
      return;
    }

    if (Capacitor.isNativePlatform()) {
      void openExternalLink(rawUrl, navigate, title).catch((err) => {
        console.error('[WebView] Native open failed:', err);
        setError('Website could not be opened.');
      });
      return;
    }

    // Arbitrary third-party sites may forbid iframes. Keep web preview in the
    // same tab instead of creating another browser tab/window.
    window.location.assign(rawUrl);
  }, [rawUrl, navigate, title]);

  if (error) {
    return <div className="min-h-screen bg-white" aria-label="Web content unavailable" />;
  }

  return <div className="min-h-screen bg-white" aria-hidden="true" />;
}
