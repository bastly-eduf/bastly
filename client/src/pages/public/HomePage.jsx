import Hero from '../../components/common/Hero';
import CoursesPreview from '../../components/home/CoursesPreview';
import DoctorsPreview from '../../components/home/DoctorsPreview';
import FinalCta from '../../components/home/FinalCta';
import HomeFaq from '../../components/home/HomeFaq';
import HowItWorks from '../../components/home/HowItWorks';
import RewardsPreview from '../../components/home/RewardsPreview';
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
          <CoursesPreview />
          <HowItWorks />
          <DoctorsPreview />
          <RewardsPreview />
          <HomeFaq />
          <FinalCta />
        </div>
      </main>
    </>
  );
}
