import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import type { NavigateFunction } from 'react-router-dom';

/**
 * Opens a third-party website without routing it through the RPF HTML proxy.
 *
 * Native Android/iOS: Capacitor Browser keeps the user inside the app's
 * browser experience while preserving the site's own cookies, JavaScript,
 * redirects, popups and authentication flows.
 * Web: a normal new tab is used because arbitrary third-party sites cannot be
 * reliably embedded due to CSP/X-Frame-Options and many publisher WAFs.
 */
export function openExternalLink(url: string, _navigate?: NavigateFunction) {
  const value = String(url || '').trim();
  if (!/^https?:\/\//i.test(value)) return;

  if (Capacitor.isNativePlatform()) {
    Browser.open({ url: value }).catch((error) => {
      console.error('Unable to open external link:', error);
    });
    return;
  }

  window.open(value, '_blank', 'noopener,noreferrer');
}
