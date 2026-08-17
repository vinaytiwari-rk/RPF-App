import { Capacitor } from '@capacitor/core';
import type { NavigateFunction } from 'react-router-dom';

const HTTP_URL = /^https?:\/\//i;

/** Returns true only for HTTP(S) links that leave the RPF web origin. */
export function isExternalWebUrl(url: string): boolean {
  const value = String(url || '').trim();
  if (!HTTP_URL.test(value)) return false;
  if (typeof window === 'undefined') return true;
  return new URL(value, window.location.href).origin !== window.location.origin;
}

/** Single navigation boundary for all external web links in RPF. */
export async function openExternalLink(
  url: string,
  navigate?: NavigateFunction,
  title: string = 'RPF Browser',
): Promise<void> {
  const value = String(url || '').trim();
  if (!HTTP_URL.test(value)) return;

  if (Capacitor.isNativePlatform()) {
    const iab = (window as any).cordova?.InAppBrowser || (window as any).InAppBrowser;

    if (iab?.open) {
      try {
        iab.open(value, '_blank', [
          'location=no',
          'toolbar=no',
          'hidenavigationbuttons=yes',
          'hideurlbar=yes',
          'hardwareback=yes',
          'zoom=yes',
          'clearcache=no',
          'clearsessioncache=no',
          'mediaPlaybackRequiresUserAction=no',
        ].join(','));
        return;
      } catch (error) {
        console.error('[RPF Browser] InAppBrowser failed:', error);
      }
    }

    try {
      const { Browser } = await import('@capacitor/browser');
      await Browser.open({ url: value });
      return;
    } catch (error) {
      console.error('[RPF Browser] Native browser fallback failed:', error);
    }

    // Do not silently launch Chrome or revive the old iframe/proxy route.
    return;
  }

  // Web/dev builds cannot provide a native WebView; use the host browser.
  const W = 520;
  const H = Math.min(window.screen.availHeight - 60, 820);
  const left = Math.max(0, Math.round((window.screen.availWidth - W) / 2));
  const top = Math.max(0, Math.round((window.screen.availHeight - H) / 2));
  const popup = window.open(
    value,
    'rpf_browser',
    `width=${W},height=${H},left=${left},top=${top},` +
      'toolbar=no,menubar=no,scrollbars=yes,resizable=yes,status=no,location=no',
  );

  if (!popup && navigate) {
    navigate(`/browser?url=${encodeURIComponent(value)}&title=${encodeURIComponent(title)}`);
  } else {
    popup?.focus();
  }
}

/**
 * One capture-phase interceptor for ordinary external <a href> links.
 * Future pages automatically inherit the same RPF browser policy.
 */
export function installExternalLinkInterceptor(
  getNavigate: () => NavigateFunction | undefined,
): () => void {
  const handleClick = (event: MouseEvent) => {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const target = event.target as HTMLElement | null;
    const anchor = target?.closest?.('a[href]') as HTMLAnchorElement | null;
    if (!anchor) return;

    const href = anchor.href;
    if (!isExternalWebUrl(href)) return;

    event.preventDefault();
    event.stopImmediatePropagation();
    void openExternalLink(href, getNavigate(), anchor.textContent?.trim() || 'RPF Browser');
  };

  document.addEventListener('click', handleClick, true);
  return () => document.removeEventListener('click', handleClick, true);
}
