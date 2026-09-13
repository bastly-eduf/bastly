import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import DoctorCard from '../public/DoctorCard';
import PreviewCarousel from './PreviewCarousel';
import { api } from '../../services/api';

export default function DoctorsPreview() {
  const [doctors, setDoctors] = useState(null);

  useEffect(() => {
    let active = true;

    api
      .get('/public/doctors', {
        params: { limit: 9 },
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
        <div className="mb-9 grid items-end gap-4 lg:mb-12 lg:grid-cols-[1.3fr_0.7fr] lg:gap-20">
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

          <p className="mb-0 max-w-[650px] leading-7 text-muted">
            Bastly brings together instructors across different subjects and levels,
            each with a dedicated profile and their own course experience.
          </p>
        </div>

        {doctors === null ? (
          <PreviewCarousel label="Loading instructor previews">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="aspect-[4/5.5] animate-pulse rounded-[26px] border border-line bg-surface"
              />
            ))}
          </PreviewCarousel>
        ) : doctors.length ? (
          <PreviewCarousel label="Bastly instructors">
            {doctors.map((doctor) => (
              <DoctorCard
                doctor={doctor}
                headingLevel="h3"
                key={doctor._id}
              />
            ))}
          </PreviewCarousel>
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

        <div className="mt-8 flex justify-center lg:mt-10">
          <Link
            to="/doctors"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-bastly-blue px-6 font-extrabold text-white no-underline shadow-[0_12px_28px_rgba(35,127,209,0.22)] transition hover:-translate-y-0.5 hover:bg-bastly-blue-dark"
          >
            Meet all instructors <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
