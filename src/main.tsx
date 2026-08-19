import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './styles/premium-reset.css';
import { Capacitor } from '@capacitor/core';
import axios from 'axios';
import { CapacitorUpdater } from '@capgo/capacitor-updater';

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
    // Offline or temporarily unavailable: keep the currently loaded app running.
  } finally {
    updateCheckInFlight = false;
  }
}

// Intercept relative paths for Capacitor native builds
if (Capacitor.isNativePlatform()) {
  CapacitorUpdater.notifyAppReady();
  axios.defaults.baseURL = RPF_WEB_ORIGIN;

  const originalFetch = window.fetch;
  window.fetch = function (input, init) {
    if (typeof input === 'string') {
      if (input.startsWith('/api/')) {
        input = `${RPF_WEB_ORIGIN}${input}`;
      } else if (input.startsWith('api/')) {
        input = `${RPF_WEB_ORIGIN}/${input}`;
      }
    } else if (input instanceof URL) {
      if (input.pathname.startsWith('/api/')) {
        return originalFetch(new URL(input.pathname, RPF_WEB_ORIGIN).toString(), init);
      } else if (input.pathname.startsWith('api/')) {
        return originalFetch(new URL('/' + input.pathname, RPF_WEB_ORIGIN).toString(), init);
      }
    } else if (input && typeof input === 'object' && 'url' in input) {
      const urlStr = String((input as any).url);
      if (urlStr.startsWith('/api/')) {
        return originalFetch(new Request(`${RPF_WEB_ORIGIN}${urlStr}`, input as RequestInit), init);
      } else if (urlStr.startsWith('api/')) {
        return originalFetch(new Request(`${RPF_WEB_ORIGIN}/${urlStr}`, input as RequestInit), init);
      }
    }
    return originalFetch(input, init);
  };

  // Keep the installed APK as a stable native shell while automatically
  // picking up newly deployed web code from the server.
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
