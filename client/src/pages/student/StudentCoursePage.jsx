import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Clock3,
  ExternalLink,
  FileText,
  PlayCircle,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { api, apiErrorMessage } from '../../services/api';

export default function StudentCoursePage() {
  const { courseId } = useParams();
  const [workspace, setWorkspace] = useState(null);
  const [selectedLessonId, setSelectedLessonId] = useState('');
  const [lessonData, setLessonData] = useState(null);
  const [loadingLesson, setLoadingLesson] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const loadWorkspace = useCallback(async () => {
    try {
      const { data } = await api.get(
        `/student/courses/${courseId}`,
      );

      setWorkspace(data);

      const allLessons = data.modules.flatMap(
        (module) => module.lessons || [],
      );

      setSelectedLessonId((current) => {
        if (
          current &&
          allLessons.some(
            (lesson) => String(lesson._id) === String(current),
          )
        ) {
          return current;
        }

        return (
          String(data.nextLessonId || '') ||
          String(allLessons[0]?._id || '')
        );
      });
    } catch (err) {
      setError(
        apiErrorMessage(
          err,
          'Could not open this course.',
        ),
      );
    }
  }, [courseId]);

  useEffect(() => {
    loadWorkspace();
  }, [loadWorkspace]);

  useEffect(() => {
    if (!selectedLessonId) {
      setLessonData(null);
      return;
    }

    let active = true;
    setLoadingLesson(true);
    setError('');

    api
      .get(`/student/lessons/${selectedLessonId}`)
      .then(({ data }) => {
        if (active) setLessonData(data);
      })
      .catch((err) => {
        if (active) {
          setError(
            apiErrorMessage(
              err,
              'Could not open this lesson.',
            ),
          );
        }
      })
      .finally(() => {
        if (active) setLoadingLesson(false);
      });

    return () => {
      active = false;
    };
  }, [selectedLessonId]);

  const allLessons = useMemo(
    () =>
      (workspace?.modules || []).flatMap(
        (module) => module.lessons || [],
      ),
    [workspace],
  );

  const currentIndex = allLessons.findIndex(
    (lesson) =>
      String(lesson._id) === String(selectedLessonId),
  );

  const nextLesson =
    currentIndex >= 0
      ? allLessons[currentIndex + 1] || null
      : null;

  const setCompleted = async (completed) => {
    if (!lessonData?.lesson?._id) return;

    setBusy(true);
    setError('');

    try {
      await api.patch(
        `/student/lessons/${lessonData.lesson._id}/completion`,
        { completed },
      );

      setLessonData((current) => ({
        ...current,
        lesson: {
          ...current.lesson,
          completed,
          completedAt: completed
            ? new Date().toISOString()
            : null,
        },
      }));

      await loadWorkspace();
    } catch (err) {
      setError(
        apiErrorMessage(
          err,
          'Could not update lesson progress.',
        ),
      );
    } finally {
      setBusy(false);
    }
  };

  if (!workspace && !error) {
    return (
      <main className="grid min-h-[calc(100vh-4rem)] place-items-center">
        <div className="size-8 animate-spin rounded-full border-2 border-bastly-blue/20 border-t-bastly-blue" />
      </main>
    );
  }

  if (!workspace) {
    return (
      <main className="px-4 py-8 sm:px-6 lg:px-8">
        <Link
          to="/student/courses"
          className="mb-5 inline-flex items-center gap-2 text-sm font-extrabold text-bastly-blue-dark no-underline"
        >
          <ArrowLeft size={16} />
          My courses
        </Link>
        <ErrorBox message={error} />
      </main>
    );
  }

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <Link
        to="/student/courses"
        className="mb-5 inline-flex items-center gap-2 text-sm font-extrabold text-bastly-blue-dark no-underline"
      >
        <ArrowLeft size={16} />
        My courses
      </Link>

      <div className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="mb-2 text-[0.68rem] font-extrabold uppercase tracking-[0.08em] text-bastly-blue">
            {workspace.course?.academicYear}
          </p>
          <h1 className="mb-2 font-heading text-[clamp(2rem,5vw,3.2rem)] font-bold tracking-[-0.055em] text-bastly-navy">
            {workspace.course?.title}
          </h1>
          <p className="mb-0 text-sm text-muted">
            {workspace.course?.doctorProfile?.displayName}
            {workspace.course?.level
              ? ` · ${workspace.course.level}`
              : ''}
            {workspace.course?.curriculum
              ? ` · ${workspace.course.curriculum}`
              : ''}
          </p>
        </div>

        <div className="w-full max-w-[360px]">
          <div className="mb-2 flex items-center justify-between text-xs font-bold">
            <span className="text-muted">
              {workspace.progress.completedLessons} /{' '}
              {workspace.progress.totalLessons} lessons
            </span>
            <span className="text-bastly-blue-dark">
              {workspace.progress.percentage}%
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white shadow-inner">
            <div
              className="h-full rounded-full bg-bastly-blue"
              style={{
                width: `${workspace.progress.percentage}%`,
              }}
            />
          </div>
        </div>
      </div>

      {error && <ErrorBox message={error} />}

      <div className="grid gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="self-start overflow-hidden rounded-[26px] border border-line bg-white shadow-soft xl:sticky xl:top-[84px]">
          <div className="border-b border-line bg-surface px-5 py-4">
            <p className="mb-1 text-[0.67rem] font-extrabold uppercase tracking-[0.08em] text-bastly-blue">
              Course outline
            </p>
            <p className="mb-0 font-heading text-lg font-bold text-bastly-navy">
              Modules & lessons
            </p>
          </div>

          <div className="max-h-[calc(100vh-190px)] overflow-y-auto">
            {workspace.modules.map((module, moduleIndex) => (
              <section
                key={module._id}
                className="border-b border-line last:border-b-0"
              >
                <div className="px-5 py-4">
                  <p className="mb-1 text-[0.62rem] font-extrabold uppercase tracking-[0.08em] text-muted">
                    Module {moduleIndex + 1}
                  </p>
                  <p className="mb-0 font-heading text-sm font-bold text-bastly-navy">
                    {module.title}
                  </p>
                </div>

                <div className="grid gap-1 px-2 pb-3">
                  {(module.lessons || []).map(
                    (lesson, lessonIndex) => {
                      const active =
                        String(lesson._id) ===
                        String(selectedLessonId);

                      return (
                        <button
                          type="button"
                          key={lesson._id}
                          onClick={() =>
                            setSelectedLessonId(
                              String(lesson._id),
                            )
                          }
                          className={[
                            'flex items-start gap-3 rounded-2xl px-3 py-3 text-left transition',
                            active
                              ? 'bg-bastly-blue-pale'
                              : 'hover:bg-surface',
                          ].join(' ')}
                        >
                          {lesson.completed ? (
                            <CheckCircle2
                              size={17}
                              className="mt-0.5 shrink-0 text-[#18764a]"
                            />
                          ) : (
                            <Circle
                              size={17}
                              className="mt-0.5 shrink-0 text-muted"
                            />
                          )}

                          <div className="min-w-0">
                            <p
                              className={[
                                'mb-0 text-xs font-extrabold',
                                active
                                  ? 'text-bastly-blue-dark'
                                  : 'text-bastly-navy',
                              ].join(' ')}
                            >
                              {lessonIndex + 1}. {lesson.title}
                            </p>
                            {lesson.durationMinutes !== null &&
                              lesson.durationMinutes !==
                                undefined && (
                                <p className="mt-1 mb-0 text-[0.64rem] text-muted">
                                  {lesson.durationMinutes} min
                                </p>
                              )}
                          </div>
                        </button>
                      );
                    },
                  )}

                  {module.lessons?.length === 0 && (
                    <p className="px-3 pb-2 text-xs text-muted">
                      No published lessons yet.
                    </p>
                  )}
                </div>
              </section>
            ))}
          </div>
        </aside>

        <section className="min-w-0">
          {!selectedLessonId ? (
            <div className="rounded-[28px] border border-line bg-white p-10 text-center shadow-soft">
              <p className="mb-2 font-heading text-xl font-bold text-bastly-navy">
                Lessons are coming.
              </p>
              <p className="mb-0 text-sm text-muted">
                Your doctor has not published a lesson in this course yet.
              </p>
            </div>
          ) : loadingLesson ? (
            <div className="grid min-h-[420px] place-items-center rounded-[28px] border border-line bg-white shadow-soft">
              <div className="size-8 animate-spin rounded-full border-2 border-bastly-blue/20 border-t-bastly-blue" />
            </div>
          ) : lessonData ? (
            <div className="grid gap-5">
              <article className="overflow-hidden rounded-[28px] border border-line bg-white shadow-card">
                <div className="aspect-video bg-black">
                  {lessonData.lesson.embedUrl ? (
                    <iframe
                      src={lessonData.lesson.embedUrl}
                      title={lessonData.lesson.title}
                      className="size-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      referrerPolicy="strict-origin-when-cross-origin"
                    />
                  ) : (
                    <div className="grid size-full place-items-center text-sm text-white/55">
                      Video unavailable.
                    </div>
                  )}
                </div>

                <div className="p-5 sm:p-7">
                  <div className="mb-3 flex flex-wrap items-center gap-2 text-[0.68rem] font-bold text-muted">
                    <span className="rounded-full bg-surface px-2.5 py-1">
                      {lessonData.module?.title}
                    </span>

                    {lessonData.lesson.durationMinutes !== null &&
                      lessonData.lesson.durationMinutes !==
                        undefined && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2.5 py-1">
                          <Clock3 size={13} />
                          {lessonData.lesson.durationMinutes} min
                        </span>
                      )}
                  </div>

                  <h2 className="mb-3 font-heading text-[clamp(1.8rem,4vw,2.6rem)] font-bold tracking-[-0.045em] text-bastly-navy">
                    {lessonData.lesson.title}
                  </h2>

                  {lessonData.lesson.description && (
                    <p className="mb-5 whitespace-pre-line text-sm leading-7 text-muted">
                      {lessonData.lesson.description}
                    </p>
                  )}

                  <div className="flex flex-col gap-3 border-t border-line pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() =>
                        setCompleted(
                          !lessonData.lesson.completed,
                        )
                      }
                      className={[
                        'inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 text-sm font-extrabold disabled:opacity-50',
                        lessonData.lesson.completed
                          ? 'border border-[#4b9e73]/30 bg-[#eef8f1] text-[#18764a]'
                          : 'bg-bastly-blue text-white',
                      ].join(' ')}
                    >
                      {lessonData.lesson.completed ? (
                        <>
                          <CheckCircle2 size={17} />
                          Completed
                        </>
                      ) : (
                        <>
                          <Circle size={17} />
                          Mark complete
                        </>
                      )}
                    </button>

                    {nextLesson && (
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedLessonId(
                            String(nextLesson._id),
                          )
                        }
                        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-line px-4 text-sm font-extrabold text-bastly-navy transition hover:border-bastly-blue/25 hover:text-bastly-blue-dark"
                      >
                        Next lesson
                        <PlayCircle size={17} />
                      </button>
                    )}
                  </div>
                </div>
              </article>

              {(lessonData.lesson.resources || []).length >
                0 && (
                <section className="rounded-[26px] border border-line bg-white p-5 shadow-soft sm:p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-2xl bg-bastly-blue-pale text-bastly-blue">
                      <FileText size={17} />
                    </span>
                    <div>
                      <p className="mb-0 font-heading text-lg font-bold text-bastly-navy">
                        Lesson resources
                      </p>
                      <p className="mb-0 text-xs text-muted">
                        External notes, sheets, or references from your doctor.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    {lessonData.lesson.resources.map(
                      (resource, index) => (
                        <a
                          key={`${resource.url}-${index}`}
                          href={resource.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-surface px-4 py-3 text-sm font-bold text-bastly-navy no-underline transition hover:border-bastly-blue/25 hover:bg-white"
                        >
                          <span>{resource.label}</span>
                          <ExternalLink size={15} />
                        </a>
                      ),
                    )}
                  </div>
                </section>
              )}

              <p className="mb-0 px-1 text-xs leading-6 text-muted">
                Lesson completion is a personal learning-progress marker only. It does not affect your weekly grade, quiz score, attendance, or Bastly Spin eligibility.
              </p>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}

function ErrorBox({ message }) {
  return (
    <div className="mb-5 rounded-2xl border border-[#d1605a]/25 bg-[#fff0ef] px-4 py-3 text-sm font-bold text-[#a83d36]">
      {message}
    </div>
  );
}
