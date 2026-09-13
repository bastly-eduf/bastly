import { Gift, RotateCw, Star } from 'lucide-react';

const eligibility = [
  { value: '90%+', label: 'Star score' },
  { value: 'All', label: 'required quizzes' },
  { value: '1', label: 'spin / week' },
];

const journey = [
  [Star, 'Hit every Star', '90%+ on every required quiz'],
  [RotateCw, 'Take one spin', 'One eligible spin each week'],
  [Gift, 'Unlock a card', 'Reward saved in your account'],
];

export default function RewardsPreview() {
  return (
    <section
      className="relative overflow-hidden bg-bastly-navy py-12 text-white lg:py-16"
      aria-labelledby="rewards-title"
    >
      <div
        className="pointer-events-none absolute -top-36 -right-28 size-[360px] rounded-full border border-white/5"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto w-[min(1050px,calc(100%-2rem))] lg:w-[min(1050px,calc(100%-4rem))]">
        <div className="mb-6 grid items-end gap-3 lg:mb-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
          <div>
            <p className="mb-2 text-[0.74rem] font-extrabold uppercase tracking-[0.12em] text-[#82c8ff]">
              Bastly Cards
            </p>
            <h2
              id="rewards-title"
              className="max-w-[560px] font-heading text-[clamp(2.15rem,4.3vw,4rem)] leading-[1.03] font-bold tracking-[-0.06em] text-white"
            >
              Earn the Star. Unlock the spin.
            </h2>
          </div>

          <p className="mb-0 max-w-[600px] text-sm leading-6 text-white/65 sm:text-base sm:leading-7">
            Star every required quiz in the reward period to unlock one weekly spin.
            The result is chosen securely and saved to your account.
          </p>
        </div>

        <div className="overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.05] shadow-[0_22px_60px_rgba(0,0,0,0.16)]">
          <div className="grid gap-4 p-4 sm:p-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-8 lg:p-7">
            <div>
              <div className="grid grid-cols-3 gap-2">
                {eligibility.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-white/10 bg-[#071d43]/75 p-3"
                  >
                    <p className="mb-1 font-heading text-[clamp(1.1rem,4vw,1.75rem)] font-bold text-[#82c8ff]">
                      {item.value}
                    </p>
                    <p className="mb-0 text-[0.58rem] leading-4 text-white/55 sm:text-[0.68rem]">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex items-start gap-3 rounded-[18px] border border-white/10 bg-[#041838]/72 p-3.5 sm:mt-4 sm:p-4">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-bastly-blue/15 text-[#82c8ff]">
                  <Star size={17} fill="currentColor" aria-hidden="true" />
                </span>
                <div>
                  <p className="mb-1 font-heading text-xs font-bold text-white sm:text-sm">
                    Every required quiz must reach Star.
                  </p>
                  <p className="mb-0 text-[0.66rem] leading-5 text-white/52 sm:text-xs">
                    Homework and attendance still count toward weekly performance.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative mx-auto flex min-h-[190px] w-full max-w-[330px] items-center justify-center sm:min-h-[230px] lg:min-h-[270px]">
              <div className="relative aspect-square w-[170px] sm:w-[215px] lg:w-[245px]">
                <div
                  className="absolute inset-[4%] rounded-full border border-white/10 bg-white/[0.025]"
                  aria-hidden="true"
                />

                <div
                  className="absolute inset-[11%] rounded-full border-[8px] border-white bg-[conic-gradient(from_-22.5deg,#237fd1_0_45deg,#d9efff_45deg_90deg,#0a2a5c_90deg_135deg,#72bfff_135deg_180deg,#1766b0_180deg_225deg,#f8fbff_225deg_270deg,#397fd0_270deg_315deg,#a7d9ff_315deg_360deg)] shadow-[0_20px_48px_rgba(0,0,0,0.22)] transition-transform duration-700 hover:rotate-[5deg]"
                  aria-hidden="true"
                />

                <div
                  className="absolute left-1/2 top-1/2 grid size-[27%] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-[5px] border-white bg-bastly-navy text-center shadow-xl"
                  aria-hidden="true"
                >
                  <span className="font-heading text-[0.52rem] font-extrabold leading-tight text-white sm:text-[0.62rem] lg:text-[0.7rem]">
                    BASTLY
                    <br />
                    SPIN
                  </span>
                </div>

                <div
                  className="absolute left-1/2 top-[2%] -translate-x-1/2 drop-shadow-lg"
                  aria-hidden="true"
                >
                  <div className="h-0 w-0 border-x-[9px] border-t-[18px] border-x-transparent border-t-white sm:border-x-[10px] sm:border-t-[20px]" />
                </div>

                <div className="absolute -right-[20%] bottom-[2%] w-[65%] rotate-2 rounded-[16px] border border-white/20 bg-white p-2.5 text-bastly-navy shadow-[0_14px_36px_rgba(0,0,0,0.20)] sm:-right-[24%] sm:w-[62%] sm:p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="grid size-7 place-items-center rounded-lg bg-bastly-blue-soft text-bastly-blue-dark">
                      <Gift size={14} aria-hidden="true" />
                    </span>
                    <span className="rounded-full bg-bastly-blue-soft px-1.5 py-1 text-[0.42rem] font-extrabold uppercase tracking-[0.04em] text-bastly-blue-dark sm:text-[0.46rem]">
                      Bastly Card
                    </span>
                  </div>
                  <p className="mb-1 text-[0.44rem] font-extrabold uppercase tracking-[0.07em] text-muted sm:text-[0.48rem]">
                    Partner reward
                  </p>
                  <p className="mb-1 font-heading text-[0.68rem] font-bold leading-tight sm:text-xs lg:text-sm">
                    Your reward appears here.
                  </p>
                  <p className="mb-0 text-[0.46rem] leading-3 text-muted sm:text-[0.54rem] sm:leading-4">
                    Revealed after your eligible spin.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 border-t border-white/10 bg-[#041838]/50">
            {journey.map(([Icon, title, text], index) => (
              <div
                key={title}
                className={[
                  'flex min-w-0 flex-col items-center gap-2 px-2 py-3 text-center sm:flex-row sm:items-start sm:gap-3 sm:px-4 sm:py-4 sm:text-left',
                  index < journey.length - 1 ? 'border-r border-white/10' : '',
                ].join(' ')}
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-white/[0.07] text-[#82c8ff] sm:size-9">
                  <Icon size={15} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="mb-0 font-heading text-[0.62rem] font-bold leading-4 text-white sm:mb-1 sm:text-xs lg:text-sm">
                    {title}
                  </p>
                  <p className="mb-0 hidden text-[0.64rem] leading-5 text-white/48 sm:block lg:text-xs">
                    {text}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
