# Bastly Academy

MERN learning platform for **Students, Parents, Doctors/Instructors, and Admins**.

## Stack

- React + Vite + Tailwind CSS v4
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

**Step 3B — Meet Your Doctors + How Bastly Works**

Completed:

- Step 1 project/security/SEO foundation
- Step 2 responsive navbar + hero
- Step 3A Bastly value strip + featured courses
- responsive featured-doctors section using supplied instructor portraits
- homepage doctor links prepared for future SEO profile pages
- four-step enrollment/learning flow
- WhatsApp enrollment contact link using Bastly's number

Next: Student Learning Hub + Performance Tracking sections.


## Styling architecture

The frontend now uses **Tailwind CSS v4** through the official Vite plugin. Bastly brand colors,
fonts, and shared theme tokens live in `client/src/styles/global.css` under `@theme`.

Component-specific CSS files were removed in favor of colocated Tailwind utility classes.
Small global styles are kept only for true global behavior, theme tokens, and the hero entrance animation.


## Step 3C — Student Learning Hub + Performance Tracking

Added:

- student dashboard marketing preview
- courses / quiz / homework / reward preview cards
- weekly performance UI
- 60% quiz + 40% attendance rating presentation
- Star / A / B / C grade bands
- parent / doctor / student tracking explanation

Next homepage sections: Bastly Cards / Spin & Win, Parent experience, final CTA, FAQ, and footer.


## Step 3D — Homepage completion

Added:

- Bastly Cards / Spin & Win section
- parent dashboard preview
- final homepage CTA
- homepage FAQ section
- reusable public footer with Bastly contact links

At this milestone the public homepage structure is complete.
Next recommended step: core database + authentication architecture before building live public course/doctor pages and dashboards.
