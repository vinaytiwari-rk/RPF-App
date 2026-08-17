import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import type { NavigateFunction } from 'react-router-dom';

/**
 * Opens a third-party website without changing RPF authentication state.
 * Native Android/iOS uses the Capacitor browser surface. Web uses the RPF
 * browser route so the user does not leave the application tab.
 */
export function openExternalLink(url: string, navigate: NavigateFunction) {
  const value = String(url || '').trim();
  if (!/^https?:\/\//i.test(value)) return;

  if (Capacitor.isNativePlatform()) {
    Browser.open({ url: value }).catch((error) => {
      console.error('Unable to open external link:', error);
    });
    return;
  }

  navigate(`/browser?url=${encodeURIComponent(value)}`);
}
