import Hero from '../../components/common/Hero';
import Seo from '../../components/seo/Seo';

export default function HomePage() {
  return (
    <>
      <Seo
        title="Bastly Academy | Study Smarter. Aim Higher."
        description="Explore Bastly Academy courses, meet expert instructors, learn through lessons and quizzes, track progress, and earn Bastly rewards."
        canonicalPath="/"
      />

      <main>
        <Hero />

        <div id="homepage-content" className="homepage-content-anchor" aria-hidden="true" />
      </main>
    </>
  );
}
