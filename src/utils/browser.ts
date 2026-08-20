import type { NavigateFunction } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { getExternalLink, type ExternalLinkId } from '../config/externalLinks';
import '../config/dynamicExternalLinks';
import { isSafeWebUrl } from '../config/browserPolicy';

const HTTP_URL = /^https?:\/\//i;
const UNSAFE_URL_SCHEME = /^(?:javascript|data|file|blob|intent):/i;
const DEFAULT_WEB_TITLE = 'RPF Web View';

type NativeBrowserPlugin = { open(options: { url: string; title: string }): Promise<void> };

export function normalizeExternalWebUrl(url: string): string | null {
  const value = String(url || '').trim();
  if (!value || UNSAFE_URL_SCHEME.test(value) || !HTTP_URL.test(value) || !isSafeWebUrl(value)) return null;
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
    parsed.username = '';
    parsed.password = '';
    return parsed.toString();
  } catch { return null; }
}

export function isExternalWebUrl(url: string): boolean {
  const value = normalizeExternalWebUrl(url);
  if (!value) return false;
  if (typeof window === 'undefined') return true;
  try {
    const parsed = new URL(value, window.location.href);
    const host = parsed.hostname.toLowerCase();
    if (host === 'therpfoundation.org' || host.endsWith('.therpfoundation.org')) return false;
  } catch {}
  return new URL(value, window.location.href).origin !== window.location.origin;
}

/** Open third-party destinations in the platform browser/custom tab.
 * This avoids forcing heavy social/news sites through an in-app WebView,
 * which was causing 30–45 second blank/spinner states on Android.
 */
export async function openExternalLink(url: string, navigate?: NavigateFunction, title: string = DEFAULT_WEB_TITLE): Promise<void> {
  const value = normalizeExternalWebUrl(url);
  if (!value) { console.warn('[WebView] Blocked unsupported URL:', url); return; }
  const safeTitle = title || DEFAULT_WEB_TITLE;

  if (value.toLowerCase().includes('therpfoundation.org')) {
    try {
      const urlObj = new URL(value);
      if (!urlObj.pathname.startsWith('/uploads/') && !urlObj.pathname.startsWith('/api/')) {
        if (navigate) { navigate(urlObj.pathname + urlObj.search + urlObj.hash); return; }
      }
    } catch {}
  }

  if (Capacitor.isNativePlatform()) {
    try {
      const { Browser } = await import('@capacitor/browser');
      await Browser.open({ url: value, presentationStyle: 'popover' });
      return;
    } catch (error) {
      console.warn('[Browser] Capacitor Browser failed, trying native fallback:', error);
    }

    if (Capacitor.getPlatform() === 'android') {
      try {
        const { registerPlugin } = await import('@capacitor/core');
        const NativeRPFBrowser = registerPlugin<NativeBrowserPlugin>('NativeRPFBrowser');
        await NativeRPFBrowser.open({ url: value, title: safeTitle });
        return;
      } catch (error) {
        console.error('[Browser] Native Android browser failed:', error);
      }
    }
  }

  if (navigate) {
    navigate(`/browser?url=${encodeURIComponent(value)}&title=${encodeURIComponent(safeTitle)}`);
    return;
  }

  const popup = window.open(value, '_blank', 'noopener,noreferrer');
  if (popup) popup.focus();
}

export const openRPFBrowser = openExternalLink;
export function openRegisteredExternalLink(id: ExternalLinkId, navigate?: NavigateFunction): Promise<void> {
  const entry = getExternalLink(id);
  return openExternalLink(entry.url, navigate, entry.label);
}

export function installExternalLinkInterceptor(getNavigate: () => NavigateFunction | undefined): () => void {
  const handleClick = (event: MouseEvent) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = event.target as HTMLElement | null;
    const anchor = target?.closest?.('a[href]') as HTMLAnchorElement | null;
    if (!anchor) return;

    if (anchor.href.toLowerCase().includes('therpfoundation.org')) {
      try {
        const urlObj = new URL(anchor.href);
        const navigateFn = getNavigate();
        if (navigateFn && !urlObj.pathname.startsWith('/uploads/') && !urlObj.pathname.startsWith('/api/')) {
          event.preventDefault();
          event.stopImmediatePropagation();
          navigateFn(urlObj.pathname + urlObj.search + urlObj.hash);
          return;
        }
      } catch {}
    }

    if (!isExternalWebUrl(anchor.href)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    void openExternalLink(anchor.href, getNavigate(), anchor.textContent?.trim() || DEFAULT_WEB_TITLE);
  };
  document.addEventListener('click', handleClick, true);
  return () => document.removeEventListener('click', handleClick, true);
}
