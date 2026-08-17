import { Capacitor } from '@capacitor/core';
import type { NavigateFunction } from 'react-router-dom';

const HTTP_URL = /^https?:\/\//i;
const UNSAFE_URL_SCHEME = /^(?:javascript|data|file|blob|intent):/i;
const NATIVE_BROWSER_TARGET = 'rpf_browser';

/** Returns a safe, normalized HTTP(S) URL suitable for the RPF browser. */
export function normalizeExternalWebUrl(url: string): string | null {
  const value = String(url || '').trim();
  if (!value || UNSAFE_URL_SCHEME.test(value) || !HTTP_URL.test(value)) return null;

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

/** Returns true only for HTTP(S) links that leave the RPF web origin. */
export function isExternalWebUrl(url: string): boolean {
  const value = normalizeExternalWebUrl(url);
  if (!value) return false;
  if (typeof window === 'undefined') return true;
  return new URL(value, window.location.href).origin !== window.location.origin;
}

/**
 * Single navigation boundary for all external web links in RPF.
 * Native browser navigation is deliberately session-preserving: the app never
 * asks the native browser to clear cookies or session storage.
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

    if (iab?.open) {
      try {
        // Use one stable native browser target. Reusing the target lets links
        // opened from Directory/E-paper continue in the same native browser
        // context instead of creating a fresh login/session context each time.
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
            'hidden=no',
            'allowInlineMediaPlayback=yes',
            'disallowoverscroll=no',
          ].join(','),
        );

        browser?.addEventListener?.('loaderror', (event: any) => {
          console.error('[RPF Browser] Native page load error:', event?.message || event?.url || event);
        });
        browser?.addEventListener?.('exit', () => {
          // Do not clear any site cookies/session data when the browser closes.
        });
        return;
      } catch (error) {
        console.error('[RPF Browser] InAppBrowser failed:', error);
      }
    }

    // Capacitor Browser remains an in-app native browser surface when the
    // Cordova compatibility plugin is unavailable. It is never replaced with
    // a window.location/system-browser redirect by this helper.
    try {
      const { Browser } = await import('@capacitor/browser');
      await Browser.open({ url: value, presentationStyle: 'fullscreen' });
      return;
    } catch (error) {
      console.error('[RPF Browser] Native browser fallback failed:', error);
    }

    return;
  }

  // Web/dev builds do not have a native app browser. Keep a single named
  // popup so navigation remains in one browser context during web testing.
  const W = 520;
  const H = Math.min(window.screen.availHeight - 60, 820);
  const left = Math.max(0, Math.round((window.screen.availWidth - W) / 2));
  const top = Math.max(0, Math.round((window.screen.availHeight - H) / 2));
  const popup = window.open(
    value,
    NATIVE_BROWSER_TARGET,
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
