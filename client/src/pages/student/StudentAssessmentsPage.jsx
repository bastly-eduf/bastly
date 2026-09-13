import {
  ArrowRight,
  BookOpen,
  ClipboardCheck,
  RotateCcw,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { api } from '../../services/api';

export default function StudentAssessmentsPage() {
  const [items, setItems] = useState(null);

  useEffect(() => {
    let alive = true;

    api
      .get('/student/assessments')
      .then(({ data }) => {
        if (alive) setItems(data.assessments || []);
      });

    return () => {
      alive = false;
    };
  }, []);

  return (
    <main className="px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
      <p className="mb-2 text-[0.72rem] font-extrabold uppercase tracking-[0.1em] text-bastly-blue">
        Practice & test
      </p>
      <h1 className="mb-2 font-heading text-[clamp(2rem,5vw,3.3rem)] font-bold tracking-[-0.055em] text-bastly-navy">
        Quizzes & homework
      </h1>
      <p className="mb-7 max-w-[720px] text-sm leading-6 text-muted">
        Quizzes give one submitted attempt. Homework is repeatable practice.
      </p>

      <div className="grid gap-4 lg:grid-cols-2">
        {(items || []).map((assessment) => (
          <article
            key={assessment._id}
            className="rounded-[24px] border border-line bg-white p-5 shadow-soft"
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <div className="mb-2 flex flex-wrap gap-2">
                  <TypePill type={assessment.type} />
                  {assessment.latestAttempt && (
                    <span className="rounded-full bg-[#eef8f1] px-2.5 py-1 text-[0.68rem] font-extrabold text-[#18764a]">
                      {assessment.latestAttempt.gradeBand} ·{' '}
                      {Math.round(
                        assessment.latestAttempt.percentage,
                      )}
                      %
                    </span>
                  )}
                </div>

                <h2 className="mb-1 font-heading text-xl font-bold text-bastly-navy">
                  {assessment.title}
                </h2>
                <p className="mb-0 text-xs text-muted">
                  {assessment.course?.title} ·{' '}
                  {assessment.questionCount} questions
                </p>
              </div>

              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-bastly-blue-pale text-bastly-blue">
                {assessment.type === 'quiz' ? (
                  <BookOpen size={18} aria-hidden="true" />
                ) : (
                  <RotateCcw size={18} aria-hidden="true" />
                )}
              </span>
            </div>

            {assessment.description && (
              <p className="mb-5 text-sm leading-6 text-muted">
                {assessment.description}
              </p>
            )}

            <div className="mb-5 grid grid-cols-2 gap-2">
              <Info
                label="Attempts used"
                value={`${assessment.attemptCount}${
                  assessment.maxAttempts
                    ? ` / ${assessment.maxAttempts}`
                    : ''
                }`}
              />
              <Info
                label="Rule"
                value={
                  assessment.type === 'quiz'
                    ? 'One attempt'
                    : 'Unlimited'
                }
              />
            </div>

            <Link
              to={`/student/assessments/${assessment._id}`}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-bastly-blue font-extrabold text-white no-underline"
            >
              {assessment.canAttempt
                ? assessment.attemptCount
                  ? 'Try again'
                  : 'Open assessment'
                : 'View result'}
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </article>
        ))}

        {items && !items.length && (
          <div className="flex flex-col items-center rounded-[24px] border border-line bg-white p-8 text-center shadow-soft sm:p-10 lg:col-span-2">
            <span className="mb-4 grid size-12 place-items-center rounded-2xl bg-bastly-blue-pale text-bastly-blue">
              <ClipboardCheck size={20} aria-hidden="true" />
            </span>
            <p className="mb-2 font-heading text-xl font-bold text-bastly-navy">
              Nothing waiting for you right now 🎉
            </p>
            <p className="mb-5 max-w-[560px] text-sm leading-6 text-muted">
              Published quizzes and homework from your active courses will appear here as soon as your doctor assigns them.
            </p>
            <Link
              to="/student/courses"
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-line px-5 text-sm font-extrabold text-bastly-navy no-underline transition hover:border-bastly-blue/30 hover:bg-bastly-blue-pale"
            >
              Open my courses
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}

function TypePill({ type }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[0.68rem] font-extrabold capitalize ${
        type === 'quiz'
          ? 'bg-bastly-blue-pale text-bastly-blue-dark'
          : 'bg-[#fff6df] text-[#9a6510]'
      }`}
    >
      {type}
    </span>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-2xl bg-surface p-3">
      <p className="mb-0 text-[0.65rem] text-muted">
        {label}
      </p>
      <p className="mb-0 font-heading font-bold text-bastly-navy">
        {value}
      </p>
    </div>
  );
}
