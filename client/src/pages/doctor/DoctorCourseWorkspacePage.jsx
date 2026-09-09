import {
  Archive,
  ArrowLeft,
  Eye,
  EyeOff,
  Plus,
  Video,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import Modal from '../../components/admin/Modal';
import DoctorPageHeader from '../../components/doctor/DoctorPageHeader';
import { api, apiErrorMessage, apiFieldErrors } from '../../services/api';

export default function DoctorCourseWorkspacePage() {
  const { courseId } = useParams();
  const [workspace, setWorkspace] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState('');
  const [moduleModal, setModuleModal] = useState(false);
  const [lessonModule, setLessonModule] = useState(null);
  const [previewLesson, setPreviewLesson] = useState(null);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get(`/doctor/courses/${courseId}`);
      setWorkspace(data);
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not load this course.'));
    }
  }, [courseId]);

  useEffect(() => {
    load();
  }, [load]);

  const updateModuleStatus = async (module, status) => {
    setBusy(module._id);
    setError('');

    try {
      await api.patch(`/doctor/modules/${module._id}`, { status });
      await load();
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not update the module.'));
    } finally {
      setBusy('');
    }
  };

  const updateLessonStatus = async (lesson, status) => {
    setBusy(lesson._id);
    setError('');

    try {
      await api.patch(`/doctor/lessons/${lesson._id}`, { status });
      await load();
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not update the lesson.'));
    } finally {
      setBusy('');
    }
  };

  if (!workspace && !error) {
    return (
      <main className="grid min-h-[calc(100vh-4rem)] place-items-center">
        <div className="size-8 animate-spin rounded-full border-2 border-bastly-blue/20 border-t-bastly-blue" />
      </main>
    );
  }

  return (
    <main className="px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
      <Link
        to="/doctor/courses"
        className="mb-5 inline-flex items-center gap-2 text-sm font-extrabold text-bastly-blue-dark no-underline"
      >
        <ArrowLeft size={16} />
        My courses
      </Link>

      <DoctorPageHeader
        eyebrow={workspace?.course?.academicYear || 'Course workspace'}
        title={workspace?.course?.title || 'Course'}
        description={`${workspace?.course?.level || ''}${
          workspace?.course?.curriculum
            ? ` · ${workspace.course.curriculum}`
            : ''
        } · ${workspace?.activeStudentCount || 0} active students`}
        action={
          <button
            type="button"
            onClick={() => setModuleModal(true)}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-bastly-blue px-4 text-sm font-extrabold text-white"
          >
            <Plus size={17} />
            Add module
          </button>
        }
      />

      {error && (
        <div className="mb-5 rounded-2xl border border-[#d1605a]/25 bg-[#fff0ef] px-4 py-3 text-sm font-bold text-[#a83d36]">
          {error}
        </div>
      )}

      <div className="mb-6 flex flex-wrap gap-2">
        {(workspace?.groups || []).map((group) => (
          <div
            key={group._id}
            className="rounded-2xl border border-line bg-white px-3 py-2 shadow-soft"
          >
            <p className="mb-0 text-xs font-extrabold text-bastly-navy">
              {group.name}
            </p>
            {group.scheduleLabel && (
              <p className="mt-0.5 mb-0 text-[0.67rem] text-muted">
                {group.scheduleLabel}
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="grid gap-4">
        {(workspace?.modules || []).map((module, moduleIndex) => (
          <section
            key={module._id}
            className="overflow-hidden rounded-[26px] border border-line bg-white shadow-soft"
          >
            <div className="flex flex-col gap-4 border-b border-line bg-surface px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-[0.67rem] font-extrabold uppercase tracking-[0.08em] text-bastly-blue">
                    Module {moduleIndex + 1}
                  </span>
                  <ContentStatus value={module.status} />
                </div>
                <h2 className="mb-1 font-heading text-xl font-bold tracking-[-0.035em] text-bastly-navy">
                  {module.title}
                </h2>
                {module.description && (
                  <p className="mb-0 max-w-[760px] text-xs leading-5 text-muted">
                    {module.description}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {module.status === 'draft' ? (
                  <ActionButton
                    onClick={() => updateModuleStatus(module, 'published')}
                    disabled={busy === module._id}
                    icon={Eye}
                    label="Publish"
                  />
                ) : (
                  <ActionButton
                    onClick={() => updateModuleStatus(module, 'draft')}
                    disabled={busy === module._id}
                    icon={EyeOff}
                    label="Unpublish"
                  />
                )}

                <ActionButton
                  onClick={() => {
                    setError('');
                    setLessonModule(module);
                  }}
                  icon={Plus}
                  label="Add lesson"
                />

                <ActionButton
                  onClick={() => {
                    const confirmed = window.confirm(
                      `Archive "${module.title}" and its lessons?`,
                    );
                    if (confirmed) updateModuleStatus(module, 'archived');
                  }}
                  disabled={busy === module._id}
                  icon={Archive}
                  label="Archive"
                  danger
                />
              </div>
            </div>

            <div className="divide-y divide-line">
              {(module.lessons || []).map((lesson, lessonIndex) => (
                <div
                  key={lesson._id}
                  className="grid gap-4 px-5 py-4 lg:grid-cols-[auto_1fr_auto] lg:items-center"
                >
                  <button
                    type="button"
                    onClick={() => setPreviewLesson(lesson)}
                    className="relative aspect-video w-full overflow-hidden rounded-2xl bg-bastly-navy text-white lg:w-[180px]"
                  >
                    <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_50%_50%,rgba(35,127,209,0.35),transparent_45%)]">
                      <span className="grid size-11 place-items-center rounded-full bg-white text-bastly-blue shadow-xl">
                        <Video size={18} />
                      </span>
                    </div>
                  </button>

                  <div className="min-w-0">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="text-[0.67rem] font-bold text-muted">
                        Lesson {lessonIndex + 1}
                      </span>
                      <ContentStatus value={lesson.status} />
                      {lesson.durationMinutes !== null &&
                        lesson.durationMinutes !== undefined && (
                          <span className="text-[0.67rem] text-muted">
                            {lesson.durationMinutes} min
                          </span>
                        )}
                    </div>

                    <h3 className="mb-1 font-heading text-lg font-bold text-bastly-navy">
                      {lesson.title}
                    </h3>
                    <p className="mb-0 line-clamp-2 text-xs leading-5 text-muted">
                      {lesson.description || 'No lesson description yet.'}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 lg:justify-end">
                    <ActionButton
                      onClick={() => setPreviewLesson(lesson)}
                      icon={Video}
                      label="Preview"
                    />

                    {lesson.status === 'draft' ? (
                      <ActionButton
                        onClick={() =>
                          updateLessonStatus(lesson, 'published')
                        }
                        disabled={busy === lesson._id}
                        icon={Eye}
                        label="Publish"
                      />
                    ) : (
                      <ActionButton
                        onClick={() => updateLessonStatus(lesson, 'draft')}
                        disabled={busy === lesson._id}
                        icon={EyeOff}
                        label="Unpublish"
                      />
                    )}

                    <ActionButton
                      onClick={() => {
                        const confirmed = window.confirm(
                          `Archive "${lesson.title}"?`,
                        );
                        if (confirmed)
                          updateLessonStatus(lesson, 'archived');
                      }}
                      disabled={busy === lesson._id}
                      icon={Archive}
                      label="Archive"
                      danger
                    />
                  </div>
                </div>
              ))}

              {module.lessons?.length === 0 && (
                <div className="px-5 py-8 text-center text-sm text-muted">
                  No lessons yet. Add the first YouTube lesson to this module.
                </div>
              )}
            </div>
          </section>
        ))}

        {workspace?.modules?.length === 0 && (
          <div className="rounded-[24px] border border-line bg-white p-10 text-center shadow-soft">
            <p className="mb-2 font-heading text-xl font-bold text-bastly-navy">
              Start with your first module.
            </p>
            <p className="mx-auto mb-5 max-w-[520px] text-sm leading-6 text-muted">
              Modules keep lessons organised by topic or chapter. Students only see
              published content.
            </p>
            <button
              type="button"
              onClick={() => setModuleModal(true)}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-bastly-blue px-4 font-extrabold text-white"
            >
              <Plus size={17} />
              Add first module
            </button>
          </div>
        )}
      </div>

      <ModuleFormModal
        open={moduleModal}
        courseId={courseId}
        onClose={() => setModuleModal(false)}
        onSaved={async () => {
          setModuleModal(false);
          await load();
        }}
      />

      <LessonFormModal
        module={lessonModule}
        onClose={() => setLessonModule(null)}
        onSaved={async () => {
          setLessonModule(null);
          await load();
        }}
      />

      <PreviewModal
        lesson={previewLesson}
        onClose={() => setPreviewLesson(null)}
      />
    </main>
  );
}

function ContentStatus({ value }) {
  const tone =
    value === 'published'
      ? 'bg-[#eef8f1] text-[#18764a]'
      : 'bg-[#eef3f8] text-[#536579]';

  return (
    <span className={`rounded-full px-2 py-0.5 text-[0.62rem] font-extrabold capitalize ${tone}`}>
      {value}
    </span>
  );
}

function ActionButton({
  onClick,
  disabled,
  icon: Icon,
  label,
  danger = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        'inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-xs font-extrabold transition disabled:opacity-50',
        danger
          ? 'bg-[#fff0ef] text-[#a83d36]'
          : 'border border-line bg-white text-bastly-navy hover:border-bastly-blue/25 hover:text-bastly-blue-dark',
      ].join(' ')}
    >
      <Icon size={14} />
      {label}
    </button>
  );
}

function ModuleFormModal({ open, courseId, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'draft',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');

    try {
      await api.post(`/doctor/courses/${courseId}/modules`, form);
      setForm({ title: '', description: '', status: 'draft' });
      await onSaved();
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not create the module.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} title="Add module" onClose={onClose}>
      <form className="grid gap-4" onSubmit={submit}>
        <Field
          label="Module title"
          value={form.title}
          onChange={(value) => setForm({ ...form, title: value })}
          placeholder="Cell Biology"
          required
        />

        <label className="grid gap-2">
          <span className="text-sm font-extrabold text-bastly-navy">
            Description
          </span>
          <textarea
            rows="4"
            value={form.description}
            onChange={(event) =>
              setForm({ ...form, description: event.target.value })
            }
            className="rounded-2xl border border-line px-4 py-3 text-sm outline-none focus:border-bastly-blue"
          />
        </label>

        <StatusSelect
          value={form.status}
          onChange={(value) => setForm({ ...form, status: value })}
        />

        {error && <ErrorBox message={error} />}

        <button
          type="submit"
          disabled={busy}
          className="min-h-11 rounded-full bg-bastly-blue px-4 font-extrabold text-white disabled:opacity-50"
        >
          {busy ? 'Creating…' : 'Create module'}
        </button>
      </form>
    </Modal>
  );
}

function LessonFormModal({ module, onClose, onSaved }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    youtube: '',
    durationMinutes: '',
    status: 'draft',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (module) {
      setForm({
        title: '',
        description: '',
        youtube: '',
        durationMinutes: '',
        status: 'draft',
      });
      setError('');
      setFieldErrors({});
    }
  }, [module]);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    setFieldErrors({});

    try {
      await api.post(`/doctor/modules/${module._id}/lessons`, {
        ...form,
        durationMinutes:
          form.durationMinutes === '' ? null : Number(form.durationMinutes),
        resources: [],
      });
      await onSaved();
    } catch (err) {
      setFieldErrors(apiFieldErrors(err));
      setError(apiErrorMessage(err, 'Could not create the lesson.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={Boolean(module)}
      title={`Add lesson${module ? ` — ${module.title}` : ''}`}
      onClose={onClose}
    >
      <form className="grid gap-4" onSubmit={submit}>
        <Field
          label="Lesson title"
          value={form.title}
          onChange={(value) => setForm({ ...form, title: value })}
          placeholder="Introduction to Cell Structure"
          required
        />

        <Field
          label="YouTube URL"
          value={form.youtube}
          onChange={(value) => setForm({ ...form, youtube: value })}
          placeholder="https://youtu.be/..."
          required
          error={fieldErrors.youtube}
        />

        <Field
          label="Duration (minutes)"
          type="number"
          value={form.durationMinutes}
          onChange={(value) =>
            setForm({ ...form, durationMinutes: value })
          }
          placeholder="45"
        />

        <label className="grid gap-2">
          <span className="text-sm font-extrabold text-bastly-navy">
            Description
          </span>
          <textarea
            rows="4"
            value={form.description}
            onChange={(event) =>
              setForm({ ...form, description: event.target.value })
            }
            className="rounded-2xl border border-line px-4 py-3 text-sm outline-none focus:border-bastly-blue"
          />
        </label>

        <StatusSelect
          value={form.status}
          onChange={(value) => setForm({ ...form, status: value })}
        />

        <div className="rounded-2xl bg-bastly-blue-pale px-4 py-3 text-xs leading-6 text-muted">
          Use an <strong>Unlisted</strong> YouTube video. Bastly stores only the
          video ID and embeds it through <strong>youtube-nocookie.com</strong>.
          Students will receive video data only through protected course access.
        </div>

        {error && <ErrorBox message={error} />}

        <button
          type="submit"
          disabled={busy}
          className="min-h-11 rounded-full bg-bastly-blue px-4 font-extrabold text-white disabled:opacity-50"
        >
          {busy ? 'Creating…' : 'Create lesson'}
        </button>
      </form>
    </Modal>
  );
}

function PreviewModal({ lesson, onClose }) {
  return (
    <Modal
      open={Boolean(lesson)}
      title={lesson?.title || 'Lesson preview'}
      onClose={onClose}
    >
      {lesson && (
        <div className="grid gap-4">
          <div className="aspect-video overflow-hidden rounded-2xl bg-black">
            {lesson.embedUrl ? (
              <iframe
                src={lesson.embedUrl}
                title={lesson.title}
                className="size-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            ) : (
              <div className="grid size-full place-items-center text-sm text-white/60">
                Video preview unavailable.
              </div>
            )}
          </div>

          {lesson.description && (
            <p className="mb-0 text-sm leading-7 text-muted">
              {lesson.description}
            </p>
          )}

          <p className="mb-0 rounded-2xl bg-surface px-4 py-3 text-xs leading-6 text-muted">
            YouTube Unlisted reduces casual discovery, but it is not DRM. A student
            with legitimate access can still inspect or share a video link, and no
            browser-based platform can prevent screen recording completely.
          </p>
        </div>
      )}
    </Modal>
  );
}

function StatusSelect({ value, onChange }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-extrabold text-bastly-navy">
        Visibility
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-11 rounded-2xl border border-line bg-white px-4 text-sm"
      >
        <option value="draft">Draft — students cannot see it</option>
        <option value="published">Published</option>
      </select>
    </label>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder = '',
  type = 'text',
  required = false,
  error = '',
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-extrabold text-bastly-navy">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        className={[
          'min-h-11 rounded-2xl border px-4 text-sm outline-none focus:ring-4 focus:ring-bastly-blue/10',
          error
            ? 'border-[#d1605a] focus:border-[#d1605a]'
            : 'border-line focus:border-bastly-blue',
        ].join(' ')}
      />
      {error && (
        <span className="text-xs font-bold text-[#a83d36]">{error}</span>
      )}
    </label>
  );
}

function ErrorBox({ message }) {
  return (
    <div className="rounded-2xl border border-[#d1605a]/25 bg-[#fff0ef] px-4 py-3 text-sm font-bold text-[#a83d36]">
      {message}
    </div>
  );
}
