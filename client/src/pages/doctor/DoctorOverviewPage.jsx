import {
  BookOpen,
  Layers3,
  PlaySquare,
  UsersRound,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import DoctorPageHeader from '../../components/doctor/DoctorPageHeader';
import { api } from '../../services/api';

const cards = [
  ['courses', 'Courses', BookOpen],
  ['activeStudents', 'Active students', UsersRound],
  ['modules', 'Modules', Layers3],
  ['publishedLessons', 'Published lessons', PlaySquare],
];

export default function DoctorOverviewPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    let active = true;

    api.get('/doctor/overview').then(({ data: response }) => {
      if (active) setData(response);
    });

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
      <DoctorPageHeader
        title={data?.profile?.displayName || 'Your Bastly workspace'}
        description="Manage what your students learn without touching anyone else's courses."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([key, label, Icon]) => (
          <div
            key={key}
            className="rounded-[24px] border border-line bg-white p-5 shadow-soft"
          >
            <span className="mb-5 grid size-11 place-items-center rounded-2xl bg-bastly-blue-pale text-bastly-blue">
              <Icon size={19} />
            </span>
            <p className="mb-1 font-heading text-4xl font-bold tracking-[-0.05em] text-bastly-navy">
              {data ? data.counts?.[key] ?? 0 : '—'}
            </p>
            <p className="mb-0 text-sm text-muted">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-[26px] border border-line bg-white p-5 shadow-soft sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <p className="mb-1 text-[0.7rem] font-extrabold uppercase tracking-[0.08em] text-bastly-blue">
              My courses
            </p>
            <h2 className="mb-0 font-heading text-2xl font-bold tracking-[-0.04em] text-bastly-navy">
              Continue building
            </h2>
          </div>

          <Link
            to="/doctor/courses"
            className="text-sm font-extrabold text-bastly-blue-dark no-underline"
          >
            View all →
          </Link>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {(data?.recentCourses || []).map((course) => (
            <Link
              key={course._id}
              to={`/doctor/courses/${course._id}`}
              className="rounded-2xl border border-line bg-surface p-4 no-underline transition hover:border-bastly-blue/25 hover:bg-white hover:shadow-soft"
            >
              <p className="mb-1 font-heading font-bold text-bastly-navy">
                {course.title}
              </p>
              <p className="mb-0 text-xs text-muted">
                {course.level} · {course.academicYear}
              </p>
            </Link>
          ))}

          {data && data.recentCourses?.length === 0 && (
            <p className="mb-0 text-sm text-muted">
              No courses are assigned to this profile yet.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
