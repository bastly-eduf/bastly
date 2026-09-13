import {
  ArrowUpRight,
  CalendarDays,
  GraduationCap,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import { formatCoursePrice } from '../../utils/publicCourse';

export default function CourseCard({ course, headingLevel = 'h2' }) {
  const Heading = headingLevel;

  return (
    <article className="group overflow-hidden rounded-[26px] border border-line bg-white shadow-soft transition duration-300 hover:-translate-y-1 hover:border-bastly-blue/25 hover:shadow-card">
      <div className="relative aspect-[4/2.75] overflow-hidden bg-[#061f49]">
        {course.doctorProfile?.imageVariants?.card ||
        course.doctorProfile?.imageUrl ? (
          <img
            src={
              course.doctorProfile.imageVariants?.card ||
              course.doctorProfile.imageUrl
            }
            alt=""
            loading="lazy"
            decoding="async"
            className="size-full object-cover object-[center_18%] opacity-85 transition duration-500 group-hover:scale-[1.025]"
          />
        ) : null}

        <div className="absolute inset-0 bg-gradient-to-r from-[#031128]/85 via-[#031128]/45 to-[#031128]/20" />

        <div className="absolute inset-x-4 bottom-4 z-10">
          <div className="mb-2 flex flex-wrap gap-2">
            <span className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[0.65rem] font-extrabold text-white backdrop-blur-md">
              {course.subject}
            </span>
            <span className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[0.65rem] font-extrabold text-white backdrop-blur-md">
              {course.level}
            </span>
          </div>
        </div>
      </div>

      <div className="flex min-h-[290px] flex-col p-5">
        <p className="mb-2 text-[0.68rem] font-extrabold uppercase tracking-[0.08em] text-bastly-blue">
          {course.curriculum || course.academicYear}
        </p>

        <Heading className="mb-2 font-heading text-2xl font-bold tracking-[-0.045em] text-bastly-navy">
          {course.title}
        </Heading>

        <p className="mb-4 text-sm text-muted">
          with{' '}
          <Link
            to={`/doctors/${course.doctorProfile?.slug}`}
            className="font-extrabold text-bastly-navy underline decoration-bastly-blue/35 underline-offset-4"
          >
            {course.doctorProfile?.displayName}
          </Link>
        </p>

        <div className="mb-5 grid gap-2 text-xs text-muted">
          <span className="inline-flex items-center gap-2">
            <GraduationCap
              size={15}
              className="text-bastly-blue"
            />
            {course.level}
            {course.curriculum
              ? ` · ${course.curriculum}`
              : ''}
          </span>
          <span className="inline-flex items-center gap-2">
            <CalendarDays
              size={15}
              className="text-bastly-blue"
            />
            {course.academicYear}
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
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </article>
  );
}
