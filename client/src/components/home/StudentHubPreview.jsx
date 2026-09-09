import { Link } from 'react-router-dom';

const miniCourses = [
  { title: 'Biology O Level', doctor: 'Dr. Radwa Antar', progress: 'Next: Cell division' },
  { title: 'Physics IGCSE', doctor: 'Dr. Mohamed Emad', progress: 'Next: Motion & forces' },
];

export default function StudentHubPreview() {
  return (
    <section className="overflow-hidden bg-white py-20 lg:py-28" aria-labelledby="student-hub-title">
      <div className="mx-auto grid w-[min(1200px,calc(100%-2rem))] items-center gap-12 lg:w-[min(1200px,calc(100%-4rem))] lg:grid-cols-[0.88fr_1.12fr] lg:gap-20">
        <div className="max-w-[580px]">
          <p className="mb-3 text-[0.78rem] font-extrabold uppercase tracking-[0.12em] text-bastly-blue">
            Your learning hub
          </p>

          <h2
            id="student-hub-title"
            className="mb-5 font-heading text-[clamp(2.4rem,5vw,4.7rem)] leading-[1.06] font-bold tracking-[-0.055em] text-bastly-navy"
          >
            Everything you need, without digging through chats.
          </h2>

          <p className="mb-7 max-w-[540px] text-base leading-7 text-muted">
            Courses, lessons, quizzes, homework, attendance, results, and rewards all
            live inside one student-friendly dashboard.
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ['Lessons & videos', 'Open what your doctor has published and keep your course organised.'],
              ['Quizzes & homework', 'Take one-attempt quizzes and unlimited practice homework in the same place.'],
              ['Weekly performance', 'See your quiz and attendance rating without waiting for a report.'],
              ['Bastly rewards', 'Earn a spin when you hit Star across the required quizzes.'],
            ].map(([title, text]) => (
              <div key={title} className="rounded-2xl border border-line bg-surface p-4">
                <div className="mb-3 grid size-9 place-items-center rounded-xl bg-bastly-blue-soft text-bastly-blue">
                  <span className="size-2 rounded-full bg-current" />
                </div>
                <h3 className="mb-1.5 font-heading text-[0.95rem] font-bold text-bastly-navy">
                  {title}
                </h3>
                <p className="mb-0 text-[0.8rem] leading-6 text-muted">{text}</p>
              </div>
            ))}
          </div>

          <Link
            to="/register"
            className="mt-7 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-bastly-navy px-5 text-sm font-extrabold text-white no-underline transition hover:-translate-y-0.5 hover:bg-bastly-blue-dark"
          >
            Join Bastly <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="relative">
          <div className="absolute -top-10 -right-10 size-44 rounded-full bg-bastly-blue-soft blur-2xl" aria-hidden="true" />
          <div className="absolute -bottom-12 -left-8 size-40 rounded-full bg-bastly-blue/10 blur-2xl" aria-hidden="true" />

          <div className="relative overflow-hidden rounded-[30px] border border-bastly-navy/10 bg-[#f6f9fc] shadow-[0_26px_70px_rgba(6,31,73,0.16)]">
            <div className="flex items-center justify-between border-b border-line bg-white px-5 py-4 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center overflow-hidden rounded-xl bg-white shadow-soft">
                  <img src="/brand/bastly-logo.webp" alt="" className="size-full object-contain" />
                </div>
                <div>
                  <p className="mb-0 text-[0.7rem] font-bold uppercase tracking-[0.08em] text-muted">
                    Student dashboard
                  </p>
                  <p className="mb-0 font-heading text-sm font-bold text-bastly-navy">
                    Good evening, Youssef 👋
                  </p>
                </div>
              </div>

              <div className="hidden items-center gap-2 sm:flex">
                <span className="grid size-9 place-items-center rounded-full border border-line bg-white text-sm">
                  🔔
                </span>
                <span className="grid size-9 place-items-center rounded-full bg-bastly-navy font-heading text-xs font-extrabold text-white">
                  YK
                </span>
              </div>
            </div>

            <div className="grid gap-4 p-4 sm:p-6">
              <div className="grid gap-4 sm:grid-cols-[1.25fr_0.75fr]">
                <div className="rounded-3xl bg-bastly-navy p-5 text-white">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="mb-2 text-[0.7rem] font-extrabold uppercase tracking-[0.1em] text-[#88cbff]">
                        Your week
                      </p>
                      <p className="mb-1 font-heading text-4xl font-bold tracking-[-0.05em]">92%</p>
                      <p className="mb-0 text-sm text-white/70">⭐ Star performance</p>
                    </div>

                    <div className="grid size-14 place-items-center rounded-2xl border border-white/10 bg-white/5 text-2xl">
                      ⭐
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-white/7 p-3">
                      <p className="mb-1 text-[0.65rem] uppercase tracking-[0.08em] text-white/50">Quiz avg.</p>
                      <p className="mb-0 font-heading text-lg font-bold">94%</p>
                    </div>
                    <div className="rounded-2xl bg-white/7 p-3">
                      <p className="mb-1 text-[0.65rem] uppercase tracking-[0.08em] text-white/50">Attendance</p>
                      <p className="mb-0 font-heading text-lg font-bold">88%</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-3xl border border-line bg-white p-5">
                  <p className="mb-2 text-[0.7rem] font-extrabold uppercase tracking-[0.08em] text-bastly-blue">
                    Reward
                  </p>
                  <p className="mb-1 font-heading text-xl font-bold tracking-[-0.035em] text-bastly-navy">
                    1 Bastly Spin
                  </p>
                  <p className="mb-4 text-xs leading-5 text-muted">
                    All required quizzes hit Star this week.
                  </p>
                  <button
                    type="button"
                    tabIndex="-1"
                    className="inline-flex min-h-10 w-full items-center justify-center rounded-full bg-bastly-blue text-xs font-extrabold text-white"
                  >
                    Spin & win 🎡
                  </button>
                </div>
              </div>

              <div className="rounded-3xl border border-line bg-white p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="mb-1 text-[0.7rem] font-extrabold uppercase tracking-[0.08em] text-muted">
                      My courses
                    </p>
                    <h3 className="mb-0 font-heading text-lg font-bold text-bastly-navy">
                      Keep going
                    </h3>
                  </div>
                  <span className="text-xs font-extrabold text-bastly-blue">2 active</span>
                </div>

                <div className="grid gap-3">
                  {miniCourses.map((course, index) => (
                    <div
                      key={course.title}
                      className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-3"
                    >
                      <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-bastly-blue-soft font-heading text-sm font-extrabold text-bastly-blue">
                        {index === 0 ? 'BIO' : 'PHY'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="mb-0 truncate font-heading text-sm font-bold text-bastly-navy">
                          {course.title}
                        </p>
                        <p className="mb-0 truncate text-[0.7rem] text-muted">{course.doctor}</p>
                      </div>
                      <p className="hidden max-w-[145px] text-right text-[0.68rem] leading-5 text-muted sm:block">
                        {course.progress}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-line bg-white p-5">
                  <p className="mb-2 text-[0.7rem] font-extrabold uppercase tracking-[0.08em] text-muted">
                    Next quiz
                  </p>
                  <p className="mb-1 font-heading font-bold text-bastly-navy">Cell Biology Quiz</p>
                  <p className="mb-0 text-xs text-muted">Thursday · 8:00 PM · 1 attempt</p>
                </div>

                <div className="rounded-3xl border border-line bg-white p-5">
                  <p className="mb-2 text-[0.7rem] font-extrabold uppercase tracking-[0.08em] text-muted">
                    Homework
                  </p>
                  <p className="mb-1 font-heading font-bold text-bastly-navy">Motion Practice</p>
                  <p className="mb-0 text-xs text-muted">Unlimited attempts · Keep practicing</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
