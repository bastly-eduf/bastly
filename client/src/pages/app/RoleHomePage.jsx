import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Seo from '../../components/seo/Seo';
import { useAuth } from '../../context/AuthContext';

export default function RoleHomePage({ role }) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [busy, setBusy] = useState(false);

  const handleLogout = async () => {
    setBusy(true);
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <>
      <Seo title={`${role} Area | Bastly Academy`} noIndex />
      <main className="grid min-h-screen place-items-center bg-bastly-blue-pale px-4 py-20">
        <div className="w-full max-w-[720px] rounded-[30px] border border-bastly-navy/10 bg-white p-8 text-center shadow-card sm:p-12">
          <img
            src="/brand/bastly-logo.webp"
            alt="Bastly Academy"
            className="mx-auto mb-6 size-20 rounded-2xl object-contain shadow-soft"
          />
          <p className="mb-2 text-[0.72rem] font-extrabold uppercase tracking-[0.1em] text-bastly-blue">
            {role} area
          </p>
          <h1 className="mb-3 font-heading text-4xl font-bold tracking-[-0.05em] text-bastly-navy">
            Hi, {user?.fullName || role}.
          </h1>
          <p className="mx-auto mb-2 max-w-[560px] leading-7 text-muted">
            Your Bastly session is protected and restored after refresh.
          </p>
          <p className="mx-auto mb-7 max-w-[560px] text-sm text-muted">
            The actual {role.toLowerCase()} dashboard is built in the next dashboard step.
          </p>

          <div className="mx-auto mb-7 grid max-w-[440px] gap-2 rounded-2xl border border-line bg-surface p-4 text-left text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-muted">Role</span>
              <strong className="capitalize text-bastly-navy">{user?.role}</strong>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-muted">Email</span>
              <strong className="truncate text-bastly-navy">{user?.email}</strong>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={busy}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-bastly-navy px-5 font-extrabold text-white transition hover:bg-bastly-blue-dark disabled:opacity-60"
          >
            {busy ? 'Logging out…' : 'Log out'}
          </button>
        </div>
      </main>
    </>
  );
}
