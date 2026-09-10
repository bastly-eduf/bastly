import { Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import DoctorCard from '../../components/public/DoctorCard';
import PublicEmptyState from '../../components/public/PublicEmptyState';
import PublicPageHero from '../../components/public/PublicPageHero';
import Seo from '../../components/seo/Seo';
import { api, apiErrorMessage } from '../../services/api';

export default function DoctorsPage() {
  const [data, setData] = useState({
    doctors: [],
    filters: { subjects: [], levels: [] },
  });
  const [query, setQuery] = useState('');
  const [subject, setSubject] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    api
      .get('/public/doctors')
      .then(({ data: response }) => {
        if (active) setData(response);
      })
      .catch((err) => {
        if (active) {
          setError(
            apiErrorMessage(
              err,
              'Could not load Bastly instructors.',
            ),
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const doctors = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return data.doctors.filter((doctor) => {
      const matchesQuery =
        !normalized ||
        [
          doctor.displayName,
          doctor.subject,
          ...(doctor.levels || []),
        ]
          .join(' ')
          .toLowerCase()
          .includes(normalized);

      const matchesSubject =
        !subject || doctor.subject === subject;

      return matchesQuery && matchesSubject;
    });
  }, [data.doctors, query, subject]);

  return (
    <>
      <Seo
        title="Bastly Academy Instructors | Meet the Teaching Team"
        description="Meet Bastly Academy instructors across Biology, Chemistry, Physics, ICT, Mathematics, English, Business, Psychology and more."
        canonicalPath="/doctors"
        schema={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'Bastly Academy Instructors',
          description:
            'The public instructor directory for Bastly Academy.',
        }}
      />

      <main>
        <PublicPageHero
          eyebrow="Meet the team"
          title="The people behind the lessons."
          description="Explore Bastly instructors by subject, open their profiles, and find the courses they teach."
          aside={
            <div className="rounded-[22px] border border-white/10 bg-white/8 px-5 py-4 backdrop-blur-md">
              <p className="mb-0 font-heading text-3xl font-bold">
                {loading ? '—' : data.doctors.length}
              </p>
              <p className="mb-0 text-xs text-white/55">
                published instructors
              </p>
            </div>
          }
        />

        <section className="bg-[#f6f9fc] py-12 lg:py-18">
          <div className="mx-auto w-[min(1200px,calc(100%-2rem))] lg:w-[min(1200px,calc(100%-4rem))]">
            <div className="mb-8 grid gap-3 rounded-[24px] border border-line bg-white p-3 shadow-soft md:grid-cols-[1fr_280px]">
              <label className="flex min-h-12 items-center gap-3 rounded-2xl bg-surface px-4">
                <Search
                  size={18}
                  className="shrink-0 text-bastly-blue"
                />
                <input
                  value={query}
                  onChange={(event) =>
                    setQuery(event.target.value)
                  }
                  placeholder="Search instructor, subject or level..."
                  className="min-w-0 flex-1 bg-transparent text-sm text-bastly-navy outline-none placeholder:text-muted"
                />
              </label>

              <select
                value={subject}
                onChange={(event) =>
                  setSubject(event.target.value)
                }
                className="min-h-12 rounded-2xl border-0 bg-surface px-4 text-sm font-bold text-bastly-navy outline-none"
              >
                <option value="">All subjects</option>
                {data.filters?.subjects?.map((item) => (
                  <option value={item} key={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            {error && (
              <div className="mb-6 rounded-2xl bg-[#fff0ef] px-4 py-3 text-sm font-bold text-[#a83d36]">
                {error}
              </div>
            )}

            {loading ? (
              <LoadingGrid />
            ) : doctors.length ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {doctors.map((doctor) => (
                  <DoctorCard
                    doctor={doctor}
                    key={doctor._id}
                  />
                ))}
              </div>
            ) : (
              <PublicEmptyState
                title={
                  data.doctors.length
                    ? 'No instructors match those filters.'
                    : 'Instructor profiles are being prepared.'
                }
                description={
                  data.doctors.length
                    ? 'Try another subject or clear your search.'
                    : 'Published Bastly instructor profiles will appear here as the academy team is added.'
                }
              />
            )}
          </div>
        </section>
      </main>
    </>
  );
}

function LoadingGrid() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <div
          key={index}
          className="aspect-[4/5.6] animate-pulse rounded-[26px] border border-line bg-white shadow-soft"
        />
      ))}
    </div>
  );
}
