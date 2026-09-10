# Bastly Step 7F — PWA, headers, caching, and privacy hardening

This step intentionally changes deployment/runtime behavior without changing Bastly's product rules or page design.

## What changed

- Service worker no longer runtime-caches JS, CSS, images, route HTML, or API responses.
- The only service-worker cache is the small offline fallback shell and brand icons.
- Navigations are always network-first and fall back to `offline.html` only when the network fails.
- Development automatically unregisters stale Bastly service workers and removes old `bastly-*` caches.
- Production only registers the PWA on the exact canonical `VITE_SITE_URL` origin over HTTPS. Vercel preview URLs therefore do not become installable/sticky by accident.
- Service-worker update checks bypass the HTTP cache with `updateViaCache: none`.
- The install banner follows the same canonical-origin rule.
- The web app manifest no longer locks devices to portrait orientation.
- Added the standard `mobile-web-app-capable` meta alongside the Apple compatibility meta.
- Vercel sends a security header baseline, including CSP, HSTS, anti-framing, MIME sniff protection, referrer policy, and a restrictive Permissions Policy.
- CSP permits the current required external resources: Google Fonts, YouTube frames, HTTPS images/media, and direct Cloudflare R2 upload requests.
- API proxy responses are forced `private, no-store` and Vercel rewrite caching is explicitly disabled.
- `sw.js` itself is never stored as a stale browser response.
- Hashed Vite `/assets/*` remain immutable for one year. Public route HTML revalidates. Private fallback HTML remains no-store + noindex.
- Offline fallback has no inline JavaScript/event handler.

## CSP note

The build-time SEO generator injects inline `application/ld+json` structured-data blocks. The current static-host CSP therefore allows inline script elements but explicitly blocks inline script attributes with `script-src-attr 'none'`. If Bastly later moves to a nonce-capable server-rendered frontend, this can be tightened further without losing structured data.

## Local checks

1. Run `npm run dev` and confirm normal navigation/login/admin pages still work.
2. DevTools > Application > Service Workers should show no active Bastly worker on `http://localhost:5173` after refresh.
3. Run `npm run build`.
4. Optionally run `npm run preview --prefix client`; because the preview origin will not equal the canonical production origin, the PWA intentionally will not register there.

## Production checks after deployment

- `sw.js`: `Cache-Control: no-cache, no-store, must-revalidate`
- `/api/health`: no-store through the Vercel proxy
- private route such as `/admin`: `X-Robots-Tag: noindex, nofollow` and no-store
- public `/courses`: indexable HTML only in production, with canonical metadata
- CSP does not block Google Fonts, YouTube lessons, or R2 Admin uploads
- install prompt appears only on the canonical production origin
- updating and redeploying Bastly does not leave an old JS bundle controlled by the service worker
