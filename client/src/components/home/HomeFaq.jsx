import { Link } from 'react-router-dom';

const questions = [
  {
    question: 'How do I enroll in a Bastly course?',
    answer:
      'Choose the course you want and use the enrollment button to open WhatsApp with Bastly. Once payment is confirmed, the admin activates access inside your account.',
  },
  {
    question: 'How long does my course access stay active?',
    answer:
      'Course access is tied to the academic cohort and remains active until its configured end-of-June access date unless Bastly unregisters the enrollment earlier.',
  },
  {
    question: 'How do quizzes and homework work?',
    answer:
      'Quizzes support MCQ and True/False and allow one attempt. Homework uses the same question types but can be attempted more than once for practice.',
  },
  {
    question: 'Can my parent follow my progress?',
    answer:
      'Yes. Parents receive their own secure Bastly account and can see the quiz grades, attendance, weekly performance, and courses of students linked to them.',
  },
  {
    question: 'How do Bastly Cards work?',
    answer:
      'Strong quiz performance can unlock a Bastly Spin. The spin awards an available Bastly Card from food, beverage, or local partner rewards managed by the academy.',
  },
];

export default function HomeFaq() {
  return (
    <section className="bg-white py-20 lg:py-28" aria-labelledby="faq-home-title">
      <div className="mx-auto grid w-[min(1100px,calc(100%-2rem))] gap-10 lg:w-[min(1100px,calc(100%-4rem))] lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
        <div>
          <p className="mb-3 text-[0.78rem] font-extrabold uppercase tracking-[0.12em] text-bastly-blue">
            Quick answers
          </p>
          <h2
            id="faq-home-title"
            className="mb-5 font-heading text-[clamp(2.4rem,5vw,4.4rem)] leading-[1.06] font-bold tracking-[-0.055em] text-bastly-navy"
          >
            A few things students usually ask.
          </h2>
          <p className="mb-5 max-w-[420px] leading-7 text-muted">
            We keep enrollment simple. If you still need help, Bastly is one WhatsApp
            message away.
          </p>
          <Link
            to="/faq"
            className="group inline-flex items-center gap-2 font-extrabold text-bastly-blue-dark no-underline"
          >
            View all FAQs
            <span className="transition group-hover:translate-x-1" aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="border-t border-line">
          {questions.map((item, index) => (
            <details key={item.question} className="group border-b border-line">
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
