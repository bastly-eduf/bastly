const gradeBands = [
  { label: 'Star', range: '90–100%', tone: 'bg-[#e8f4ff] text-bastly-blue-dark' },
  { label: 'A', range: '80–89%', tone: 'bg-[#eef8f1] text-[#18764a]' },
  { label: 'B', range: '70–79%', tone: 'bg-[#fff6df] text-[#9a6510]' },
  { label: 'C', range: 'Below 70%', tone: 'bg-[#fff0ef] text-[#a83d36]' },
];

export default function PerformancePreview() {
  return (
    <section
      className="overflow-hidden bg-bastly-blue-pale py-20 lg:py-28"
      aria-labelledby="performance-title"
    >
      <div className="mx-auto grid w-[min(1200px,calc(100%-2rem))] items-center gap-12 lg:w-[min(1200px,calc(100%-4rem))] lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
        <div className="relative">
          <div className="rounded-[30px] border border-bastly-navy/10 bg-white p-5 shadow-card sm:p-6">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="mb-1 text-[0.72rem] font-extrabold uppercase tracking-[0.09em] text-bastly-blue">
                  Weekly performance
                </p>
                <h3 className="mb-0 font-heading text-2xl font-bold tracking-[-0.04em] text-bastly-navy">
                  Biology O Level
                </h3>
              </div>

              <div className="rounded-2xl bg-bastly-blue-soft px-4 py-2 text-right">
                <p className="mb-0 text-[0.65rem] font-bold uppercase tracking-[0.08em] text-muted">
                  Overall
                </p>
                <p className="mb-0 font-heading text-xl font-bold text-bastly-blue-dark">
                  92% ⭐
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-bastly-navy p-5 text-white">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="mb-1 text-[0.68rem] font-extrabold uppercase tracking-[0.08em] text-[#82c8ff]">
                      Quiz performance
                    </p>
                    <p className="mb-0 font-heading text-3xl font-bold">94%</p>
                  </div>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white/80">
                    60% weight
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-[94%] rounded-full bg-[#72c0ff]" />
                </div>
              </div>

              <div className="rounded-3xl border border-line bg-surface p-5">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="mb-1 text-[0.68rem] font-extrabold uppercase tracking-[0.08em] text-bastly-blue">
                      Attendance
                    </p>
                    <p className="mb-0 font-heading text-3xl font-bold text-bastly-navy">88%</p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-muted shadow-soft">
                    40% weight
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-bastly-blue/10">
                  <div className="h-full w-[88%] rounded-full bg-bastly-blue" />
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-3xl border border-line bg-white p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="mb-1 text-[0.68rem] font-extrabold uppercase tracking-[0.08em] text-muted">
                    Recent weeks
                  </p>
                  <p className="mb-0 font-heading font-bold text-bastly-navy">Progress history</p>
                </div>
                <span className="text-xs font-extrabold text-[#18764a]">+8% ↑</span>
              </div>

              <div className="flex h-28 items-end gap-2 sm:gap-3">
                {[72, 78, 81, 85, 88, 92].map((value, index) => (
                  <div key={value} className="flex h-full flex-1 flex-col justify-end gap-2">
                    <div
                      className={[
                        'w-full rounded-t-xl',
                        index === 5 ? 'bg-bastly-blue' : 'bg-bastly-blue/20',
                      ].join(' ')}
                      style={{ height: `${value}%` }}
                    />
                    <span className="text-center text-[0.62rem] font-bold text-muted">
                      W{index + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-4">
              {gradeBands.map((band) => (
                <div key={band.label} className={`rounded-2xl px-3 py-3 ${band.tone}`}>
                  <p className="mb-1 font-heading text-lg font-bold">
                    {band.label === 'Star' ? '⭐ Star' : band.label}
                  </p>
                  <p className="mb-0 text-[0.68rem] font-bold opacity-75">{band.range}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="max-w-[560px]">
          <p className="mb-3 text-[0.78rem] font-extrabold uppercase tracking-[0.12em] text-bastly-blue">
            Track what matters
          </p>

          <h2
            id="performance-title"
            className="mb-5 font-heading text-[clamp(2.4rem,5vw,4.7rem)] leading-[1.06] font-bold tracking-[-0.055em] text-bastly-navy"
          >
            Progress everyone can actually understand.
          </h2>

          <p className="mb-7 text-base leading-7 text-muted">
            Bastly turns quiz grades and attendance into one clear weekly performance
            score, while still showing the details behind it.
          </p>

          <div className="grid gap-4">
            {[
              {
                title: 'Students',
                text: 'See every course rating, recent quiz result, attendance record, and reward status.',
              },
              {
                title: 'Parents',
                text: 'Open one secure account and follow each linked child without relying on weekly emails.',
              },
              {
                title: 'Doctors',
                text: 'See the tracking for students enrolled in their own courses and spot who may need attention.',
              },
            ].map((item) => (
              <div key={item.title} className="flex gap-4 rounded-2xl border border-bastly-navy/8 bg-white p-4 shadow-soft">
                <div className="grid size-10 shrink-0 place-items-center rounded-2xl bg-bastly-navy font-heading text-xs font-extrabold text-white">
                  {item.title.slice(0, 1)}
                </div>
                <div>
                  <h3 className="mb-1 font-heading font-bold text-bastly-navy">{item.title}</h3>
                  <p className="mb-0 text-sm leading-6 text-muted">{item.text}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-6 mb-0 rounded-2xl border border-bastly-blue/15 bg-bastly-blue-soft px-4 py-3 text-sm leading-6 text-bastly-navy">
            <strong>Rating formula:</strong> 60% quiz performance + 40% attendance.
            Star starts at 90%, then A at 80%, B at 70%, and C below 70%.
          </p>
        </div>
      </div>
    </section>
  );
}
