import { Link } from 'react-router-dom';
import { featuredCourses, formatCoursePrice } from '../../data/featuredCourses';

export default function CoursesPreview() {
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
              className="max-w-[720px] font-heading text-[clamp(2.4rem,5vw,4.6rem)] leading-[1.08] font-bold tracking-[-0.055em] text-bastly-navy"
            >
              Find the course that fits you.
            </h2>
          </div>

          <div className="max-w-[640px]">
            <p className="mb-4 leading-7 text-muted">
              Learn with instructors who know the syllabus, the exam, and how to make
              difficult ideas click.
            </p>
            <Link
              to="/courses"
              className="group inline-flex items-center gap-2 font-extrabold text-bastly-blue-dark no-underline"
            >
              View all courses
              <span className="transition group-hover:translate-x-1" aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {featuredCourses.map((course) => (
            <article
              className="group min-w-0 overflow-hidden rounded-3xl border border-bastly-navy/10 bg-white shadow-soft transition duration-300 hover:-translate-y-1.5 hover:border-bastly-blue/30 hover:shadow-card"
              key={course.id}
            >
              <div className="relative aspect-[4/3.2] overflow-hidden bg-[#eef5fb]">
                <img
                  src={course.image}
                  alt={`${course.doctor}, instructor for ${course.title}`}
                  loading="lazy"
                  decoding="async"
                  className="size-full object-cover object-[center_18%] transition duration-500 group-hover:scale-[1.025]"
                />

                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[45%] bg-gradient-to-b from-transparent to-[#031128]/50" />

                <div className="absolute inset-x-3.5 bottom-3.5 z-10 flex flex-wrap gap-2" aria-label="Course categories">
                  {course.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex min-h-7 items-center rounded-full border border-white/20 bg-[#041634]/45 px-2.5 py-1 text-[0.7rem] font-extrabold text-white backdrop-blur-md"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex min-h-[255px] flex-col justify-between gap-6 p-5">
                <div>
                  <p className="mb-2 text-[0.76rem] font-extrabold uppercase tracking-[0.04em] text-bastly-blue">
                    {course.subtitle}
                  </p>
                  <h3 className="mb-2 font-heading text-[clamp(1.5rem,2.2vw,2rem)] font-bold tracking-[-0.04em] text-bastly-navy">
                    {course.title}
                  </h3>
                  <p className="mb-0 text-sm text-muted">
                    with{' '}
                    <Link
                      to={`/doctors/${course.doctorSlug}`}
                      className="font-extrabold text-bastly-navy underline decoration-bastly-blue/40 underline-offset-4"
                    >
                      {course.doctor}
                    </Link>
                  </p>
                </div>

                <div className="flex items-center justify-between gap-4 border-t border-line pt-4 max-[420px]:flex-col max-[420px]:items-stretch">
                  <div className="grid gap-0.5">
                    <span className="text-[0.7rem] font-bold text-muted">Course price</span>
                    <strong className="font-heading text-lg text-bastly-navy">
                      {formatCoursePrice(course.price, course.currency)}
                    </strong>
                  </div>

                  <Link
                    to={`/courses/${course.id}`}
                    aria-label={`View ${course.title}`}
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-bastly-navy px-3.5 text-[0.78rem] font-extrabold text-white no-underline transition hover:-translate-y-0.5 hover:bg-bastly-blue-dark max-[420px]:w-full"
                  >
                    View course <span aria-hidden="true">↗</span>
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        <p className="mt-4 max-w-[720px] text-xs leading-6 text-muted">
          Course prices shown during development are temporary and can be updated from
          Bastly Admin before launch.
        </p>
      </div>
    </section>
  );
}
