import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './styles/premium-reset.css';
import { Capacitor } from '@capacitor/core';
import axios from 'axios';

const RPF_WEB_ORIGIN = 'https://appapi.therpfoundation.org';

// Native builds keep the same local React bundle that was packaged into the APK.
// Only API requests are routed to the production backend; app code is never
// replaced at runtime by an OTA updater.
if (Capacitor.isNativePlatform()) {
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
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
