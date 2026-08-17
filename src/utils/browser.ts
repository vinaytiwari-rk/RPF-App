import { Capacitor } from '@capacitor/core';
import { Browser } from '@capacitor/browser';
import { NavigateFunction } from 'react-router-dom';

const PROXY_HOSTS = new Set([
  "www.india.gov.in", 
  "india.gov.in", 
  "www.myscheme.gov.in", 
  "myscheme.gov.in", 
  "www.calculator.net", 
  "calculator.net"
]);

/**
 * Safely opens an external link.
 * - On Native (Android/iOS): Uses Capacitor Browser for a seamless in-app experience.
 * - On Web (Proxied): Uses the internal /browser iframe for whitelisted sites.
 * - On Web (External): Opens in a new tab to avoid iframe X-Frame-Options blocking.
 */
export function openExternalLink(url: string, navigate: NavigateFunction) {
  if (Capacitor.isNativePlatform()) {
    Browser.open({ url }).catch(console.error);
    return;
  }
  
  try {
    const u = new URL(url);
    if (PROXY_HOSTS.has(u.hostname.toLowerCase())) {
      navigate(`/browser?url=${encodeURIComponent(url)}`);
      return;
    }
  } catch {}
  
  // Direct web open (bypasses popup blockers if called directly from onClick)
  window.open(url, '_blank', 'noopener,noreferrer');
}
