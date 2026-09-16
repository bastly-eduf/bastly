import {
  ArrowUpRight,
  CalendarDays,
  GraduationCap,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { formatCoursePrice } from '../../utils/publicCourse';

export default function CourseCard({ course, headingLevel = 'h2' }) {
  const Heading = headingLevel;
  const doctorImage =
    course.doctorProfile?.imageVariants?.thumb ||
    course.doctorProfile?.imageVariants?.card ||
    course.doctorProfile?.imageUrl;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[26px] border border-line bg-white shadow-soft transition duration-300 hover:-translate-y-1 hover:border-bastly-blue/25 hover:shadow-card">
      <div className="h-1.5 bg-gradient-to-r from-bastly-blue via-[#62b2ed] to-[#9bd3ff]" />

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="mb-5 flex flex-wrap gap-2">
          <span className="rounded-full bg-bastly-blue-pale px-2.5 py-1 text-[0.65rem] font-extrabold text-bastly-blue-dark">
            {course.subject}
          </span>
          <span className="rounded-full bg-surface px-2.5 py-1 text-[0.65rem] font-extrabold text-muted">
            {course.level}
          </span>
          {course.curriculum && (
            <span className="rounded-full border border-line bg-white px-2.5 py-1 text-[0.65rem] font-extrabold text-muted">
              {course.curriculum}
            </span>
          )}
        </div>

        <Heading className="mb-3 font-heading text-2xl font-bold tracking-[-0.045em] text-bastly-navy">
          {course.title}
        </Heading>

        <p className="mb-5 line-clamp-3 min-h-[4.5rem] text-sm leading-6 text-muted">
          {course.description ||
            `Learn ${course.title} with Bastly Academy through a structured course built for ${course.level} students.`}
        </p>

        <Link
          to={`/doctors/${course.doctorProfile?.slug}`}
          className="mb-5 flex w-fit items-center gap-3 rounded-2xl bg-surface px-3 py-2.5 no-underline transition hover:bg-bastly-blue-pale"
          aria-label={`View ${course.doctorProfile?.displayName || 'instructor'} profile`}
        >
          <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full border-2 border-white bg-bastly-blue-pale shadow-sm">
            {doctorImage ? (
              <img
                src={doctorImage}
                alt=""
                loading="lazy"
                decoding="async"
                className="size-full object-cover object-top"
              />
            ) : (
              <span className="font-heading text-xs font-extrabold text-bastly-blue-dark">
                {course.doctorProfile?.displayName
                  ?.split(' ')
                  .filter(Boolean)
                  .slice(-2)
                  .map((word) => word[0])
                  .join('')}
              </span>
            )}
          </span>

          <span className="min-w-0">
            <span className="block text-[0.62rem] font-bold uppercase tracking-[0.08em] text-muted">
              Instructor
            </span>
            <span className="block truncate text-sm font-extrabold text-bastly-navy">
              {course.doctorProfile?.displayName}
            </span>
          </span>
        </Link>

        <div className="mb-5 grid gap-2 text-xs text-muted">
          <span className="inline-flex items-center gap-2">
            <GraduationCap
              size={15}
              className="text-bastly-blue"
              aria-hidden="true"
            />
            {course.level}
            {course.curriculum ? ` · ${course.curriculum}` : ''}
          </span>
          <span className="inline-flex items-center gap-2">
            <CalendarDays
              size={15}
              className="text-bastly-blue"
              aria-hidden="true"
            />
            Academic year {course.academicYear}
          </span>
        </div>

        <div className="mt-auto flex items-end justify-between gap-4 border-t border-line pt-4">
          <div>
            <p className="mb-0 text-[0.65rem] font-bold text-muted">
              Course price
            </p>
            <p className="mb-0 font-heading text-lg font-bold text-bastly-navy">
              {formatCoursePrice(course)}
            </p>
          </div>

          <Link
            to={`/courses/${course.slug}`}
            className="inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full bg-bastly-navy px-3.5 text-xs font-extrabold text-white no-underline transition hover:bg-bastly-blue-dark"
          >
            View course
            <ArrowUpRight size={14} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
