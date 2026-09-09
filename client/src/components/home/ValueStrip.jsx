const values = [
  {
    key: 'instructors',
    value: '18',
    label: 'Expert instructors',
    detail: 'Different subjects, levels, and learning styles.',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 19.2V18a4 4 0 0 1 4-4h3a4 4 0 0 1 4 4v1.2M9.5 11A3.5 3.5 0 1 0 9.5 4a3.5 3.5 0 0 0 0 7ZM16 5.5h4M18 3.5v4" />
      </svg>
    ),
  },
  {
    key: 'practice',
    value: 'Quiz + Homework',
    label: 'Practice that sticks',
    detail: 'MCQ and True/False built right into your course.',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 3.5h10.5L20 7v13.5H6zM16.5 3.5V7H20M9 11h8M9 14.5h8M9 18h5" />
      </svg>
    ),
  },
  {
    key: 'tracking',
    value: 'Live Progress',
    label: 'Parents stay in the loop',
    detail: 'Quiz grades, attendance, and weekly performance in one place.',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 19.5h16M6.5 16V11M11.5 16V6.5M16.5 16V9M20 4l-4.2 4.2-3-2.2L8 10.5" />
      </svg>
    ),
  },
  {
    key: 'rewards',
    value: 'Bastly Cards',
    label: 'Good work gets rewarded',
    detail: 'Earn spins through strong quiz performance and unlock partner rewards.',
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 7.5h16v11H4zM4 11h16M8 7.5c-1.8 0-3-1-3-2.2C5 4 6 3.2 7.2 3.2 9.2 3.2 12 7.5 12 7.5S10.2 3.2 8 3.2M16 7.5c1.8 0 3-1 3-2.2C19 4 18 3.2 16.8 3.2 14.8 3.2 12 7.5 12 7.5v11" />
      </svg>
    ),
  },
];

export default function ValueStrip() {
  return (
    <section className="relative z-10 border-b border-line bg-white" aria-label="Why students choose Bastly">
      <div className="mx-auto grid w-[min(1200px,calc(100%-2rem))] grid-cols-1 md:grid-cols-2 lg:w-[min(1200px,calc(100%-4rem))] xl:grid-cols-4">
        {values.map((item, index) => (
          <article
            key={item.key}
            className={[
              'grid min-w-0 grid-cols-[auto_1fr] items-start gap-3.5 py-5 md:px-6',
              index > 0 ? 'border-t border-line md:border-t-0' : '',
              index % 2 === 1 ? 'md:border-l md:border-line' : '',
              index >= 2 ? 'md:border-t md:border-line xl:border-t-0' : '',
              index > 0 ? 'xl:border-l xl:border-line' : '',
            ].join(' ')}
          >
            <div className="grid size-[42px] place-items-center rounded-[13px] bg-bastly-blue-pale text-bastly-blue">
              <div className="[&_svg]:size-[23px] [&_svg]:fill-none [&_svg]:stroke-current [&_svg]:stroke-[1.7] [&_svg]:[stroke-linecap:round] [&_svg]:[stroke-linejoin:round]">
                {item.icon}
              </div>
            </div>

            <div className="min-w-0">
              <p className="mb-0.5 font-heading text-[0.78rem] font-extrabold tracking-[0.025em] text-bastly-blue">
                {item.value}
              </p>
              <h2 className="mb-1 font-heading text-[0.98rem] font-bold tracking-[-0.02em] text-bastly-navy">
                {item.label}
              </h2>
              <p className="mb-0 text-[0.8rem] leading-[1.55] text-muted">
                {item.detail}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
