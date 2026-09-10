import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DoctorCard({ doctor }) {
  return (
    <article className="group overflow-hidden rounded-[26px] border border-line bg-white shadow-soft transition duration-300 hover:-translate-y-1 hover:border-bastly-blue/25 hover:shadow-card">
      <Link
        to={`/doctors/${doctor.slug}`}
        className="relative block aspect-[4/4.55] overflow-hidden bg-gradient-to-b from-bastly-blue-pale to-[#edf4f9]"
        aria-label={`View ${doctor.displayName}`}
      >
        {doctor.imageUrl ? (
          <img
            src={doctor.imageUrl}
            alt={doctor.displayName}
            loading="lazy"
            decoding="async"
            className="size-full object-cover object-[center_12%] transition duration-500 group-hover:scale-[1.025]"
          />
        ) : (
          <div className="grid size-full place-items-center font-heading text-5xl font-bold text-bastly-blue/35">
            {initials(doctor.displayName)}
          </div>
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[34%] bg-gradient-to-b from-transparent to-[#031128]/55" />

        <span className="absolute bottom-3.5 left-3.5 right-3.5 z-10 w-fit max-w-[calc(100%-1.75rem)] truncate rounded-full border border-white/20 bg-[#041634]/55 px-3 py-1.5 text-[0.7rem] font-extrabold text-white backdrop-blur-md">
          {doctor.subject}
        </span>
      </Link>

      <div className="p-5">
        <h2 className="mb-1.5 font-heading text-[clamp(1.35rem,2vw,1.7rem)] font-bold tracking-[-0.04em] text-bastly-navy">
          {doctor.displayName}
        </h2>

        <p className="mb-4 min-h-10 text-xs leading-5 text-muted">
          {doctor.levels?.length
            ? doctor.levels.join(' · ')
            : 'Course levels are available on the instructor profile.'}
        </p>

        <div className="flex items-center justify-between gap-3 border-t border-line pt-4">
          <span className="text-[0.68rem] font-bold text-muted">
            {doctor.courseCount}{' '}
            {doctor.courseCount === 1
              ? 'published course'
              : 'published courses'}
          </span>

          <Link
            to={`/doctors/${doctor.slug}`}
            className="inline-flex items-center gap-1 text-xs font-extrabold text-bastly-blue-dark no-underline"
          >
            Profile
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </article>
  );
}

function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('');
}
