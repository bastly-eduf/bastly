import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/global.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);

function canonicalOrigin() {
  try {
    const siteUrl = import.meta.env.VITE_SITE_URL;
    return siteUrl ? new URL(siteUrl).origin : '';
  } catch {
    return '';
  }
}

async function clearDevelopmentPwaState() {
  if (!('serviceWorker' in navigator)) return;

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((registration) => registration.unregister()));

    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key.startsWith('bastly-'))
          .map((key) => caches.delete(key)),
      );
    }
  } catch (error) {
    console.warn('Bastly development PWA cleanup failed:', error);
  }
}

function shouldRegisterPwa() {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) {
    return false;
  }

  if (window.location.protocol !== 'https:') {
    return false;
  }

  const expectedOrigin = canonicalOrigin();
  return Boolean(expectedOrigin && window.location.origin === expectedOrigin);
}

if (import.meta.env.DEV) {
  clearDevelopmentPwaState();
} else if (shouldRegisterPwa()) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none',
      });

      // Ask the browser to check the network copy immediately instead of waiting
      // for its normal service-worker update interval.
      registration.update().catch(() => {});
    } catch (error) {
      console.error('Bastly service worker registration failed:', error);
    }
  });
}
