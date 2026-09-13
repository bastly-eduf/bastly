import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

import { bastlyWhatsAppUrl } from '../../config/publicConfig';

const steps = [
  {
    number: '01',
    short: 'Choose',
    title: 'Choose your course',
    text: 'Browse subjects, levels, and instructors to find the course that fits what you need.',
  },
  {
    number: '02',
    short: 'Enroll',
    title: 'Enroll on WhatsApp',
    text: 'Tap enroll and Bastly opens WhatsApp with the course details ready for you.',
  },
  {
    number: '03',
    short: 'Unlock',
    title: 'Bastly unlocks access',
    text: 'Once your payment is confirmed, your course appears inside your student account.',
  },
  {
    number: '04',
    short: 'Learn',
    title: 'Learn, practice, progress',
    text: 'Watch lessons, complete quizzes and homework, track attendance, and build your Bastly rating.',
  },
];

const whatsappMessage =
  'Hi Bastly Academy, I would like to ask about enrolling in one of your courses.';

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(0);
  const stepRefs = useRef([]);
  const step = steps[activeStep];
  const progress = (activeStep / (steps.length - 1)) * 100;

  const activateStep = (index, shouldFocus = false) => {
    const nextIndex = Math.min(Math.max(index, 0), steps.length - 1);
    setActiveStep(nextIndex);

    if (shouldFocus) {
      window.requestAnimationFrame(() => stepRefs.current[nextIndex]?.focus());
    }
  };

  const handleStepKeyDown = (event, index) => {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      activateStep(index + 1 >= steps.length ? 0 : index + 1, true);
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      activateStep(index - 1 < 0 ? steps.length - 1 : index - 1, true);
    }

    if (event.key === 'Home') {
      event.preventDefault();
      activateStep(0, true);
    }

    if (event.key === 'End') {
      event.preventDefault();
      activateStep(steps.length - 1, true);
    }
  };

  return (
    <section
      id="how-it-works"
      className="relative overflow-hidden bg-bastly-navy py-16 text-white lg:py-20"
      aria-labelledby="how-it-works-title"
    >
      <div
        className="pointer-events-none absolute -top-36 right-[-120px] size-[360px] rounded-full border border-white/5"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto w-[min(1050px,calc(100%-2rem))] lg:w-[min(1050px,calc(100%-4rem))]">
        <div className="mb-8 text-center lg:mb-10">
          <p className="mb-3 text-[0.78rem] font-extrabold uppercase tracking-[0.12em] text-[#80c7ff]">
            How Bastly works
          </p>
          <h2
            id="how-it-works-title"
            className="mx-auto max-w-[760px] font-heading text-[clamp(2.25rem,4.8vw,4.1rem)] leading-[1.06] font-bold tracking-[-0.055em] text-white"
          >
            From choosing a course to actually learning.
          </h2>
        </div>

        <div className="rounded-[30px] border border-white/10 bg-white/[0.055] p-4 shadow-[0_24px_70px_rgba(0,0,0,0.18)] backdrop-blur-sm sm:p-6 lg:p-8">
          <div
            role="tablist"
            aria-label="Bastly enrollment steps"
            className="relative mb-7 grid grid-cols-4 sm:mb-9"
          >
            <div
              className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-[22px] h-[3px] overflow-hidden rounded-full bg-white/10 sm:top-[24px]"
              aria-hidden="true"
            >
              <span
                className="block h-full rounded-full bg-gradient-to-r from-[#80c7ff] via-bastly-blue to-[#4c9be4] transition-[width] duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            {steps.map((item, index) => {
              const active = index === activeStep;
              const completed = index < activeStep;

              return (
                <button
                  key={item.number}
                  ref={(node) => {
                    stepRefs.current[index] = node;
                  }}
                  id={`how-it-works-tab-${index}`}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  aria-controls={`how-it-works-panel-${index}`}
                  tabIndex={active ? 0 : -1}
                  onClick={() => activateStep(index)}
                  onKeyDown={(event) => handleStepKeyDown(event, index)}
                  className="relative z-10 flex flex-col items-center gap-2 bg-transparent px-1 text-center"
                >
                  <span
                    className={[
                      'grid size-11 place-items-center rounded-full border-2 font-heading text-[0.7rem] font-extrabold transition sm:size-12 sm:text-xs',
                      active
                        ? 'border-[#9bd3ff] bg-bastly-blue text-white shadow-[0_0_0_5px_rgba(35,127,209,0.16),0_8px_24px_rgba(35,127,209,0.28)]'
                        : completed
                          ? 'border-[#68b7f7] bg-[#1766b0] text-white'
                          : 'border-white/15 bg-[#0a2858] text-white/55',
                    ].join(' ')}
                  >
                    {item.number}
                  </span>
                  <span
                    className={[
                      'hidden text-[0.7rem] font-extrabold tracking-[0.02em] sm:block',
                      active ? 'text-white' : completed ? 'text-white/75' : 'text-white/40',
                    ].join(' ')}
                  >
                    {item.short}
                  </span>
                </button>
              );
            })}
          </div>

          <div
            id={`how-it-works-panel-${activeStep}`}
            role="tabpanel"
            aria-labelledby={`how-it-works-tab-${activeStep}`}
            className="flex h-[330px] flex-col rounded-[24px] border border-white/10 bg-[#041838]/72 p-5 min-[380px]:h-[310px] sm:h-[285px] sm:p-6 md:h-[260px] md:p-7"
          >
            <div className="max-w-[680px]">
              <p className="mb-2 text-xs font-extrabold uppercase tracking-[0.12em] text-[#80c7ff]">
                Step {activeStep + 1} of {steps.length}
              </p>
              <h3 className="mb-3 font-heading text-[clamp(1.65rem,3vw,2.35rem)] font-bold tracking-[-0.04em] text-white">
                {step.title}
              </h3>
              <p className="mb-0 max-w-[650px] leading-7 text-white/70">
                {step.text}
              </p>

              {activeStep === 1 && (
                <a
                  href={bastlyWhatsAppUrl(whatsappMessage)}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex min-h-10 items-center gap-2 font-extrabold text-[#9bd3ff] underline decoration-[#9bd3ff]/35 underline-offset-4"
                >
                  Ask Bastly on WhatsApp <span aria-hidden="true">↗</span>
                </a>
              )}
            </div>

            <div className="mt-auto flex items-center justify-between gap-3 pt-5">
              <button
                type="button"
                onClick={() => activateStep(activeStep - 1)}
                disabled={activeStep === 0}
                className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full border border-white/15 px-4 text-sm font-extrabold text-white transition hover:bg-white/8 disabled:pointer-events-none disabled:opacity-30"
              >
                <ChevronLeft size={17} aria-hidden="true" />
                Back
              </button>

              {activeStep < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={() => activateStep(activeStep + 1)}
                  className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full bg-bastly-blue px-4 text-sm font-extrabold text-white transition hover:bg-[#3290e5]"
                >
                  Next
                  <ChevronRight size={17} aria-hidden="true" />
                </button>
              ) : (
                <Link
                  to="/courses"
                  className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full bg-bastly-blue px-4 text-sm font-extrabold text-white no-underline transition hover:bg-[#3290e5]"
                >
                  Explore courses
                  <ChevronRight size={17} aria-hidden="true" />
                </Link>
              )}
            </div>
          </div>

          <p className="mt-5 mb-0 text-center text-sm text-white/55">
            Already enrolled?{' '}
            <Link
              to="/login"
              className="font-extrabold text-white underline decoration-white/35 underline-offset-4"
            >
              Log in to Bastly
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
