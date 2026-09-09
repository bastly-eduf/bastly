import Hero from '../../components/common/Hero';
import CoursesPreview from '../../components/home/CoursesPreview';
import DoctorsPreview from '../../components/home/DoctorsPreview';
import HowItWorks from '../../components/home/HowItWorks';
import ValueStrip from '../../components/home/ValueStrip';
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

        <div id="homepage-content">
          <ValueStrip />
          <CoursesPreview />
          <DoctorsPreview />
          <HowItWorks />
        </div>
      </main>
    </>
  );
}
