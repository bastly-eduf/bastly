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
- 50% quiz + 30% attendance + 20% homework rating presentation
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


## Step 5B — Modules, Lessons, YouTube + Doctor workspace

Added content models:

```text
Course
  └── Module
        └── Lesson
              └── YouTube Unlisted video
```

Added Doctor-scoped APIs and UI:

- Doctor overview
- My Courses
- Course content workspace
- create/publish/unpublish/archive modules
- create/publish/unpublish/archive lessons
- YouTube URL parsing and validation
- video preview through `youtube-nocookie.com`
- active-student list scoped only to the doctor's own courses
- strict server-side ownership checks on every doctor course/module/lesson action

### YouTube security design

Bastly stores the 11-character YouTube video ID instead of storing an iframe or exposing
the original URL in public content.

Doctor preview uses:

`https://www.youtube-nocookie.com/embed/<VIDEO_ID>?rel=0&modestbranding=1`

The future Student lesson API must only return published lesson/video data after verifying
an ACTIVE enrollment whose access has not expired.

Important limitation: YouTube Unlisted is not DRM. An authorized viewer can potentially
extract/share the video link and screen recording cannot be reliably prevented in a browser.
For this project's low-cost target, this is the strongest sensible free-video architecture.
A protected paid video provider can replace it later without changing the Course/Module/Lesson
structure.

### Next

Step 5C: assessments.

- Quiz + Homework
- MCQ + True/False
- quiz = one attempt
- homework = repeatable
- doctor creates/publishes assessments
- student attempt/result foundation

## Step 5C — Quizzes + Homework + student attempts

Added assessment models:

```text
Course
  └── Assessment
        ├── Quiz       → maximum 1 submitted attempt per student
        └── Homework   → unlimited submitted attempts
```

Question types:

- MCQ
- True / False

Security and grading:

- correct answers are not included in the student's pre-submit API payload
- grading happens on the server
- students only receive assessments for published courses with ACTIVE + PAID + unexpired enrollments
- quiz repeat submission is rejected by the backend, not just the UI
- homework can be repeated
- every submitted result is stored as a new attempt record
- results store percentage plus Star / A / B / C

Doctor experience:

- open a course → Quizzes & Homework
- create Quiz or Homework
- add MCQ and True/False questions
- choose correct answers and optional explanations
- publish/unpublish/archive
- see attempts, student count, and average score

Student experience:

- real Student dashboard foundation
- list available quizzes/homework
- take assessments
- immediate server-graded results
- answer review after submission
- homework retry flow

Grade bands:

- Star: 90–100%
- A: 80–89%
- B: 70–79%
- C: below 70%

### Next

Step 5D: Attendance + weekly performance.

- doctor creates/opens attendance sessions for a group
- doctor marks Present / Absent
- weekly rating uses Quiz results only; Homework stays practice-only
- current rating direction: 50% quiz + 30% attendance + 20% homework
- Doctor / Student / Parent tracking views
- all-Star quiz eligibility feeds the Bastly Spin system


## Step 5D — Attendance + weekly performance + Parent dashboard

Weekly performance is now locked to:

- Quizzes: 50%
- Attendance: 30%
- Homework: 20%

Important behavior:

- if a category was not assigned for that week, its weight is removed and the remaining weights are normalized to 100%
- if an assessment was assigned but the student did not submit it, that assessment contributes 0 to its category score
- Homework uses the FIRST submitted attempt for weekly performance, while the student can still keep retrying for practice
- only finalized Present/Absent attendance contributes to performance
- Quiz Star threshold remains 90%+
- Bastly Spin eligibility stays separate from the overall rating: every required Quiz assigned that week must have a first/only attempt of 90%+, and at least one Quiz must exist

Attendance data model:

```text
AttendanceSession
  └── AttendanceRecord per student
```

Performance snapshot:

```text
WeeklyPerformance
  student + course + week
  quiz / attendance / homework categories
  normalized weights used
  overall percentage + Star/A/B/C
  Bastly Spin eligibility + reason
```

New views:

