import { Capacitor } from '@capacitor/core';
import type { NavigateFunction } from 'react-router-dom';

/** Central external-navigation boundary for RPF. */
export function openExternalLink(
  url: string,
  navigate: NavigateFunction,
  title: string = 'RPF Browser',
) {
  const value = String(url || '').trim();
  if (!/^https?:\/\//i.test(value)) return;

  // Native Android / iOS: use the installed native InAppBrowser plugin.
  // This gives external websites a real browser context while keeping the
  // browsing surface inside the RPF app flow. JavaScript, cookies, redirects,
  // forms, popups, downloads and normal navigation are handled natively.
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
            'location=yes',
            'toolbar=yes',
            'toolbarposition=top',
            'hidenavigationbuttons=no',
            'hideurlbar=no',
            'hardwareback=yes',
            'zoom=yes',
            'clearcache=no',
            'clearsessioncache=no',
            'mediaPlaybackRequiresUserAction=no',
            'closebuttoncaption=Back',
            'closebuttoncolor=#000080',
          ].join(','),
        );
        return;
      } catch (error) {
        console.error('[RPF Browser] InAppBrowser failed:', error);
      }
    }

    // Secondary native fallback. It remains an in-app browser surface rather
    // than directly launching the system browser.
    import('@capacitor/browser')
      .then(({ Browser }) => Browser.open({ url: value }))
      .catch((error) => {
        console.error('[RPF Browser] Native browser fallback failed:', error);
        navigate(`/browser?url=${encodeURIComponent(value)}&title=${encodeURIComponent(title)}`);
      });
    return;
  }

  // Desktop/development web: the host browser is already the browser engine.
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
