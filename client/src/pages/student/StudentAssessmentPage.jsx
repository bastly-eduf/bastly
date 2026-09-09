import { ArrowLeft, Check, RotateCcw } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, apiErrorMessage } from '../../services/api';

export default function StudentAssessmentPage() {
  const { assessmentId } = useParams();
  const [data, setData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [review, setReview] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      const { data } = await api.get(`/student/assessments/${assessmentId}`);
      setData(data);
      setResult(data.attempts?.[0] || null);
      setReview(data.review || null);
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not open this assessment.'));
    }
  }, [assessmentId]);

  useEffect(() => { load(); }, [load]);
  const answered = useMemo(() => Object.keys(answers).length, [answers]);

  const submit = async (event) => {
    event.preventDefault();
    if (answered !== (data?.assessment?.questions?.length || 0)) {
      setError('Answer every question before submitting.');
      return;
    }
    if (!window.confirm(data.assessment.type === 'quiz' ? 'Submit your quiz? You only get one attempt.' : 'Submit this homework attempt?')) return;
    setBusy(true); setError('');
    try {
      const { data: response } = await api.post(`/student/assessments/${assessmentId}/submit`, {
        answers: data.assessment.questions.map((q) => ({ questionId: q._id, selectedOptionIndex: Number(answers[q._id]) })),
      });
      setResult(response.attempt);
      setReview(response.review);
      setData((current) => ({ ...current, canAttempt: response.canAttemptAgain }));
    } catch (err) {
      setError(apiErrorMessage(err, 'Could not submit this assessment.'));
    } finally { setBusy(false); }
  };

  if (!data && !error) return <main className="grid min-h-[calc(100vh-4rem)] place-items-center"><div className="size-8 animate-spin rounded-full border-2 border-bastly-blue/20 border-t-bastly-blue" /></main>;
  if (!data) return <main className="px-4 py-10"><Link to="/student/assessments" className="mb-5 inline-flex items-center gap-2 font-extrabold text-bastly-blue-dark"><ArrowLeft size={16} />Assessments</Link><ErrorBox message={error} /></main>;

  const a = data.assessment;
  return (
    <main className="px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
      <Link to="/student/assessments" className="mb-5 inline-flex items-center gap-2 text-sm font-extrabold text-bastly-blue-dark no-underline"><ArrowLeft size={16} />Quizzes & homework</Link>
      <div className="mx-auto max-w-[860px]">
        <div className="mb-7"><span className={`mb-2 inline-flex rounded-full px-2.5 py-1 text-[0.68rem] font-extrabold capitalize ${a.type === 'quiz' ? 'bg-bastly-blue-pale text-bastly-blue-dark' : 'bg-[#fff6df] text-[#9a6510]'}`}>{a.type}</span><h1 className="mb-2 font-heading text-[clamp(2rem,5vw,3.3rem)] font-bold tracking-[-0.055em] text-bastly-navy">{a.title}</h1><p className="mb-0 text-sm text-muted">{data.course?.title} · {a.questionCount} questions</p></div>
        {a.instructions && <div className="mb-5 rounded-2xl bg-bastly-blue-pale px-4 py-3 text-sm leading-6 text-bastly-navy">{a.instructions}</div>}
        {result && <ResultCard result={result} retry={a.type === 'homework' && data.canAttempt} onRetry={() => { setResult(null); setReview(null); setAnswers({}); setError(''); window.scrollTo({ top: 0, behavior: 'smooth' }); }} />}
        <form className="grid gap-4" onSubmit={submit}>
          {a.questions.map((q) => <QuestionCard key={q._id} question={q} selected={answers[q._id]} review={review?.find((x) => String(x.questionId) === String(q._id))} locked={Boolean(result)} onSelect={(i) => setAnswers((current) => ({ ...current, [q._id]: i }))} />)}
          {!result && data.canAttempt && <><>{error && <ErrorBox message={error} />}</><div className="sticky bottom-4 flex items-center justify-between gap-4 rounded-2xl border border-line bg-white/95 p-3 shadow-card backdrop-blur-xl"><p className="mb-0 text-xs font-bold text-muted">{answered} / {a.questionCount} answered</p><button type="submit" disabled={busy} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-bastly-blue px-5 font-extrabold text-white disabled:opacity-50"><Check size={16} />{busy ? 'Submitting…' : 'Submit'}</button></div></>}
        </form>
      </div>
    </main>
  );
}

function QuestionCard({ question, selected, review, locked, onSelect }) {
  return <section className="rounded-[24px] border border-line bg-white p-5 shadow-soft"><div className="mb-4"><p className="mb-1 text-[0.68rem] font-extrabold uppercase tracking-[0.08em] text-bastly-blue">Question {question.number}</p><h2 className="mb-0 font-heading text-lg font-bold leading-7 text-bastly-navy">{question.prompt}</h2></div><div className="grid gap-2">{question.options.map((option, i) => { const chosen = Number(selected) === i || review?.selectedOptionIndex === i; const correct = review?.correctOptionIndex === i; const wrong = review && chosen && !correct; return <label key={i} className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm ${correct ? 'border-[#4b9e73]/40 bg-[#eef8f1] text-[#18764a]' : wrong ? 'border-[#d1605a]/35 bg-[#fff0ef] text-[#a83d36]' : chosen ? 'border-bastly-blue bg-bastly-blue-pale text-bastly-navy' : 'border-line bg-white text-bastly-navy'}`}><input type="radio" name={`q-${question._id}`} checked={Number(selected) === i} onChange={() => onSelect(i)} disabled={locked} /><span className="font-bold">{option}</span></label>; })}</div>{review && <div className={`mt-4 rounded-2xl px-4 py-3 text-sm leading-6 ${review.isCorrect ? 'bg-[#eef8f1] text-[#18764a]' : 'bg-[#fff6df] text-[#805815]'}`}><strong>{review.isCorrect ? 'Correct.' : 'Review this one.'}</strong>{review.explanation && ` ${review.explanation}`}</div>}</section>;
}

function ResultCard({ result, retry, onRetry }) { return <div className="mb-6 rounded-[26px] bg-bastly-navy p-5 text-white shadow-card"><div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div><p className="mb-2 text-[0.68rem] font-extrabold uppercase tracking-[0.08em] text-[#82c8ff]">Submitted</p><p className="mb-1 font-heading text-5xl font-bold">{Math.round(result.percentage)}% <span className="text-xl">{result.gradeBand === 'Star' ? '⭐ Star' : result.gradeBand}</span></p><p className="mb-0 text-sm text-white/60">{result.scorePoints} / {result.maxPoints} points · attempt {result.attemptNumber}</p></div>{retry && <button type="button" onClick={onRetry} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-white px-4 text-sm font-extrabold text-bastly-navy"><RotateCcw size={16} />Try again</button>}</div></div>; }
function ErrorBox({ message }) { return <div className="rounded-2xl border border-[#d1605a]/25 bg-[#fff0ef] px-4 py-3 text-sm font-bold text-[#a83d36]">{message}</div>; }
