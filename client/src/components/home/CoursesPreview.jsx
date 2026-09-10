import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import CourseCard from '../public/CourseCard';
import { api } from '../../services/api';

export default function CoursesPreview() {
  const [courses, setCourses] = useState(null);

  useEffect(() => {
    let active = true;

    api
      .get('/public/courses', {
        params: { limit: 3 },
      })
      .then(({ data }) => {
        if (active) setCourses(data.courses || []);
      })
      .catch(() => {
        if (active) setCourses([]);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <section
      className="overflow-hidden bg-[radial-gradient(circle_at_95%_12%,rgba(35,127,209,0.09),transparent_28%)] bg-bastly-blue-pale py-20 lg:py-28"
      aria-labelledby="courses-preview-title"
    >
      <div className="mx-auto w-[min(1200px,calc(100%-2rem))] lg:w-[min(1200px,calc(100%-4rem))]">
        <div className="mb-8 grid items-end gap-4 lg:mb-12 lg:grid-cols-[1.25fr_0.75fr] lg:gap-20">
          <div>
            <p className="mb-3 text-[0.78rem] font-extrabold uppercase tracking-[0.12em] text-bastly-blue">
              Explore Bastly
            </p>
            <h2
              id="courses-preview-title"
              className="max-w-[720px] font-heading text-[clamp(2.4rem,5vw,4.6rem)] font-bold leading-[1.08] tracking-[-0.055em] text-bastly-navy"
            >
              Find the course that fits you.
            </h2>
          </div>

          <div className="max-w-[640px]">
            <p className="mb-4 leading-7 text-muted">
              Learn with instructors who know the syllabus,
              the exam, and how to make difficult ideas click.
            </p>
            <Link
              to="/courses"
              className="group inline-flex items-center gap-2 font-extrabold text-bastly-blue-dark no-underline"
            >
              View all courses
              <span
                className="transition group-hover:translate-x-1"
                aria-hidden="true"
              >
                →
              </span>
            </Link>
          </div>
        </div>

        {courses === null ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-[520px] animate-pulse rounded-[26px] border border-bastly-navy/10 bg-white shadow-soft"
              />
            ))}
          </div>
        ) : courses.length ? (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard
                course={course}
                key={course._id}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-[26px] border border-bastly-navy/10 bg-white px-5 py-10 text-center shadow-soft">
            <p className="mb-1 font-heading text-xl font-bold text-bastly-navy">
              Published courses are coming.
            </p>
            <p className="mb-0 text-sm text-muted">
              Bastly only shows courses here after the academy
              publishes their real details.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
