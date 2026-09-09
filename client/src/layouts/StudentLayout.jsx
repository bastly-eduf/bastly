import { ClipboardCheck, LayoutDashboard, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const links = [
  ['Overview', '/student', LayoutDashboard, true],
  ['Quizzes & Homework', '/student/assessments', ClipboardCheck, false],
];

export default function StudentLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const signOut = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-[#f5f8fc] text-ink">
      <aside className={`fixed inset-y-0 left-0 z-50 w-[270px] bg-[#041632] px-4 py-5 text-white transition-transform lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="grid size-12 place-items-center overflow-hidden rounded-2xl bg-white"><img src="/brand/bastly-logo.webp" alt="Bastly Academy" className="size-full object-contain" /></span>
            <div><p className="mb-0 font-heading text-sm font-bold">Bastly</p><p className="mb-0 text-[0.68rem] text-white/45">Student space</p></div>
          </div>
          <button type="button" onClick={() => setOpen(false)} className="lg:hidden" aria-label="Close navigation"><X size={19} /></button>
        </div>
        <nav className="mt-9 grid gap-1.5">
          {links.map(([label, to, Icon, end]) => (
            <NavLink key={to} to={to} end={end} onClick={() => setOpen(false)} className={({ isActive }) => `flex min-h-11 items-center gap-3 rounded-2xl px-3.5 text-sm font-bold no-underline ${isActive ? 'bg-bastly-blue text-white' : 'text-white/60 hover:bg-white/6 hover:text-white'}`}><Icon size={18} />{label}</NavLink>
          ))}
        </nav>
        <div className="absolute inset-x-4 bottom-5">
          <div className="mb-3 rounded-2xl border border-white/8 bg-white/5 p-3"><p className="mb-1 truncate text-sm font-bold">{user?.fullName}</p><p className="mb-0 truncate text-[0.7rem] text-white/45">{user?.email}</p></div>
          <button type="button" onClick={signOut} className="flex min-h-10 w-full items-center justify-center gap-2 rounded-2xl border border-white/10 text-sm font-bold text-white/60"><LogOut size={16} />Log out</button>
        </div>
      </aside>
      {open && <button type="button" className="fixed inset-0 z-40 bg-[#041632]/55 lg:hidden" onClick={() => setOpen(false)} aria-label="Close navigation overlay" />}
      <div className="lg:pl-[270px]">
        <header className="sticky top-0 z-30 flex h-16 items-center border-b border-line bg-white/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8"><button type="button" onClick={() => setOpen(true)} className="grid size-10 place-items-center rounded-xl border border-line text-bastly-navy lg:hidden" aria-label="Open navigation"><Menu size={19} /></button><div className="ml-auto rounded-full bg-bastly-blue-pale px-3 py-1.5 text-xs font-extrabold text-bastly-blue-dark">Student</div></header>
        <Outlet />
      </div>
    </div>
  );
}
