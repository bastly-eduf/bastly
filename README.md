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


## Step 4A — MongoDB + authentication foundation

Added:

- MongoDB/Mongoose user, student profile, parent relationship, auth-token, and audit-log models
- student self-registration API
- secure bcrypt password hashing
- JWT session stored in an HttpOnly cookie
- login / logout / current-user API endpoints
- authentication + role authorization middleware
- Zod validation on both client and server
- authentication-specific rate limiting
- Axios API client with credentials enabled
- real Bastly login and student-registration screens
- temporary role-area destinations for Student / Parent / Doctor / Admin

### Important production note

The intended deployment should keep the frontend and API on the same Bastly site
(for example `www.example.com` + `api.example.com`) so secure SameSite cookies behave predictably.

### Still upcoming

- email verification + password reset through Gmail
- secure doctor invite / parent invite acceptance
- protected client routing / global auth context
- Admin user management
- core academic models (Course, Group, Enrollment, Lesson, Assessment, Attendance, Performance, Rewards)


## Step 4B — Complete authentication + secure invitations

Added:

- global auth context with `/auth/me` session restoration
- protected Student / Parent / Doctor / Admin frontend routes
- role guards and wrong-role redirects
- real logout flow
- one-time hashed doctor invitation links (48h)
- one-time hashed parent invitation links (72h)
- existing-parent-account sibling linking
- parent invitations generated from student registration
- optional student email verification flow
- forgot/reset password flow with session invalidation
- Gmail/Nodemailer email service with Google App Password support
- development email fallback that prints secure links to the server console
- admin-only doctor invitation endpoint
- temporary admin seed command

### Development admin

Put temporary admin values in `server/.env`, then run:

```bash
npm run seed:admin --prefix server
```

After the real owner accounts are ready, development credentials can be discarded.

### Email behavior

If `GMAIL_USER` and `GMAIL_APP_PASSWORD` are blank in development, Bastly does not fake delivery.
Instead, secure invitation/reset URLs are printed to the server console so the flows can be tested locally.

For production:

- configure Gmail + Google App Password
- set `REQUIRE_EMAIL_VERIFICATION=true`
- never commit Gmail or admin credentials

### Next

Build the academic data foundation:

Course → Group → Enrollment → Modules/Lessons → Assessments → Attendance → Weekly Performance → Bastly Cards.


## Step 5A — Academic core + real Admin operations

Added the first real academic data layer:

- DoctorProfile (public identity separated from login account)
- Course
- Group
- Enrollment
- explicit course `accessEndDate`
- pending → paid/active enrollment flow
- admin unregister flow that revokes access without deleting history
- enrollment status history for future reactivation/auditing
- doctor invitation can now link directly to an existing DoctorProfile

Added the first real Admin UI:

- Admin Overview
- Doctors
- Courses & Groups
- Enrollments
- secure admin-only APIs for all of the above

### Locked course structure

```text
Doctor Profile
  └── Course (different level/topic = different course)
        └── Group (same course, different cohort/timetable)
              └── Enrollment
```

### Payment/access rule

Enrollment starts `pending`.
After WhatsApp payment is confirmed by Admin:

- `paymentStatus = paid`
- `status = active`
- access begins immediately
- enrollment snapshots the Course `accessEndDate`

Admin can later unregister the enrollment. The User account and academic history remain intact.

### Next

Step 5B should build Modules / Lessons / YouTube video content and the Doctor course-management area.
