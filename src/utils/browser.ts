import type { NavigateFunction } from 'react-router-dom';
import { getExternalLink, type ExternalLinkId } from '../config/externalLinks';
import '../config/dynamicExternalLinks';
import { isSafeWebUrl } from '../config/browserPolicy';
import { Capacitor, registerPlugin } from '@capacitor/core';

const HTTP_URL = /^https?:\/\//i;
const UNSAFE_URL_SCHEME = /^(?:javascript|data|file|blob|intent):/i;
const DEFAULT_WEB_TITLE = 'Samahit Views';

const NativeSamahitViews = registerPlugin<{ open(options: { url: string; title?: string }): Promise<void> }>('NativeRPFBrowser');

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
    return parsed.origin !== window.location.origin;
  } catch { return false; }
}

/**
 * Canonical entry point for third-party web content.
 * Native Android uses Samahit Views' real WebView activity; the web build keeps
 * the existing /browser route as the compatible fallback.
 */
export async function openExternalLink(url: string, navigate?: NavigateFunction, title: string = DEFAULT_WEB_TITLE): Promise<void> {
  const value = normalizeExternalWebUrl(url);
  if (!value) { console.warn('[Samahit Views] Blocked unsupported URL:', url); return; }

  try {
    const urlObj = new URL(value);
    const host = urlObj.hostname.toLowerCase();
    if ((host === 'therpfoundation.org' || host.endsWith('.therpfoundation.org')) &&
        !urlObj.pathname.startsWith('/uploads/') && !urlObj.pathname.startsWith('/api/') && navigate) {
      navigate(urlObj.pathname + urlObj.search + urlObj.hash);
      return;
    }
  } catch {}

  if (Capacitor.isNativePlatform()) {
    try {
      await NativeSamahitViews.open({ url: value, title: title || DEFAULT_WEB_TITLE });
      return;
    } catch (err) {
      console.error('Failed to open Samahit Views:', err);
    }
  }

  if (navigate) {
    navigate(`/browser?url=${encodeURIComponent(value)}&title=${encodeURIComponent(title || DEFAULT_WEB_TITLE)}`);
    return;
  }

  window.open(value, '_self');
}

export const openSamahitView = openExternalLink;
/** Backward-compatible alias for existing callers. */
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
    if (!anchor || !isExternalWebUrl(anchor.href)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    void openExternalLink(anchor.href, getNavigate(), anchor.textContent?.trim() || DEFAULT_WEB_TITLE);
  };
  document.addEventListener('click', handleClick, true);
  return () => document.removeEventListener('click', handleClick, true);
}
