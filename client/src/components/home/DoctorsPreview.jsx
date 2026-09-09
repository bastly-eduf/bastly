import { Link } from 'react-router-dom';
import { featuredDoctors } from '../../data/featuredDoctors';

export default function DoctorsPreview() {
  return (
    <section className="bg-white py-20 lg:py-28" aria-labelledby="doctors-preview-title">
      <div className="mx-auto w-[min(1200px,calc(100%-2rem))] lg:w-[min(1200px,calc(100%-4rem))]">
        <div className="mb-8 grid items-end gap-4 lg:mb-12 lg:grid-cols-[1.3fr_0.7fr] lg:gap-20">
          <div>
            <p className="mb-3 text-[0.78rem] font-extrabold uppercase tracking-[0.12em] text-bastly-blue">
              Meet your teachers
            </p>
            <h2
              id="doctors-preview-title"
              className="max-w-[760px] font-heading text-[clamp(2.35rem,5vw,4.5rem)] leading-[1.08] font-bold tracking-[-0.055em] text-bastly-navy"
            >
              Learn from people who know the syllabus.
            </h2>
          </div>

          <div className="max-w-[650px]">
            <p className="mb-4 leading-7 text-muted">
              Bastly brings together 18 instructors across different subjects and levels,
              each with a dedicated profile and their own course experience.
            </p>

            <Link
              to="/doctors"
              className="group inline-flex items-center gap-2 font-extrabold text-bastly-blue-dark no-underline"
            >
              Meet all 18 instructors
              <span className="transition group-hover:translate-x-1" aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {featuredDoctors.map((doctor) => (
            <article
              className="group min-w-0 overflow-hidden rounded-3xl border border-line bg-white transition duration-300 hover:-translate-y-1.5 hover:border-bastly-blue/30 hover:shadow-card"
              key={doctor.slug}
            >
              <Link
                to={`/doctors/${doctor.slug}`}
                aria-label={`View ${doctor.name}'s profile`}
                className="relative block aspect-[4/4.45] overflow-hidden bg-gradient-to-b from-bastly-blue-pale to-[#edf4f9]"
              >
                <img
                  src={doctor.image}
                  alt={doctor.name}
                  loading="lazy"
                  decoding="async"
                  className="size-full object-cover object-[center_12%] transition duration-500 group-hover:scale-[1.025]"
                />
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[34%] bg-gradient-to-b from-transparent to-[#031128]/50" />
                <span className="absolute right-3.5 bottom-3.5 left-3.5 z-10 w-fit max-w-[calc(100%-1.75rem)] truncate rounded-full border border-white/20 bg-[#041634]/50 px-3 py-1.5 text-[0.7rem] font-extrabold text-white backdrop-blur-md">
                  {doctor.subject}
                </span>
              </Link>

              <div className="flex items-end justify-between gap-4 p-4.5">
                <div>
                  <h3 className="mb-1.5 font-heading text-[clamp(1.2rem,2vw,1.55rem)] font-bold tracking-[-0.035em] text-bastly-navy">
                    {doctor.name}
                  </h3>
                  <p className="mb-0 text-[0.78rem] leading-6 text-muted">{doctor.levels}</p>
                </div>

                <Link
                  to={`/doctors/${doctor.slug}`}
                  aria-label={`View ${doctor.name}'s profile`}
                  className="group/link shrink-0 text-[0.75rem] font-extrabold text-bastly-blue-dark no-underline"
                >
                  View profile{' '}
                  <span className="inline-block transition group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" aria-hidden="true">
                    ↗
                  </span>
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
