import { Check, Plus, UserMinus } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import AdminPageHeader from '../../components/admin/AdminPageHeader';
import Modal from '../../components/admin/Modal';
import StatusPill from '../../components/admin/StatusPill';
import { api, apiErrorMessage } from '../../services/api';

export default function AdminEnrollmentsPage() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ studentId: '', courseId: '', groupId: '' });
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    const [studentsResponse, coursesResponse, enrollmentsResponse] = await Promise.all([
      api.get('/admin/academic/students'),
      api.get('/admin/academic/courses'),
      api.get('/admin/academic/enrollments'),
    ]);

    setStudents(studentsResponse.data.students || []);
    setCourses(coursesResponse.data.courses || []);
    setEnrollments(enrollmentsResponse.data.enrollments || []);
  };

  useEffect(() => {
    load();
  }, []);

  const selectedCourse = useMemo(
    () => courses.find((course) => course._id === form.courseId),
    [courses, form.courseId],
  );

  const createEnrollment = async (event) => {
    event.preventDefault();
    setBusy('create');
    setError('');

    try {
      await api.post('/admin/academic/enrollments', form);
      setForm({ studentId: '', courseId: '', groupId: '' });
      setModalOpen(false);
      await load();
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not create enrollment.'));
    } finally {
      setBusy('');
    }
  };

  const confirmPayment = async (enrollment) => {
    setBusy(enrollment._id);
    setError('');

    try {
      await api.patch(`/admin/academic/enrollments/${enrollment._id}/confirm-payment`, {
        pricePaid: enrollment.course?.price,
      });
      await load();
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not confirm payment.'));
    } finally {
      setBusy('');
    }
  };

  const unregister = async (enrollment) => {
    const confirmed = window.confirm(
      `Unregister ${enrollment.student?.fullName} from ${enrollment.course?.title}? Their account and academic history will stay saved.`,
    );

    if (!confirmed) return;

    setBusy(enrollment._id);
    setError('');

    try {
      await api.patch(`/admin/academic/enrollments/${enrollment._id}/unregister`, {
        note: 'Unregistered from Bastly Admin.',
      });
      await load();
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not unregister this enrollment.'));
    } finally {
      setBusy('');
    }
  };

  return (
    <main className="px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
      <AdminPageHeader
        title="Enrollments"
        description="WhatsApp remains the payment conversation. Bastly Admin controls who actually gets course access."
        action={
          <button
            type="button"
            onClick={() => {
              setError('');
              setModalOpen(true);
            }}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-bastly-blue px-4 text-sm font-extrabold text-white"
          >
            <Plus size={17} />
            New enrollment
          </button>
        }
      />

      {error && (
        <div className="mb-4 rounded-2xl border border-[#d1605a]/25 bg-[#fff0ef] px-4 py-3 text-sm font-bold text-[#a83d36]">
          {error}
        </div>
      )}

      <div className="overflow-x-auto rounded-[24px] border border-line bg-white shadow-soft">
        <table className="w-full min-w-[880px] border-collapse text-left">
          <thead className="bg-surface text-[0.68rem] font-extrabold uppercase tracking-[0.08em] text-muted">
            <tr>
              <th className="px-5 py-3">Student</th>
              <th className="px-5 py-3">Course</th>
              <th className="px-5 py-3">Group</th>
              <th className="px-5 py-3">Access</th>
              <th className="px-5 py-3">Payment</th>
              <th className="px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {enrollments.map((enrollment) => (
              <tr key={enrollment._id} className="border-t border-line">
                <td className="px-5 py-4">
                  <p className="mb-0 font-heading text-sm font-bold text-bastly-navy">
                    {enrollment.student?.fullName}
                  </p>
                  <p className="mb-0 text-xs text-muted">{enrollment.student?.email}</p>
                </td>
                <td className="px-5 py-4">
                  <p className="mb-0 text-sm font-bold text-bastly-navy">{enrollment.course?.title}</p>
                  <p className="mb-0 text-xs text-muted">
                    {enrollment.course?.doctorProfile?.displayName}
                  </p>
                </td>
                <td className="px-5 py-4 text-sm text-muted">{enrollment.group?.name}</td>
                <td className="px-5 py-4">
                  <StatusPill value={enrollment.status} />
                  {enrollment.accessEndDate && (
                    <p className="mt-1 mb-0 text-[0.68rem] text-muted">
                      until {new Date(enrollment.accessEndDate).toLocaleDateString('en-GB')}
                    </p>
                  )}
                </td>
                <td className="px-5 py-4">
                  <StatusPill value={enrollment.paymentStatus} />
                  {enrollment.pricePaid !== null && enrollment.pricePaid !== undefined && (
                    <p className="mt-1 mb-0 text-[0.68rem] text-muted">
                      EGP {Number(enrollment.pricePaid).toLocaleString('en-EG')}
                    </p>
                  )}
                </td>
                <td className="px-5 py-4">
                  <div className="flex gap-2">
                    {enrollment.status === 'pending' && (
                      <button
                        type="button"
                        disabled={busy === enrollment._id}
                        onClick={() => confirmPayment(enrollment)}
                        className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-[#eef8f1] px-3 text-xs font-extrabold text-[#18764a]"
                      >
                        <Check size={14} />
                        Confirm payment
                      </button>
                    )}
                    {enrollment.status === 'active' && (
                      <button
                        type="button"
                        disabled={busy === enrollment._id}
                        onClick={() => unregister(enrollment)}
                        className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-[#fff0ef] px-3 text-xs font-extrabold text-[#a83d36]"
                      >
                        <UserMinus size={14} />
                        Unregister
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}

            {enrollments.length === 0 && (
              <tr>
                <td colSpan="6" className="px-5 py-10 text-center text-sm text-muted">
                  No enrollments yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} title="Create enrollment" onClose={() => setModalOpen(false)}>
        <form className="grid gap-4" onSubmit={createEnrollment}>
          <Select
            label="Student"
            value={form.studentId}
            onChange={(value) => setForm({ ...form, studentId: value })}
            options={students.map((student) => ({
              value: student._id,
              label: `${student.fullName} — ${student.profile?.academicLevel || 'Student'}`,
            }))}
          />

          <Select
            label="Course"
            value={form.courseId}
            onChange={(value) => setForm({ ...form, courseId: value, groupId: '' })}
            options={courses
              .filter((course) => course.status !== 'archived')
              .map((course) => ({
                value: course._id,
                label: `${course.title} — ${course.doctorProfile?.displayName || ''}`,
              }))}
          />

          <Select
            label="Group"
            value={form.groupId}
            onChange={(value) => setForm({ ...form, groupId: value })}
            options={(selectedCourse?.groups || [])
              .filter((group) => group.active)
              .map((group) => ({
                value: group._id,
                label: group.scheduleLabel ? `${group.name} — ${group.scheduleLabel}` : group.name,
              }))}
          />

          <p className="mb-0 rounded-2xl bg-bastly-blue-pale px-4 py-3 text-xs leading-6 text-muted">
            New enrollments start as <strong>Pending</strong>. Click Confirm payment after Bastly
            verifies the WhatsApp payment. That is what unlocks course access.
          </p>

          {error && (
            <div className="rounded-2xl border border-[#d1605a]/25 bg-[#fff0ef] px-4 py-3 text-sm font-bold text-[#a83d36]">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={busy === 'create'}
            className="min-h-11 rounded-full bg-bastly-blue px-4 font-extrabold text-white disabled:opacity-50"
          >
            {busy === 'create' ? 'Creating…' : 'Create pending enrollment'}
          </button>
        </form>
      </Modal>
    </main>
  );
}

function Select({ label, value, onChange, options }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-extrabold text-bastly-navy">{label}</span>
      <select
        required
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-11 rounded-2xl border border-line bg-white px-4 text-sm outline-none focus:border-bastly-blue"
      >
        <option value="">Choose {label.toLowerCase()}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
