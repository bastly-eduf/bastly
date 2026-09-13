import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Courses', to: '/courses' },
  { label: 'Doctors', to: '/doctors' },
  { label: 'FAQ', to: '/faq' },
];

export default function Header() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef(null);
  const firstMobileLinkRef = useRef(null);

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

    if (menuOpen) {
      window.requestAnimationFrame(() => firstMobileLinkRef.current?.focus());
    }

    const onKeyDown = (event) => {
      if (event.key === 'Escape' && menuOpen) {
        setMenuOpen(false);
        window.requestAnimationFrame(() => menuButtonRef.current?.focus());
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  const desktopLinkClass = solid ? 'text-bastly-navy' : 'text-white';
  const closeMobileMenu = () => setMenuOpen(false);

  const desktopNavItem = (item) => (
    <NavLink
      key={item.label}
      to={item.to}
      end={item.to === '/'}
      className={() =>
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
  );

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-[var(--header-height)]">
      <div className="flex h-[var(--announcement-height)] items-center border-b border-white/10 bg-bastly-navy text-white">
        <div className="mx-auto flex w-[min(1200px,calc(100%-2rem))] items-center justify-center lg:w-[min(1200px,calc(100%-4rem))]">
          <p className="m-0 text-center text-[0.68rem] font-extrabold tracking-[0.025em] text-white/88 sm:text-xs">
            Think Smart. Aim High. Be BASATA 💡
          </p>
        </div>
      </div>

      <div
        className={[
          'h-[var(--nav-height)] transition-colors duration-300',
          solid
            ? 'border-b border-line bg-white'
            : 'bg-gradient-to-b from-[#010b1c]/60 to-transparent',
        ].join(' ')}
      >
        <div className="mx-auto grid h-full w-[min(1200px,calc(100%-2rem))] grid-cols-[auto_1fr_auto] items-center gap-4 lg:w-[min(1200px,calc(100%-4rem))] lg:gap-8">
          <Link to="/" className="inline-flex items-center" aria-label="Bastly Academy home">
            <span className="grid size-[58px] place-items-center overflow-hidden rounded-[15px] bg-white md:size-[68px] md:rounded-[18px]">
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
            {navItems.map(desktopNavItem)}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <Link
              to="/login"
              className={[
                'inline-flex min-h-10 items-center justify-center rounded-full border px-4 text-sm font-extrabold transition hover:-translate-y-0.5',
                solid
                  ? 'border-line bg-white text-bastly-navy hover:border-bastly-blue/30'
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
            ref={menuButtonRef}
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
      </div>

      <div
        id="mobile-navigation"
        aria-hidden={!menuOpen}
        className={[
          'absolute inset-x-0 top-full h-[calc(100dvh-var(--header-height))] overflow-y-auto bg-[radial-gradient(circle_at_80%_10%,rgba(35,127,209,0.12),transparent_32%)] bg-white transition duration-300 lg:hidden',
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
            {navItems.map((item, index) => (
              <NavLink
                ref={index === 0 ? firstMobileLinkRef : undefined}
                key={item.label}
                to={item.to}
                end={item.to === '/'}
                onClick={closeMobileMenu}
                className={({ isActive }) =>
                  [
                    'border-b border-line py-4 font-heading text-[clamp(1.45rem,7vw,2rem)] font-bold no-underline',
                    isActive ? 'text-bastly-blue-dark' : 'text-bastly-navy',
                  ].join(' ')
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3">
            <Link
              to="/login"
              onClick={closeMobileMenu}
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-line font-extrabold text-bastly-navy"
            >
              Log in
            </Link>
            <Link
              to="/register"
              onClick={closeMobileMenu}
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
