# Bastly production environment contract

This file is the handoff checklist for production configuration. It contains variable names and
rules only. Never paste real secrets into Git, screenshots, issues, or chat messages.

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

`CLIENT_URL` is not a secret. It is derived from the final Cloudflare frontend origin selected at
deployment time.

`JWT_SECRET` does not need to be sent by the owner when the Render Blueprint is used.
`render.yaml` uses `generateValue: true`, so Render creates and stores it.

If Bastly is hosted elsewhere or the service is configured manually, generate one locally with:

```text
npm run generate:jwt
```

Copy the output directly into the hosting provider and never commit it.

Production also locks:

```text
NODE_ENV=production
REQUIRE_EMAIL_VERIFICATION=true
EMAIL_FROM_NAME=Bastly Academy
```

`PORT` is supplied by Render and is not an owner handoff value.

---

## 2. Public business values — client build

These values are intentionally public because the website displays them:

```text
VITE_BASTLY_WHATSAPP_NUMBER=201000883609
VITE_BASTLY_PHONE_DISPLAY=01000883609
VITE_BASTLY_INSTAGRAM_URL=https://www.instagram.com/bastly.eduf/
```

The owner should confirm these before launch.

They feed public WhatsApp/phone/Instagram links through the centralized client config module.

Also configure for the production frontend build:

```text
VITE_SITE_URL=https://FINAL_FRONTEND_ORIGIN
BACKEND_URL=https://FINAL_RENDER_ORIGIN
```

Browser API traffic remains:

```text
VITE_API_URL=/api
```

`VITE_API_URL` can be omitted because `/api` is the code default.

Do not point browser API calls directly at Render. The Cloudflare Worker `/api` reverse proxy is
intentional so the HttpOnly auth cookie remains first-party/same-origin.

`SEO_API_URL` is an optional build-only override. Normally leave it unset because the SEO generator
derives `${BACKEND_URL}/api`.

---

## 3. Cloudflare Worker runtime value

The deployed Worker needs:

```text
BACKEND_URL=https://FINAL_RENDER_ORIGIN
```

This is not a browser Vite variable.

It is the upstream used by the Worker for:

```text
/api/*
```

For local Wrangler testing:

```text
client/.dev.vars.example
```

documents the variable name.

Copy it to:

```text
client/.dev.vars
```

when the Render origin exists.

`client/.dev.vars` is ignored by Git.

The presence of `.dev.vars` also keeps Wrangler from importing the client Vite `.env` file into the
Worker runtime.

---

## 4. Never expose these through VITE_

Do not create client variables for:

```text
JWT_SECRET
MONGODB_URI
GMAIL_APP_PASSWORD
CLOUDFLARE_R2_ACCESS_KEY_ID
CLOUDFLARE_R2_SECRET_ACCESS_KEY
```

The client environment checker rejects known `VITE_` versions of these secrets.

---

## 5. One-time bootstrap Admin values

The following are read only by:

```text
npm run seed:admin
```

```text
ADMIN_NAME
ADMIN_EMAIL
ADMIN_PASSWORD
ADMIN_PHONE
```

They are not runtime production requirements.

After the first production Admin is created, remove `ADMIN_PASSWORD` from the hosting environment.
Prefer removing all four bootstrap values once no longer needed.

---

## 6. Validation before deployment

Server contract — checks required values, HTTPS origins, placeholders, Mongo shape, Gmail shape,
R2 bucket shape, and the production email-verification flag without printing values:

```text
npm run check:prod --prefix server
```

Client production contract — checks same-origin `/api`, canonical URL, backend URL, public contact
settings, and accidental client-secret exposure:

```text
npm run check:env:prod --prefix client
```

Combined:

```text
npm run check:production
```

A normal local:

```text
npm run build
```

does not require owner production values.

Strict production behavior is explicit rather than inferred from a hosting-provider environment:

```text
npm run build:production --prefix client
```

This strict production build also requires the public Render API to be reachable for published
Doctor/Course SEO discovery.

---

## 7. Placeholder protection

Production validation deliberately rejects obvious template/development values such as
`replace-with...`, `your-...`, `example.com`, local MongoDB, localhost frontend URLs, and Bastly's
old development JWT fallback.

This matters because a long placeholder string can technically satisfy a simple length check while
still being unsafe.

---

## 8. Deployment URL relationship

Final request path:

```text
Browser
  https://FINAL_FRONTEND_ORIGIN/api/*
        ↓ Cloudflare Worker
  https://FINAL_RENDER_ORIGIN/api/*
        ↓
  Express / MongoDB Atlas
```

The browser keeps using `/api`.

The Cloudflare Worker receives `BACKEND_URL` at runtime and forwards the request to Render.

The browser's `Origin` remains the Bastly frontend origin, which is what the API production Origin
guard expects.

Do not rewrite the browser API base URL to the Render hostname.

---

## 9. Domain decision

The final frontend origin is intentionally undecided until the Bastly owner chooses whether to buy
or use a custom domain.

Once the choice is made, the exact same frontend origin must be used for:

```text
VITE_SITE_URL
Render CLIENT_URL
R2 browser CORS allowed origin
SEO canonical URLs
PWA canonical-origin registration check
```

If no custom domain is used, select one stable Cloudflare production origin and use that exact
origin consistently.

Do not launch with multiple competing canonical frontend origins.

---

## 10. Course-price production rule

The old `5000 EGP` development placeholder has been removed from new Course defaults and Admin
forms.

New courses start at:

```text
price=0
priceConfirmed=false
```

until the Admin enters the real price and explicitly confirms it.

Public UI continues to show `Price coming soon` whenever `priceConfirmed` is false.
