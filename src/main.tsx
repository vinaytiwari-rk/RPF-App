import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './styles/premium-reset.css';
import { Capacitor } from '@capacitor/core';
import axios from 'axios';

// Intercept relative paths for Capacitor native builds
if (Capacitor.isNativePlatform()) {
  // 1. Setup Axios baseURL
  axios.defaults.baseURL = 'https://appapi.therpfoundation.org';

  // 2. Setup window.fetch interceptor
  const originalFetch = window.fetch;
  window.fetch = function (input, init) {
    if (typeof input === 'string') {
      if (input.startsWith('/api/')) {
        input = 'https://appapi.therpfoundation.org' + input;
      } else if (input.startsWith('api/')) {
        input = 'https://appapi.therpfoundation.org/' + input;
      }
    } else if (input instanceof URL) {
      if (input.pathname.startsWith('/api/')) {
        return originalFetch(new URL(input.pathname, 'https://appapi.therpfoundation.org').toString(), init);
      } else if (input.pathname.startsWith('api/')) {
        return originalFetch(new URL('/' + input.pathname, 'https://appapi.therpfoundation.org').toString(), init);
      }
    } else if (input && typeof input === 'object' && 'url' in input) {
      const urlStr = String((input as any).url);
      if (urlStr.startsWith('/api/')) {
        const newUrl = 'https://appapi.therpfoundation.org' + urlStr;
        const newRequest = new Request(newUrl, input as RequestInit);
        return originalFetch(newRequest, init);
      } else if (urlStr.startsWith('api/')) {
        const newUrl = 'https://appapi.therpfoundation.org/' + urlStr;
        const newRequest = new Request(newUrl, input as RequestInit);
        return originalFetch(newRequest, init);
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
