import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './styles/premium-reset.css';
import { Capacitor } from '@capacitor/core';
import axios from 'axios';

const RPF_WEB_ORIGIN = 'https://appapi.therpfoundation.org';
const RPF_VERSION_KEY = '@rpf_web_version';
let updateCheckInFlight = false;

async function checkForWebUpdate() {
  if (!Capacitor.isNativePlatform() || updateCheckInFlight) return;
  updateCheckInFlight = true;
  try {
    const response = await fetch(`${RPF_WEB_ORIGIN}/version.json?ts=${Date.now()}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' },
    });
    if (!response.ok) return;
    const payload = await response.json();
    const remoteVersion = String(payload?.version || '').trim();
    if (!remoteVersion) return;
    const localVersion = localStorage.getItem(RPF_VERSION_KEY);
    if (!localVersion) {
      localStorage.setItem(RPF_VERSION_KEY, remoteVersion);
      return;
    }
    if (localVersion === remoteVersion) return;
    localStorage.setItem(RPF_VERSION_KEY, remoteVersion);
    window.location.reload();
  } catch {
    // Keep the currently loaded app running when the network is unavailable.
  } finally {
    updateCheckInFlight = false;
  }
}

if (Capacitor.isNativePlatform()) {
  axios.defaults.baseURL = RPF_WEB_ORIGIN;
  const originalFetch = window.fetch.bind(window);

  window.fetch = function (input, init) {
    let resolvedInput: RequestInfo | URL = input;
    let url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input instanceof Request ? input.url : '';

    // The live feed service is served by the cPanel PHP proxy. Route it directly
    // instead of waiting for a Node route that may not exist in the native build.
    if (url.startsWith('/api/public/live-feeds')) url = `${RPF_WEB_ORIGIN}/rss-proxy.php${url.includes('?') ? url.slice(url.indexOf('?')) : ''}`;
    else if (url.startsWith('api/public/live-feeds')) url = `${RPF_WEB_ORIGIN}/rss-proxy.php`;
    else if (url.startsWith('/api/')) url = `${RPF_WEB_ORIGIN}${url}`;
    else if (url.startsWith('api/')) url = `${RPF_WEB_ORIGIN}/${url}`;
    else if (url.startsWith('/rss-proxy.php')) url = `${RPF_WEB_ORIGIN}${url}`;
    else if (url.startsWith('rss-proxy.php')) url = `${RPF_WEB_ORIGIN}/${url}`;

    if (url) resolvedInput = url;

    const isLiveFeed = url.includes('/rss-proxy.php');
    if (!isLiveFeed) return originalFetch(resolvedInput, init);

    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 10_000);
    const mergedInit: RequestInit = { ...(init || {}), signal: controller.signal };
    return originalFetch(resolvedInput, mergedInit).finally(() => window.clearTimeout(timer));
  };

  window.setTimeout(checkForWebUpdate, 1500);
  window.setInterval(checkForWebUpdate, 60_000);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') checkForWebUpdate();
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);