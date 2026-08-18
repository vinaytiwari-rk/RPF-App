import type { NavigateFunction } from 'react-router-dom';
import { getExternalLink, type ExternalLinkId } from '../config/externalLinks';
import { isSafeWebUrl } from '../config/browserPolicy';

const HTTP_URL = /^https?:\/\//i;
const UNSAFE_URL_SCHEME = /^(?:javascript|data|file|blob|intent):/i;
const DEFAULT_WEB_TITLE = 'RPF Web View';

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

/**
 * Keep external web content inside the React application route so the RPF
 * header and bottom navigation remain visible on native and web platforms.
 */
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

  if (!navigate) {
    console.warn('[WebView] App navigation unavailable:', value);
    return;
  }

  navigate(`/browser?url=${encodeURIComponent(value)}&title=${encodeURIComponent(title || DEFAULT_WEB_TITLE)}`);
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
