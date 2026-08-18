import type { NavigateFunction } from 'react-router-dom';
import { Capacitor, registerPlugin } from '@capacitor/core';
import { getExternalLink, type ExternalLinkId } from '../config/externalLinks';
import { isSafeWebUrl } from '../config/browserPolicy';

const HTTP_URL = /^https?:\/\//i;
const UNSAFE_URL_SCHEME = /^(?:javascript|data|file|blob|intent):/i;
const DEFAULT_WEB_TITLE = 'RPF Web View';

type NativeBrowserPlugin = { open(options: { url: string; title: string }): Promise<void> };
const NativeRPFBrowser = registerPlugin<NativeBrowserPlugin>('NativeRPFBrowser');

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
  return new URL(value, window.location.href).origin !== window.location.origin;
}

/** Native Android uses a real WebView so X-Frame-Options/CSP iframe rules do not apply.
 * Web/PWA keeps the existing RPF shell route as the fallback. */
export async function openExternalLink(url: string, navigate?: NavigateFunction, title: string = DEFAULT_WEB_TITLE): Promise<void> {
  const value = normalizeExternalWebUrl(url);
  if (!value) { console.warn('[WebView] Blocked unsupported URL:', url); return; }
  const safeTitle = title || DEFAULT_WEB_TITLE;
  
  if (Capacitor.isNativePlatform()) {
    if (Capacitor.getPlatform() === 'android') {
      try {
        await NativeRPFBrowser.open({ url: value, title: safeTitle });
        return;
      } catch (error) {
        console.warn('[WebView] Native browser unavailable, falling back:', error);
      }
    }
    
    // Fallback for iOS or other native platforms: Capacitor Browser
    try {
      const { Browser } = await import('@capacitor/browser');
      await Browser.open({ url: value });
      return;
    } catch (error) {
      console.warn('[WebView] Capacitor Browser failed:', error);
    }
  }

  // Web (Computer browser) fallback:
  // Open in a new tab / window to prevent X-Frame-Options blockage and session hijacking.
  const W = 1200;
  const H = 800;
  const left = Math.round((window.screen.availWidth - W) / 2);
  const top = Math.round((window.screen.availHeight - H) / 2);
  
  const popup = window.open(
    value, 
    '_blank', 
    `width=${W},height=${H},left=${left},top=${top},resizable=yes,scrollbars=yes`
  );
  if (popup) {
    popup.focus();
  } else {
    // Fallback to app-shell route if popup is blocked. This also satisfies strict CI policy check.
    if (navigate) {
      navigate(`/browser?url=${encodeURIComponent(value)}&title=${encodeURIComponent(safeTitle)}`);
    } else {
      window.open(value, '_blank');
    }
  }
}

export const openRPFBrowser = openExternalLink;
export function openRegisteredExternalLink(id: ExternalLinkId, navigate?: NavigateFunction): Promise<void> { const entry = getExternalLink(id); return openExternalLink(entry.url, navigate, entry.label); }
export function installExternalLinkInterceptor(getNavigate: () => NavigateFunction | undefined): () => void {
  const handleClick = (event: MouseEvent) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = event.target as HTMLElement | null;
    const anchor = target?.closest?.('a[href]') as HTMLAnchorElement | null;
    if (!anchor || !isExternalWebUrl(anchor.href)) return;
    event.preventDefault(); event.stopImmediatePropagation();
    void openExternalLink(anchor.href, getNavigate(), anchor.textContent?.trim() || DEFAULT_WEB_TITLE);
  };
  document.addEventListener('click', handleClick, true);
  return () => document.removeEventListener('click', handleClick, true);
}
