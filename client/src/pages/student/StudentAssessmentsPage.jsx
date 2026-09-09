import { ArrowRight, BookOpen, RotateCcw } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';

export default function StudentAssessmentsPage() {
  const [items, setItems] = useState(null);
  useEffect(() => { let alive = true; api.get('/student/assessments').then(({ data }) => alive && setItems(data.assessments || [])); return () => { alive = false; }; }, []);

  return (
    <main className="px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
      <p className="mb-2 text-[0.72rem] font-extrabold uppercase tracking-[0.1em] text-bastly-blue">Practice & test</p>
      <h1 className="mb-2 font-heading text-[clamp(2rem,5vw,3.3rem)] font-bold tracking-[-0.055em] text-bastly-navy">Quizzes & homework</h1>
      <p className="mb-7 max-w-[720px] text-sm leading-6 text-muted">Quizzes give one submitted attempt. Homework is repeatable practice.</p>
      <div className="grid gap-4 lg:grid-cols-2">
        {(items || []).map((a) => (
          <article key={a._id} className="rounded-[24px] border border-line bg-white p-5 shadow-soft">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div><div className="mb-2 flex flex-wrap gap-2"><TypePill type={a.type} />{a.latestAttempt && <span className="rounded-full bg-[#eef8f1] px-2.5 py-1 text-[0.68rem] font-extrabold text-[#18764a]">{a.latestAttempt.gradeBand} · {Math.round(a.latestAttempt.percentage)}%</span>}</div><h2 className="mb-1 font-heading text-xl font-bold text-bastly-navy">{a.title}</h2><p className="mb-0 text-xs text-muted">{a.course?.title} · {a.questionCount} questions</p></div>
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-bastly-blue-pale text-bastly-blue">{a.type === 'quiz' ? <BookOpen size={18} /> : <RotateCcw size={18} />}</span>
            </div>
            {a.description && <p className="mb-5 text-sm leading-6 text-muted">{a.description}</p>}
            <div className="mb-5 grid grid-cols-2 gap-2"><Info label="Attempts used" value={`${a.attemptCount}${a.maxAttempts ? ` / ${a.maxAttempts}` : ''}`} /><Info label="Rule" value={a.type === 'quiz' ? 'One attempt' : 'Unlimited'} /></div>
            <Link to={`/student/assessments/${a._id}`} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-bastly-blue font-extrabold text-white no-underline">{a.canAttempt ? (a.attemptCount ? 'Try again' : 'Open assessment') : 'View result'}<ArrowRight size={16} /></Link>
          </article>
        ))}
        {items && !items.length && <div className="rounded-[24px] border border-line bg-white p-10 text-center shadow-soft lg:col-span-2"><p className="mb-2 font-heading text-xl font-bold text-bastly-navy">Nothing waiting for you right now 🎉</p><p className="mb-0 text-sm text-muted">Published quizzes and homework from your active courses will appear here.</p></div>}
      </div>
    </main>
  );
}
function TypePill({ type }) { return <span className={`rounded-full px-2.5 py-1 text-[0.68rem] font-extrabold capitalize ${type === 'quiz' ? 'bg-bastly-blue-pale text-bastly-blue-dark' : 'bg-[#fff6df] text-[#9a6510]'}`}>{type}</span>; }
function Info({ label, value }) { return <div className="rounded-2xl bg-surface p-3"><p className="mb-0 text-[0.65rem] text-muted">{label}</p><p className="mb-0 font-heading font-bold text-bastly-navy">{value}</p></div>; }
