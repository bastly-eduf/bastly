import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import './Header.css';

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
  const solidHeader = !isHome || scrolled || menuOpen;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 24);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    };

    window.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [menuOpen]);

  return (
    <header
      className={`site-header ${solidHeader ? 'site-header--solid' : 'site-header--transparent'}`}
    >
      <div className="container site-header__inner">
        <Link className="site-header__brand" to="/" aria-label="Bastly Academy home">
          <span className="site-header__logo-frame">
            <img
              className="site-header__logo"
              src="/brand/bastly-logo.webp"
              alt=""
              width="1254"
              height="1254"
            />
          </span>
        </Link>

        <nav className="site-header__nav" aria-label="Primary navigation">
          {navItems.map((item) =>
            item.to.includes('#') ? (
              <Link className="site-header__nav-link" key={item.label} to={item.to}>
                {item.label}
              </Link>
            ) : (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) =>
                  `site-header__nav-link ${isActive ? 'site-header__nav-link--active' : ''}`
                }
              >
                {item.label}
              </NavLink>
            ),
          )}
        </nav>

        <div className="site-header__actions">
          <Link className="site-header__login" to="/login">
            Log in
          </Link>
          <Link className="site-header__join" to="/register">
            Join Bastly
          </Link>
        </div>

        <button
          className={`site-header__menu-button ${menuOpen ? 'site-header__menu-button--open' : ''}`}
          type="button"
          aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      <div
        id="mobile-navigation"
        className={`mobile-nav ${menuOpen ? 'mobile-nav--open' : ''}`}
        aria-hidden={!menuOpen}
      >
        <nav className="container mobile-nav__inner" aria-label="Mobile navigation">
          <div className="mobile-nav__links">
            {navItems.map((item) => (
              <Link className="mobile-nav__link" key={item.label} to={item.to}>
                {item.label}
              </Link>
            ))}
          </div>

          <div className="mobile-nav__actions">
            <Link className="mobile-nav__login" to="/login">
              Log in
            </Link>
            <Link className="mobile-nav__join" to="/register">
              Join Bastly
            </Link>
          </div>

          <p className="mobile-nav__note">
            Learn, track your progress, and earn Bastly rewards.
          </p>
        </nav>
      </div>
    </header>
  );
}
