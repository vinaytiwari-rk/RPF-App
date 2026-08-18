import { Capacitor } from '@capacitor/core';
import type { NavigateFunction } from 'react-router-dom';
import { getExternalLink, type ExternalLinkId } from '../config/externalLinks';
import { isAllowedRedirect, isSafeWebUrl } from '../config/browserPolicy';

const HTTP_URL = /^https?:\/\//i;
const UNSAFE_URL_SCHEME = /^(?:javascript|data|file|blob|intent):/i;
const NATIVE_BROWSER_TARGET = 'rpf_webview';
const DEFAULT_WEB_TITLE = 'Web content';

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
      console.warn('[WebView] Blocked unsafe redirect:', nextUrl);
      try { browser.close?.(); } catch { /* native close may be unavailable */ }
    }
  });
  browser?.addEventListener?.('loaderror', (event: any) => {
    console.error('[WebView] Native page load error:', event?.message || event?.url || event);
  });
}

export async function openExternalLink(
  url: string,
  navigate?: NavigateFunction,
  title: string = DEFAULT_WEB_TITLE,
): Promise<void> {
  const value = normalizeExternalWebUrl(url);
  if (!value) {
    console.warn('[WebView] Blocked unsupported URL:', url);
    return;
  }

  if (Capacitor.isNativePlatform()) {
    const iab = (window as any).cordova?.InAppBrowser || (window as any).InAppBrowser;
    if (!iab?.open) {
      console.error('[WebView] Native InAppBrowser is unavailable; refusing external browser fallback.');
      return;
    }
    try {
      const browser = iab.open(
        value,
        NATIVE_BROWSER_TARGET,
        [
          'location=yes',
          'toolbar=yes',
          'hidenavigationbuttons=no',
          'hideurlbar=no',
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
          'footer=yes',
          'shouldPauseOnSuspend=no',
        ].join(','),
      );
      attachBrowserGuards(browser);
    } catch (error) {
      console.error('[WebView] Native open failed; refusing external browser fallback:', error);
    }
    return;
  }

  if (navigate) {
    navigate(`/browser?url=${encodeURIComponent(value)}&title=${encodeURIComponent(title || DEFAULT_WEB_TITLE)}`);
    return;
  }

  console.warn('[WebView] Web navigation unavailable; refusing external tab:', value);
}

export const openRPFBrowser = openExternalLink;

export function openRegisteredExternalLink(id: ExternalLinkId, navigate?: NavigateFunction): Promise<void> {
  const entry = getExternalLink(id);
  return openExternalLink(entry.url, navigate, entry.label);
}

export function installExternalLinkInterceptor(getNavigate: () => NavigateFunction | undefined): () => void {
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
    void openExternalLink(href, getNavigate(), anchor.textContent?.trim() || DEFAULT_WEB_TITLE);
  };
  document.addEventListener('click', handleClick, true);
  return () => document.removeEventListener('click', handleClick, true);
}
