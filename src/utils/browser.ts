import { Capacitor } from '@capacitor/core';
import type { NavigateFunction } from 'react-router-dom';

/**
 * Single navigation boundary for every third-party website in RPF.
 *
 * Native Android/iOS: open the URL in the native in-app browser surface.
 * The browser chrome is intentionally hidden so the website remains visually
 * inside the RPF experience. Website navigation itself is NOT restricted.
 * JavaScript, cookies, sessions, redirects, forms, popups and downloads are
 * handled by the native browser engine.
 *
 * Web/dev: use the host browser because a normal web build cannot create a
 * real native WebView inside the page.
 */
export function openExternalLink(
  url: string,
  navigate: NavigateFunction,
  title: string = 'RPF Browser',
) {
  const value = String(url || '').trim();
  if (!/^https?:\/\//i.test(value)) return;

  if (Capacitor.isNativePlatform()) {
    const iab =
      (window as any).cordova?.InAppBrowser ||
      (window as any).InAppBrowser;

    if (iab?.open) {
      try {
        iab.open(
          value,
          '_blank',
          [
            // Keep the native web surface inside the app, but hide its browser UI.
            'location=no',
            'toolbar=no',
            'toolbarposition=top',
            'hidenavigationbuttons=yes',
            'hideurlbar=yes',
            'hardwareback=yes',
            'zoom=yes',
            'clearcache=no',
            'clearsessioncache=no',
            'mediaPlaybackRequiresUserAction=no',
          ].join(','),
        );
        return;
      } catch (error) {
        console.error('[RPF Browser] InAppBrowser failed:', error);
      }
    }

    // Capacitor Browser is the safe native fallback. Do NOT fall back to the
    // old /browser iframe/proxy because that breaks third-party security,
    // cookies, authentication and X-Frame-Options/CSP protected sites.
    import('@capacitor/browser')
      .then(({ Browser }) => Browser.open({ url: value }))
      .catch((error) => {
        console.error('[RPF Browser] Native browser fallback failed:', error);
        // Last-resort internal route only for a visible error/recovery screen;
        // never silently launch Chrome or another system browser.
        navigate(`/browser?url=${encodeURIComponent(value)}&title=${encodeURIComponent(title)}`);
      });
    return;
  }

  // Desktop/development web cannot embed an arbitrary third-party site with
  // reliable cookies/CSP/authentication. Use the host browser for web builds.
  const W = 520;
  const H = Math.min(window.screen.availHeight - 60, 820);
  const left = Math.round((window.screen.availWidth - W) / 2);
  const top = Math.round((window.screen.availHeight - H) / 2);

  const popup = window.open(
    value,
    'rpf_browser',
    `width=${W},height=${H},left=${left},top=${top},` +
      'toolbar=yes,menubar=no,scrollbars=yes,resizable=yes,status=no,location=yes',
  );

  if (!popup) {
    navigate(`/browser?url=${encodeURIComponent(value)}&title=${encodeURIComponent(title)}`);
  } else {
    popup.focus();
  }
}
