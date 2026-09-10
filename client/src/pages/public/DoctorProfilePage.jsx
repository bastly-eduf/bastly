import {
  Award,
  BookOpen,
  BriefcaseBusiness,
  GraduationCap,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import CourseCard from '../../components/public/CourseCard';
import PublicEmptyState from '../../components/public/PublicEmptyState';
import Seo from '../../components/seo/Seo';
import { api, apiErrorMessage } from '../../services/api';

export default function DoctorProfilePage() {
  const { slug } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setNotFound(false);
    setError('');

    api
      .get(`/public/doctors/${slug}`)
      .then(({ data: response }) => {
        if (active) setData(response);
      })
      .catch((err) => {
        if (!active) return;

        if (err?.response?.status === 404) {
          setNotFound(true);
        } else {
          setError(
            apiErrorMessage(
              err,
              'Could not load this instructor.',
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
  }, [slug]);

  const doctor = data?.doctor;

  const schema = useMemo(() => {
    if (!doctor) return null;

    const siteUrl = import.meta.env.VITE_SITE_URL;
    const image = doctor.imageUrl
      ? siteUrl
        ? new URL(doctor.imageUrl, siteUrl).toString()
        : doctor.imageUrl
      : undefined;

    return {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: doctor.displayName,
      jobTitle: `${doctor.subject} Instructor`,
      description:
        doctor.bio ||
        `${doctor.displayName} teaches ${doctor.subject} at Bastly Academy.`,
      ...(image ? { image } : {}),
      worksFor: {
        '@type': 'EducationalOrganization',
        name: 'Bastly Academy',
      },
    };
  }, [doctor]);

  if (loading) {
    return <PageLoading />;
  }

  if (notFound) {
    return (
      <>
        <Seo
          title="Instructor Not Found | Bastly Academy"
          description="This Bastly instructor profile could not be found."
          canonicalPath={null}
          noIndex
        />
        <main className="min-h-[75vh] bg-[#f6f9fc] pt-[calc(var(--header-height)+4rem)]">
          <div className="mx-auto w-[min(900px,calc(100%-2rem))]">
            <PublicEmptyState
              title="That instructor profile isn't available."
              description="It may have been unpublished or the link may be outdated."
            />
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Seo
        title={`${doctor?.displayName || 'Instructor'} | Bastly Academy`}
        description={
          doctor?.bio ||
          `Learn with ${doctor?.displayName}, ${doctor?.subject} instructor at Bastly Academy. Explore their profile and published courses.`
        }
        canonicalPath={`/doctors/${doctor?.slug || slug}`}
        image={doctor?.imageUrl || '/brand/icon-512.png'}
        type="profile"
        schema={schema}
      />

      <main>
        <section className="relative overflow-hidden bg-[#061f49] pb-14 pt-[calc(var(--header-height)+3.5rem)] text-white lg:pb-20 lg:pt-[calc(var(--header-height)+5rem)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(35,127,209,0.38),transparent_30%),radial-gradient(circle_at_15%_90%,rgba(130,200,255,0.12),transparent_32%)]" />

          <div className="relative mx-auto grid w-[min(1200px,calc(100%-2rem))] items-center gap-8 lg:w-[min(1200px,calc(100%-4rem))] lg:grid-cols-[1fr_390px] lg:gap-16">
            <div>
              <Link
                to="/doctors"
                className="mb-8 inline-flex text-sm font-extrabold text-[#82c8ff] no-underline"
              >
                ← All instructors
              </Link>

              <p className="mb-3 text-[0.75rem] font-extrabold uppercase tracking-[0.12em] text-[#82c8ff]">
                {doctor?.subject}
              </p>

              <h1 className="mb-4 max-w-[760px] font-heading text-[clamp(3rem,7vw,6rem)] font-bold leading-[0.96] tracking-[-0.07em]">
                {doctor?.displayName}
              </h1>

              <p className="mb-6 max-w-[720px] text-sm leading-7 text-white/65 sm:text-base">
                {doctor?.bio ||
                  `Explore ${doctor?.subject} courses and levels taught by ${doctor?.displayName} at Bastly Academy.`}
              </p>

              <div className="flex flex-wrap gap-2">
                {(doctor?.levels || []).map((level) => (
                  <span
                    key={level}
                    className="rounded-full border border-white/15 bg-white/8 px-3 py-1.5 text-xs font-extrabold text-white/80 backdrop-blur-md"
                  >
                    {level}
                  </span>
                ))}
              </div>
            </div>

            <div className="mx-auto w-full max-w-[390px]">
              <div className="relative aspect-[4/4.7] overflow-hidden rounded-[34px] border border-white/12 bg-white/8 shadow-[0_30px_100px_rgba(0,0,0,0.28)]">
                {doctor?.imageUrl ? (
                  <img
                    src={doctor.imageUrl}
                    alt={doctor.displayName}
                    className="size-full object-cover object-[center_12%]"
                  />
                ) : (
                  <div className="grid size-full place-items-center font-heading text-6xl font-bold text-white/20">
                    {doctor?.displayName
                      ?.split(' ')
                      .slice(0, 2)
                      .map((part) => part[0])
                      .join('')}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-14 lg:py-20">
          <div className="mx-auto grid w-[min(1200px,calc(100%-2rem))] gap-8 lg:w-[min(1200px,calc(100%-4rem))] lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
            <div>
              <p className="mb-3 text-[0.72rem] font-extrabold uppercase tracking-[0.1em] text-bastly-blue">
                Instructor profile
              </p>
              <h2 className="mb-4 font-heading text-[clamp(2.1rem,4vw,3.5rem)] font-bold tracking-[-0.055em] text-bastly-navy">
                Teaching experience that students can trust.
              </h2>
              <p className="mb-0 text-sm leading-7 text-muted">
                {doctor?.bio ||
                  'Profile details are being completed by Bastly Academy.'}
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <ProfilePanel
                icon={GraduationCap}
                title="Levels"
                items={doctor?.levels}
                empty="Levels will be added soon."
              />
              <ProfilePanel
                icon={Award}
                title="Qualifications"
                items={doctor?.qualifications}
                empty="Qualifications will be added soon."
              />
              <ProfilePanel
                icon={BriefcaseBusiness}
                title="Experience"
                items={doctor?.experience}
                empty="Experience highlights will be added soon."
                wide
              />
            </div>
          </div>
        </section>

        <section className="bg-[#f6f9fc] py-14 lg:py-20">
          <div className="mx-auto w-[min(1200px,calc(100%-2rem))] lg:w-[min(1200px,calc(100%-4rem))]">
            <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="mb-2 text-[0.72rem] font-extrabold uppercase tracking-[0.1em] text-bastly-blue">
                  <BookOpen
                    size={15}
                    className="mr-2 inline"
                  />
                  Published courses
                </p>
                <h2 className="mb-0 font-heading text-[clamp(2rem,4vw,3.3rem)] font-bold tracking-[-0.05em] text-bastly-navy">
                  Learn with {doctor?.displayName}.
                </h2>
              </div>

              <p className="mb-0 text-sm text-muted">
                {data?.courses?.length || 0}{' '}
                {data?.courses?.length === 1
                  ? 'course'
                  : 'courses'}
              </p>
            </div>

            {data?.courses?.length ? (
              <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
                {data.courses.map((course) => (
                  <CourseCard
                    course={course}
                    key={course._id}
                  />
                ))}
              </div>
            ) : (
              <PublicEmptyState
                title="No published courses yet."
                description="This instructor's course pages will appear here when Bastly publishes them."
              />
            )}
          </div>
        </section>

        {error && (
          <div className="mx-auto my-6 w-[min(1200px,calc(100%-2rem))] rounded-2xl bg-[#fff0ef] px-4 py-3 text-sm font-bold text-[#a83d36]">
            {error}
          </div>
        )}
      </main>
    </>
  );
}

function ProfilePanel({
  icon: Icon,
  title,
  items = [],
  empty,
  wide = false,
}) {
  return (
    <div
      className={[
        'rounded-[24px] border border-line bg-surface p-5',
        wide ? 'sm:col-span-2' : '',
      ].join(' ')}
    >
      <span className="mb-4 grid size-10 place-items-center rounded-2xl bg-bastly-blue-pale text-bastly-blue">
        <Icon size={17} />
      </span>

      <h3 className="mb-3 font-heading text-lg font-bold text-bastly-navy">
        {title}
      </h3>

      {items?.length ? (
        <ul className="m-0 grid gap-2 p-0 text-sm leading-6 text-muted">
          {items.map((item) => (
            <li
              className="flex items-start gap-2"
              key={item}
            >
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-bastly-blue" />
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mb-0 text-sm text-muted">{empty}</p>
      )}
    </div>
  );
}

function PageLoading() {
  return (
    <main className="grid min-h-[80vh] place-items-center bg-[#061f49]">
      <div className="size-9 animate-spin rounded-full border-2 border-white/20 border-t-white" />
    </main>
  );
}
