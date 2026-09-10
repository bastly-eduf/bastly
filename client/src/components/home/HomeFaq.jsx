import { Link } from 'react-router-dom';

import { homeFaqItems } from '../../data/faqData';

export default function HomeFaq() {
  return (
    <section
      className="bg-white py-20 lg:py-28"
      aria-labelledby="faq-home-title"
    >
      <div className="mx-auto grid w-[min(1100px,calc(100%-2rem))] gap-10 lg:w-[min(1100px,calc(100%-4rem))] lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
        <div>
          <p className="mb-3 text-[0.78rem] font-extrabold uppercase tracking-[0.12em] text-bastly-blue">
            Quick answers
          </p>
          <h2
            id="faq-home-title"
            className="mb-5 font-heading text-[clamp(2.4rem,5vw,4.4rem)] font-bold leading-[1.06] tracking-[-0.055em] text-bastly-navy"
          >
            A few things students usually ask.
          </h2>
          <p className="mb-5 max-w-[420px] leading-7 text-muted">
            Enrollment stays simple, and the full FAQ explains
            how access, assessments, tracking, parents, and
            rewards work.
          </p>
          <Link
            to="/faq"
            className="group inline-flex items-center gap-2 font-extrabold text-bastly-blue-dark no-underline"
          >
            View all FAQs
            <span
              className="transition group-hover:translate-x-1"
              aria-hidden="true"
            >
              →
            </span>
          </Link>
        </div>

        <div className="border-t border-line">
          {homeFaqItems.map((item, index) => (
            <details
              key={item.question}
              className="group border-b border-line"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 font-heading text-base font-bold text-bastly-navy marker:hidden sm:text-lg">
                <span>
                  <span className="mr-3 text-xs font-extrabold text-bastly-blue">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  {item.question}
                </span>
                <span className="grid size-8 shrink-0 place-items-center rounded-full bg-bastly-blue-soft text-bastly-blue transition group-open:rotate-45">
                  +
                </span>
              </summary>
              <p className="max-w-[760px] pb-5 pl-0 pr-12 text-sm leading-7 text-muted sm:pl-9">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
