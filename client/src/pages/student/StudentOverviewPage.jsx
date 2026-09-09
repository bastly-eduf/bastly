import { BookOpen, ClipboardCheck, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export default function StudentOverviewPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  useEffect(() => { let alive = true; api.get('/student/overview').then(({ data }) => alive && setData(data)); return () => { alive = false; }; }, []);

  return (
    <main className="px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
      <p className="mb-2 text-[0.72rem] font-extrabold uppercase tracking-[0.1em] text-bastly-blue">Student dashboard</p>
      <h1 className="mb-2 font-heading text-[clamp(2rem,5vw,3.3rem)] font-bold tracking-[-0.055em] text-bastly-navy">Hey, {user?.fullName?.split(' ')[0] || 'there'} 👋</h1>
      <p className="mb-7 text-sm leading-6 text-muted">Your active courses and assessment progress in one place.</p>

      <div className="grid gap-4 sm:grid-cols-3">
        <Metric icon={BookOpen} label="Active courses" value={data ? data.counts?.courses || 0 : '—'} />
        <Metric icon={ClipboardCheck} label="Available assessments" value={data ? data.counts?.availableAssessments || 0 : '—'} />
        <Metric icon={Star} label="Quiz average" value={data ? (data.quizAverage === null ? '—' : `${Math.round(data.quizAverage)}%`) : '—'} />
      </div>

      <section className="mt-6 rounded-[26px] border border-line bg-white p-5 shadow-soft sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-4"><div><p className="mb-1 text-[0.68rem] font-extrabold uppercase tracking-[0.08em] text-bastly-blue">My courses</p><h2 className="mb-0 font-heading text-2xl font-bold text-bastly-navy">Active access</h2></div><Link to="/student/assessments" className="text-sm font-extrabold text-bastly-blue-dark no-underline">Quizzes & homework →</Link></div>
        <div className="grid gap-3 md:grid-cols-2">
          {(data?.activeCourses || []).map((e) => <div key={e._id} className="rounded-2xl border border-line bg-surface p-4"><p className="mb-1 font-heading font-bold text-bastly-navy">{e.course?.title}</p><p className="mb-1 text-xs text-muted">{e.course?.doctorProfile?.displayName}</p><p className="mb-0 text-[0.68rem] text-muted">{e.group?.name}{e.group?.scheduleLabel ? ` · ${e.group.scheduleLabel}` : ''}</p></div>)}
          {data && !data.activeCourses?.length && <p className="mb-0 text-sm text-muted">You do not have an active paid course yet.</p>}
        </div>
      </section>
    </main>
  );
}

function Metric({ icon: Icon, label, value }) {
  return <div className="rounded-[24px] border border-line bg-white p-5 shadow-soft"><span className="mb-5 grid size-11 place-items-center rounded-2xl bg-bastly-blue-pale text-bastly-blue"><Icon size={19} /></span><p className="mb-1 font-heading text-4xl font-bold tracking-[-0.05em] text-bastly-navy">{value}</p><p className="mb-0 text-sm text-muted">{label}</p></div>;
}
