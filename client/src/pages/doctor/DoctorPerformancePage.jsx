import { useEffect, useMemo, useState } from 'react';

import DoctorPageHeader from '../../components/doctor/DoctorPageHeader';
import WeekPicker from '../../components/performance/WeekPicker';
import { api, apiErrorMessage } from '../../services/api';

function mondayValue() {
  const d = new Date(); const day = d.getUTCDay(); d.setUTCDate(d.getUTCDate() + (day === 0 ? -6 : 1 - day)); d.setUTCHours(0,0,0,0); return d.toISOString().slice(0,10);
}

export default function DoctorPerformancePage() {
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState('');
  const [weekStart, setWeekStart] = useState(mondayValue);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/doctor/courses').then(({ data }) => {
      setCourses(data.courses || []);
      if (data.courses?.length) setCourseId((current) => current || data.courses[0]._id);
    });
  }, []);

  useEffect(() => {
    if (!courseId) return;
    setError('');
    api.get(`/doctor/courses/${courseId}/performance`, { params: { weekStart } })
      .then(({ data }) => setData(data))
      .catch((err) => setError(apiErrorMessage(err, 'Could not load performance.')));
  }, [courseId, weekStart]);

  const summary = useMemo(() => {
    const rows = data?.rows || [];
    const rated = rows.filter((row) => row.performance?.overallPercentage !== null);
    if (!rated.length) return { average: null, stars: 0, spins: 0 };
    return {
      average: rated.reduce((sum, row) => sum + Number(row.performance.overallPercentage || 0), 0) / rated.length,
      stars: rated.filter((row) => row.performance.gradeBand === 'Star').length,
      spins: rated.filter((row) => row.performance.spinEligible).length,
    };
  }, [data]);

  return <main className="px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
    <DoctorPageHeader title="Weekly performance" description="Bastly uses 50% quizzes, 30% attendance, and 20% homework. If a category was not assigned that week, its weight is redistributed proportionally instead of counting as zero." action={<WeekPicker value={weekStart} onChange={setWeekStart} />} />

    <div className="mb-5 max-w-[420px]"><label className="grid gap-2"><span className="text-xs font-extrabold text-bastly-navy">Course</span><select value={courseId} onChange={(e) => setCourseId(e.target.value)} className="min-h-11 rounded-2xl border border-line bg-white px-4 text-sm">{courses.map((course) => <option key={course._id} value={course._id}>{course.title}</option>)}</select></label></div>
    {error && <div className="mb-4 rounded-2xl bg-[#fff0ef] px-4 py-3 text-sm font-bold text-[#a83d36]">{error}</div>}

    <div className="mb-5 grid gap-3 sm:grid-cols-3">
      <Metric label="Class average" value={summary.average === null ? '—' : `${Math.round(summary.average)}%`} />
      <Metric label="Star ratings" value={summary.stars} />
      <Metric label="Spin eligible" value={summary.spins} />
    </div>

    <div className="overflow-x-auto rounded-[24px] border border-line bg-white shadow-soft">
      <table className="w-full min-w-[920px] border-collapse text-left">
        <thead className="bg-surface text-[0.67rem] font-extrabold uppercase tracking-[0.08em] text-muted"><tr><th className="px-4 py-3">Student</th><th className="px-4 py-3">Group</th><th className="px-4 py-3">Quiz</th><th className="px-4 py-3">Attendance</th><th className="px-4 py-3">Homework</th><th className="px-4 py-3">Overall</th><th className="px-4 py-3">Spin</th></tr></thead>
        <tbody>{(data?.rows || []).map((row) => <tr key={row.enrollmentId} className="border-t border-line"><td className="px-4 py-4"><p className="mb-0 font-heading text-sm font-bold text-bastly-navy">{row.student.fullName}</p><p className="mb-0 text-xs text-muted">{row.student.email}</p></td><td className="px-4 py-4 text-sm text-muted">{row.group?.name}</td><ScoreCell item={row.performance?.quiz}/><ScoreCell item={row.performance?.attendance}/><ScoreCell item={row.performance?.homework}/><td className="px-4 py-4"><p className="mb-0 font-heading text-lg font-bold text-bastly-navy">{score(row.performance?.overallPercentage)}</p><p className="mb-0 text-xs font-bold text-bastly-blue-dark">{row.performance?.gradeBand === 'Star' ? '⭐ Star' : row.performance?.gradeBand || 'No rating'}</p></td><td className="px-4 py-4"><span className={['rounded-full px-2.5 py-1 text-[0.67rem] font-extrabold', row.performance?.spinEligible ? 'bg-[#eef8f1] text-[#18764a]' : 'bg-[#fff6df] text-[#805815]'].join(' ')}>{row.performance?.spinEligible ? 'Earned' : 'Not earned'}</span></td></tr>)}</tbody>
      </table>
    </div>
  </main>;
}
function score(v){ return v===null||v===undefined?'—':`${Math.round(v)}%`; }
function ScoreCell({item}){ return <td className="px-4 py-4"><p className="mb-0 text-sm font-extrabold text-bastly-navy">{score(item?.score)}</p><p className="mb-0 text-[0.65rem] text-muted">{item?.available ? `${item.completed}/${item.assigned} · ${Math.round(item.weightUsed)}% wt` : 'Not assigned'}</p></td>; }
function Metric({label,value}){ return <div className="rounded-2xl border border-line bg-white px-4 py-3 shadow-soft"><p className="mb-0 text-xs text-muted">{label}</p><p className="mb-0 font-heading text-2xl font-bold text-bastly-navy">{value}</p></div>; }
