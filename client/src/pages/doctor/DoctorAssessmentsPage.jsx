import { Archive, ArrowLeft, Eye, EyeOff, Plus, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Modal from '../../components/admin/Modal';
import DoctorPageHeader from '../../components/doctor/DoctorPageHeader';
import { api, apiErrorMessage } from '../../services/api';

function currentMondayValue() {
  const d = new Date();
  const day = d.getUTCDay();
  d.setUTCDate(d.getUTCDate() + (day === 0 ? -6 : 1 - day));
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

const makeQuestion = () => ({
  type: 'mcq',
  prompt: '',
  options: ['', '', '', ''],
  correctOptionIndex: 0,
  explanation: '',
  points: 1,
});

export default function DoctorAssessmentsPage() {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const { data } = await api.get(`/doctor/courses/${courseId}/assessments`);
      setCourse(data.course);
      setItems(data.assessments || []);
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not load assessments.'));
    }
  }, [courseId]);

  useEffect(() => { load(); }, [load]);

  const changeStatus = async (item, status) => {
    setBusy(item._id);
    setError('');
    try {
      await api.patch(`/doctor/assessments/${item._id}`, { status });
      await load();
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not update assessment.'));
    } finally {
      setBusy('');
    }
  };

  return (
    <main className="px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
      <Link to={`/doctor/courses/${courseId}`} className="mb-5 inline-flex items-center gap-2 text-sm font-extrabold text-bastly-blue-dark no-underline">
        <ArrowLeft size={16} />Course content
      </Link>
      <DoctorPageHeader
        eyebrow={course?.academicYear || 'Assessments'}
        title={`${course?.title || 'Course'} assessments`}
        description="Create one-attempt quizzes and repeatable homework. Each assessment belongs to one performance week."
        action={<button type="button" onClick={() => setOpen(true)} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-bastly-blue px-4 text-sm font-extrabold text-white"><Plus size={17} />New assessment</button>}
      />
      {error && <ErrorBox message={error} />}
      <div className="grid gap-4">
        {items.map((a) => (
          <article key={a._id} className="rounded-[24px] border border-line bg-white p-5 shadow-soft">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap gap-2">
                  <Pill value={a.type} /><Pill value={a.status} />
                  <span className="text-xs text-muted">{a.questionCount} questions</span>
                </div>
                <h2 className="mb-1 font-heading text-xl font-bold text-bastly-navy">{a.title}</h2>
                <p className="mb-0 text-xs text-muted">
                  {a.type === 'quiz' ? '1 attempt per student' : 'Unlimited attempts'} · performance week {a.performanceWeekStart ? new Date(a.performanceWeekStart).toLocaleDateString('en-GB') : 'legacy/current'}
                </p>
              </div>
              <div className="grid grid-cols-3 gap-2 lg:w-[300px]">
                <Metric label="Attempts" value={a.stats?.attempts || 0} />
                <Metric label="Students" value={a.stats?.students || 0} />
                <Metric label="Average" value={a.stats?.attempts ? `${Math.round(a.stats.averagePercentage)}%` : '—'} />
              </div>
              <div className="flex flex-wrap gap-2">
                {a.status === 'draft'
                  ? <Action label="Publish" icon={Eye} onClick={() => changeStatus(a, 'published')} disabled={busy === a._id} />
                  : <Action label="Unpublish" icon={EyeOff} onClick={() => changeStatus(a, 'draft')} disabled={busy === a._id} />}
                <Action label="Archive" icon={Archive} danger onClick={() => window.confirm(`Archive "${a.title}"?`) && changeStatus(a, 'archived')} disabled={busy === a._id} />
              </div>
            </div>
          </article>
        ))}
        {!items.length && <div className="rounded-[24px] border border-line bg-white p-10 text-center shadow-soft"><p className="mb-2 font-heading text-xl font-bold text-bastly-navy">No quizzes or homework yet.</p><p className="mb-5 text-sm text-muted">Create the first assessment for this course.</p><button type="button" onClick={() => setOpen(true)} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-bastly-blue px-4 font-extrabold text-white"><Plus size={17} />Create assessment</button></div>}
      </div>
      <Builder open={open} courseId={courseId} onClose={() => setOpen(false)} onSaved={async () => { setOpen(false); await load(); }} />
    </main>
  );
}

function Builder({ open, courseId, onClose, onSaved }) {
  const blankForm = () => ({
    type: 'quiz',
    title: '',
    description: '',
    instructions: '',
    status: 'draft',
    performanceWeekStart: currentMondayValue(),
    questions: [makeQuestion()],
  });

  const [form, setForm] = useState(blankForm);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) {
      setForm(blankForm());
      setError('');
    }
  }, [open]);

  const changeQuestion = (index, patch) => setForm((current) => ({
    ...current,
    questions: current.questions.map((q, i) => {
      if (i !== index) return q;
      const next = { ...q, ...patch };
      if (patch.type === 'true_false') {
        next.options = ['True', 'False'];
        next.correctOptionIndex = 0;
      }
      if (patch.type === 'mcq' && q.type !== 'mcq') {
        next.options = ['', '', '', ''];
        next.correctOptionIndex = 0;
      }
      return next;
    }),
  }));

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api.post(`/doctor/courses/${courseId}/assessments`, {
        ...form,
        performanceWeekStart: new Date(`${form.performanceWeekStart}T00:00:00.000Z`).toISOString(),
        questions: form.questions.map((q) => ({
          ...q,
          options: q.type === 'true_false' ? ['True', 'False'] : q.options,
          points: Number(q.points),
          correctOptionIndex: Number(q.correctOptionIndex),
        })),
      });
      await onSaved();
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not create assessment.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal open={open} title="Create assessment" onClose={onClose}>
      <form className="grid gap-5" onSubmit={submit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Select label="Type" value={form.type} onChange={(value) => setForm({ ...form, type: value })} options={[["quiz","Quiz — 1 attempt"],["homework","Homework — unlimited"]]} />
          <Select label="Visibility" value={form.status} onChange={(value) => setForm({ ...form, status: value })} options={[["draft","Draft"],["published","Published"]]} />
        </div>
        <label className="grid gap-2">
          <span className="text-xs font-extrabold text-bastly-navy">Performance week</span>
          <input type="date" value={form.performanceWeekStart} onChange={(e) => setForm({ ...form, performanceWeekStart: e.target.value })} required className="min-h-10 rounded-xl border border-line bg-white px-3 text-sm outline-none focus:border-bastly-blue" />
          <span className="text-[0.68rem] text-muted">The date is normalized to that week's Monday.</span>
        </label>
        <Field label="Title" value={form.title} onChange={(value) => setForm({ ...form, title: value })} placeholder="Cell Biology Quiz 1" required />
        <TextArea label="Description" value={form.description} onChange={(value) => setForm({ ...form, description: value })} />
        <TextArea label="Instructions" value={form.instructions} onChange={(value) => setForm({ ...form, instructions: value })} />
        <div className="border-t border-line pt-5">
          <div className="mb-4 flex items-center justify-between">
            <div><p className="mb-0 font-heading text-lg font-bold text-bastly-navy">Questions</p><p className="mb-0 text-xs text-muted">{form.questions.length} total</p></div>
            <button type="button" onClick={() => setForm((c) => ({ ...c, questions: [...c.questions, makeQuestion()] }))} className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-line px-3 text-xs font-extrabold text-bastly-navy"><Plus size={14} />Add question</button>
          </div>
          <div className="grid gap-4">
            {form.questions.map((q, index) => (
              <div key={index} className="rounded-2xl border border-line bg-surface p-4">
                <div className="mb-4 flex items-center justify-between"><p className="mb-0 text-sm font-extrabold text-bastly-navy">Question {index + 1}</p>{form.questions.length > 1 && <button type="button" onClick={() => setForm((c) => ({ ...c, questions: c.questions.filter((_, i) => i !== index) }))} className="grid size-8 place-items-center rounded-xl bg-[#fff0ef] text-[#a83d36]"><Trash2 size={14} /></button>}</div>
                <div className="grid gap-4">
                  <Select label="Question type" value={q.type} onChange={(value) => changeQuestion(index, { type: value })} options={[["mcq","Multiple choice"],["true_false","True / False"]]} />
                  <Field label="Question" value={q.prompt} onChange={(value) => changeQuestion(index, { prompt: value })} required />
                  {q.type === 'mcq' ? (
                    <div className="grid gap-2">
                      <span className="text-xs font-extrabold text-bastly-navy">Options — select the correct one</span>
                      {q.options.map((option, oi) => <label key={oi} className="flex items-center gap-3 rounded-xl border border-line bg-white px-3 py-2"><input type="radio" name={`correct-${index}`} checked={q.correctOptionIndex === oi} onChange={() => changeQuestion(index, { correctOptionIndex: oi })} /><input value={option} onChange={(event) => { const options = [...q.options]; options[oi] = event.target.value; changeQuestion(index, { options }); }} required placeholder={`Option ${oi + 1}`} className="min-w-0 flex-1 bg-transparent text-sm outline-none" /></label>)}
                    </div>
                  ) : <Select label="Correct answer" value={String(q.correctOptionIndex)} onChange={(value) => changeQuestion(index, { correctOptionIndex: Number(value) })} options={[[0,"True"],[1,"False"]]} />}
                  <Field label="Explanation after submission (optional)" value={q.explanation} onChange={(value) => changeQuestion(index, { explanation: value })} />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-2xl bg-bastly-blue-pale px-4 py-3 text-xs leading-6 text-muted"><strong>Quiz:</strong> one attempt. <strong>Homework:</strong> unlimited attempts, but weekly performance uses the first attempt only.</div>
        {error && <ErrorBox message={error} />}
        <button type="submit" disabled={busy} className="min-h-11 rounded-full bg-bastly-blue px-4 font-extrabold text-white disabled:opacity-50">{busy ? 'Creating…' : 'Create assessment'}</button>
      </form>
    </Modal>
  );
}

function Field({ label, value, onChange, placeholder = '', required = false }) { return <label className="grid gap-2"><span className="text-xs font-extrabold text-bastly-navy">{label}</span><input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} required={required} className="min-h-10 rounded-xl border border-line bg-white px-3 text-sm outline-none focus:border-bastly-blue" /></label>; }
function TextArea({ label, value, onChange }) { return <label className="grid gap-2"><span className="text-xs font-extrabold text-bastly-navy">{label}</span><textarea rows="3" value={value} onChange={(e) => onChange(e.target.value)} className="rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none focus:border-bastly-blue" /></label>; }
function Select({ label, value, onChange, options }) { return <label className="grid gap-2"><span className="text-xs font-extrabold text-bastly-navy">{label}</span><select value={value} onChange={(e) => onChange(e.target.value)} className="min-h-10 rounded-xl border border-line bg-white px-3 text-sm">{options.map(([v,l]) => <option key={v} value={v}>{l}</option>)}</select></label>; }
function Metric({ label, value }) { return <div className="rounded-2xl bg-surface px-3 py-2 text-center"><p className="mb-0 font-heading text-lg font-bold text-bastly-navy">{value}</p><p className="mb-0 text-[0.65rem] text-muted">{label}</p></div>; }
function Pill({ value }) { const n = String(value).toLowerCase(); const tone = n === 'published' ? 'bg-[#eef8f1] text-[#18764a]' : n === 'quiz' ? 'bg-bastly-blue-pale text-bastly-blue-dark' : n === 'homework' ? 'bg-[#fff6df] text-[#9a6510]' : 'bg-[#eef3f8] text-[#536579]'; return <span className={`rounded-full px-2.5 py-1 text-[0.68rem] font-extrabold capitalize ${tone}`}>{value}</span>; }
function Action({ label, icon: Icon, onClick, disabled, danger = false }) { return <button type="button" onClick={onClick} disabled={disabled} className={`inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-xs font-extrabold disabled:opacity-50 ${danger ? 'bg-[#fff0ef] text-[#a83d36]' : 'border border-line text-bastly-navy'}`}><Icon size={14} />{label}</button>; }
function ErrorBox({ message }) { return <div className="rounded-2xl border border-[#d1605a]/25 bg-[#fff0ef] px-4 py-3 text-sm font-bold text-[#a83d36]">{message}</div>; }
