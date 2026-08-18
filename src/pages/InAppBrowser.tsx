import React, { useEffect, useRef, useState } from 'react';
import { isExternalWebUrl, normalizeExternalWebUrl } from '../utils/browser';
import { useSearchParams } from 'react-router-dom';

/** Web content rendered inside the RPF application shell. */
export default function InAppBrowser() {
  const [params] = useSearchParams();
  const rawUrl = normalizeExternalWebUrl(params.get('url') || '') || '';
  const frameRef = useRef<HTMLIFrameElement>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!rawUrl || !isExternalWebUrl(rawUrl)) setError('Invalid or unsupported web URL.');
    else setError('');
  }, [rawUrl]);

  useEffect(() => {
    const goBack = () => {
      try { frameRef.current?.contentWindow?.history.back(); } catch {}
    };
    const goForward = () => {
      try { frameRef.current?.contentWindow?.history.forward(); } catch {}
    };
    const refresh = () => {
      try { frameRef.current?.contentWindow?.location.reload(); } catch {}
    };
    window.addEventListener('rpf-browser-back', goBack);
    window.addEventListener('rpf-browser-forward', goForward);
    window.addEventListener('rpf-browser-refresh', refresh);
    return () => {
      window.removeEventListener('rpf-browser-back', goBack);
      window.removeEventListener('rpf-browser-forward', goForward);
      window.removeEventListener('rpf-browser-refresh', refresh);
    };
  }, []);

  if (error || !rawUrl) {
    return <div className="flex min-h-[60vh] items-center justify-center px-6 text-center text-sm font-medium text-slate-500">{error || 'Web page unavailable.'}</div>;
  }

  return (
    <div className="h-[calc(100dvh-9.25rem-env(safe-area-inset-bottom))] min-h-[420px] w-full bg-white">
      <iframe
        ref={frameRef}
        title="RPF Web View"
        src={rawUrl}
        className="h-full w-full border-0 bg-white"
        allow="autoplay; clipboard-read; clipboard-write; encrypted-media; fullscreen; geolocation; microphone; camera; picture-in-picture"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  );
}
