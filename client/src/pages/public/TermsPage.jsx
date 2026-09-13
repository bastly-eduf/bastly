import PublicPageHero from '../../components/public/PublicPageHero';
import Seo from '../../components/seo/Seo';

const sections = [
  {
    title: 'Using Bastly',
    body: [
      'Bastly provides learning, assessment, attendance, progress, parent visibility, and reward features for enrolled users. You must use the platform lawfully and only through an account you are authorized to access.',
      'Account credentials are personal. Do not share passwords, session access, invitation links, or other security credentials with another person.',
    ],
  },
  {
    title: 'Enrollment, payment, and course access',
    body: [
      'Course availability, group placement, current pricing, payment instructions, and enrollment confirmation are communicated by Bastly through its official enrollment process, including WhatsApp where applicable.',
      'A course becomes available in a student account only after Bastly confirms the enrollment and access. Access may have a stated start date and end date.',
      'Any course-specific cancellation, transfer, or refund terms communicated during enrollment form part of that enrollment arrangement. If you are unsure, confirm the applicable terms with Bastly before paying.',
    ],
  },
  {
    title: 'Assessments and academic integrity',
    body: [
      'Quiz attempts, homework attempts, attendance, and performance calculations are governed by the rules shown in the platform. Attempts must be completed by the enrolled student without unauthorized assistance or manipulation.',
      'Bastly may restrict or investigate activity that appears to abuse assessments, impersonate another user, interfere with academic records, or bypass access controls.',
    ],
  },
  {
    title: 'Content and intellectual property',
    body: [
      'Course videos, resources, questions, branding, interfaces, and other Bastly or instructor materials are provided for authorized personal learning use unless Bastly or the rights holder states otherwise.',
      'You may not copy, redistribute, sell, publicly repost, scrape, or commercially exploit protected course materials without permission.',
    ],
  },
  {
    title: 'Bastly Cards and rewards',
    body: [
      'Reward eligibility is separate from the academic weekly grade. A Bastly Spin may depend on the published reward rules, required quiz performance, account eligibility, and available reward inventory.',
      'Rewards are subject to availability and any terms set for the specific partner reward. They are not guaranteed, cannot be manipulated or duplicated, and have no cash value unless Bastly explicitly states otherwise.',
    ],
  },
  {
    title: 'Third-party services',
    body: [
      'Bastly may link to or embed third-party services such as YouTube, WhatsApp, or Instagram. Those services are operated independently and may have their own terms and privacy policies.',
      'Bastly is not responsible for outages, policy changes, or content controlled solely by a third-party service provider.',
    ],
  },
  {
    title: 'Availability and changes',
    body: [
      'Bastly may update, improve, suspend, or discontinue parts of the platform when reasonably necessary for security, maintenance, product changes, legal requirements, or academy operations.',
      'Reasonable efforts are made to keep the platform reliable, but uninterrupted or error-free availability cannot be guaranteed.',
    ],
  },
  {
    title: 'No guarantee of academic results',
    body: [
      'Bastly is a learning and academic-management platform. Participation in a course, use of study materials, performance ratings, or reward eligibility does not guarantee a particular school, exam, admission, or career result.',
    ],
  },
  {
    title: 'Governing terms and questions',
    body: [
      'These terms are intended to operate together with any course-specific enrollment terms communicated by Bastly. If a course-specific term conflicts with a general platform term, Bastly will clarify which term applies to that enrollment.',
      'Questions about these terms can be raised through Bastly\'s official WhatsApp or Instagram channels.',
    ],
  },
];

export default function TermsPage() {
  return (
    <>
      <Seo
        title="Terms & Conditions | Bastly Academy"
        description="Read the terms for Bastly Academy accounts, enrollment, course access, assessments, learning content, rewards, and platform use."
        canonicalPath="/terms"
      />

      <main>
        <PublicPageHero
          eyebrow="Legal"
          title="Terms & Conditions"
          description="The rules that apply when using Bastly accounts, courses, assessments, academic records, and rewards."
        />

        <article className="bg-white py-14 lg:py-20">
          <div className="mx-auto w-[min(860px,calc(100%-2rem))] lg:w-[min(860px,calc(100%-4rem))]">
            <p className="mb-10 text-sm text-muted">Effective: September 13, 2026</p>

            <div className="grid gap-10">
              {sections.map((section) => (
                <section key={section.title} aria-labelledby={`terms-${section.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>
                  <h2
                    id={`terms-${section.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                    className="mb-4 font-heading text-2xl font-bold tracking-[-0.04em] text-bastly-navy"
                  >
                    {section.title}
                  </h2>
                  <div className="grid gap-3 text-sm leading-7 text-muted sm:text-base">
                    {section.body.map((paragraph) => (
                      <p key={paragraph} className="mb-0">{paragraph}</p>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            <div className="mt-12 rounded-[24px] border border-line bg-bastly-blue-pale p-5 text-sm leading-7 text-muted">
              Bastly may revise these terms as the platform or enrollment model changes. The current version will be published on this page.
            </div>
          </div>
        </article>
      </main>
    </>
  );
}
