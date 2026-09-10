# Bastly Step 7G — authorization and access-integrity hardening

This patch was prepared against `main` after Step 7F (`e1fe26d`). It focuses on server-side ownership boundaries and time-bounded enrollment access. No owner secrets or new dependencies are required.

## Fixed in this step

- Added one shared definition for current enrollment access and week-overlap access.
- Student direct course/lesson/assessment access now also respects `accessStartDate`, not only `accessEndDate`.
- Parent current-course views require an active ParentRelationship, an active student, an active+paid enrollment inside its access window, and a published course.
- Parent summaries no longer expose draft-course data through an otherwise active enrollment.
- Doctor "active student" counts/lists now mean active + paid + currently inside the enrollment access window. Expired records stay in MongoDB but stop appearing as current students.
- Doctor lesson editing verifies that the Lesson → Module → Course chain is internally consistent before applying an update.
- Attendance creation requires an active group. Attendance-session access verifies Session → Group → Course consistency.
- Weekly doctor/student/parent performance only includes enrollments whose access period overlaps the requested week.
- Payment activation re-validates the student/course/group at the moment payment is confirmed, refuses archived/draft courses, refuses already-ended course access periods, and requires an explicit amount when the public course price is not confirmed.
- Invalid Mongoose ObjectId casts return a controlled 400 rather than surfacing as a 500/log-noise path.

## Deliberately preserved

- Unregistering an enrollment still preserves the enrollment, attempts, attendance, progress, audit history, and rewards in the database.
- Finalized attendance remains editable by the owning Doctor for legitimate corrections. `finalizedAt` is refreshed when a correction is saved.
- Archived courses remain inaccessible through current Doctor/Student/Parent course routes, matching the existing behavior.
- Multiple group enrollments for the same student/course remain an operational possibility because the current unique key is `(student, course, group)`. Do not change this until Bastly decides whether group transfer history or one-group-per-course is the desired rule.

## Manual authorization QA after applying

Use test accounts/data only. Do not paste cookies or tokens into chat.

1. Doctor A: copy a Course/Module/Lesson/AttendanceSession ID belonging to Doctor B and try the corresponding Doctor route. Expect 403/404 and no foreign data.
2. Student A: copy a Course/Lesson/Assessment ID from Student B's only course. Expect 403/404 unless Student A independently has current paid access to that same course.
3. Expire Student A's test enrollment (or use an already-expired test record), then verify course, lesson, assessment, and parent current-course detail are blocked.
4. Parent A: request Parent B's child ID. Expect 403. Then request a linked child's expired/unpublished course. Expect 404.
5. Attendance: try creating a session for an inactive group. Expect 404. Try a foreign Doctor's session ID. Expect 404.
6. Payment: try confirming a stale pending enrollment whose group was deactivated, course archived/draft, student disabled, or course end date already passed. Expect 400.
7. For a course with `priceConfirmed: false`, omit `pricePaid` during payment confirmation. Expect 400; supplying the actual amount should work.
8. Confirm normal active Student, Parent, Doctor, and Admin flows still work.
9. Run `npm run build`.

## Remaining pre-launch work

Step 7H should be end-to-end QA rather than another broad feature build: exercise each role with two-account IDOR tests, concurrent quiz/spin/reward requests, auth recovery/invitation replay, notification ownership, R2 media once owner credentials exist, and production-like no-cache/header checks. Deployment remains paused until those checks are clean.
