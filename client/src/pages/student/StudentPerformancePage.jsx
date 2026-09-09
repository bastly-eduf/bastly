import { useEffect, useState } from 'react';
import PerformanceCard from '../../components/performance/PerformanceCard';
import WeekPicker from '../../components/performance/WeekPicker';
import { api, apiErrorMessage } from '../../services/api';

function mondayValue(){ const d=new Date(); const day=d.getUTCDay(); d.setUTCDate(d.getUTCDate()+(day===0?-6:1-day)); d.setUTCHours(0,0,0,0); return d.toISOString().slice(0,10); }

export default function StudentPerformancePage(){
  const [weekStart,setWeekStart]=useState(mondayValue); const [data,setData]=useState(null); const [error,setError]=useState('');
  useEffect(()=>{ setError(''); api.get('/student/performance',{params:{weekStart}}).then(({data})=>setData(data)).catch((err)=>setError(apiErrorMessage(err,'Could not load performance.'))); },[weekStart]);
  return <main className="px-4 py-7 sm:px-6 lg:px-8 lg:py-9"><div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="mb-2 text-[0.72rem] font-extrabold uppercase tracking-[0.1em] text-bastly-blue">Progress</p><h1 className="mb-2 font-heading text-[clamp(2rem,5vw,3.3rem)] font-bold tracking-[-0.055em] text-bastly-navy">Weekly performance</h1><p className="mb-0 max-w-[720px] text-sm leading-6 text-muted">50% quizzes · 30% attendance · 20% homework. Missing categories are automatically redistributed, so you are never punished for work your doctor did not assign.</p></div><WeekPicker value={weekStart} onChange={setWeekStart}/></div>{error&&<div className="mb-4 rounded-2xl bg-[#fff0ef] px-4 py-3 text-sm font-bold text-[#a83d36]">{error}</div>}<div className="grid gap-4 lg:grid-cols-2">{(data?.rows||[]).map((row)=><PerformanceCard key={row.enrollmentId} course={row.course} group={row.group} performance={row.performance}/>)}{data&&data.rows?.length===0&&<div className="rounded-[24px] border border-line bg-white p-10 text-center text-sm text-muted shadow-soft lg:col-span-2">No active course performance for this week.</div>}</div></main>;
}
