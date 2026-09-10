# Bastly production environment contract

This file is the handoff checklist for production configuration. It contains variable names and rules only. Never paste real secrets into Git, screenshots, issues, or chat messages.

## 1. Owner-provided private values — Render/server only

The Bastly owner/business should provide or create these directly in the final production accounts:

```text
MONGODB_URI
GMAIL_USER
GMAIL_APP_PASSWORD
CLOUDFLARE_R2_ACCOUNT_ID
CLOUDFLARE_R2_ACCESS_KEY_ID
CLOUDFLARE_R2_SECRET_ACCESS_KEY
CLOUDFLARE_R2_BUCKET
CLOUDFLARE_R2_PUBLIC_BASE_URL
```

`CLIENT_URL` is not a secret. It is derived from the final Vercel/custom-domain frontend origin.

`JWT_SECRET` does not need to be sent by the owner when Render Blueprint is used. `render.yaml` uses `generateValue: true`, so Render creates and stores it. If Bastly is hosted elsewhere, generate one locally with:

```text
npm run generate:jwt
```

Copy the output directly into that hosting provider and never commit it.

Production also locks:

```text
NODE_ENV=production
REQUIRE_EMAIL_VERIFICATION=true
EMAIL_FROM_NAME=Bastly Academy
```

`PORT` is supplied by Render and is not an owner handoff value.

## 2. Public business values — Vercel/client build

These values are intentionally public because the website displays them:

```text
VITE_BASTLY_WHATSAPP_NUMBER=201000883609
VITE_BASTLY_PHONE_DISPLAY=01000883609
VITE_BASTLY_INSTAGRAM_URL=https://www.instagram.com/bastly.eduf/
```

The owner should confirm these before launch. They now feed every public WhatsApp/phone/Instagram link from one config module instead of being duplicated throughout React.

Also configure:

```text
VITE_SITE_URL=https://FINAL_FRONTEND_ORIGIN
BACKEND_URL=https://FINAL_RENDER_ORIGIN
```

Browser API traffic remains:

```text
VITE_API_URL=/api
```

`VITE_API_URL` can be omitted because `/api` is the code default. Do not point browser API calls directly at Render; the Vercel `/api` reverse proxy is intentional so the HttpOnly auth cookie remains first-party/same-origin.

`SEO_API_URL` is an optional build-only override. Normally leave it unset because the SEO generator derives `${BACKEND_URL}/api`.

## 3. Never expose these through VITE_

Do not create client variables for:

```text
JWT_SECRET
MONGODB_URI
GMAIL_APP_PASSWORD
CLOUDFLARE_R2_ACCESS_KEY_ID
CLOUDFLARE_R2_SECRET_ACCESS_KEY
```

Step 7E's client environment checker rejects known `VITE_` versions of these secrets.

## 4. One-time bootstrap Admin values

The following are read only by `npm run seed:admin`:

```text
ADMIN_NAME
ADMIN_EMAIL
ADMIN_PASSWORD
ADMIN_PHONE
```

They are not runtime production requirements. After the first production Admin is created, remove `ADMIN_PASSWORD` from the hosting environment. Prefer removing all four bootstrap values once no longer needed.

## 5. Validation before deployment

Server contract — checks required values, HTTPS origins, placeholders, Mongo shape, Gmail shape, R2 bucket shape, and the production email-verification flag without printing values:

```text
npm run check:prod --prefix server
```

Client/Vercel contract — checks same-origin `/api`, canonical URL, backend URL, public contact settings, and accidental client-secret exposure:

```text
npm run check:env:prod --prefix client
```

Combined:

```text
npm run check:production
```

A normal local `npm run build` does not require owner secrets. Vercel Production builds automatically run the strict client check because `VERCEL_ENV=production`.

## 6. Placeholder protection

Production validation deliberately rejects obvious template/development values such as `replace-with...`, `your-...`, `example.com`, local MongoDB, localhost frontend URLs, and Bastly's old development JWT fallback.

This matters because a long placeholder string can technically satisfy a simple "32 characters" password/secret check while still being unsafe.

## 7. Deployment URL relationship

Final request path:

```text
Browser
  https://www.BASTLY_DOMAIN/api/*
        ↓ Vercel external route
  https://bastly-api.onrender.com/api/*
        ↓
  Express / MongoDB Atlas
```

Vercel's current `vercel.json` route intentionally expands `BACKEND_URL` only on the platform side. The value is not bundled into browser JavaScript unless it is explicitly prefixed with `VITE_` (do not do that).

The browser `Origin` remains the Bastly frontend origin, which is what the API's production Origin guard expects through the reverse proxy.

## 8. Course-price production rule

The old `5000 EGP` development placeholder has been removed from new Course defaults and Admin forms. New courses start at `0` with `priceConfirmed: false` until the Admin enters the real price and explicitly confirms it.

Public UI continues to show `Price coming soon` whenever `priceConfirmed` is false.