- Doctor Attendance
- Doctor Weekly Performance
- Student Weekly Performance
- Parent Dashboard with all linked children's current/history week cards

Assessment creation now stores a `performanceWeekStart`, so a quiz/homework belongs to one explicit performance week instead of relying on submission time.

Next: Step 5E — Bastly Cards reward inventory + spin credit/claim flow, plus Admin performance visibility.


## Step 5E — Bastly Cards + Spin & Win

Added the real reward system.

### Locked eligibility rule

A student can earn a maximum of **one Bastly Spin per week across all active courses**.

The spin is earned only when:

- at least one required Quiz exists for that week
- every required Quiz was submitted
- every required Quiz earned `Star` (90%+)

Homework and attendance affect Weekly Performance but do **not** affect Spin eligibility.

### Reward flow

```text
All required weekly quizzes = Star
            ↓
       SpinCredit earned
            ↓
Student presses "Use Bastly Spin"
            ↓
Server locks one SpinCredit
            ↓
Server randomly selects + atomically decrements live reward inventory
            ↓
RewardAssignment is created
            ↓
SpinCredit becomes consumed
            ↓
Only now does the client wheel animation reveal the already-decided reward
```

The browser never decides the prize.

### Inventory

Admin can manage:

- partner name
- partner logo/image path
- reward title
- offer
- description
- redemption instructions
- redemption code
- expiry date
- quantity
- active / paused / expired state
- restocking

Students cannot see redemption codes or private instructions until they win a card.

### Student rewards

`/student/rewards`

Students can:

- see ready Spin credits
- spin the visual wheel
- see won Bastly Cards
- copy redemption codes
- see instructions/expiry
- mark a card as used

### Safety / consistency

- `SpinCredit` is unique by Student + Week, enforcing max 1/week.
- one Spin can only have one RewardAssignment.
- a processing lock prevents duplicate clicks from consuming the same Spin twice.
- stale processing locks self-recover.
- reward stock is decremented with an atomic conditional update.
- if assignment creation fails, stock is restored and the Spin is returned.
- expired inventory and assigned cards are synchronized automatically.
- Spin eligibility is rechecked immediately before every Spin, so a stale/unqualified credit cannot be used.
- qualifying Quiz submissions also sync Spin credits immediately.

### Next

Step 6 should begin the remaining full-platform experience rather than another isolated backend feature:

- Student course/lesson learning area
- Parent deeper child detail pages
- notifications foundation
- public dynamic Doctors + Courses pages
- then PWA / SEO / launch hardening


## Step 6A — Student learning area

Added the real protected learning experience.

### Student routes

```text
/student/courses
/student/courses/:courseId
```

Students now get:

- active paid courses only
- course/group information
- published modules only
- published lessons only
- responsive course outline
- protected YouTube lesson playback
- lesson resources
- manual Mark Complete / Completed control
- course progress percentage
- next unfinished lesson behavior

### Security

Course and lesson APIs validate the student's active paid Enrollment and `accessEndDate`
on every protected request.

The general course workspace does **not** return YouTube video IDs or embed URLs.
Those are returned only when the student opens a specific published lesson after
the server verifies access.

Draft/archived modules and lessons never enter the Student API.

If Admin unregisters the Enrollment or its access expires, the student immediately
loses the ability to fetch that course/lesson even if they know an old URL.

### Lesson progress

Added `LessonProgress`:

```text
Student + Lesson → completed / completedAt
```

Progress is intentionally separate from academic performance.

It does **not** change:

- Quiz score
- Homework score
- Attendance
- Weekly Performance
- Bastly Spin eligibility

There is no continuous video tracking in V1. The student deliberately marks a
lesson complete, which keeps the system lightweight and avoids fake precision.

### Next

Step 6B:

- deeper Parent child/course detail pages
- attendance + quiz/homework drill-down for parents
- notifications foundation for Student / Parent / Doctor / Admin


## Step 6B — Parent drill-down + in-app notifications

### Parent experience

Parent accounts now have three levels:

```text
/parent
  └── /parent/children/:studentId
        └── /parent/children/:studentId/courses/:courseId
```

