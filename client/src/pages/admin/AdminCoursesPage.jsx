import {
  Edit3,
  ExternalLink,
  Layers3,
  Plus,
  Star,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import AdminPageHeader from '../../components/admin/AdminPageHeader';
import Modal from '../../components/admin/Modal';
import StatusPill from '../../components/admin/StatusPill';
import {
  api,
  apiErrorMessage,
} from '../../services/api';

const initialCourse = {
  doctorProfileId: '',
  title: '',
  subject: '',
  level: '',
  curriculum: '',
  academicYear: '2026/2027',
  description: '',
  price: 5000,
  priceConfirmed: false,
  accessEndDate: '2027-06-30',
  status: 'draft',
  featured: false,
};

function courseToForm(course) {
  return {
    doctorProfileId:
      course.doctorProfile?._id || '',
    title: course.title || '',
    subject: course.subject || '',
    level: course.level || '',
    curriculum: course.curriculum || '',
    academicYear: course.academicYear || '',
    description: course.description || '',
    price: course.price ?? 5000,
    priceConfirmed: Boolean(course.priceConfirmed),
    accessEndDate: course.accessEndDate
      ? new Date(course.accessEndDate)
          .toISOString()
          .slice(0, 10)
      : '',
    status: course.status || 'draft',
    featured: Boolean(course.featured),
  };
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [courseForm, setCourseForm] =
    useState(initialCourse);
  const [editingCourse, setEditingCourse] =
    useState(null);
  const [courseModal, setCourseModal] =
    useState(false);
  const [groupCourse, setGroupCourse] =
    useState(null);
  const [groupForm, setGroupForm] = useState({
    name: '',
    scheduleLabel: '',
    meetingUrl: '',
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    const [coursesResponse, doctorsResponse] =
      await Promise.all([
        api.get('/admin/academic/courses'),
        api.get('/admin/academic/doctor-profiles'),
      ]);

    setCourses(coursesResponse.data.courses || []);
    setDoctors(
      doctorsResponse.data.doctorProfiles || [],
    );
  };

  useEffect(() => {
    load();
  }, []);

  const groupedCount = useMemo(
    () =>
      courses.reduce(
        (sum, course) =>
          sum + (course.groups?.length || 0),
        0,
      ),
    [courses],
  );

  const openCreate = () => {
    setEditingCourse(null);
    setCourseForm(initialCourse);
    setError('');
    setCourseModal(true);
  };

  const openEdit = (course) => {
    setEditingCourse(course);
    setCourseForm(courseToForm(course));
    setError('');
    setCourseModal(true);
  };

  const saveCourse = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');

    const payload = {
      ...courseForm,
      price: Number(courseForm.price),
      accessEndDate: new Date(
        `${courseForm.accessEndDate}T23:59:59Z`,
      ).toISOString(),
    };

    try {
      if (editingCourse) {
        await api.patch(
          `/admin/academic/courses/${editingCourse._id}`,
          payload,
        );
      } else {
        await api.post(
          '/admin/academic/courses',
          payload,
        );
      }

      setCourseForm(initialCourse);
      setEditingCourse(null);
      setCourseModal(false);
      await load();
    } catch (err) {
      setError(
        apiErrorMessage(
          err,
          editingCourse
            ? 'Could not update the course.'
            : 'Could not create the course.',
        ),
      );
    } finally {
      setBusy(false);
    }
  };

  const createGroup = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');

    try {
      await api.post('/admin/academic/groups', {
        courseId: groupCourse._id,
        ...groupForm,
      });

      setGroupForm({
        name: '',
        scheduleLabel: '',
        meetingUrl: '',
      });
      setGroupCourse(null);
      await load();
    } catch (err) {
      setError(
        apiErrorMessage(
          err,
          'Could not create the group.',
        ),
      );
    } finally {
      setBusy(false);
    }
  };

  const toggleCourseStatus = async (course) => {
    setBusy(true);
    setError('');

    try {
      await api.patch(
        `/admin/academic/courses/${course._id}`,
        {
          status:
            course.status === 'published'
              ? 'draft'
              : 'published',
        },
      );
      await load();
    } catch (err) {
      setError(
        apiErrorMessage(
          err,
          'Could not update course visibility.',
        ),
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
      <AdminPageHeader
        title="Courses & groups"
        description="The public course page uses the description, confirmed price, featured flag, and published status controlled here."
        action={
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-bastly-blue px-4 text-sm font-extrabold text-white"
          >
            <Plus size={17} />
            New course
          </button>
        }
      />

      {error && (
        <ErrorBox
          message={error}
          className="mb-5"
        />
      )}

      <div className="mb-5 flex flex-wrap gap-3">
        <Metric
          label="Courses"
          value={courses.length}
        />
        <Metric
          label="Groups"
          value={groupedCount}
        />
        <Metric
          label="Published"
          value={
            courses.filter(
              (course) =>
                course.status === 'published',
            ).length
          }
        />
      </div>

      <div className="grid gap-4">
        {courses.length === 0 ? (
          <div className="rounded-[24px] border border-line bg-white p-8 text-center text-sm text-muted shadow-soft">
            Create a doctor profile first, then add Bastly's
            first course.
          </div>
        ) : (
          courses.map((course) => (
            <article
              key={course._id}
              className="rounded-[24px] border border-line bg-white p-5 shadow-soft"
            >
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <StatusPill
                      value={course.status}
                    />

                    {!course.priceConfirmed && (
                      <span className="rounded-full bg-[#fff6df] px-2.5 py-1 text-[0.68rem] font-extrabold text-[#9a6510]">
                        Public price hidden
                      </span>
                    )}

                    {course.featured && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-bastly-blue-pale px-2.5 py-1 text-[0.68rem] font-extrabold text-bastly-blue-dark">
                        <Star size={12} />
                        Featured
                      </span>
                    )}
                  </div>

                  <h2 className="mb-1 font-heading text-2xl font-bold tracking-[-0.04em] text-bastly-navy">
                    {course.title}
                  </h2>

                  <p className="mb-1 text-sm text-muted">
                    {course.doctorProfile?.displayName} ·{' '}
                    {course.level}
                    {course.curriculum
                      ? ` · ${course.curriculum}`
                      : ''}
                  </p>

                  <p className="mb-0 text-xs text-muted">
                    {course.academicYear} · Admin price EGP{' '}
                    {Number(
                      course.price,
                    ).toLocaleString('en-EG')}{' '}
                    · access until{' '}
                    {new Date(
                      course.accessEndDate,
                    ).toLocaleDateString('en-GB')}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(course)}
                    className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-line px-3.5 text-xs font-extrabold text-bastly-navy"
                  >
                    <Edit3 size={14} />
                    Edit
                  </button>

                  {course.status === 'published' && (
                    <Link
                      to={`/courses/${course.slug}`}
                      target="_blank"
                      className="inline-flex min-h-10 items-center gap-1.5 rounded-full border border-line px-3.5 text-xs font-extrabold text-bastly-blue-dark no-underline"
                    >
                      <ExternalLink size={14} />
                      Public
                    </Link>
                  )}

                  <button
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      toggleCourseStatus(course)
                    }
                    className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-full border border-line px-3.5 text-xs font-extrabold text-bastly-navy disabled:opacity-50"
                  >
                    {course.status === 'published'
                      ? 'Unpublish'
                      : 'Publish'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setError('');
                      setGroupCourse(course);
                    }}
                    className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-full border border-line px-3.5 text-xs font-extrabold text-bastly-navy"
                  >
                    <Layers3 size={15} />
                    Add group
                  </button>
                </div>
              </div>

              {course.description && (
                <p className="mt-4 mb-0 max-w-[850px] border-t border-line pt-4 text-xs leading-6 text-muted">
                  {course.description}
                </p>
              )}

              <div className="mt-5 border-t border-line pt-4">
                <p className="mb-3 text-[0.68rem] font-extrabold uppercase tracking-[0.08em] text-muted">
                  Groups
                </p>

                {course.groups?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {course.groups.map((group) => (
                      <div
                        key={group._id}
                        className="rounded-2xl border border-line bg-surface px-3 py-2"
                      >
                        <p className="mb-0 text-xs font-extrabold text-bastly-navy">
                          {group.name}
                        </p>
                        {group.scheduleLabel && (
                          <p className="mt-0.5 mb-0 text-[0.68rem] text-muted">
                            {group.scheduleLabel}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mb-0 text-sm text-muted">
                    No groups added yet.
                  </p>
                )}
              </div>
            </article>
          ))
        )}
      </div>

      <Modal
        open={courseModal}
        title={
          editingCourse
            ? `Edit ${editingCourse.title}`
            : 'Create course'
        }
        onClose={() => setCourseModal(false)}
      >
        <form
          className="grid gap-4"
          onSubmit={saveCourse}
        >
          <label className="grid gap-2">
            <span className="text-sm font-extrabold text-bastly-navy">
              Doctor
            </span>
            <select
              value={courseForm.doctorProfileId}
              onChange={(event) =>
                setCourseForm({
                  ...courseForm,
                  doctorProfileId:
                    event.target.value,
                })
              }
              required
              className="min-h-11 rounded-2xl border border-line bg-white px-4 text-sm outline-none focus:border-bastly-blue"
            >
              <option value="">Choose doctor</option>
              {doctors.map((doctor) => (
                <option
                  value={doctor._id}
                  key={doctor._id}
                >
                  {doctor.displayName} — {doctor.subject}
                </option>
              ))}
            </select>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Course title"
              value={courseForm.title}
              onChange={(value) =>
                setCourseForm({
                  ...courseForm,
                  title: value,
                })
              }
              placeholder="Biology O Level"
              required
            />
            <Field
              label="Subject"
              value={courseForm.subject}
              onChange={(value) =>
                setCourseForm({
                  ...courseForm,
                  subject: value,
                })
              }
              placeholder="Biology"
              required
            />
            <Field
              label="Level"
              value={courseForm.level}
              onChange={(value) =>
                setCourseForm({
                  ...courseForm,
                  level: value,
                })
              }
              placeholder="O Level"
              required
            />
            <Field
              label="Curriculum"
              value={courseForm.curriculum}
              onChange={(value) =>
                setCourseForm({
                  ...courseForm,
                  curriculum: value,
                })
              }
              placeholder="Cambridge / IGCSE"
            />
            <Field
              label="Academic year"
              value={courseForm.academicYear}
              onChange={(value) =>
                setCourseForm({
                  ...courseForm,
                  academicYear: value,
                })
              }
              placeholder="2026/2027"
            />
            <Field
              label="Price (EGP)"
              type="number"
              value={courseForm.price}
              onChange={(value) =>
                setCourseForm({
                  ...courseForm,
                  price: value,
                })
              }
              required
            />
            <Field
              label="Access end date"
              type="date"
              value={courseForm.accessEndDate}
              onChange={(value) =>
                setCourseForm({
                  ...courseForm,
                  accessEndDate: value,
                })
              }
              required
            />
          </div>

          <label className="grid gap-2">
            <span className="text-sm font-extrabold text-bastly-navy">
              Public description
            </span>
            <textarea
              rows="4"
              value={courseForm.description}
              onChange={(event) =>
                setCourseForm({
                  ...courseForm,
                  description: event.target.value,
                })
              }
              placeholder="What students will learn and what makes this course useful..."
              className="rounded-2xl border border-line px-4 py-3 text-sm outline-none focus:border-bastly-blue"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <Toggle
              checked={courseForm.priceConfirmed}
              onChange={(checked) =>
                setCourseForm({
                  ...courseForm,
                  priceConfirmed: checked,
                })
              }
              title="Price confirmed"
              text="Only then will the price appear publicly."
            />
            <Toggle
              checked={courseForm.featured}
              onChange={(checked) =>
                setCourseForm({
                  ...courseForm,
                  featured: checked,
                })
              }
              title="Featured"
              text="Prioritize this course in public ordering."
            />
          </div>

          <label className="grid gap-2">
            <span className="text-sm font-extrabold text-bastly-navy">
              Status
            </span>
            <select
              value={courseForm.status}
              onChange={(event) =>
                setCourseForm({
                  ...courseForm,
                  status: event.target.value,
                })
              }
              className="min-h-11 rounded-2xl border border-line bg-white px-4 text-sm"
            >
              <option value="draft">Draft</option>
              <option value="published">
                Published
              </option>
            </select>
          </label>

          <div className="rounded-2xl bg-bastly-blue-pale px-4 py-3 text-xs leading-6 text-muted">
            If <strong>Price confirmed</strong> is off,
            the public site says <strong>Price coming soon</strong>{' '}
            instead of exposing the 5,000 EGP development
            placeholder.
          </div>

          {error && <ErrorBox message={error} />}

          <button
            type="submit"
            disabled={busy || doctors.length === 0}
            className="min-h-11 rounded-full bg-bastly-blue px-4 font-extrabold text-white disabled:opacity-50"
          >
            {busy
              ? 'Saving…'
              : editingCourse
                ? 'Save course'
                : 'Create course'}
          </button>
        </form>
      </Modal>

      <Modal
        open={Boolean(groupCourse)}
        title={`Add group — ${groupCourse?.title || ''}`}
        onClose={() => setGroupCourse(null)}
      >
        <form
          className="grid gap-4"
          onSubmit={createGroup}
        >
          <Field
            label="Group name"
            value={groupForm.name}
            onChange={(value) =>
              setGroupForm({
                ...groupForm,
                name: value,
              })
            }
            placeholder="Group A"
            required
          />
          <Field
            label="Schedule"
            value={groupForm.scheduleLabel}
            onChange={(value) =>
              setGroupForm({
                ...groupForm,
                scheduleLabel: value,
              })
            }
            placeholder="Sunday & Wednesday · 7:00 PM"
          />
          <Field
            label="Meeting link (private)"
            value={groupForm.meetingUrl}
            onChange={(value) =>
              setGroupForm({
                ...groupForm,
                meetingUrl: value,
              })
            }
            placeholder="https://zoom.us/..."
          />

          <p className="mb-0 rounded-2xl bg-surface px-4 py-3 text-xs leading-6 text-muted">
            Public course pages may show the group name and
            schedule. Meeting links remain private.
          </p>

          {error && <ErrorBox message={error} />}

          <button
            type="submit"
            disabled={busy}
            className="min-h-11 rounded-full bg-bastly-blue px-4 font-extrabold text-white disabled:opacity-50"
          >
            {busy ? 'Creating…' : 'Create group'}
          </button>
        </form>
      </Modal>
    </main>
  );
}

function Toggle({
  checked,
  onChange,
  title,
  text,
}) {
  return (
    <label className="flex cursor-pointer gap-3 rounded-2xl border border-line bg-surface p-4">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) =>
          onChange(event.target.checked)
        }
        className="mt-1 accent-[#237fd1]"
      />
      <div>
        <p className="mb-1 text-sm font-extrabold text-bastly-navy">
          {title}
        </p>
        <p className="mb-0 text-xs leading-5 text-muted">
          {text}
        </p>
      </div>
    </label>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-2xl border border-line bg-white px-4 py-3 shadow-soft">
      <p className="mb-0 text-xs text-muted">
        {label}
      </p>
      <p className="mb-0 font-heading text-lg font-bold text-bastly-navy">
        {value}
      </p>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder = '',
  type = 'text',
  required = false,
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-extrabold text-bastly-navy">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        required={required}
        className="min-h-11 rounded-2xl border border-line px-4 text-sm outline-none focus:border-bastly-blue focus:ring-4 focus:ring-bastly-blue/10"
      />
    </label>
  );
}

function ErrorBox({
  message,
  className = '',
}) {
  return (
    <div
      className={[
        'rounded-2xl border border-[#d1605a]/25 bg-[#fff0ef] px-4 py-3 text-sm font-bold text-[#a83d36]',
        className,
      ].join(' ')}
    >
      {message}
    </div>
  );
}
