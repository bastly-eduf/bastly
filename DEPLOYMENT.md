# Bastly production deployment

This file is intentionally free of passwords, connection strings, and other secrets.

## Locked topology

Use:

- **Frontend:** Vercel
- **API:** Render
- **Database:** MongoDB Atlas
- **Transactional email:** Gmail + Google App Password
- **Videos:** YouTube Unlisted
- **DNS/custom domain:** connect after the first healthy deployment

The browser should call the API through the frontend origin:

```text
Browser
  ↓
https://YOUR_FRONTEND/api/...
  ↓ Vercel proxy
https://YOUR_RENDER_API/api/...
```

This is deliberate. It keeps Bastly's HttpOnly session cookie first-party from the browser's
point of view and avoids depending on third-party cookie behavior between `vercel.app` and
`onrender.com`.

---

## 1. Render API

Repository:

```text
youssefkhaled222/bastly
```

Blueprint configuration is already in:

```text
/render.yaml
```

Equivalent manual settings:

```text
Service type: Web Service
Runtime: Node
Region: Frankfurt
Root directory: server
Build command: npm ci && npm run check:prod
Start command: npm start
Health check: /api/health
Branch: main
Auto deploy: On Commit
```

### Render production environment variables

Set these in Render. Do NOT put values in Git:

```text
NODE_ENV=production

CLIENT_URL=https://YOUR_STABLE_VERCEL_PRODUCTION_DOMAIN

MONGODB_URI=<production Atlas connection string>

JWT_SECRET=<long random secret, minimum 32 characters>

REQUIRE_EMAIL_VERIFICATION=true

GMAIL_USER=<Bastly Gmail account>
GMAIL_APP_PASSWORD=<Google App Password>
EMAIL_FROM_NAME=Bastly Academy
```

Render injects `PORT`; do not hardcode a production port.

The production build checker refuses deployment when the required values are missing or unsafe.

### Health check

After Render deploys, visit:

```text
https://YOUR_RENDER_API/api/health
```

Expected:

```json
{
  "status": "ok",
  "service": "bastly-api",
  "database": "connected"
}
```

A disconnected MongoDB returns HTTP `503`, which lets Render detect an unhealthy API.

---

## 2. Gmail check

Before launch, verify the Gmail App Password from an environment where the production Gmail
variables are set:

```text
npm run check:email --prefix server
```

This only verifies the SMTP transport. It does not print your App Password.

Production startup also requires email configuration because Doctor/Parent invites, email
verification, and password recovery are real product flows.

---

## 3. Vercel frontend

Create/import the same GitHub repository in Vercel.

Set:

```text
Root Directory: client
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Production Branch: main
```

`client/vercel.json` contains Bastly's routing rules.

### Vercel production environment variables

```text
VITE_API_URL=/api

VITE_SITE_URL=https://YOUR_STABLE_VERCEL_PRODUCTION_DOMAIN

BACKEND_URL=https://YOUR_RENDER_API
```

`BACKEND_URL` does not need `/api`.

Example shape:

```text
BACKEND_URL=https://bastly-api.onrender.com
```

Do not prefix `BACKEND_URL` with `VITE_`. It is used by Vercel routing and the build-time SEO
generator, not exposed intentionally as a browser config variable.

### Why `/api` is relative

Bastly's browser client now defaults to:

```text
/api
```

Local Vite proxies it to port `5000`.
Vercel proxies it to Render.

This gives the browser one frontend origin for both the UI and session-cookie requests.

---

## 4. Deployment order

Use this order:

```text
1. Production Atlas is reachable
2. Render API deploys successfully
3. /api/health reports database connected
4. Add Render URL to Vercel as BACKEND_URL
5. Add stable Vercel production URL to Render as CLIENT_URL
6. Add the same frontend URL to Vercel as VITE_SITE_URL
7. Deploy Vercel
8. Test public pages
9. Test login/session through /api
10. Test verification + reset email
11. Only then connect the final custom domain
```

Render and Vercel depend on each other's final URLs, so the first deploy may require one config
update/redeploy after both generated platform URLs exist.

---

## 5. Static SEO behavior on Vercel

The build generates public HTML head shells for:

```text
/
/about
/faq
/contact
/courses
/doctors
/courses/:published-slug
/doctors/:published-slug
```

Vercel serves those generated files directly before falling back to the SPA.

Everything else falls back to:

```text
private.html
```