The child page combines:

- active paid courses
- weekly performance
- overall attendance summary
- Quiz first-attempt average
- Homework first-attempt average
- Homework best-attempt improvement
- published lesson completion

The course detail page shows a selected performance week with:

- the 50/30/20 normalized Weekly Performance card
- Quiz/Homework first, latest, and best attempts
- finalized attendance session history
- learning progress for published lessons

Every Parent API request verifies an ACTIVE ParentRelationship before exposing child data.

### Notifications foundation

Added one shared in-app Notification system for:

- Student
- Parent
- Doctor
- Admin

Every private role layout now has a notification bell with:

- unread badge
- dropdown feed
- mark one as read
- mark all as read
- direct navigation to the related Bastly screen
- 180-day TTL retention

Initial high-value events wired in:

- Admin: new Student account
- Student: course access confirmed
- Doctor: Student gets active course access
- Parent: child's course access confirmed
- Student: assessment result
- Doctor: Student submits Quiz/Homework
- Parent: child's Quiz result
- Student + Parent: finalized absence
- Student: Bastly Spin earned

Notifications are intentionally in-app rather than weekly email spam. Gmail remains for important
transactional/security/account flows.

### Next

Step 6C should replace the public placeholder routes with real dynamic content:

- `/doctors`
- `/doctors/:slug`
- `/courses`
- `/courses/:slug`
- WhatsApp enroll CTA using Bastly's number and course-specific message
- real SEO metadata / structured public data foundation

Then continue to PWA + production hardening and final launch QA.


## Step 6C — Public Doctors + Courses + WhatsApp + SEO foundation

The public placeholders are now backed by MongoDB.

### Public API

```text
GET /api/public/doctors
GET /api/public/doctors/:slug
GET /api/public/courses
GET /api/public/courses/:slug
```

Only `DoctorProfile.isPublished === true` and `Course.status === "published"`
can appear publicly.

Public responses do **not** expose:

- Doctor login accounts
- Student data
- Group meeting URLs
- Lesson/video IDs
- Assessment answers
- Private enrollment data

Course detail may expose active group `name` + `scheduleLabel` only.

### Public routes

```text
/doctors
/doctors/:slug
/courses
/courses/:slug
```

Directories include search/filter UI and link to real MongoDB-backed profiles.

Doctor profiles include:

- portrait
- subject
- levels
- public bio
- qualifications
- experience highlights
- published courses

Course pages include:

- subject / level / curriculum
- instructor
- public description
- academic year
- access end date
- active group schedule labels
- Bastly platform benefits
- WhatsApp enrollment CTA

### Price safety

The internal development default can remain `5000 EGP`, but the public API returns
`price: null` unless `priceConfirmed === true`.

Therefore public pages show:

```text
Price coming soon
```

until Admin explicitly confirms the real price.

### WhatsApp enrollment

Bastly WhatsApp remains:

```text
01000883609
+20 100 088 3609
```

Course CTAs open WhatsApp with a prefilled course-specific enrollment message.

### Admin content controls

Doctor Admin now supports edit/create for:

- public bio
- qualifications
- experience
- levels
- portrait path
- published
- featured

Course Admin now supports edit/create for:

- public description
- price + price-confirmed state
- featured
- status
- academic details

All 18 supplied instructor portraits are now present under:

```text
/client/public/doctors/
```

### SEO foundation

`Seo.jsx` now supports:

- title
- meta description
- canonical URL
- robots
- Open Graph
- Twitter card tags
- optional image
- JSON-LD structured data

Doctor detail uses `Person` JSON-LD.
Course detail uses `Course` JSON-LD.
Public directories use `CollectionPage` JSON-LD.

Private Student / Parent / Doctor / Admin layouts are marked `noindex,nofollow`.

Important: this is still a Vite SPA. Dynamic client-side metadata is useful and Google can
render it, but the final SEO/launch step should add a prerender/static-render strategy for
public routes so crawlers receive useful HTML immediately rather than depending on JS rendering.

### Homepage

