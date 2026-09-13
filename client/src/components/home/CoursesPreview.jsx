import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import CourseCard from '../public/CourseCard';
import PreviewCarousel from './PreviewCarousel';
import { api } from '../../services/api';

export default function CoursesPreview() {
  const [courses, setCourses] = useState(null);

  useEffect(() => {
    let active = true;

    api
      .get('/public/courses', {
        params: { limit: 9 },
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
        <div className="mb-9 grid items-end gap-4 lg:mb-12 lg:grid-cols-[1.25fr_0.75fr] lg:gap-20">
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

          <p className="mb-0 max-w-[640px] leading-7 text-muted">
            Learn with instructors who know the syllabus, the exam, and how to make
            difficult ideas click.
          </p>
        </div>

        {courses === null ? (
          <PreviewCarousel label="Loading course previews">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="h-[520px] animate-pulse rounded-[26px] border border-bastly-navy/10 bg-white shadow-soft"
              />
            ))}
          </PreviewCarousel>
        ) : courses.length ? (
          <PreviewCarousel label="Featured courses">
            {courses.map((course) => (
              <CourseCard
                course={course}
                headingLevel="h3"
                key={course._id}
              />
            ))}
          </PreviewCarousel>
        ) : (
          <div className="rounded-[26px] border border-bastly-navy/10 bg-white px-5 py-10 text-center shadow-soft">
            <p className="mb-1 font-heading text-xl font-bold text-bastly-navy">
              Published courses are coming.
            </p>
            <p className="mb-0 text-sm text-muted">
              Bastly only shows courses here after the academy publishes their real
              details.
            </p>
          </div>
        )}

        <div className="mt-8 flex justify-center lg:mt-10">
          <Link
            to="/courses"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-bastly-blue px-6 font-extrabold text-white no-underline shadow-[0_12px_28px_rgba(35,127,209,0.22)] transition hover:-translate-y-0.5 hover:bg-bastly-blue-dark"
          >
            View all courses <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
