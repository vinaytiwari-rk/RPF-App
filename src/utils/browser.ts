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

/** Canonical entry point for third-party web content. Native Android always
 * prefers the in-app Samahit Views activity and never intentionally delegates
 * ordinary HTTP(S) links to an external browser. */
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
      // Keep the user inside Samahit even if the native bridge is temporarily
      // unavailable instead of falling through to the system browser.
      console.error('Failed to open Samahit Views:', err);
    }
  }

  const fallback = `/browser?url=${encodeURIComponent(value)}&title=${encodeURIComponent(title || DEFAULT_WEB_TITLE)}`;
  if (navigate) {
    navigate(fallback);
    return;
  }

  // Browser-build fallback stays in the current application context.
  window.location.assign(fallback);
}

export const openSamahitView = openExternalLink;
export const openRPFBrowser = openExternalLink;

export function openRegisteredExternalLink(id: ExternalLinkId, navigate?: NavigateFunction): Promise<void> {
  const entry = getExternalLink(id);
  return openExternalLink(entry.url, navigate, entry.label);
}

/**
 * Capture ordinary third-party links before framework/default handlers can open
 * another task. target="_blank" is intentionally handled too: in native builds
 * it must open in Samahit Views, not the system browser. Downloads are left to
 * the platform's download pipeline.
 */
export function installExternalLinkInterceptor(getNavigate: () => NavigateFunction | undefined): () => void {
  const handleClick = (event: MouseEvent) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const target = event.target as HTMLElement | null;
    const anchor = target?.closest?.('a[href]') as HTMLAnchorElement | null;
    if (!anchor || anchor.hasAttribute('download') || !isExternalWebUrl(anchor.href)) return;

    event.preventDefault();
    // Prevent duplicate React/default navigation, which can make a single tap
    // look slow or open the same destination through a second route.
    event.stopImmediatePropagation();
    void openExternalLink(anchor.href, getNavigate(), anchor.textContent?.trim() || DEFAULT_WEB_TITLE);
  };
  document.addEventListener('click', handleClick, true);
  return () => document.removeEventListener('click', handleClick, true);
}
