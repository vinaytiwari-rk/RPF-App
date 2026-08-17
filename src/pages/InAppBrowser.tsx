import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { openExternalLink, isExternalWebUrl, normalizeExternalWebUrl } from '../utils/browser';

/**
 * Invisible navigation bridge for external web content.
 * User-facing browser chrome is intentionally hidden; navigation remains
 * controlled by the app/native layer and the device's normal back gesture.
 */
export default function InAppBrowser() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const rawUrl = normalizeExternalWebUrl(params.get('url') || '') || '';
  const title = params.get('title') || 'RPF WebView';
  const [error, setError] = useState('');

  useEffect(() => {
    if (!rawUrl || !isExternalWebUrl(rawUrl)) {
      setError('Invalid or unsupported web URL.');
      return;
    }

    if (Capacitor.isNativePlatform()) {
      void openExternalLink(rawUrl, navigate, title).catch((err) => {
        console.error('[RPF WebView] Native open failed:', err);
        setError('Website could not be opened.');
      });
      return;
    }

    // Web browsers cannot reliably embed sites that forbid iframes.
    // Open in the same tab; never create a second tab/window.
    window.location.assign(rawUrl);
  }, [rawUrl, navigate, title]);

  // Keep this route visually empty. No "RPF Browser" label, no Back/Forward,
  // Refresh or Home toolbar, and no duplicate browser chrome is shown to users.
  if (error) {
    return <div className="min-h-screen bg-white" aria-label="Web content unavailable" />;
  }

  return <div className="min-h-screen bg-white" aria-hidden="true" />;
}
