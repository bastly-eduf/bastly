import {
  BookOpen,
  GraduationCap,
  Hourglass,
  Layers3,
  Users,
  UsersRound,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import AdminPageHeader from '../../components/admin/AdminPageHeader';
import { api } from '../../services/api';

const cards = [
  ['doctorProfiles', 'Doctors', UsersRound],
  ['courses', 'Courses', BookOpen],
  ['groups', 'Active groups', Layers3],
  ['activeStudents', 'Students', Users],
  ['pendingEnrollments', 'Pending enrollments', Hourglass],
  ['activeEnrollments', 'Active enrollments', GraduationCap],
];

export default function AdminOverviewPage() {
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    api
      .get('/admin/academic/overview')
      .then(({ data }) => {
        if (active) setCounts(data.counts || {});
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
      <AdminPageHeader
        title="Academy overview"
        description="The operational side of Bastly: instructors, courses, groups, students, and access."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(([key, label, Icon]) => (
          <div key={key} className="rounded-[24px] border border-line bg-white p-5 shadow-soft">
            <div className="mb-5 flex items-center justify-between">
              <span className="grid size-11 place-items-center rounded-2xl bg-bastly-blue-pale text-bastly-blue">
                <Icon size={19} />
              </span>
              <span className="text-xs font-bold text-muted">Live</span>
            </div>
            <p className="mb-1 font-heading text-4xl font-bold tracking-[-0.05em] text-bastly-navy">
              {loading ? '—' : counts[key] ?? 0}
            </p>
            <p className="mb-0 text-sm text-muted">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {[
          ['/admin/doctors', 'Set up doctors', 'Create public instructor profiles and connect their login accounts.'],
          ['/admin/courses', 'Build courses & groups', 'Different levels become separate courses; groups hold different student cohorts.'],
          ['/admin/enrollments', 'Manage access', 'Create pending enrollments, confirm WhatsApp payments, or unregister access without deleting history.'],
        ].map(([to, title, text]) => (
          <Link
            key={to}
            to={to}
            className="group rounded-[24px] border border-line bg-white p-5 no-underline shadow-soft transition hover:-translate-y-1 hover:border-bastly-blue/25 hover:shadow-card"
          >
            <p className="mb-2 font-heading text-lg font-bold text-bastly-navy">{title}</p>
            <p className="mb-4 text-sm leading-6 text-muted">{text}</p>
            <span className="text-sm font-extrabold text-bastly-blue-dark">
              Open <span className="inline-block transition group-hover:translate-x-1">→</span>
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}
