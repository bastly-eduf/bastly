import { ArrowRight, BookOpen, Layers3, PlaySquare, UsersRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import DoctorPageHeader from '../../components/doctor/DoctorPageHeader';
import { api } from '../../services/api';

export default function DoctorCoursesPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    let active = true;

    api.get('/doctor/courses').then(({ data: response }) => {
      if (active) setData(response);
    });

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
      <DoctorPageHeader
        title="My courses"
        description="Admin creates the course and group structure. You manage the learning content inside the courses assigned to your doctor profile."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {(data?.courses || []).map((course) => (
          <article
            key={course._id}
            className="rounded-[26px] border border-line bg-white p-5 shadow-soft"
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <span className="mb-3 inline-flex rounded-full bg-bastly-blue-pale px-2.5 py-1 text-[0.68rem] font-extrabold text-bastly-blue-dark">
                  {course.status}
                </span>
                <h2 className="mb-1 font-heading text-2xl font-bold tracking-[-0.04em] text-bastly-navy">
                  {course.title}
                </h2>
                <p className="mb-0 text-sm text-muted">
                  {course.level}
                  {course.curriculum ? ` · ${course.curriculum}` : ''}
                </p>
              </div>

              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-bastly-navy text-white">
                <BookOpen size={19} />
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Metric
                icon={Layers3}
                value={course.counts?.modules || 0}
                label="Modules"
              />
              <Metric
                icon={PlaySquare}
                value={course.counts?.lessons || 0}
                label="Lessons"
              />
              <Metric
                icon={UsersRound}
                value={course.counts?.students || 0}
                label="Students"
              />
            </div>

            <Link
              to={`/doctor/courses/${course._id}`}
              className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-bastly-blue font-extrabold text-white no-underline transition hover:bg-bastly-blue-dark"
            >
              Manage content
              <ArrowRight size={17} />
            </Link>
          </article>
        ))}

        {data && data.courses?.length === 0 && (
          <div className="rounded-[24px] border border-line bg-white p-8 text-center text-sm text-muted shadow-soft lg:col-span-2">
            No courses have been assigned to your doctor profile yet.
          </div>
        )}
      </div>
    </main>
  );
}

function Metric({ icon: Icon, value, label }) {
  return (
    <div className="rounded-2xl bg-surface p-3">
      <Icon size={15} className="mb-2 text-bastly-blue" />
      <p className="mb-0 font-heading text-lg font-bold text-bastly-navy">
        {value}
      </p>
      <p className="mb-0 text-[0.67rem] text-muted">{label}</p>
    </div>
  );
}
