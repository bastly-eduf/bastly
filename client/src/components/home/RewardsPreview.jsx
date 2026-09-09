const sampleRewards = [
  {
    partner: 'LOCAL BITE',
    offer: '20% OFF',
    detail: 'Food & beverage',
    accent: 'from-[#55a8ff] to-[#237fd1]',
  },
  {
    partner: 'BREW CLUB',
    offer: 'FREE DRINK',
    detail: 'Café reward',
    accent: 'from-[#7bc5ff] to-[#3978d4]',
  },
  {
    partner: 'URBAN',
    offer: '15% OFF',
    detail: 'Local partner',
    accent: 'from-[#3d82c6] to-[#0a2a5c]',
  },
];

export default function RewardsPreview() {
  return (
    <section
      className="relative overflow-hidden bg-bastly-navy py-20 text-white lg:py-28"
      aria-labelledby="rewards-title"
    >
      <div
        className="pointer-events-none absolute -top-32 -right-28 size-[380px] rounded-full border border-white/5"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute top-1/2 -left-28 size-72 rounded-full bg-bastly-blue/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto grid w-[min(1200px,calc(100%-2rem))] items-center gap-12 lg:w-[min(1200px,calc(100%-4rem))] lg:grid-cols-[0.92fr_1.08fr] lg:gap-20">
        <div className="max-w-[580px]">
          <p className="mb-3 text-[0.78rem] font-extrabold uppercase tracking-[0.12em] text-[#82c8ff]">
            Bastly Cards
          </p>

          <h2
            id="rewards-title"
            className="mb-5 font-heading text-[clamp(2.5rem,5vw,4.9rem)] leading-[1.03] font-bold tracking-[-0.06em] text-white"
          >
            All Stars? Take a spin.
          </h2>

          <p className="mb-7 max-w-[540px] text-base leading-7 text-white/70">
            Hit Star on every required quiz in the reward period and Bastly can unlock
            a spin for partner cards across food, drinks, and local brands.
          </p>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="mb-1 font-heading text-2xl font-bold text-[#82c8ff]">90%+</p>
              <p className="mb-0 text-xs leading-5 text-white/60">Star quiz score</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="mb-1 font-heading text-2xl font-bold text-[#82c8ff]">All</p>
              <p className="mb-0 text-xs leading-5 text-white/60">required quizzes</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="mb-1 font-heading text-2xl font-bold text-[#82c8ff]">1</p>
              <p className="mb-0 text-xs leading-5 text-white/60">weekly spin max</p>
            </div>
          </div>
        </div>

        <div className="relative min-h-[500px]">
          <div className="absolute left-1/2 top-1/2 size-[390px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/10 bg-white/[0.025] max-sm:size-[320px]" />

          <div className="absolute left-1/2 top-1/2 grid size-[290px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-[14px] border-white bg-[conic-gradient(from_0deg,#237fd1_0_45deg,#eaf5fd_45deg_90deg,#0a2a5c_90deg_135deg,#71bfff_135deg_180deg,#1766b0_180deg_225deg,#ffffff_225deg_270deg,#237fd1_270deg_315deg,#a5d8ff_315deg_360deg)] shadow-[0_26px_80px_rgba(0,0,0,0.28)] max-sm:size-[235px]">
            <div className="grid size-24 place-items-center rounded-full border-8 border-white bg-bastly-navy text-center shadow-xl max-sm:size-20">
              <span className="font-heading text-sm font-extrabold leading-4 text-white">
                BASTLY
                <br />
                SPIN
              </span>
            </div>

            <div className="absolute -top-7 left-1/2 -translate-x-1/2">
              <div className="h-0 w-0 border-x-[13px] border-t-[26px] border-x-transparent border-t-white" />
            </div>
          </div>

          <div className="absolute right-0 top-2 w-[220px] rotate-3 rounded-[24px] border border-white/15 bg-white p-4 text-bastly-navy shadow-[0_20px_55px_rgba(0,0,0,0.18)] sm:right-4">
            <div className="mb-4 flex items-center justify-between">
              <img src="/brand/bastly-logo.webp" alt="" className="size-10 rounded-xl object-contain" />
              <span className="rounded-full bg-bastly-blue-soft px-2.5 py-1 text-[0.62rem] font-extrabold uppercase text-bastly-blue-dark">
                Bastly Card
              </span>
            </div>
            <p className="mb-1 text-[0.65rem] font-extrabold uppercase tracking-[0.08em] text-muted">
              Partner reward
            </p>
            <p className="mb-1 font-heading text-2xl font-bold">20% OFF</p>
            <p className="mb-0 text-xs text-muted">at a Bastly local partner</p>
          </div>

          <div className="absolute bottom-0 left-0 grid w-full gap-2 sm:left-3 sm:w-[245px]">
            {sampleRewards.map((reward) => (
              <div
                key={reward.partner}
                className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.07] p-3 backdrop-blur-md"
              >
                <div className={`size-10 shrink-0 rounded-xl bg-gradient-to-br ${reward.accent}`} />
                <div className="min-w-0 flex-1">
                  <p className="mb-0 truncate text-[0.65rem] font-extrabold tracking-[0.08em] text-white/50">
                    {reward.partner}
                  </p>
                  <p className="mb-0 truncate font-heading text-sm font-bold text-white">{reward.offer}</p>
                </div>
                <span className="text-[0.65rem] text-white/45">{reward.detail}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
