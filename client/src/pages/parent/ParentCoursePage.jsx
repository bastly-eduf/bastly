import {
  ArrowLeft,
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  CircleX,
  ClipboardCheck,
  TrendingUp,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import {
  Link,
  useParams,
  useSearchParams,
} from 'react-router-dom';

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

export default function ParentCoursePage() {
  const { studentId, courseId } = useParams();
  const [searchParams, setSearchParams] =
    useSearchParams();
  const weekStart =
    searchParams.get('weekStart') || mondayValue();

  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    setError('');

    api
      .get(
        `/parent/children/${studentId}/courses/${courseId}`,
        {
          params: { weekStart },
        },
      )
      .then(({ data: response }) => {
        if (active) setData(response);
      })
      .catch((err) => {
        if (active) {
          setError(
            apiErrorMessage(
              err,
              'Could not load course details.',
            ),
          );
        }
      });

    return () => {
      active = false;
    };
  }, [studentId, courseId, weekStart]);

  const attendanceSummary = useMemo(() => {
    const rows = data?.attendance || [];
    const present = rows.filter(
      (item) => item.record?.status === 'present',
    ).length;
    const absent = rows.filter(
      (item) => item.record?.status === 'absent',
    ).length;

    return {
      present,
      absent,
      total: present + absent,
    };
  }, [data]);

  return (
    <main className="px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
      <Link
        to={`/parent/children/${studentId}?weekStart=${weekStart}`}
        className="mb-5 inline-flex items-center gap-2 text-sm font-extrabold text-bastly-blue-dark no-underline"
      >
        <ArrowLeft size={16} />
        {data?.student?.fullName || 'Child'} overview
      </Link>

      <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-2 text-[0.72rem] font-extrabold uppercase tracking-[0.1em] text-bastly-blue">
            Parent course detail
          </p>
          <h1 className="mb-2 font-heading text-[clamp(2rem,5vw,3.2rem)] font-bold tracking-[-0.055em] text-bastly-navy">
            {data?.enrollment?.course?.title || 'Course'}
          </h1>
          <p className="mb-0 text-sm text-muted">
            {data?.student?.fullName}
            {data?.enrollment?.course?.doctorProfile
              ?.displayName
              ? ` · ${data.enrollment.course.doctorProfile.displayName}`
              : ''}
            {data?.enrollment?.group?.name
              ? ` · ${data.enrollment.group.name}`
              : ''}
          </p>
        </div>

        <WeekPicker
          value={weekStart}
          onChange={(value) =>
            setSearchParams({ weekStart: value })
          }
        />
      </div>

      {error && <ErrorBox message={error} />}

      {data && (
        <div className="grid gap-6">
          <section>
            <div className="mb-3 flex items-center gap-2">
              <TrendingUp
                size={17}
                className="text-bastly-blue"
              />
              <h2 className="mb-0 font-heading text-xl font-bold text-bastly-navy">
                Weekly performance
              </h2>
            </div>

            <PerformanceCard
              course={data.enrollment.course}
              group={data.enrollment.group}
              performance={data.performance}
            />
          </section>

          <div className="grid gap-4 md:grid-cols-2">
            <Metric
              icon={BookOpen}
              label="Learning progress"
              value={`${data.learning.percentage}%`}
              detail={`${data.learning.completedLessons}/${data.learning.totalLessons} published lessons completed`}
            />
            <Metric
              icon={CalendarCheck}
              label="Attendance this week"
              value={
                attendanceSummary.total
                  ? `${Math.round(
                      (attendanceSummary.present /
                        attendanceSummary.total) *
                        100,
                    )}%`
                  : '—'
              }
              detail={`${attendanceSummary.present} present · ${attendanceSummary.absent} absent`}
            />
          </div>

          <section className="overflow-hidden rounded-[26px] border border-line bg-white shadow-soft">
            <div className="border-b border-line bg-surface px-5 py-4">
              <div className="flex items-center gap-2">
                <ClipboardCheck
                  size={17}
                  className="text-bastly-blue"
                />
                <div>
                  <p className="mb-0 font-heading text-xl font-bold text-bastly-navy">
                    Quizzes & homework
                  </p>
                  <p className="mb-0 text-xs text-muted">
                    First attempt drives weekly performance.
                    Homework improvement is still visible.
                  </p>
                </div>
              </div>
            </div>

            <div className="divide-y divide-line">
              {data.assessments.map((row) => (
                <div
                  key={row.assessment._id}
                  className="grid gap-4 px-5 py-4 lg:grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr] lg:items-center"
                >
                  <div>
                    <span
                      className={[
                        'mb-2 inline-flex rounded-full px-2.5 py-1 text-[0.65rem] font-extrabold capitalize',
                        row.assessment.type === 'quiz'
                          ? 'bg-bastly-blue-pale text-bastly-blue-dark'
                          : 'bg-[#fff6df] text-[#9a6510]',
                      ].join(' ')}
                    >
                      {row.assessment.type}
                    </span>
                    <p className="mb-0 font-heading text-sm font-bold text-bastly-navy">
                      {row.assessment.title}
                    </p>
                  </div>

                  <Score
                    label="First"
                    attempt={row.firstAttempt}
                  />
                  <Score
                    label="Latest"
                    attempt={row.latestAttempt}
                  />
                  <Score
                    label="Best"
                    attempt={row.bestAttempt}
                  />
                </div>
              ))}

              {data.assessments.length === 0 && (
                <div className="px-5 py-8 text-center text-sm text-muted">
                  No quiz or homework was assigned for this
                  performance week.
                </div>
              )}
            </div>
          </section>

          <section className="overflow-hidden rounded-[26px] border border-line bg-white shadow-soft">
            <div className="border-b border-line bg-surface px-5 py-4">
              <div className="flex items-center gap-2">
                <CalendarCheck
                  size={17}
                  className="text-bastly-blue"
                />
                <div>
                  <p className="mb-0 font-heading text-xl font-bold text-bastly-navy">
                    Attendance
                  </p>
                  <p className="mb-0 text-xs text-muted">
                    Finalized sessions for this week.
                  </p>
                </div>
              </div>
            </div>

            <div className="divide-y divide-line">
              {data.attendance.map((row) => {
                const present =
                  row.record?.status === 'present';

                return (
                  <div
                    key={row.session._id}
                    className="flex items-center justify-between gap-4 px-5 py-4"
                  >
                    <div>
                      <p className="mb-0 text-sm font-bold text-bastly-navy">
                        {row.session.title ||
                          'Class session'}
                      </p>
                      <p className="mb-0 text-xs text-muted">
                        {new Date(
                          row.session.heldAt,
                        ).toLocaleString('en-GB', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </p>
                    </div>

                    <span
                      className={[
                        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-extrabold',
                        present
                          ? 'bg-[#eef8f1] text-[#18764a]'
                          : 'bg-[#fff0ef] text-[#a83d36]',
                      ].join(' ')}
                    >
                      {present ? (
                        <CheckCircle2 size={14} />
                      ) : (
                        <CircleX size={14} />
                      )}
                      {row.record?.status || 'Unmarked'}
                    </span>
                  </div>
                );
              })}

              {data.attendance.length === 0 && (
                <div className="px-5 py-8 text-center text-sm text-muted">
                  No finalized attendance sessions this week.
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

function Metric({ icon: Icon, label, value, detail }) {
  return (
    <div className="rounded-[24px] border border-line bg-white p-5 shadow-soft">
      <span className="mb-4 grid size-11 place-items-center rounded-2xl bg-bastly-blue-pale text-bastly-blue">
        <Icon size={18} />
      </span>
      <p className="mb-1 text-[0.67rem] font-bold uppercase tracking-[0.06em] text-muted">
        {label}
      </p>
      <p className="mb-1 font-heading text-3xl font-bold tracking-[-0.05em] text-bastly-navy">
        {value}
      </p>
      <p className="mb-0 text-xs text-muted">
        {detail}
      </p>
    </div>
  );
}

function Score({ label, attempt }) {
  return (
    <div>
      <p className="mb-1 text-[0.62rem] font-bold uppercase tracking-[0.06em] text-muted">
        {label}
      </p>
      {attempt ? (
        <>
          <p className="mb-0 font-heading text-lg font-bold text-bastly-navy">
            {Math.round(attempt.percentage)}%
          </p>
          <p className="mb-0 text-[0.65rem] text-muted">
            {attempt.gradeBand} · attempt{' '}
            {attempt.attemptNumber}
          </p>
        </>
      ) : (
        <p className="mb-0 text-sm text-muted">—</p>
      )}
    </div>
  );
}

function ErrorBox({ message }) {
  return (
    <div className="mb-5 rounded-2xl border border-[#d1605a]/25 bg-[#fff0ef] px-4 py-3 text-sm font-bold text-[#a83d36]">
      {message}
    </div>
  );
}
