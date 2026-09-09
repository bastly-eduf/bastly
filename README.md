# Bastly Academy

MERN learning platform for **Students, Parents, Doctors/Instructors, and Admins**.

## Stack

- React + Vite
- Node.js + Express
- MongoDB + Mongoose
- Cloudflare-ready public frontend
- Render-ready API

## Product direction

Bastly is being built as both:
1. a public academy website with strong SEO, and
2. a role-based learning platform.

The V1 performance system is based on **quiz grades + attendance**. Video lessons use YouTube Unlisted with no continuous video-progress tracking.

## Structure

```text
client/  React/Vite website and app
server/  Express API
```

## Local setup

```bash
npm install
npm run install:all
```

Copy environment examples:

```bash
cp client/.env.example client/.env
cp server/.env.example server/.env
```

Then run:

```bash
npm run dev
```

Frontend: `http://localhost:5173`
API: `http://localhost:5000`

## Current milestone

**Step 2 — Navbar + Hero**

Completed:

- Step 1 project/security/SEO foundation
- responsive transparent-to-solid public navbar
- accessible mobile navigation
- responsive hero using separate desktop/mobile WebP backgrounds
- homepage hero CTA structure
- reduced-motion support and responsive hero typography

Next: build the remaining homepage sections in the locked Bastly section order.
