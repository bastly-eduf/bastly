# Bastly security model

This document describes the security assumptions implemented before production deployment. It is
not a claim that the application is invulnerable; it is the checklist we use to avoid shipping
with accidental trust boundaries or secret-handling mistakes.

## Authentication

- Browser sessions use an HttpOnly cookie, never localStorage.
- Development uses `bastly_session` on localhost HTTP.
- Production uses `__Host-bastly_session`, which requires Secure + Path=/ and no Domain attribute.
- Session JWTs expire after 7 days.
- JWTs are signed and verified only with HS256 and include Bastly issuer/audience checks.
- The JWT contains the user ID, role, and `tokenVersion` only.
- Every authenticated request reloads the user and rejects inactive accounts or an outdated
  `tokenVersion`.
- Password reset and password-change flows increment `tokenVersion` to invalidate older sessions.
- Passwords are bcrypt hashed with cost 12.
- Unknown-email login attempts still execute a bcrypt comparison to reduce basic account timing
  enumeration.

## One-time links

Raw verification/reset/invitation tokens are never stored in MongoDB. Only SHA-256 hashes are
stored.

Read-only invitation validation can inspect an unused token. State-changing flows atomically claim
an unused, unexpired token before the protected mutation. This prevents two concurrent requests
from both accepting the same one-time link.

A claimed token is intentionally treated as spent even if a later downstream operation fails. In
that rare case, issue a new verification/reset/invitation link rather than making the old secret
replayable.

## Browser write protection

State-changing `/api` requests use the exact-Origin guard in production.

GET/HEAD/OPTIONS are safe methods and do not require the Origin check.

This is an Origin-based CSRF mitigation, not a CSRF-token implementation.

The production session cookie is also SameSite=Lax.

Keep browser API calls same-origin through the Cloudflare Worker `/api` proxy.

The browser request path remains:

```text
https://FINAL_FRONTEND_ORIGIN/api/*
```

while the Worker forwards upstream to Render.

Do not make the browser call the Render origin directly.

## Cloudflare frontend boundary

The Cloudflare Worker is the frontend reverse-proxy boundary for `/api/*`.

The Worker:

- preserves the browser request Origin
- forwards `/api/*` to Render using server-side `BACKEND_URL`
- returns upstream response headers, including session cookies
- forces `Cache-Control: private, no-store, max-age=0` on API responses
- applies the frontend security headers to Worker-generated/proxied responses
- does not expose `BACKEND_URL` as a Vite/browser variable

Private/auth SPA routes use `private.html` and return:

```text
Cache-Control: private, no-store, max-age=0
X-Robots-Tag: noindex, nofollow
```

Unknown HTML navigations use the same private noindex shell so React can render the SPA Not Found
page without serving the indexable homepage shell.

Missing static assets still return a real `404`.

## Authorization and isolation

Routes are role protected server-side. UI route protection is never treated as authorization.

Doctor course/module/lesson actions resolve ownership through the linked DoctorProfile before
access.

Student assessment/lesson access requires an active paid Enrollment that has not expired.

Parent insight routes require an active ParentRelationship for the requested student.

Admin media routes require the Admin role and generate their own allowed R2 object keys.

Re-check these rules in production QA with IDs copied from another test account; a 403/404 must be
returned instead of another person's data.

## One-attempt quizzes and rewards

Quiz attempts have a unique `(assessment, student, attemptNumber)` index.

The existing attempt check provides a friendly error, while the unique index is the final
concurrency guard for attempt 1.

Spin credits have the existing unique weekly student ledger and atomic reward inventory behavior.

Bastly Card redemption uses a conditional `assigned -> redeemed` update so a double request cannot
independently redeem the same assignment twice.

## Abuse limits

Bastly uses separate IP-based limits for login, registration, recovery, invitations, sensitive
account actions, assessment submission, R2 media mutations, spin requests, and reward actions, plus
a broad API limit.

The current limiter store is process memory.

That matches the planned single Render web service.

If more than one API instance is introduced, configure a shared rate-limit store before assuming a
limit applies globally.

Rate limiting is defense-in-depth, not the authorization mechanism.

The final Cloudflare -> Render proxy chain must still be tested before launch to verify the client
IP/proxy assumptions used by rate limiting.

## Error handling and logs

Every request receives `X-Request-Id`.

Production 500 responses are generic and return the request ID so a report can be matched to server
logs.

Server 500 logging intentionally excludes:

- request bodies
- cookies
- Authorization headers
- query strings

Do not switch error logging to `req.originalUrl`, because reset/verification/invitation URLs may
carry secret tokens in the query string.

Never log environment variables or connection strings.

## Cloudflare R2

R2 access credentials remain server-only.

The Admin browser gets short-lived presigned PUT URLs for exact object keys created by the API.

The browser converts source images to predefined WebP variants before upload, and the API verifies
uploaded objects before committing media metadata.

Production bucket CORS must allow only the final Bastly frontend origin, not `*`.

See:

```text
R2_MEDIA_SETUP.md
```

## PWA and caching boundary

The service worker does not intercept `/api` requests.

Authenticated API responses must never be placed into browser/Worker application caches.

The service worker only registers on the canonical production origin configured by `VITE_SITE_URL`.

`sw.js` itself is served with:

```text
Cache-Control: no-cache, no-store, must-revalidate
Service-Worker-Allowed: /
```

Private SPA shells and offline fallback content are explicitly noindex where appropriate.

## Production secret boundary

Bastly treats production configuration as two separate classes:

- server-only secrets: MongoDB, Gmail App Password, JWT signing secret, and R2 access credentials
- intentionally public build values: Bastly WhatsApp number, display phone number, Instagram URL,
  and canonical site URL

Known secret names are rejected if they are accidentally introduced as `VITE_` variables.

Render generates the JWT signing secret from the Blueprint when that deployment path is used.

Production startup runs the same server environment contract used by:

```text
npm run check:prod
```

See `ENVIRONMENT.md` for the exact owner handoff list.

Do not copy real values into this repository.

## Remaining before launch

The local Cloudflare frontend architecture and routing behavior have been validated.

Still required before public launch:

- owner decision on the final frontend origin/domain
- production Render deployment
- production MongoDB connectivity
- final Cloudflare Worker runtime `BACKEND_URL`
- final Render `CLIENT_URL`
- production R2 CORS/public media origin
- production Gmail verification
- strict production frontend build against the live Render public API
- live Browser -> Cloudflare -> Render session-cookie test
- final proxy/IP and rate-limit verification
- role-by-role IDOR tests
- concurrent one-time-token/reward tests
- live no-cache/security-header checks
- production log inspection

Do not call Bastly launched until the production acceptance checklist in `DEPLOYMENT.md` passes.
