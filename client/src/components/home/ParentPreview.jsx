export default function ParentPreview() {
  return (
    <section className="bg-white py-20 lg:py-28" aria-labelledby="parent-title">
      <div className="mx-auto grid w-[min(1200px,calc(100%-2rem))] items-center gap-12 lg:w-[min(1200px,calc(100%-4rem))] lg:grid-cols-[1.08fr_0.92fr] lg:gap-20">
        <div className="relative order-2 lg:order-1">
          <div className="overflow-hidden rounded-[30px] border border-bastly-navy/10 bg-surface shadow-card">
            <div className="flex items-center justify-between border-b border-line bg-white px-5 py-4 sm:px-6">
              <div>
                <p className="mb-0 text-[0.68rem] font-extrabold uppercase tracking-[0.08em] text-muted">
                  Parent dashboard
                </p>
                <p className="mb-0 font-heading font-bold text-bastly-navy">Ahmed's progress</p>
              </div>

              <div className="flex rounded-full border border-line bg-surface p-1 text-xs font-extrabold">
                <span className="rounded-full bg-bastly-navy px-3 py-1.5 text-white">Ahmed</span>
                <span className="px-3 py-1.5 text-muted">Sara</span>
              </div>
            </div>

            <div className="grid gap-4 p-4 sm:p-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl bg-bastly-navy p-5 text-white sm:col-span-1">
                  <p className="mb-1 text-[0.68rem] font-extrabold uppercase tracking-[0.08em] text-[#82c8ff]">
                    Overall
                  </p>
                  <p className="mb-1 font-heading text-4xl font-bold">88%</p>
                  <p className="mb-0 text-sm text-white/65">A performance</p>
                </div>

                <div className="rounded-3xl border border-line bg-white p-5">
                  <p className="mb-2 text-[0.68rem] font-extrabold uppercase tracking-[0.08em] text-muted">
                    Quiz average
                  </p>
                  <p className="mb-1 font-heading text-3xl font-bold text-bastly-navy">91%</p>
                  <p className="mb-0 text-xs text-[#18764a]">Strong week ↑</p>
                </div>

                <div className="rounded-3xl border border-line bg-white p-5">
                  <p className="mb-2 text-[0.68rem] font-extrabold uppercase tracking-[0.08em] text-muted">
                    Attendance
                  </p>
                  <p className="mb-1 font-heading text-3xl font-bold text-bastly-navy">84%</p>
                  <p className="mb-0 text-xs text-muted">5 of 6 sessions</p>
                </div>
              </div>

              <div className="rounded-3xl border border-line bg-white p-5">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="mb-0 font-heading text-lg font-bold text-bastly-navy">
                    Courses
                  </h3>
                  <span className="text-xs font-extrabold text-bastly-blue">2 active</span>
                </div>

                <div className="grid gap-3">
                  {[
                    ['Biology O Level', '92%', '⭐ Star', '5 / 5 present'],
                    ['Physics IGCSE', '84%', 'A', '4 / 5 present'],
                  ].map(([course, score, band, attendance]) => (
                    <div
                      key={course}
                      className="grid items-center gap-3 rounded-2xl border border-line bg-surface p-3 sm:grid-cols-[1fr_auto_auto]"
                    >
                      <p className="mb-0 font-heading text-sm font-bold text-bastly-navy">{course}</p>
                      <div className="flex items-center gap-2">
                        <span className="font-heading text-sm font-bold text-bastly-blue-dark">{score}</span>
                        <span className="rounded-full bg-white px-2 py-1 text-[0.65rem] font-extrabold text-bastly-navy shadow-soft">
                          {band}
                        </span>
                      </div>
                      <p className="mb-0 text-xs text-muted">{attendance}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-line bg-white p-5">
                <p className="mb-3 text-[0.68rem] font-extrabold uppercase tracking-[0.08em] text-muted">
                  Recent activity
                </p>

                <div className="grid gap-3">
                  <div className="flex gap-3">
                    <span className="mt-1 size-2 shrink-0 rounded-full bg-bastly-blue" />
                    <div>
                      <p className="mb-0 text-sm font-bold text-bastly-navy">Biology quiz — 18/20</p>
                      <p className="mb-0 text-xs text-muted">Today</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="mt-1 size-2 shrink-0 rounded-full bg-[#18764a]" />
                    <div>
                      <p className="mb-0 text-sm font-bold text-bastly-navy">Physics session — Present</p>
                      <p className="mb-0 text-xs text-muted">Yesterday</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="order-1 max-w-[560px] lg:order-2">
          <p className="mb-3 text-[0.78rem] font-extrabold uppercase tracking-[0.12em] text-bastly-blue">
            For parents
          </p>

          <h2
            id="parent-title"
            className="mb-5 font-heading text-[clamp(2.4rem,5vw,4.7rem)] leading-[1.06] font-bold tracking-[-0.055em] text-bastly-navy"
          >
            Stay informed without chasing updates.
          </h2>

          <p className="mb-7 text-base leading-7 text-muted">
            Parents get their own secure Bastly account where they can follow quiz
            performance, attendance, weekly ratings, and every linked child.
          </p>

          <div className="grid gap-4">
            {[
              ['One account for the family', 'Switch between linked children without creating duplicate parent accounts.'],
              ['Clear weekly tracking', 'See the percentage, grade band, quizzes, and attendance behind each result.'],
              ['Private by design', 'Parents only see students securely linked to their account.'],
            ].map(([title, text]) => (
              <div key={title} className="flex gap-4">
                <span className="mt-1 grid size-8 shrink-0 place-items-center rounded-xl bg-bastly-blue-soft text-sm font-extrabold text-bastly-blue">
                  ✓
                </span>
                <div>
                  <h3 className="mb-1 font-heading font-bold text-bastly-navy">{title}</h3>
                  <p className="mb-0 text-sm leading-6 text-muted">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