Featured course and doctor previews now come from the public MongoDB API rather than the
old hard-coded development arrays. Featured items sort first; if nothing is published,
the homepage shows a truthful empty state instead of fake public data.

### Next

Step 6D:

- real public About / FAQ / Contact pages
- notification polish / account settings
- PWA install/offline shell
- public-route prerender + sitemap/robots
- production security/deployment hardening
- final launch QA


## Step 6D — Public completion + PWA + SEO build output + security hardening

### Public pages completed

The old placeholders are replaced by real pages:

```text
/about
/faq
/contact
```

`/about` explains the Bastly product honestly from the four role perspectives.

`/faq` uses one shared FAQ dataset with the homepage FAQ and documents:

- WhatsApp enrollment
- payment/access activation
- course end dates
- Quiz one-attempt rule
- Homework unlimited attempts
- first Homework attempt in Weekly Performance
- 50/30/20 Weekly Performance with missing-category normalization
- finalized Present/Absent attendance
- Parent visibility
- YouTube Unlisted limitations
- Bastly Spin eligibility
- Bastly Cards

`/contact` uses Bastly's real contact channels:

- WhatsApp / phone: `01000883609`
- Instagram: `@bastly.eduf`

No public contact form was added, which avoids creating a spam-prone endpoint when the
academy already handles enrollment/support through WhatsApp.

### PWA foundation

The existing manifest is upgraded and Bastly now includes:

- installable manifest
- home-screen shortcuts
- production service-worker registration
- static asset caching
- dedicated offline page
- install prompt for compatible browsers
- iOS Add to Home Screen guidance

Important security behavior:

- API responses are never cached by the service worker.
- navigation HTML is network-first
- private account pages are never intentionally served from a cached HTML shell while offline
- videos/assessment/account data still require connectivity

Test installability using a production build / preview rather than normal Vite dev mode.

### Build-time SEO output

`npm run build` now runs:

```text
vite build
node scripts/generate-static-seo.mjs
```

The SEO generator creates:

- route-specific static HTML **head shells** for public routes
- dynamic Doctor/Course head shells when the public API is reachable during the build
- `robots.txt`
- `sitemap.xml`
- canonical URLs
- Open Graph / Twitter metadata
- JSON-LD where available

If `VITE_SITE_URL` is absent or points to localhost, the generated build is intentionally
`noindex` and `robots.txt` disallows crawling. This prevents an accidental preview/dev build
from advertising localhost canonicals.

When the production domain is known, set:

```text
VITE_SITE_URL=https://your-canonical-domain.com
VITE_API_URL=https://your-render-api-domain.com/api
```

before the production build.

The generator can then include published Doctor and Course slugs in `sitemap.xml`.

This is intentionally an SEO **HTML-head prerender layer**, not fake full SSR. The final launch
SEO pass should verify the actual hosting behavior for `/route/index.html` and decide whether
to keep this static-shell approach or add full body prerender/SSR after the production domain
and hosting topology are locked.

### Security hardening

Production now:

- rejects state-changing API calls that omit `Origin`
- rejects state-changing API calls from any origin except `CLIENT_URL`
- keeps local Postman/curl testing possible in development
- applies `private, no-store` caching headers to Auth/Admin/Doctor/Student/Parent/Account/Notification APIs
- validates `CLIENT_URL`
- rejects short/default JWT secrets in production
- marks the auth cookie `HttpOnly`, `Secure` in production, `SameSite=Lax`, and high priority

Public API caching remains explicit on the public controllers.

### Next

Step 7 should be launch-focused rather than another large product feature:

1. Account/settings polish and remaining edge-case QA
2. Deploy frontend + API to the intended hosts
3. Configure canonical domain / API subdomain
4. Gmail production configuration + email verification
5. MongoDB production account/cluster ownership
6. Verify secure cookies/CORS/Origin on the real domains
7. Verify sitemap/robots/direct-route SEO shells on the real host
8. Decide full prerender/SSR based on the deployed routing behavior
9. PWA install/offline checks
10. performance/accessibility/mobile QA
11. Search Console + production launch checklist