which is `noindex,nofollow`, and Vercel also sends an `X-Robots-Tag: noindex, nofollow` header
on that fallback.

This prevents Student/Parent/Doctor/Admin/login/invite/recovery/unknown SPA routes from initially
receiving the indexable homepage HTML shell.

Production Vercel builds fail if the Render public API cannot be reached for dynamic public SEO
discovery. A production deploy should never silently ship incomplete Doctor/Course SEO shells.

Vercel preview deployments are intentionally generated as `noindex`.

---

## 6. Custom domain later

When Bastly's real domain exists, prefer:

```text
https://www.YOUR_DOMAIN
```

as the single canonical frontend origin.

Then update:

### Render
```text
CLIENT_URL=https://www.YOUR_DOMAIN
```

### Vercel
```text
VITE_SITE_URL=https://www.YOUR_DOMAIN
```

`VITE_API_URL` stays:

```text
/api
```

and `BACKEND_URL` can continue pointing to the Render service because Vercel keeps proxying it.

Redirect the non-canonical hostname to the canonical hostname in the hosting/DNS setup.

After changing the domain, redeploy the frontend so canonical URLs, sitemap, and public HTML
shells are rebuilt with the real domain.

---

## 7. Production acceptance checks

Do not call Bastly launched until all of these pass:

```text
Public
[ ] /
[ ] /about
[ ] /faq
[ ] /contact
[ ] /courses
[ ] /doctors
[ ] published Course direct URL + hard refresh
[ ] published Doctor direct URL + hard refresh
[ ] sitemap.xml uses production canonical domain
[ ] robots.txt is indexable only on production

Auth
[ ] Student register
[ ] verification email arrives
[ ] verification link works
[ ] login
[ ] refresh stays logged in
[ ] logout
[ ] forgot password email arrives
[ ] reset password works
[ ] Sign out other devices works

Roles
[ ] Admin
[ ] Doctor
[ ] Student
[ ] Parent
[ ] role protection rejects wrong role

Academic
[ ] Course enrollment confirm/unregister
[ ] lesson access
[ ] Quiz one attempt
[ ] Homework unlimited attempts
[ ] attendance finalize
[ ] weekly performance 50/30/20
[ ] missing-category normalization
[ ] Parent data isolation
[ ] Bastly Spin one/week
[ ] reward inventory decrements once

Platform
[ ] /api/health = 200 + database connected
[ ] PWA manifest
[ ] service worker
[ ] offline screen
[ ] no authenticated API response is cached
[ ] mobile nav on all roles

Security
[ ] production session cookie is `__Host-bastly_session`, Secure, HttpOnly, SameSite=Lax, Path=/
[ ] wrong-origin state-changing request is rejected
[ ] reused password-reset link is rejected
[ ] reused Doctor/Parent invitation is rejected
[ ] repeated quiz submission still creates only one quiz attempt
[ ] concurrent Bastly Card redeem produces only one successful state transition
[ ] 500 response contains a request ID but no stack/details in production
[ ] rate-limit behavior checked through the final Vercel -> Render proxy chain
[ ] no secret token appears in server request logs
```

---

## Ownership warning

Before the real launch, the production MongoDB, Render, Vercel, Gmail, and domain should be
owned by the Bastly owner/business account or formally transferred to it.

Do not leave the final production stack dependent on an unrelated client's workspace.

---

## Cloudflare R2 media storage

Before production launch, Bastly also needs a Cloudflare R2 bucket for Admin-managed images.

Required Render/server variables:

```text
CLOUDFLARE_R2_ACCOUNT_ID=
CLOUDFLARE_R2_ACCESS_KEY_ID=
CLOUDFLARE_R2_SECRET_ACCESS_KEY=
CLOUDFLARE_R2_BUCKET=bastly-media
CLOUDFLARE_R2_PUBLIC_BASE_URL=https://media.YOUR_DOMAIN
```

The R2 access key and secret remain server-only.

The browser never uploads the original source file to Render. It creates predefined WebP
variants locally and PUTs them directly to R2 through short-lived presigned URLs generated by
the Bastly API.

The bucket must allow browser `PUT` requests from Bastly's frontend origin through an explicit
R2 CORS policy. See `R2_MEDIA_SETUP.md` for the exact flow and CORS template.

For production, prefer an R2 custom domain such as:

```text
https://media.YOUR_DOMAIN
```

rather than using the rate-limited `r2.dev` development hostname.
