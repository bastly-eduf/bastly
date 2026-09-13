import { BookOpen, ClipboardCheck, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export default function StudentOverviewPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    let alive = true;

    api
      .get('/student/overview')
      .then(({ data: response }) => {
        if (alive) setData(response);
      });

    return () => {
      alive = false;
    };
  }, []);

  return (
    <main className="px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
      <p className="mb-2 text-[0.72rem] font-extrabold uppercase tracking-[0.1em] text-bastly-blue">
        Student dashboard
      </p>
      <h1 className="mb-2 font-heading text-[clamp(2rem,5vw,3.3rem)] font-bold tracking-[-0.055em] text-bastly-navy">
        Hey, {user?.fullName?.split(' ')[0] || 'there'} 👋
      </h1>
      <p className="mb-7 text-sm leading-6 text-muted">
        Your active courses and assessment progress in one place.
      </p>

      <div className="grid gap-4 sm:grid-cols-3">
        <Metric
          icon={BookOpen}
          label="Active courses"
          value={data ? data.counts?.courses || 0 : '—'}
        />
        <Metric
          icon={ClipboardCheck}
          label="Available assessments"
          value={data ? data.counts?.availableAssessments || 0 : '—'}
        />
        <Metric
          icon={Star}
          label="Quiz average"
          value={
            data
              ? data.quizAverage === null
                ? '—'
                : `${Math.round(data.quizAverage)}%`
              : '—'
          }
        />
      </div>

      <section className="mt-6 rounded-[26px] border border-line bg-white p-5 shadow-soft sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="mb-1 text-[0.68rem] font-extrabold uppercase tracking-[0.08em] text-bastly-blue">
              My courses
            </p>
            <h2 className="mb-0 font-heading text-2xl font-bold text-bastly-navy">
              Active access
            </h2>
          </div>

          <Link
            to="/student/courses"
            className="text-sm font-extrabold text-bastly-blue-dark no-underline"
          >
            Open my courses →
          </Link>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {(data?.activeCourses || []).map((enrollment) => (
            <div
              key={enrollment._id}
              className="rounded-2xl border border-line bg-surface p-4"
            >
              <p className="mb-1 font-heading font-bold text-bastly-navy">
                {enrollment.course?.title}
              </p>
              <p className="mb-1 text-xs text-muted">
                {enrollment.course?.doctorProfile?.displayName}
              </p>
              <p className="mb-0 text-[0.68rem] text-muted">
                {enrollment.group?.name}
                {enrollment.group?.scheduleLabel
                  ? ` · ${enrollment.group.scheduleLabel}`
                  : ''}
              </p>
            </div>
          ))}

          {data && !data.activeCourses?.length && (
            <div className="flex flex-col items-center rounded-[22px] border border-dashed border-line bg-surface px-5 py-7 text-center md:col-span-2">
              <span className="mb-3 grid size-11 place-items-center rounded-2xl bg-bastly-blue-pale text-bastly-blue">
                <BookOpen size={19} aria-hidden="true" />
              </span>
              <p className="mb-1 font-heading text-lg font-bold text-bastly-navy">
                No active course yet.
              </p>
              <p className="mb-4 max-w-[520px] text-sm leading-6 text-muted">
                Once Bastly confirms your enrollment, your course will appear here with its group and learning access.
              </p>
              <Link
                to="/courses"
                className="inline-flex min-h-10 items-center justify-center rounded-full bg-bastly-blue px-5 text-sm font-extrabold text-white no-underline transition hover:bg-bastly-blue-dark"
              >
                Browse courses
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function Metric({ icon: Icon, label, value }) {
  return (
    <div className="rounded-[24px] border border-line bg-white p-5 shadow-soft">
      <span className="mb-5 grid size-11 place-items-center rounded-2xl bg-bastly-blue-pale text-bastly-blue">
        <Icon size={19} aria-hidden="true" />
      </span>
      <p className="mb-1 font-heading text-4xl font-bold tracking-[-0.05em] text-bastly-navy">
        {value}
      </p>
      <p className="mb-0 text-sm text-muted">{label}</p>
    </div>
  );
}
