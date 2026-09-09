import { Award, CalendarCheck, ClipboardCheck, NotebookPen } from 'lucide-react';

function pct(value) {
  return value === null || value === undefined ? '—' : `${Math.round(value)}%`;
}

export default function PerformanceCard({ course, group, performance, compact = false }) {
  if (!performance) return null;

  const categories = [
    ['quiz', 'Quizzes', ClipboardCheck],
    ['attendance', 'Attendance', CalendarCheck],
    ['homework', 'Homework', NotebookPen],
  ];

  return (
    <article className="rounded-[24px] border border-line bg-white p-5 shadow-soft">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <p className="mb-1 font-heading text-lg font-bold text-bastly-navy">{course?.title}</p>
          <p className="mb-0 text-xs text-muted">
            {course?.doctorProfile?.displayName || course?.level || ''}
            {group?.name ? ` · ${group.name}` : ''}
          </p>
        </div>
        <div className="text-right">
          <p className="mb-0 font-heading text-3xl font-bold tracking-[-0.05em] text-bastly-navy">
            {pct(performance.overallPercentage)}
          </p>
          <span className="inline-flex rounded-full bg-bastly-blue-pale px-2.5 py-1 text-[0.68rem] font-extrabold text-bastly-blue-dark">
            {performance.gradeBand === 'Star' ? '⭐ Star' : performance.gradeBand || 'No rating'}
          </span>
        </div>
      </div>

      <div className={`grid gap-2 ${compact ? 'sm:grid-cols-3' : 'grid-cols-3'}`}>
        {categories.map(([key, label, Icon]) => {
          const item = performance[key];
          return (
            <div key={key} className="rounded-2xl bg-surface p-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <Icon size={14} className="text-bastly-blue" />
                <span className="text-[0.62rem] font-bold text-muted">
                  {item?.weightUsed ? `${Math.round(item.weightUsed)}% wt` : 'N/A'}
                </span>
              </div>
              <p className="mb-0 font-heading text-lg font-bold text-bastly-navy">{pct(item?.score)}</p>
              <p className="mb-0 text-[0.64rem] text-muted">{label}</p>
              {item?.available && (
                <p className="mt-1 mb-0 text-[0.6rem] text-muted">
                  {item.completed}/{item.assigned} completed
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className={[
        'mt-4 flex items-start gap-3 rounded-2xl px-4 py-3 text-xs leading-5',
        performance.spinEligible
          ? 'bg-[#eef8f1] text-[#18764a]'
          : 'bg-[#fff6df] text-[#805815]',
      ].join(' ')}>
        <Award size={16} className="mt-0.5 shrink-0" />
        <div>
          <strong>{performance.spinEligible ? 'Bastly Spin earned.' : 'Spin not earned yet.'}</strong>{' '}
          {performance.spinReason}
        </div>
      </div>
    </article>
  );
}
