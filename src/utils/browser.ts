import { Capacitor } from '@capacitor/core';
import type { NavigateFunction } from 'react-router-dom';
import { getExternalLink, type ExternalLinkId } from '../config/externalLinks';
import { isAllowedRedirect, isSafeWebUrl } from '../config/browserPolicy';

const HTTP_URL = /^https?:\/\//i;
const UNSAFE_URL_SCHEME = /^(?:javascript|data|file|blob|intent):/i;
const NATIVE_BROWSER_TARGET = 'rpf_browser';

export function normalizeExternalWebUrl(url: string): string | null {
  const value = String(url || '').trim();
  if (!value || UNSAFE_URL_SCHEME.test(value) || !HTTP_URL.test(value) || !isSafeWebUrl(value)) return null;
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
    parsed.username = '';
    parsed.password = '';
    return parsed.toString();
  } catch {
    return null;
  }
}

export function isExternalWebUrl(url: string): boolean {
  const value = normalizeExternalWebUrl(url);
  if (!value) return false;
  if (typeof window === 'undefined') return true;
  return new URL(value, window.location.href).origin !== window.location.origin;
}

function attachBrowserGuards(browser: any): void {
  browser?.addEventListener?.('loadstart', (event: any) => {
    const nextUrl = String(event?.url || '');
    if (nextUrl && !isAllowedRedirect(nextUrl)) {
      console.warn('[RPF Browser] Blocked unsafe redirect:', nextUrl);
      try { browser.close?.(); } catch { /* native close may be unavailable */ }
      return;
    }
  });
  browser?.addEventListener?.('loaderror', (event: any) => {
    console.error('[RPF Browser] Native page load error:', event?.message || event?.url || event);
  });
}

/**
 * One browser entry point for every external web link.
 *
 * Web preview: stays inside the RPF route. It never calls window.open().
 * Native build: uses the embedded Cordova InAppBrowser only. It deliberately
 * has NO @capacitor/browser/system-browser fallback, so an unavailable native
 * browser cannot silently launch Chrome/Safari.
 */
export async function openExternalLink(
  url: string,
  navigate?: NavigateFunction,
  title: string = 'RPF Browser',
): Promise<void> {
  const value = normalizeExternalWebUrl(url);
  if (!value) {
    console.warn('[RPF Browser] Blocked unsupported URL:', url);
    return;
  }

  if (Capacitor.isNativePlatform()) {
    const iab = (window as any).cordova?.InAppBrowser || (window as any).InAppBrowser;
    if (!iab?.open) {
      console.error('[RPF Browser] Native InAppBrowser is unavailable; refusing external browser fallback.');
      return;
    }

    try {
      const browser = iab.open(
        value,
        NATIVE_BROWSER_TARGET,
        [
          'location=no',
          'toolbar=no',
          'hidenavigationbuttons=yes',
          'hideurlbar=yes',
          'hardwareback=yes',
          'zoom=yes',
          'clearcache=no',
          'clearsessioncache=no',
          'mediaPlaybackRequiresUserAction=no',
          'allowInlineMediaPlayback=yes',
          'enableViewportScale=yes',
          'useWideViewPort=yes',
          'disallowoverscroll=no',
          'hidden=no',
          'footer=no',
          'shouldPauseOnSuspend=no',
        ].join(','),
      );
      attachBrowserGuards(browser);
    } catch (error) {
      console.error('[RPF Browser] Native InAppBrowser failed; refusing external browser fallback:', error);
    }
    return;
  }

  if (navigate) {
    navigate(`/browser?url=${encodeURIComponent(value)}&title=${encodeURIComponent(title)}`);
    return;
  }

  console.warn('[RPF Browser] Web navigation unavailable; refusing external tab:', value);
}

export const openRPFBrowser = openExternalLink;

export function openRegisteredExternalLink(
  id: ExternalLinkId,
  navigate?: NavigateFunction,
): Promise<void> {
  const entry = getExternalLink(id);
  return openExternalLink(entry.url, navigate, entry.label);
}

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
