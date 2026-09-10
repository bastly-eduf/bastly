import {
  BookOpen,
  CheckCircle2,
  GraduationCap,
  HeartHandshake,
  MessageCircle,
  Sparkles,
  TrendingUp,
  UsersRound,
} from 'lucide-react';
import { Link } from 'react-router-dom';

import PublicPageHero from '../../components/public/PublicPageHero';
import Seo from '../../components/seo/Seo';

const journey = [
  {
    number: '01',
    title: 'Choose a course',
    text: 'Browse the published course and instructor pages, then ask Bastly about the right group.',
  },
  {
    number: '02',
    title: 'Enroll through WhatsApp',
    text: 'Bastly confirms the current price, payment details, and group availability directly.',
  },
  {
    number: '03',
    title: 'Learn inside one account',
    text: 'Open lessons, quizzes, homework, attendance, and progress without jumping between scattered systems.',
  },
  {
    number: '04',
    title: 'Track the whole journey',
    text: 'Students, linked parents, doctors, and the academy each see the information appropriate to their role.',
  },
];

const roles = [
  {
    icon: GraduationCap,
    title: 'Students',
    text: 'Courses, lessons, assessments, progress, weekly performance, and Bastly rewards.',
  },
  {
    icon: UsersRound,
    title: 'Parents',
    text: 'A secure linked view of course progress, quiz results, homework improvement, and attendance.',
  },
  {
    icon: BookOpen,
    title: 'Doctors',
    text: 'Course content, quizzes, homework, attendance, students, and performance in one workspace.',
  },
  {
    icon: HeartHandshake,
    title: 'Academy',
    text: 'Enrollment control, course access, public content, instructor accounts, and reward inventory.',
  },
];

