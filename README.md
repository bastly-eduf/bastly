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

**Step 3A — Homepage Value Strip + Featured Courses**

Completed:

- Step 1 project/security/SEO foundation
- Step 2 responsive navbar + hero
- Bastly value strip
- responsive featured-courses section
- first confirmed course/instructor seed data
- temporary 5,000 EGP development pricing

Featured course data in this step uses confirmed public instructor information:
Dr. Radwa Antar (Biology O Level), Dr. Mohamed Emad (Physics IGCSE), and Eng. Yehia Badawi (ICT IGCSE).

Next: Meet Your Doctors + How Bastly Works.
