import { Capacitor } from '@capacitor/core';
import type { NavigateFunction } from 'react-router-dom';

/**
 * Opens a third-party website without changing RPF authentication state.
 *
 * Mobile (Android/iOS APK):
 *   → Uses Capacitor Browser — a native WebView overlay inside the app.
 *   → X-Frame-Options does NOT apply. ALL sites open perfectly.
 *   → User stays inside the app and can press Back to return.
 *
 * Computer (Web Browser):
 *   → Opens a small popup window styled to look like the RPF in-app browser.
 *   → Popup is NOT subject to X-Frame-Options restrictions.
 *   → The main RPF tab stays open and authenticated — no logout risk.
 */
export function openExternalLink(
  url: string,
  navigate: NavigateFunction,
  title: string = 'RPF Browser',
) {
  const value = String(url || '').trim();
  if (!/^https?:\/\//i.test(value)) return;

  // ── MOBILE (Android / iOS APK) ──────────────────────────────────────────
  if (Capacitor.isNativePlatform()) {
    // Prefer Cordova InAppBrowser if available (configured in android project)
    const iab =
      (window as any).cordova?.InAppBrowser || (window as any).InAppBrowser;
    if (iab) {
      iab.open(
        value,
        '_blank',
        'location=no,toolbar=yes,hidenavigationbuttons=yes,closebuttoncaption=← Back,closebuttoncolor=#000080',
      );
    } else {
      // Fallback to Capacitor Browser (also an in-app WebView on mobile)
      import('@capacitor/browser').then(({ Browser }) => {
        Browser.open({ url: value }).catch(console.error);
      });
    }
    return;
  }

  // ── WEB (Computer browser) ──────────────────────────────────────────────
  // Open a small popup window. Popup windows are NOT subject to
  // X-Frame-Options or CSP frame-ancestors restrictions, so every site
  // (india.gov.in, eraktkosh, newspapers, calculators) will load perfectly.
  // The main RPF tab remains open and the user stays logged in.
  const W = 520;
  const H = Math.min(window.screen.availHeight - 60, 820);
  const left = Math.round((window.screen.availWidth - W) / 2);
  const top = Math.round((window.screen.availHeight - H) / 2);

  const popup = window.open(
    value,
    'rpf_browser',
    `width=${W},height=${H},left=${left},top=${top},` +
      'toolbar=no,menubar=no,scrollbars=yes,resizable=yes,status=no,location=no',
  );

  if (!popup) {
    // Popup was blocked by the browser — fall back to in-app iframe route
    navigate(
      `/browser?url=${encodeURIComponent(value)}&title=${encodeURIComponent(title)}`,
    );
  } else {
    popup.focus();
  }
}
