import { Search } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import CourseCard from '../../components/public/CourseCard';
import DirectoryPagination from '../../components/public/DirectoryPagination';
import PublicEmptyState from '../../components/public/PublicEmptyState';
import PublicPageHero from '../../components/public/PublicPageHero';
import Seo from '../../components/seo/Seo';
import { api, apiErrorMessage } from '../../services/api';

const PAGE_SIZE = 9;

export default function CoursesPage() {
  const [data, setData] = useState({
    courses: [],
    filters: {
      subjects: [],
      levels: [],
      curricula: [],
    },
  });
  const [query, setQuery] = useState('');
  const [subject, setSubject] = useState('');
  const [level, setLevel] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const resultsRef = useRef(null);

  useEffect(() => {
    let active = true;

    api
      .get('/public/courses')
      .then(({ data: response }) => {
        if (active) setData(response);
      })
      .catch((err) => {
        if (active) {
          setError(
            apiErrorMessage(
              err,
              'Could not load Bastly courses.',
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

  const courses = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return data.courses.filter((course) => {
      const searchable = [
        course.title,
        course.subject,
        course.level,
        course.curriculum,
        course.academicYear,
        course.doctorProfile?.displayName,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return (
        (!normalized || searchable.includes(normalized)) &&
        (!subject || course.subject === subject) &&
        (!level || course.level === level)
      );
    });
  }, [data.courses, query, subject, level]);

  const totalPages = Math.max(
    1,
    Math.ceil(courses.length / PAGE_SIZE),
  );

  const visibleCourses = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return courses.slice(start, start + PAGE_SIZE);
  }, [courses, page]);

  useEffect(() => {
    setPage(1);
  }, [query, subject, level]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const changePage = (nextPage) => {
    const safePage = Math.min(Math.max(nextPage, 1), totalPages);
    if (safePage === page) return;

    setPage(safePage);

    window.requestAnimationFrame(() => {
      const prefersReducedMotion = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches;

      resultsRef.current?.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'start',
      });
    });
  };

  return (
    <>
      <Seo
        title="Bastly Academy Courses | IGCSE & School Learning"
        description="Explore published Bastly Academy courses by subject, level and instructor. View course details and enroll directly through WhatsApp."
        canonicalPath="/courses"
        schema={{
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'Bastly Academy Courses',
          description:
            'The public course directory for Bastly Academy.',
        }}
      />

      <main>
        <PublicPageHero
          eyebrow="Explore courses"
          title="Find the right course. Then make it yours."
          description="Browse published Bastly courses by subject and level, meet the instructor, and start enrollment through WhatsApp."
          aside={
            <div className="rounded-[22px] border border-white/10 bg-white/8 px-5 py-4 backdrop-blur-md">
              <p className="mb-0 font-heading text-3xl font-bold">
                {loading ? '—' : data.courses.length}
              </p>
              <p className="mb-0 text-xs text-white/55">
                published courses
              </p>
            </div>
          }
        />

        <section className="bg-[#f6f9fc] py-12 lg:py-18">
          <div className="mx-auto w-[min(1200px,calc(100%-2rem))] lg:w-[min(1200px,calc(100%-4rem))]">
            <div className="mb-8 grid gap-3 rounded-[24px] border border-line bg-white p-3 shadow-soft lg:grid-cols-[1fr_240px_240px]">
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
                  placeholder="Search course, subject or instructor..."
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
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>

              <select
                value={level}
                onChange={(event) =>
                  setLevel(event.target.value)
                }
                className="min-h-12 rounded-2xl border-0 bg-surface px-4 text-sm font-bold text-bastly-navy outline-none"
              >
                <option value="">All levels</option>
                {data.filters?.levels?.map((item) => (
                  <option key={item} value={item}>
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

            <div
              ref={resultsRef}
              className="scroll-mt-[calc(var(--header-height)+1.5rem)]"
            >
              {loading ? (
                <LoadingGrid />
              ) : courses.length ? (
                <>
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <p className="mb-0 text-sm text-muted">
                      Showing{' '}
                      <span className="font-bold text-bastly-navy">
                        {(page - 1) * PAGE_SIZE + 1}–
                        {Math.min(page * PAGE_SIZE, courses.length)}
                      </span>{' '}
                      of{' '}
                      <span className="font-bold text-bastly-navy">
                        {courses.length}
                      </span>{' '}
                      courses
                    </p>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    {visibleCourses.map((course) => (
                      <CourseCard
                        course={course}
                        key={course._id}
                      />
                    ))}
                  </div>

                  <DirectoryPagination
                    page={page}
                    totalPages={totalPages}
                    onPageChange={changePage}
                    label="courses"
                  />
                </>
              ) : (
                <PublicEmptyState
                  title={
                    data.courses.length
                      ? 'No courses match those filters.'
                      : 'Course pages are being prepared.'
                  }
                  description={
                    data.courses.length
                      ? 'Try another subject, level or search.'
                      : 'Only published Bastly courses appear here. Draft courses stay private until the academy is ready.'
                  }
                />
              )}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

function LoadingGrid() {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 9 }).map((_, index) => (
        <div
          key={index}
          className="h-[530px] animate-pulse rounded-[26px] border border-line bg-white shadow-soft"
        />
      ))}
    </div>
  );
}
