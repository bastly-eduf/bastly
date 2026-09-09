import { Link } from 'react-router-dom';
import './Hero.css';

export default function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <picture className="hero__media" aria-hidden="true">
        <source media="(max-width: 767px)" srcSet="/media/hero-mobile.webp" />
        <img
          src="/media/hero-desktop.webp"
          alt=""
          width="1672"
          height="941"
          fetchPriority="high"
          decoding="async"
        />
      </picture>

      <div className="hero__overlay" aria-hidden="true" />

      <div className="container hero__inner">
        <div className="hero__content">
          <p className="hero__eyebrow">
            <span className="hero__eyebrow-dot" aria-hidden="true" />
            Your smarter way to learn
          </p>

          <h1 id="hero-title">
            <span>Study smarter.</span>
            <span className="hero__title-accent">Aim higher.</span>
          </h1>

          <p className="hero__description">
            Learn with expert instructors, tackle quizzes and homework, track your
            progress, and unlock Bastly rewards — all in one place.
          </p>

          <div className="hero__actions">
            <Link className="hero__button hero__button--primary" to="/courses">
              Explore Courses
              <span aria-hidden="true">→</span>
            </Link>
            <Link className="hero__button hero__button--secondary" to="/doctors">
              Meet Our Doctors
            </Link>
          </div>

          <p className="hero__login-note">
            Already studying with Bastly? <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>

      <a className="hero__scroll-cue" href="#homepage-content" aria-label="Explore Bastly">
        <span>Explore</span>
        <span className="hero__scroll-line" aria-hidden="true" />
      </a>
    </section>
  );
}
