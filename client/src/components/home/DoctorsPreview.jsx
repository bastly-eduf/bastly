import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import DoctorCard from '../public/DoctorCard';
import { api } from '../../services/api';

export default function DoctorsPreview() {
  const [doctors, setDoctors] = useState(null);

  useEffect(() => {
    let active = true;

    api
      .get('/public/doctors', {
        params: { limit: 6 },
      })
      .then(({ data }) => {
        if (active) setDoctors(data.doctors || []);
      })
      .catch(() => {
        if (active) setDoctors([]);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <section
      className="bg-white py-20 lg:py-28"
      aria-labelledby="doctors-preview-title"
    >
      <div className="mx-auto w-[min(1200px,calc(100%-2rem))] lg:w-[min(1200px,calc(100%-4rem))]">
        <div className="mb-8 grid items-end gap-4 lg:mb-12 lg:grid-cols-[1.3fr_0.7fr] lg:gap-20">
          <div>
            <p className="mb-3 text-[0.78rem] font-extrabold uppercase tracking-[0.12em] text-bastly-blue">
              Meet your teachers
            </p>
            <h2
              id="doctors-preview-title"
              className="max-w-[760px] font-heading text-[clamp(2.35rem,5vw,4.5rem)] font-bold leading-[1.08] tracking-[-0.055em] text-bastly-navy"
            >
              Learn from people who know the syllabus.
            </h2>
          </div>

          <div className="max-w-[650px]">
            <p className="mb-4 leading-7 text-muted">
              Bastly brings together instructors across
              different subjects and levels, each with a
              dedicated profile and their own course experience.
            </p>

            <Link
              to="/doctors"
              className="group inline-flex items-center gap-2 font-extrabold text-bastly-blue-dark no-underline"
            >
              Meet all instructors
              <span
                className="transition group-hover:translate-x-1"
                aria-hidden="true"
              >
                →
              </span>
            </Link>
          </div>
        </div>

        {doctors === null ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="aspect-[4/5.5] animate-pulse rounded-[26px] border border-line bg-surface"
              />
            ))}
          </div>
        ) : doctors.length ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {doctors.map((doctor) => (
              <DoctorCard
                doctor={doctor}
                key={doctor._id}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-[26px] border border-line bg-surface px-5 py-10 text-center">
            <p className="mb-1 font-heading text-xl font-bold text-bastly-navy">
              Instructor profiles are being prepared.
            </p>
            <p className="mb-0 text-sm text-muted">
              Published profiles will appear here automatically.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
