import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

const navItems = [
  { label: 'Courses', to: '/courses' },
  { label: 'Doctors', to: '/doctors' },
  { label: 'How It Works', to: '/#how-it-works' },
  { label: 'About', to: '/about' },
  { label: 'FAQ', to: '/faq' },
];

export default function Header() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const isHome = location.pathname === '/';
  const solid = !isHome || scrolled || menuOpen;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';

    const onKeyDown = (event) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  const desktopLinkClass = solid
    ? 'text-bastly-navy'
    : 'text-white';

  return (
    <header
      className={[
        'fixed inset-x-0 top-0 z-50 h-[var(--header-height)] transition-all duration-300',
        solid
          ? 'bg-white/95 shadow-[0_10px_36px_rgba(6,31,73,0.10)] backdrop-blur-xl'
          : 'bg-gradient-to-b from-[#010b1c]/60 to-transparent',
      ].join(' ')}
    >
      <div className="mx-auto grid h-full w-[min(1200px,calc(100%-2rem))] grid-cols-[auto_1fr_auto] items-center gap-4 lg:w-[min(1200px,calc(100%-4rem))] lg:gap-8">
        <Link to="/" className="inline-flex items-center" aria-label="Bastly Academy home">
          <span className="grid size-[58px] place-items-center overflow-hidden rounded-[15px] bg-white shadow-[0_8px_30px_rgba(1,11,28,0.16)] transition hover:-translate-y-0.5 hover:shadow-[0_10px_34px_rgba(1,11,28,0.20)] md:size-[68px] md:rounded-[18px]">
            <img
              src="/brand/bastly-logo.webp"
              alt=""
              className="size-full object-contain"
              width="1254"
              height="1254"
            />
          </span>
        </Link>

        <nav className="hidden items-center justify-center gap-5 lg:flex xl:gap-8" aria-label="Primary navigation">
          {navItems.map((item) =>
            item.to.includes('#') ? (
              <Link
                key={item.label}
                to={item.to}
                className={`group relative py-2 text-[0.93rem] font-bold ${desktopLinkClass}`}
              >
                {item.label}
                <span className="absolute inset-x-0 bottom-0 h-0.5 origin-center scale-x-0 rounded-full bg-bastly-blue transition-transform group-hover:scale-x-100" />
              </Link>
            ) : (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) =>
                  `group relative py-2 text-[0.93rem] font-bold ${desktopLinkClass}`
                }
              >
                {({ isActive }) => (
                  <>
                    {item.label}
                    <span
                      className={[
                        'absolute inset-x-0 bottom-0 h-0.5 origin-center rounded-full bg-bastly-blue transition-transform',
                        isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100',
                      ].join(' ')}
                    />
                  </>
                )}
              </NavLink>
            ),
          )}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            to="/login"
            className={[
              'inline-flex min-h-10 items-center justify-center rounded-full border px-4 text-sm font-extrabold transition hover:-translate-y-0.5',
              solid
                ? 'border-line bg-white text-bastly-navy'
                : 'border-white/40 bg-bastly-navy/15 text-white',
            ].join(' ')}
          >
            Log in
          </Link>
          <Link
            to="/register"
            className="inline-flex min-h-10 items-center justify-center rounded-full bg-bastly-blue px-4 text-sm font-extrabold text-white shadow-[0_8px_22px_rgba(35,127,209,0.22)] transition hover:-translate-y-0.5 hover:bg-bastly-blue-dark"
          >
            Join Bastly
          </Link>
        </div>

        <button
          type="button"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen((open) => !open)}
          className="relative grid size-11 place-items-center justify-self-end rounded-[14px] lg:hidden"
        >
          <span
            className={[
              'absolute h-0.5 w-[22px] rounded-full transition duration-300',
              solid ? 'bg-bastly-navy' : 'bg-white',
              menuOpen ? 'rotate-45' : '-translate-y-[7px]',
            ].join(' ')}
          />
          <span
            className={[
              'absolute h-0.5 w-[22px] rounded-full transition duration-200',
              solid ? 'bg-bastly-navy' : 'bg-white',
              menuOpen ? 'opacity-0' : 'opacity-100',
            ].join(' ')}
          />
          <span
            className={[
              'absolute h-0.5 w-[22px] rounded-full transition duration-300',
              solid ? 'bg-bastly-navy' : 'bg-white',
              menuOpen ? '-rotate-45' : 'translate-y-[7px]',
            ].join(' ')}
          />
        </button>
      </div>

      <div
        id="mobile-navigation"
        aria-hidden={!menuOpen}
        className={[
          'fixed inset-x-0 bottom-0 top-[var(--header-height)] z-40 overflow-y-auto bg-[radial-gradient(circle_at_80%_10%,rgba(35,127,209,0.12),transparent_32%)] bg-white transition duration-300 lg:hidden',
          menuOpen
            ? 'visible translate-y-0 opacity-100'
            : 'invisible -translate-y-3 opacity-0 pointer-events-none',
        ].join(' ')}
      >
        <nav
          className="mx-auto flex min-h-full w-[min(1200px,calc(100%-2rem))] flex-col py-8"
          aria-label="Mobile navigation"
        >
          <div className="grid">
            {navItems.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className="border-b border-line py-4 font-heading text-[clamp(1.45rem,7vw,2rem)] font-bold text-bastly-navy no-underline"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3">
            <Link
              to="/login"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-line font-extrabold text-bastly-navy"
            >
              Log in
            </Link>
            <Link
              to="/register"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-bastly-blue font-extrabold text-white"
            >
              Join Bastly
            </Link>
          </div>

          <p className="mt-auto max-w-[340px] pt-8 leading-7 text-muted">
            Learn, track your progress, and earn Bastly rewards.
          </p>
        </nav>
      </div>
    </header>
  );
}
