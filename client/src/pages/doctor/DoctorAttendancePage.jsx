import { CheckCircle2, Plus, Save } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import Modal from '../../components/admin/Modal';
import DoctorPageHeader from '../../components/doctor/DoctorPageHeader';
import { api, apiErrorMessage } from '../../services/api';

export default function DoctorAttendancePage() {
  const [data, setData] = useState({ courses: [], groups: [], sessions: [] });
  const [courseId, setCourseId] = useState('');
  const [groupId, setGroupId] = useState('');
  const [session, setSession] = useState(null);
  const [records, setRecords] = useState([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const { data: response } = await api.get('/doctor/attendance', {
      params: {
        ...(courseId && { courseId }),
        ...(groupId && { groupId }),
      },
    });
    setData(response);
  }, [courseId, groupId]);

  useEffect(() => {
    load().catch((err) => setError(apiErrorMessage(err, 'Could not load attendance.')));
  }, [load]);

  const visibleGroups = useMemo(
    () => data.groups.filter((group) => !courseId || String(group.course) === String(courseId)),
    [data.groups, courseId],
  );

  const openSession = async (sessionId) => {
    setError('');
    try {
      const { data: response } = await api.get(`/doctor/attendance-sessions/${sessionId}`);
      setSession(response.session);
      setRecords(response.records || []);
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not open attendance session.'));
    }
  };

  const setStatus = (studentId, status) => {
    setRecords((current) => current.map((record) =>
      String(record.student._id) === String(studentId) ? { ...record, status } : record,
    ));
  };

  const saveRecords = async ({ requireAll = false } = {}) => {
    const marked = records.filter((record) => record.status !== 'unmarked');

    if (!marked.length) {
      throw new Error('Mark at least one student before saving.');
    }

    if (requireAll && marked.length !== records.length) {
      throw new Error(`Mark every student before finalizing. ${records.length - marked.length} still unmarked.`);
    }

    await api.patch(`/doctor/attendance-sessions/${session._id}/records`, {
      records: marked.map((record) => ({
        studentId: record.student._id,
        status: record.status,
      })),
    });
  };

  const save = async () => {
    setBusy(true);
    setError('');
    try {
      await saveRecords();
      await openSession(session._id);
      await load();
    } catch (err) {
      setError(err?.response ? apiErrorMessage(err, 'Could not save attendance.') : err.message);
    } finally {
      setBusy(false);
    }
  };

  const finalize = async () => {
    setBusy(true);
    setError('');
    try {
      await saveRecords({ requireAll: true });
      await api.post(`/doctor/attendance-sessions/${session._id}/finalize`);
      await openSession(session._id);
      await load();
    } catch (err) {
      setError(err?.response ? apiErrorMessage(err, 'Could not finalize attendance.') : err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
      <DoctorPageHeader
        title="Attendance"
        description="Create a session for a group, mark everyone Present or Absent, then finalize it. Only finalized attendance contributes to weekly performance."
        action={
          <button type="button" disabled={!groupId} onClick={() => setCreateOpen(true)} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-bastly-blue px-4 text-sm font-extrabold text-white disabled:opacity-40">
            <Plus size={17} /> New session
          </button>
        }
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-2">
        <Select label="Course" value={courseId} onChange={(value) => { setCourseId(value); setGroupId(''); }} options={data.courses.map((course) => ({ value: course._id, label: course.title }))} />
        <Select label="Group" value={groupId} onChange={setGroupId} options={visibleGroups.map((group) => ({ value: group._id, label: group.scheduleLabel ? `${group.name} — ${group.scheduleLabel}` : group.name }))} />
      </div>

      {error && <ErrorBox message={error} />}

      <div className="grid gap-5 xl:grid-cols-[360px_1fr]">
        <section className="overflow-hidden rounded-[24px] border border-line bg-white shadow-soft">
          <div className="border-b border-line bg-surface px-4 py-3 text-xs font-extrabold uppercase tracking-[0.08em] text-muted">Sessions</div>
          {(data.sessions || []).map((item) => (
            <button key={item._id} type="button" onClick={() => openSession(item._id)} className="flex w-full items-center justify-between gap-3 border-b border-line px-4 py-4 text-left last:border-0 hover:bg-surface">
              <div>
                <p className="mb-1 text-sm font-extrabold text-bastly-navy">{item.title || item.group?.name || 'Class session'}</p>
                <p className="mb-0 text-xs text-muted">{new Date(item.heldAt).toLocaleString()} · {item.group?.name}</p>
              </div>
              <span className={['rounded-full px-2.5 py-1 text-[0.65rem] font-extrabold capitalize', item.status === 'finalized' ? 'bg-[#eef8f1] text-[#18764a]' : 'bg-[#fff6df] text-[#9a6510]'].join(' ')}>{item.status}</span>
            </button>
          ))}
          {data.sessions?.length === 0 && <p className="m-0 p-6 text-center text-sm text-muted">No attendance sessions yet.</p>}
        </section>

        <section className="rounded-[24px] border border-line bg-white p-5 shadow-soft">
          {!session ? (
            <div className="grid min-h-[320px] place-items-center text-center">
              <div><p className="mb-2 font-heading text-xl font-bold text-bastly-navy">Open a session</p><p className="mb-0 text-sm text-muted">Or choose a group and create today's attendance.</p></div>
            </div>
          ) : (
            <>
              <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="mb-1 font-heading text-xl font-bold text-bastly-navy">{session.title || 'Attendance session'}</p>
                  <p className="mb-0 text-xs text-muted">{new Date(session.heldAt).toLocaleString()}</p>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={save} disabled={busy} className="inline-flex min-h-10 items-center gap-2 rounded-full border border-line px-3 text-xs font-extrabold text-bastly-navy"><Save size={14}/> Save</button>
                  <button type="button" onClick={finalize} disabled={busy} className="inline-flex min-h-10 items-center gap-2 rounded-full bg-bastly-blue px-3 text-xs font-extrabold text-white"><CheckCircle2 size={14}/> Finalize</button>
                </div>
              </div>

              <div className="grid gap-2">
                {records.map((record) => (
                  <div key={record._id} className="flex flex-col gap-3 rounded-2xl border border-line p-3 sm:flex-row sm:items-center sm:justify-between">
                    <div><p className="mb-0 text-sm font-extrabold text-bastly-navy">{record.student?.fullName}</p><p className="mb-0 text-xs text-muted">{record.student?.email}</p></div>
                    <div className="grid grid-cols-2 gap-2 sm:w-[230px]">
                      {['present', 'absent'].map((status) => (
                        <button key={status} type="button" onClick={() => setStatus(record.student._id, status)} className={['min-h-9 rounded-full text-xs font-extrabold capitalize', record.status === status ? (status === 'present' ? 'bg-[#18764a] text-white' : 'bg-[#a83d36] text-white') : 'bg-surface text-muted'].join(' ')}>{status}</button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </div>

      <CreateSessionModal open={createOpen} groupId={groupId} onClose={() => setCreateOpen(false)} onSaved={async (id) => { setCreateOpen(false); await load(); await openSession(id); }} />
    </main>
  );
}

function CreateSessionModal({ open, groupId, onClose, onSaved }) {
  const [title, setTitle] = useState('');
  const [heldAt, setHeldAt] = useState(() => new Date().toISOString().slice(0, 16));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (event) => {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const { data } = await api.post(`/doctor/groups/${groupId}/attendance-sessions`, { title, heldAt: new Date(heldAt).toISOString() });
      setTitle('');
      await onSaved(data.session._id);
    } catch (err) { setError(apiErrorMessage(err, 'Could not create attendance session.')); }
    finally { setBusy(false); }
  };

  return <Modal open={open} title="New attendance session" onClose={onClose}>
    <form className="grid gap-4" onSubmit={submit}>
      <Field label="Session title (optional)" value={title} onChange={setTitle} placeholder="Chapter 3 revision" />
      <Field label="Session date & time" type="datetime-local" value={heldAt} onChange={setHeldAt} required />
      {error && <ErrorBox message={error} />}
      <button type="submit" disabled={busy} className="min-h-11 rounded-full bg-bastly-blue px-4 font-extrabold text-white disabled:opacity-50">{busy ? 'Creating…' : 'Create session'}</button>
    </form>
  </Modal>;
}

function Select({ label, value, onChange, options }) {
  return <label className="grid gap-2"><span className="text-xs font-extrabold text-bastly-navy">{label}</span><select value={value} onChange={(e) => onChange(e.target.value)} className="min-h-11 rounded-2xl border border-line bg-white px-4 text-sm outline-none"><option value="">Choose {label.toLowerCase()}</option>{options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></label>;
}
function Field({ label, value, onChange, placeholder='', type='text', required=false }) { return <label className="grid gap-2"><span className="text-sm font-extrabold text-bastly-navy">{label}</span><input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required={required} className="min-h-11 rounded-2xl border border-line px-4 text-sm outline-none focus:border-bastly-blue" /></label>; }
function ErrorBox({ message }) { return <div className="mb-4 rounded-2xl border border-[#d1605a]/25 bg-[#fff0ef] px-4 py-3 text-sm font-bold text-[#a83d36]">{message}</div>; }
