import Seo from '../../components/seo/Seo';

export default function HomePage() {
  return (
    <>
      <Seo
        title="Bastly Academy | Study Smarter. Aim Higher."
        description="Explore Bastly Academy courses, meet expert instructors, learn through lessons and quizzes, track progress, and earn Bastly rewards."
        canonicalPath="/"
      />

      <main className="foundation-preview">
        <div className="container foundation-preview__inner">
          <img
            className="foundation-preview__logo"
            src="/brand/bastly-logo.webp"
            alt="Bastly Academy"
          />

          <p className="eyebrow">Foundation ready</p>
          <h1>Study smarter. Aim higher.</h1>
          <p className="foundation-preview__copy">
            The Bastly foundation is in place. The next step is the real responsive navbar
            and hero using the supplied desktop and mobile backgrounds.
          </p>
        </div>
      </main>
    </>
  );
}
