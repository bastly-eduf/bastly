import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  GraduationCap,
  School,
} from 'lucide-react';
import { useEffect, useState } from 'react';
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

export default function ParentChildPage() {
  const { studentId } = useParams();
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
      .get(`/parent/children/${studentId}/summary`, {
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
              'Could not load child details.',
            ),
          );
        }
      });

    return () => {
      active = false;
    };
  }, [studentId, weekStart]);

  return (
    <main className="px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
      <Link
        to="/parent"
        className="mb-5 inline-flex items-center gap-2 text-sm font-extrabold text-bastly-blue-dark no-underline"
      >
        <ArrowLeft size={16} />
        Parent overview
      </Link>

      <div className="mb-7 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-2 text-[0.72rem] font-extrabold uppercase tracking-[0.1em] text-bastly-blue">
            Child progress
          </p>
          <h1 className="mb-2 font-heading text-[clamp(2rem,5vw,3.3rem)] font-bold tracking-[-0.055em] text-bastly-navy">
            {data?.student?.fullName || 'Student'}
          </h1>

          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted">
            {data?.studentProfile?.school && (
              <span className="inline-flex items-center gap-1.5">
                <School size={14} />
                {data.studentProfile.school}
              </span>
            )}
            {data?.studentProfile?.academicLevel && (
              <span className="inline-flex items-center gap-1.5">
                <GraduationCap size={14} />
                {data.studentProfile.academicLevel}
              </span>
            )}
          </div>
        </div>

        <WeekPicker
          value={weekStart}
          onChange={(value) =>
            setSearchParams({ weekStart: value })
          }
        />
      </div>

      {error && <ErrorBox message={error} />}

      <div className="grid gap-5">
        {(data?.courses || []).map((row) => (
          <article
            key={row.enrollmentId}
            className="rounded-[28px] border border-line bg-white p-5 shadow-soft sm:p-6"
          >
            <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="mb-1 text-[0.68rem] font-extrabold uppercase tracking-[0.08em] text-bastly-blue">
                  {row.course?.academicYear}
                </p>
                <h2 className="mb-1 font-heading text-2xl font-bold tracking-[-0.04em] text-bastly-navy">
                  {row.course?.title}
                </h2>
                <p className="mb-0 text-sm text-muted">
                  {row.course?.doctorProfile?.displayName}
                  {row.group?.name
                    ? ` · ${row.group.name}`
                    : ''}
                </p>
              </div>

              <Link
                to={`/parent/children/${studentId}/courses/${row.course?._id}?weekStart=${weekStart}`}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-bastly-blue px-4 text-sm font-extrabold text-white no-underline"
              >
                Open course details
                <ArrowRight size={15} />
              </Link>
            </div>

            <div className="mb-5">
              <PerformanceCard
                course={row.course}
                group={row.group}
                performance={row.weeklyPerformance}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <Metric
                icon={BookOpen}
                label="Learning progress"
                value={`${row.learning.percentage}%`}
                detail={`${row.learning.completedLessons}/${row.learning.totalLessons} lessons`}
              />
              <Metric
                icon={CheckCircle2}
                label="Attendance"
                value={
                  row.attendance.percentage === null
                    ? '—'
                    : `${Math.round(row.attendance.percentage)}%`
                }
                detail={`${row.attendance.present} present · ${row.attendance.absent} absent`}
              />
              <Metric
                icon={ClipboardCheck}
                label="Quiz avg."
                value={
                  row.academics.quizFirstAttemptAverage ===
                  null
                    ? '—'
                    : `${Math.round(row.academics.quizFirstAttemptAverage)}%`
                }
                detail="First attempts"
              />
              <Metric
                icon={ClipboardCheck}
                label="Homework"
                value={
                  row.academics.homeworkFirstAttemptAverage ===
                  null
                    ? '—'
                    : `${Math.round(row.academics.homeworkFirstAttemptAverage)}%`
                }
                detail={
                  row.academics.homeworkBestAverage === null
                    ? 'No attempts'
                    : `Best avg. ${Math.round(row.academics.homeworkBestAverage)}%`
                }
              />
            </div>
          </article>
        ))}

        {data && data.courses?.length === 0 && (
          <div className="rounded-[24px] border border-line bg-white p-10 text-center text-sm text-muted shadow-soft">
            No active paid courses are linked to this child
            right now.
          </div>
        )}
      </div>
    </main>
  );
}

function Metric({ icon: Icon, label, value, detail }) {
  return (
    <div className="rounded-2xl bg-surface p-4">
      <Icon
        size={16}
        className="mb-3 text-bastly-blue"
      />
      <p className="mb-1 text-[0.67rem] font-bold uppercase tracking-[0.06em] text-muted">
        {label}
      </p>
      <p className="mb-1 font-heading text-xl font-bold text-bastly-navy">
        {value}
      </p>
      <p className="mb-0 text-[0.67rem] text-muted">
        {detail}
      </p>
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
