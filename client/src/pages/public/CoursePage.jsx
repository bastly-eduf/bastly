import {
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  MessageCircle,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import PublicEmptyState from '../../components/public/PublicEmptyState';
import Seo from '../../components/seo/Seo';
import { api, apiErrorMessage } from '../../services/api';
import {
  courseWhatsAppUrl,
  formatCoursePrice,
} from '../../utils/publicCourse';

export default function CoursePage() {
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
      .get(`/public/courses/${slug}`)
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
              'Could not load this course.',
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

  const course = data?.course;

  const whatsapp = useMemo(
    () => (course ? courseWhatsAppUrl(course) : '#'),
    [course],
  );

  const schema = useMemo(() => {
    if (!course) return null;

    const siteUrl = import.meta.env.VITE_SITE_URL;
    const url = siteUrl
      ? new URL(`/courses/${course.slug}`, siteUrl).toString()
      : undefined;

    return {
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: course.title,
      description:
        course.description ||
        `${course.title} at Bastly Academy.`,
      ...(url ? { url } : {}),
      provider: {
        '@type': 'EducationalOrganization',
        name: 'Bastly Academy',
      },
      instructor: {
        '@type': 'Person',
        name: course.doctorProfile?.displayName,
      },
      educationalLevel: course.level,
      ...(course.priceConfirmed
        ? {
            offers: {
              '@type': 'Offer',
              price: course.price,
              priceCurrency: course.currency || 'EGP',
              availability: 'https://schema.org/InStock',
            },
          }
        : {}),
    };
  }, [course]);

  if (loading) {
    return (
      <main className="grid min-h-[80vh] place-items-center bg-[#061f49]">
        <div className="size-9 animate-spin rounded-full border-2 border-white/20 border-t-white" />
      </main>
    );
  }

  if (notFound) {
    return (
      <>
        <Seo
          title="Course Not Found | Bastly Academy"
          description="This Bastly course could not be found."
          canonicalPath={null}
          noIndex
        />
        <main className="min-h-[75vh] bg-[#f6f9fc] pt-[calc(var(--header-height)+4rem)]">
          <div className="mx-auto w-[min(900px,calc(100%-2rem))]">
            <PublicEmptyState
              title="That course isn't available."
              description="It may still be a draft, it may have been unpublished, or the link may be outdated."
            />
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Seo
        title={`${course?.title || 'Course'} | Bastly Academy`}
        description={
          course?.description ||
          `Study ${course?.title} with ${course?.doctorProfile?.displayName} at Bastly Academy. View course details and enroll through WhatsApp.`
        }
        canonicalPath={`/courses/${course?.slug || slug}`}
        image={
          course?.doctorProfile?.imageVariants?.profile ||
          course?.doctorProfile?.imageUrl ||
          '/brand/icon-512.png'
        }
        schema={schema}
      />

      <main>
        <section className="relative overflow-hidden bg-[#061f49] pb-14 pt-[calc(var(--header-height)+3.5rem)] text-white lg:pb-20 lg:pt-[calc(var(--header-height)+5rem)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_84%_20%,rgba(35,127,209,0.4),transparent_30%),radial-gradient(circle_at_12%_82%,rgba(130,200,255,0.1),transparent_34%)]" />

          <div className="relative mx-auto grid w-[min(1200px,calc(100%-2rem))] gap-8 lg:w-[min(1200px,calc(100%-4rem))] lg:grid-cols-[1fr_390px] lg:items-center lg:gap-16">
            <div>
              <Link
                to="/courses"
                className="mb-8 inline-flex text-sm font-extrabold text-[#82c8ff] no-underline"
              >
                ← All courses
              </Link>

              <div className="mb-4 flex flex-wrap gap-2">
                <span className="rounded-full border border-white/15 bg-white/8 px-3 py-1.5 text-xs font-extrabold">
                  {course?.subject}
                </span>
                <span className="rounded-full border border-white/15 bg-white/8 px-3 py-1.5 text-xs font-extrabold">
                  {course?.level}
                </span>
                {course?.curriculum && (
                  <span className="rounded-full border border-white/15 bg-white/8 px-3 py-1.5 text-xs font-extrabold">
                    {course.curriculum}
                  </span>
                )}
              </div>

              <h1 className="mb-4 max-w-[800px] font-heading text-[clamp(3rem,7vw,5.8rem)] font-bold leading-[0.96] tracking-[-0.07em]">
                {course?.title}
              </h1>

              <p className="mb-6 max-w-[720px] text-sm leading-7 text-white/65 sm:text-base">
                {course?.description ||
                  `Learn ${course?.subject} with ${course?.doctorProfile?.displayName} through Bastly's lessons, assessments, progress tracking, and student experience.`}
              </p>

              <p className="mb-0 text-sm text-white/55">
                with{' '}
                <Link
                  to={`/doctors/${course?.doctorProfile?.slug}`}
                  className="font-extrabold text-white underline decoration-[#82c8ff]/60 underline-offset-4"
                >
                  {course?.doctorProfile?.displayName}
                </Link>
              </p>
            </div>

            <div className="rounded-[30px] border border-white/12 bg-white p-5 text-bastly-navy shadow-[0_30px_100px_rgba(0,0,0,0.28)] sm:p-6">
              <p className="mb-1 text-[0.68rem] font-extrabold uppercase tracking-[0.08em] text-bastly-blue">
                Enrollment
              </p>
              <p className="mb-4 font-heading text-3xl font-bold tracking-[-0.05em]">
                {formatCoursePrice(course)}
              </p>

              <div className="mb-5 grid gap-3 rounded-2xl bg-surface p-4 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted">
                    Academic year
                  </span>
                  <strong>{course?.academicYear}</strong>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-muted">
                    Access until
                  </span>
                  <strong>
                    {course?.accessEndDate
                      ? new Date(
                          course.accessEndDate,
                        ).toLocaleDateString('en-GB')
                      : '—'}
                  </strong>
                </div>
              </div>

              <a
                href={whatsapp}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#1fa855] px-4 text-sm font-extrabold text-white no-underline transition hover:-translate-y-0.5"
              >
                <MessageCircle size={18} />
                Enroll via WhatsApp
              </a>

              {!course?.priceConfirmed && (
                <p className="mt-3 mb-0 text-center text-[0.68rem] leading-5 text-muted">
                  Bastly will confirm the current course price and payment details on WhatsApp.
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="bg-white py-14 lg:py-20">
          <div className="mx-auto grid w-[min(1200px,calc(100%-2rem))] gap-8 lg:w-[min(1200px,calc(100%-4rem))] lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            <div>
              <p className="mb-3 text-[0.72rem] font-extrabold uppercase tracking-[0.1em] text-bastly-blue">
                Course experience
              </p>
              <h2 className="mb-4 font-heading text-[clamp(2.1rem,4vw,3.5rem)] font-bold tracking-[-0.055em] text-bastly-navy">
                More than a video playlist.
              </h2>
              <p className="mb-7 max-w-[700px] text-sm leading-7 text-muted">
                Bastly brings the course content, assessment flow,
                attendance, weekly performance, and rewards into one
                student account.
              </p>

              <div className="grid gap-3 sm:grid-cols-2">
                <Feature
                  icon={BookOpen}
                  title="Published lessons"
                  text="Course modules and lessons become available inside the student's protected learning area."
                />
                <Feature
                  icon={CheckCircle2}
                  title="Quizzes & homework"
                  text="One-attempt quizzes and repeatable homework with immediate grading."
                />
                <Feature
                  icon={ShieldCheck}
                  title="Progress tracking"
                  text="Attendance and academic performance are available to the student and linked parent."
                />
                <Feature
                  icon={Sparkles}
                  title="Bastly rewards"
                  text="Eligible all-Star quiz weeks can unlock a Bastly Spin and partner reward."
                />
              </div>
            </div>

            <div className="rounded-[28px] border border-line bg-[#f6f9fc] p-5 sm:p-6">
              <p className="mb-2 text-[0.68rem] font-extrabold uppercase tracking-[0.08em] text-bastly-blue">
                Available groups
              </p>
              <h2 className="mb-5 font-heading text-2xl font-bold tracking-[-0.04em] text-bastly-navy">
                Ask Bastly which group fits you.
              </h2>

              <div className="grid gap-3">
                {(data?.groups || []).map((group) => (
                  <div
                    key={group._id}
                    className="rounded-2xl border border-line bg-white p-4"
                  >
                    <p className="mb-1 font-heading text-sm font-bold text-bastly-navy">
                      {group.name}
                    </p>
                    <p className="mb-0 text-xs leading-5 text-muted">
                      {group.scheduleLabel ||
                        'Schedule details available through Bastly.'}
                    </p>
                  </div>
                ))}

                {data?.groups?.length === 0 && (
                  <p className="mb-0 rounded-2xl bg-white p-4 text-sm leading-6 text-muted">
                    Group availability is confirmed directly with Bastly through WhatsApp.
                  </p>
                )}
              </div>

              <a
                href={whatsapp}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-bastly-blue/20 bg-white px-4 text-sm font-extrabold text-bastly-blue-dark no-underline"
              >
                Ask about groups
                <ArrowUpRight size={15} />
              </a>
            </div>
          </div>
        </section>

        <section className="bg-[#f6f9fc] py-14 lg:py-20">
          <div className="mx-auto grid w-[min(1200px,calc(100%-2rem))] gap-8 lg:w-[min(1200px,calc(100%-4rem))] lg:grid-cols-[0.75fr_1.25fr] lg:gap-14">
            <div>
              <p className="mb-3 text-[0.72rem] font-extrabold uppercase tracking-[0.1em] text-bastly-blue">
                Your instructor
              </p>
              <h2 className="mb-3 font-heading text-[clamp(2rem,4vw,3.2rem)] font-bold tracking-[-0.05em] text-bastly-navy">
                {course?.doctorProfile?.displayName}
              </h2>
              <p className="mb-5 text-sm leading-7 text-muted">
                {course?.doctorProfile?.bio ||
                  `${course?.doctorProfile?.subject} instructor at Bastly Academy.`}
              </p>

              <Link
                to={`/doctors/${course?.doctorProfile?.slug}`}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-bastly-navy px-4 text-sm font-extrabold text-white no-underline"
              >
                View instructor profile
                <ArrowUpRight size={15} />
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <InfoRow
                icon={CalendarDays}
                label="Academic year"
                value={course?.academicYear}
              />
              <InfoRow
                icon={Clock3}
                label="Course access"
                value={
                  course?.accessEndDate
                    ? `Through ${new Date(
                        course.accessEndDate,
                      ).toLocaleDateString('en-GB')}`
                    : 'Confirmed by Bastly'
                }
              />
            </div>
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

function Feature({ icon: Icon, title, text }) {
  return (
    <div className="rounded-[22px] border border-line bg-surface p-4">
      <span className="mb-3 grid size-10 place-items-center rounded-2xl bg-bastly-blue-pale text-bastly-blue">
        <Icon size={17} />
      </span>
      <p className="mb-1 font-heading text-sm font-bold text-bastly-navy">
        {title}
      </p>
      <p className="mb-0 text-xs leading-5 text-muted">
        {text}
      </p>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="rounded-[24px] border border-line bg-white p-5 shadow-soft">
      <Icon
        size={18}
        className="mb-4 text-bastly-blue"
      />
      <p className="mb-1 text-[0.67rem] font-bold uppercase tracking-[0.06em] text-muted">
        {label}
      </p>
      <p className="mb-0 font-heading text-xl font-bold text-bastly-navy">
        {value}
      </p>
    </div>
  );
}
