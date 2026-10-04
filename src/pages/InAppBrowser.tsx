import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Globe } from 'lucide-react';
import { normalizeExternalWebUrl } from '../utils/browser';
import BrandLoader from '../components/BrandLoader';

export default function InAppBrowser() {
  const [params] = useSearchParams();
  const [message, setMessage] = useState('Opening website…');

  useEffect(() => {
    const target = normalizeExternalWebUrl(params.get('url') || '');
    if (!target) {
      setMessage('Invalid or unsupported website address.');
      return;
    }

    // The web/PWA build cannot reliably embed arbitrary third-party sites:
    // CSP/X-Frame-Options, cookies, redirects and cross-origin scripting can
    // make an iframe fail even though the same URL works as a real page.
    // Navigate directly so the browser gets the actual top-level document.
    setMessage('Opening website directly…');
    window.location.replace(target);
  }, [params]);

  return (
    <div className="fixed inset-0 z-[90] flex min-h-[100dvh] items-center justify-center bg-[#F8FAFC] p-6">
      <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-orange-200 bg-orange-50 text-[#C2410C]">
          <Globe className="h-8 w-8" />
        </div>
        <div className="mt-5">
          <BrandLoader size="sm" label="Loading website" />
        </div>
        <p className="mt-3 text-sm font-semibold text-slate-700">{message}</p>
        <p className="mt-2 text-xs text-slate-500">
          The website is being opened as a real browser page, not inside an iframe.
        </p>
      </div>
    </div>
  );
}
