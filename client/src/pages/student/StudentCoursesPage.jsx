import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { api, apiErrorMessage } from '../../services/api';

export default function StudentCoursesPage() {
  const [courses, setCourses] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    api
      .get('/student/courses')
      .then(({ data }) => {
        if (active) setCourses(data.courses || []);
      })
      .catch((err) => {
        if (active) {
          setError(
            apiErrorMessage(
              err,
              'Could not load your courses.',
            ),
          );
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
      <div className="mb-7">
        <p className="mb-2 text-[0.72rem] font-extrabold uppercase tracking-[0.1em] text-bastly-blue">
          Learning hub
        </p>
        <h1 className="mb-2 font-heading text-[clamp(2rem,5vw,3.3rem)] font-bold tracking-[-0.055em] text-bastly-navy">
          My courses
        </h1>
        <p className="mb-0 max-w-[720px] text-sm leading-6 text-muted">
          Watch your published lessons, open course resources, and keep track of what you have completed.
        </p>
      </div>

      {error && (
        <div className="mb-5 rounded-2xl border border-[#d1605a]/25 bg-[#fff0ef] px-4 py-3 text-sm font-bold text-[#a83d36]">
          {error}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        {(courses || []).map((item) => (
          <article
            key={item.enrollmentId}
            className="overflow-hidden rounded-[28px] border border-line bg-white shadow-soft"
          >
            <div className="bg-bastly-navy p-5 text-white sm:p-6">
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <p className="mb-2 text-[0.67rem] font-extrabold uppercase tracking-[0.08em] text-[#82c8ff]">
                    {item.course?.academicYear}
                  </p>
                  <h2 className="mb-2 font-heading text-2xl font-bold tracking-[-0.04em]">
                    {item.course?.title}
                  </h2>
                  <p className="mb-0 text-sm text-white/60">
                    {item.course?.doctorProfile?.displayName}
                    {item.course?.level
                      ? ` · ${item.course.level}`
                      : ''}
                  </p>
                </div>

                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-white/10">
                  <BookOpen size={20} aria-hidden="true" />
                </span>
              </div>

              <div className="flex flex-wrap gap-2 text-[0.68rem] font-bold text-white/65">
                {item.group?.name && (
                  <span className="rounded-full bg-white/8 px-2.5 py-1">
                    {item.group.name}
                  </span>
                )}
                {item.group?.scheduleLabel && (
                  <span className="rounded-full bg-white/8 px-2.5 py-1">
                    {item.group.scheduleLabel}
                  </span>
                )}
              </div>
            </div>

            <div className="p-5 sm:p-6">
              <div className="mb-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2
                    size={16}
                    className="text-bastly-blue"
                    aria-hidden="true"
                  />
                  <p className="mb-0 text-sm font-extrabold text-bastly-navy">
                    {item.progress?.completedLessons || 0} /{' '}
                    {item.progress?.totalLessons || 0} lessons
                  </p>
                </div>

                <p className="mb-0 font-heading text-lg font-bold text-bastly-blue-dark">
                  {item.progress?.percentage || 0}%
                </p>
              </div>

              <div className="mb-5 h-2 overflow-hidden rounded-full bg-surface">
                <div
                  className="h-full rounded-full bg-bastly-blue transition-all"
                  style={{
                    width: `${item.progress?.percentage || 0}%`,
                  }}
                />
              </div>

              <div className="mb-5 flex items-center gap-2 text-xs text-muted">
                <CalendarDays size={15} aria-hidden="true" />
                Access until{' '}
                {new Date(
                  item.accessEndDate,
                ).toLocaleDateString('en-GB')}
              </div>

              <Link
                to={`/student/courses/${item.course?._id}`}
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-bastly-blue font-extrabold text-white no-underline transition hover:bg-bastly-blue-dark"
              >
                {item.progress?.completedLessons
                  ? 'Continue learning'
                  : 'Start course'}
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </article>
        ))}

        {courses && courses.length === 0 && (
          <div className="flex flex-col items-center rounded-[26px] border border-line bg-white p-8 text-center shadow-soft sm:p-10 lg:col-span-2">
            <span className="mb-4 grid size-12 place-items-center rounded-2xl bg-bastly-blue-pale text-bastly-blue">
              <BookOpen size={20} aria-hidden="true" />
            </span>
            <p className="mb-2 font-heading text-xl font-bold text-bastly-navy">
              No active courses yet.
            </p>
            <p className="mb-5 max-w-[560px] text-sm leading-6 text-muted">
              Once Bastly confirms your course payment, your learning space will appear here with lessons, resources, and progress.
            </p>
            <Link
              to="/courses"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-bastly-blue px-5 text-sm font-extrabold text-white no-underline transition hover:bg-bastly-blue-dark"
            >
              Browse Bastly courses
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