export default function AboutPage() {
  return (
    <>
      <Seo
        title="About Bastly Academy | One Smarter Learning Experience"
        description="Learn how Bastly Academy connects lessons, assessments, attendance, parent visibility, weekly performance, and rewards in one student-focused platform."
        canonicalPath="/about"
        schema={{
          '@context': 'https://schema.org',
          '@type': 'AboutPage',
          name: 'About Bastly Academy',
          mainEntity: {
            '@type': 'EducationalOrganization',
            name: 'Bastly Academy',
            description:
              'A learning platform that brings courses, assessments, attendance, performance tracking, parent visibility, and student rewards into one experience.',
          },
        }}
      />

      <main>
        <PublicPageHero
          eyebrow="About Bastly"
          title="Learning works better when everything connects."
          description="Bastly is built around one simple idea: students should be able to learn, prove what they know, track their progress, and stay motivated without their academic journey being scattered across disconnected tools."
          aside={
            <Link
              to="/courses"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-extrabold text-bastly-navy no-underline transition hover:-translate-y-0.5"
            >
              Explore courses
              <span aria-hidden="true">→</span>
            </Link>
          }
        />

        <section className="bg-white py-16 lg:py-24">
          <div className="mx-auto grid w-[min(1200px,calc(100%-2rem))] gap-10 lg:w-[min(1200px,calc(100%-4rem))] lg:grid-cols-[0.8fr_1.2fr] lg:gap-18">
            <div>
              <p className="mb-3 text-[0.72rem] font-extrabold uppercase tracking-[0.1em] text-bastly-blue">
                The Bastly idea
              </p>
              <h2 className="mb-5 font-heading text-[clamp(2.2rem,4.6vw,4rem)] font-bold leading-[1.05] tracking-[-0.06em] text-bastly-navy">
                Not just course videos. A connected academic
                journey.
              </h2>
            </div>

            <div className="grid gap-5 text-sm leading-8 text-muted sm:text-base">
              <p className="mb-0">
                A Bastly course can combine published video
                lessons, resources, one-attempt quizzes,
                repeatable homework, manual attendance, weekly
                performance, and parent visibility.
              </p>
              <p className="mb-0">
                The student sees one learning space. The doctor
                gets a focused course workspace. Parents get a
                secure view of linked children. The academy
                controls enrollment and access instead of
                relying on fragile manual workarounds.
              </p>
              <div className="rounded-[24px] border border-bastly-blue/15 bg-bastly-blue-pale p-5 text-bastly-navy">
                <div className="mb-3 flex items-center gap-2 font-extrabold">
                  <TrendingUp
                    size={18}
                    className="text-bastly-blue"
                  />
                  Weekly performance has context.
                </div>
                <p className="mb-0 text-sm leading-7 text-muted">
                  Bastly combines 50% quizzes, 30% attendance,
                  and 20% homework. When a category was not
                  assigned that week, the remaining weights are
                  normalized instead of unfairly giving a zero.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#f6f9fc] py-16 lg:py-24">
          <div className="mx-auto w-[min(1200px,calc(100%-2rem))] lg:w-[min(1200px,calc(100%-4rem))]">
            <div className="mb-9 max-w-[760px]">
              <p className="mb-3 text-[0.72rem] font-extrabold uppercase tracking-[0.1em] text-bastly-blue">
                One platform, four perspectives
              </p>
              <h2 className="mb-0 font-heading text-[clamp(2.1rem,4.4vw,3.8rem)] font-bold tracking-[-0.055em] text-bastly-navy">
                Everyone sees what they need — not everything.
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {roles.map(({ icon: Icon, title, text }) => (
                <article
                  key={title}
                  className="rounded-[26px] border border-line bg-white p-5 shadow-soft"
                >
                  <span className="mb-5 grid size-11 place-items-center rounded-2xl bg-bastly-blue-pale text-bastly-blue">
                    <Icon size={19} />
                  </span>
                  <h3 className="mb-2 font-heading text-xl font-bold text-bastly-navy">
                    {title}
                  </h3>
                  <p className="mb-0 text-sm leading-6 text-muted">
                    {text}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white py-16 lg:py-24">
          <div className="mx-auto w-[min(1100px,calc(100%-2rem))] lg:w-[min(1100px,calc(100%-4rem))]">
            <div className="mb-10 text-center">
              <p className="mb-3 text-[0.72rem] font-extrabold uppercase tracking-[0.1em] text-bastly-blue">
                From interest to progress
              </p>
              <h2 className="mx-auto mb-0 max-w-[780px] font-heading text-[clamp(2.2rem,4.7vw,4rem)] font-bold tracking-[-0.06em] text-bastly-navy">
                A simpler path from “I want this course” to “I
                know how I’m doing.”
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {journey.map((item) => (
                <article
                  key={item.number}
                  className="rounded-[26px] border border-line bg-surface p-5 sm:p-6"
                >
                  <p className="mb-5 font-heading text-3xl font-bold text-bastly-blue/30">
                    {item.number}
                  </p>
                  <h3 className="mb-2 font-heading text-xl font-bold text-bastly-navy">
                    {item.title}
                  </h3>
                  <p className="mb-0 text-sm leading-6 text-muted">
                    {item.text}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-bastly-navy py-16 text-white lg:py-20">
          <div className="mx-auto grid w-[min(1100px,calc(100%-2rem))] items-center gap-8 lg:w-[min(1100px,calc(100%-4rem))] lg:grid-cols-[1fr_auto]">
            <div>
              <div className="mb-3 flex items-center gap-2 text-[#82c8ff]">
                <Sparkles size={17} />
                <span className="text-[0.72rem] font-extrabold uppercase tracking-[0.1em]">
                  Motivation matters
                </span>
              </div>
              <h2 className="mb-3 max-w-[760px] font-heading text-[clamp(2.1rem,4.6vw,3.8rem)] font-bold tracking-[-0.055em]">
                Strong quiz weeks can turn into something fun,
                too.
              </h2>
              <p className="mb-0 max-w-[760px] text-sm leading-7 text-white/60">
                Bastly Spin rewards are deliberately separate
                from the weekly grade. Academic performance
                stays academic, while an all-Star quiz week can
                unlock one chance to win an available partner
                reward.
              </p>
            </div>

            <a
              href="https://wa.me/201000883609?text=Hi%20Bastly%20Academy%20%F0%9F%91%8B%0AI%20would%20like%20to%20ask%20about%20your%20courses."
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-extrabold text-bastly-navy no-underline"
            >
              <MessageCircle size={18} />
              Ask Bastly
            </a>
          </div>
        </section>

        <section className="bg-[#f6f9fc] py-14 lg:py-18">
          <div className="mx-auto flex w-[min(900px,calc(100%-2rem))] flex-col items-center text-center">
            <CheckCircle2
              size={28}
              className="mb-4 text-bastly-blue"
            />
            <h2 className="mb-3 font-heading text-[clamp(2rem,4vw,3rem)] font-bold tracking-[-0.05em] text-bastly-navy">
              Ready to see the courses?
            </h2>
            <p className="mb-6 max-w-[620px] text-sm leading-7 text-muted">
              Browse the published options, meet the instructor,
              then enroll through Bastly on WhatsApp.
            </p>
            <Link
              to="/courses"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-bastly-blue px-5 text-sm font-extrabold text-white no-underline"
            >
              Explore courses
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
