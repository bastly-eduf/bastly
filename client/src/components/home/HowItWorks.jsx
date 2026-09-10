import { Link } from 'react-router-dom';

import { bastlyWhatsAppUrl } from '../../config/publicConfig';

const steps = [
  {
    number: '01',
    title: 'Choose your course',
    text: 'Browse subjects, levels, and instructors to find the course that fits what you need.',
  },
  {
    number: '02',
    title: 'Enroll on WhatsApp',
    text: 'Tap enroll and Bastly opens WhatsApp with the course details ready for you.',
  },
  {
    number: '03',
    title: 'Bastly unlocks access',
    text: 'Once your payment is confirmed, your course appears inside your student account.',
  },
  {
    number: '04',
    title: 'Learn, practice, progress',
    text: 'Watch lessons, complete quizzes and homework, track attendance, and build your Bastly rating.',
  },
];

const whatsappMessage =
  'Hi Bastly Academy, I would like to ask about enrolling in one of your courses.';

export default function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden bg-[radial-gradient(circle_at_85%_15%,rgba(35,127,209,0.28),transparent_28%),radial-gradient(circle_at_10%_90%,rgba(35,127,209,0.13),transparent_25%)] bg-bastly-navy py-20 text-white/75 lg:py-28"
      aria-labelledby="how-it-works-title"
    >
      <div className="pointer-events-none absolute -top-[180px] -right-[160px] size-[420px] rounded-full border border-white/5" />

      <div className="mx-auto w-[min(1200px,calc(100%-2rem))] lg:w-[min(1200px,calc(100%-4rem))]">
        <div className="relative z-10 mb-12 grid items-end gap-4 lg:mb-16 lg:grid-cols-[1.25fr_0.75fr] lg:gap-20">
          <div>
            <p className="mb-3 text-[0.78rem] font-extrabold uppercase tracking-[0.12em] text-[#80c7ff]">
              How Bastly works
            </p>
            <h2
              id="how-it-works-title"
              className="max-w-[760px] font-heading text-[clamp(2.4rem,5vw,4.7rem)] leading-[1.08] font-bold tracking-[-0.055em] text-white"
            >
              From choosing a course to actually learning.
            </h2>
          </div>

          <div className="max-w-[650px]">
            <p className="mb-4 leading-7">
              No complicated checkout flow. Pick your course, complete enrollment with
              Bastly, then everything academic lives inside your account.
            </p>

            <a
              href={bastlyWhatsAppUrl(whatsappMessage)}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-2 font-extrabold text-white underline decoration-white/40 underline-offset-4"
            >
              Ask Bastly on WhatsApp
              <span className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true">↗</span>
            </a>
          </div>
        </div>

        <ol className="relative z-10 m-0 grid list-none gap-10 p-0 md:grid-cols-2 lg:grid-cols-4 lg:gap-0">
          {steps.map((step, index) => (
            <li className="min-w-0 lg:pr-8" key={step.number}>
              <div className="mb-5 flex items-center">
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl border border-[#80c7ff]/35 bg-bastly-blue/10 font-heading text-[0.78rem] font-extrabold text-[#80c7ff]">
                  {step.number}
                </span>
                {index < steps.length - 1 && (
                  <span
                    className="ml-3 hidden h-px flex-1 bg-gradient-to-r from-[#80c7ff]/50 to-[#80c7ff]/5 lg:block"
                    aria-hidden="true"
                  />
                )}
              </div>

              <h3 className="mb-2 font-heading text-[clamp(1.2rem,2vw,1.6rem)] font-bold tracking-[-0.035em] text-white">
                {step.title}
              </h3>
              <p className="mb-0 max-w-[250px] text-sm leading-7">{step.text}</p>
            </li>
          ))}
        </ol>

        <div className="relative z-10 mt-12 flex flex-col items-stretch justify-between gap-6 border-t border-white/10 pt-6 md:mt-16 md:flex-row md:items-center lg:mt-20">
          <div>
            <p className="mb-1 font-heading font-bold text-white">Already enrolled?</p>
            <p className="mb-0 text-sm leading-6">
              Jump straight back into your courses, quizzes, homework, and progress.
            </p>
          </div>

          <Link
            to="/login"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-white px-4 text-[0.8rem] font-extrabold text-bastly-navy no-underline transition hover:-translate-y-0.5 hover:bg-bastly-blue-soft"
          >
            Log in to Bastly <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
