import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import type { NavigateFunction } from 'react-router-dom';

/**
 * Opens a third-party website without changing RPF authentication state.
 * Native Android/iOS uses the Capacitor browser surface. Web uses the RPF
 * browser route so the user does not leave the application tab.
 */
export function openExternalLink(url: string, navigate: NavigateFunction, title: string = "RPF Browser") {
  const value = String(url || '').trim();
  if (!/^https?:\/\//i.test(value)) return;

  if (Capacitor.isNativePlatform()) {
    const iab = (window as any).cordova?.InAppBrowser || (window as any).InAppBrowser;
    if (iab) {
      // Custom native WebView overlay with close button, hiding URL and navigation controls
      iab.open(value, '_blank', 'location=no,toolbar=yes,hidenavigationbuttons=yes,closebuttoncaption=Back,closebuttoncolor=#000080');
    } else {
      import('@capacitor/browser').then(({ Browser }) => {
        Browser.open({ url: value }).catch((error) => {
          console.error('Unable to open external link:', error);
        });
      });
    }
    return;
  }

  // Web fallback: Load the in-app RPF Internal Browser
  navigate(`/browser?url=${encodeURIComponent(value)}&title=${encodeURIComponent(title)}`);
}
