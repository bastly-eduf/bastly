import {
  ArrowRight,
  BookOpen,
  UsersRound,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import PerformanceCard from '../../components/performance/PerformanceCard';
import WeekPicker from '../../components/performance/WeekPicker';
import { api, apiErrorMessage } from '../../services/api';

function mondayValue() {
  const date = new Date();
  const day = date.getUTCDay();

  date.setUTCDate(
    date.getUTCDate() + (day === 0 ? -6 : 1 - day),
  );
  date.setUTCHours(0, 0, 0, 0);

  return date.toISOString().slice(0, 10);
}

export default function ParentOverviewPage() {
  const [weekStart, setWeekStart] =
    useState(mondayValue);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    setError('');

    api
      .get('/parent/overview', {
        params: { weekStart },
      })
      .then(({ data: response }) => {
        if (active) setData(response);
      })
      .catch((err) => {
        if (active) {
          setError(
            apiErrorMessage(
              err,
              'Could not load parent dashboard.',
            ),
          );
        }
      });

    return () => {
      active = false;
    };
  }, [weekStart]);

  return (
    <main className="px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-[0.72rem] font-extrabold uppercase tracking-[0.1em] text-bastly-blue">
            Parent dashboard
          </p>
          <h1 className="mb-2 font-heading text-[clamp(2rem,5vw,3.3rem)] font-bold tracking-[-0.055em] text-bastly-navy">
            Their week at a glance.
          </h1>
          <p className="mb-0 max-w-[720px] text-sm leading-6 text-muted">
            Weekly performance first, with deeper course,
            attendance, assessment, and learning details one
            click away.
          </p>
        </div>

        <WeekPicker
          value={weekStart}
          onChange={setWeekStart}
        />
      </div>

      {error && (
        <div className="mb-4 rounded-2xl bg-[#fff0ef] px-4 py-3 text-sm font-bold text-[#a83d36]">
          {error}
        </div>
      )}

      <div className="grid gap-7">
        {(data?.children || []).map((child) => (
          <section
            key={child.relationshipId}
            className="rounded-[28px] border border-line bg-white p-5 shadow-soft sm:p-6"
          >
            <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="grid size-12 place-items-center rounded-2xl bg-bastly-blue-pale text-bastly-blue">
                  <UsersRound size={20} />
                </span>
                <div>
                  <p className="mb-0 font-heading text-2xl font-bold text-bastly-navy">
                    {child.student.fullName}
                  </p>
                  <p className="mb-0 text-xs text-muted">
                    {child.student.email}
                  </p>
                </div>
              </div>

              <Link
                to={`/parent/children/${child.student._id}?weekStart=${weekStart}`}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-line px-4 text-sm font-extrabold text-bastly-navy no-underline transition hover:border-bastly-blue/25 hover:text-bastly-blue-dark"
              >
                Full child view
                <ArrowRight size={15} />
              </Link>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {child.courses.map((row) => (
                <div key={row.enrollmentId}>
                  <PerformanceCard
                    course={row.course}
                    group={row.group}
                    performance={row.performance}
                  />

                  <Link
                    to={`/parent/children/${child.student._id}/courses/${row.course?._id}?weekStart=${weekStart}`}
                    className="mt-2 inline-flex items-center gap-1.5 px-1 text-xs font-extrabold text-bastly-blue-dark no-underline"
                  >
                    <BookOpen size={13} />
                    Course details
                    <ArrowRight size={13} />
                  </Link>
                </div>
              ))}
            </div>

            {child.courses.length === 0 && (
              <div className="rounded-2xl border border-line bg-surface p-5 text-sm text-muted">
                No active course performance for this week.
              </div>
            )}
          </section>
        ))}

        {data && data.children?.length === 0 && (
          <div className="rounded-[24px] border border-line bg-white p-10 text-center text-sm text-muted shadow-soft">
            No active child links were found for this parent
            account.
          </div>
        )}
      </div>
    </main>
  );
}
