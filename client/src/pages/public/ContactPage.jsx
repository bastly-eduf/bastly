import {
  BookOpen,
  CircleHelp,
  Instagram,
  MessageCircle,
  Phone,
  ShieldCheck,
  UsersRound,
} from 'lucide-react';

import PublicPageHero from '../../components/public/PublicPageHero';
import Seo from '../../components/seo/Seo';

const contactOptions = [
  {
    icon: MessageCircle,
    title: 'WhatsApp',
    text: 'Best for enrollment, current prices, payment, and group availability.',
    href: 'https://wa.me/201000883609?text=Hi%20Bastly%20Academy%20%F0%9F%91%8B%0AI%20would%20like%20some%20help.',
    action: 'Open WhatsApp',
    external: true,
  },
  {
    icon: Phone,
    title: 'Phone',
    text: 'Use the Bastly contact number when you need to call instead.',
    href: 'tel:+201000883609',
    action: '01000883609',
    external: false,
  },
  {
    icon: Instagram,
    title: 'Instagram',
    text: 'Visit the academy profile for updates and social content.',
    href: 'https://www.instagram.com/bastly.eduf/',
    action: '@bastly.eduf',
    external: true,
  },
];

const helpTopics = [
  {
    icon: BookOpen,
    title: 'Course enrollment',
    text: 'Ask about the right course, current price, academic level, and available group.',
  },
  {
    icon: CircleHelp,
    title: 'Account help',
    text: 'Get help if a student, parent, or doctor account cannot access the expected area.',
  },
  {
    icon: UsersRound,
    title: 'Parent access',
    text: 'Ask about parent invitations and the secure link between parent and student accounts.',
  },
  {
    icon: ShieldCheck,
    title: 'Payment & course access',
    text: 'If payment was made but the course is still locked, Bastly can verify the enrollment status.',
  },
];

export default function ContactPage() {
  return (
    <>
      <Seo
        title="Contact Bastly Academy | Enrollment & Course Help"
        description="Contact Bastly Academy through WhatsApp, phone, or Instagram for course enrollment, prices, group availability, payment, and account support."
        canonicalPath="/contact"
        schema={{
          '@context': 'https://schema.org',
          '@type': 'ContactPage',
          name: 'Contact Bastly Academy',
          mainEntity: {
            '@type': 'EducationalOrganization',
            name: 'Bastly Academy',
            telephone: '+201000883609',
            sameAs: [
              'https://www.instagram.com/bastly.eduf/',
            ],
          },
        }}
      />

      <main>
        <PublicPageHero
          eyebrow="Contact Bastly"
          title="A real question deserves a direct answer."
          description="For enrollment, current course pricing, group availability, payment confirmation, or account help, contact Bastly through the channel that works best for you."
        />

        <section className="bg-[#f6f9fc] py-14 lg:py-20">
          <div className="mx-auto w-[min(1100px,calc(100%-2rem))] lg:w-[min(1100px,calc(100%-4rem))]">
            <div className="grid gap-5 md:grid-cols-3">
              {contactOptions.map(
                ({
                  icon: Icon,
                  title,
                  text,
                  href,
                  action,
                  external,
                }) => (
                  <article
                    key={title}
                    className="flex min-h-[300px] flex-col rounded-[28px] border border-line bg-white p-5 shadow-soft sm:p-6"
                  >
                    <span className="mb-6 grid size-12 place-items-center rounded-2xl bg-bastly-blue-pale text-bastly-blue">
                      <Icon size={20} />
                    </span>

                    <h2 className="mb-2 font-heading text-2xl font-bold tracking-[-0.04em] text-bastly-navy">
                      {title}
                    </h2>

                    <p className="mb-6 text-sm leading-6 text-muted">
                      {text}
                    </p>

                    <a
                      href={href}
                      {...(external
                        ? {
                            target: '_blank',
                            rel: 'noreferrer',
                          }
                        : {})}
                      className="mt-auto inline-flex min-h-11 items-center justify-center rounded-full bg-bastly-navy px-4 text-sm font-extrabold text-white no-underline transition hover:bg-bastly-blue-dark"
                    >
                      {action}
                    </a>
                  </article>
                ),
              )}
            </div>
          </div>
        </section>

        <section className="bg-white py-14 lg:py-20">
          <div className="mx-auto grid w-[min(1100px,calc(100%-2rem))] gap-8 lg:w-[min(1100px,calc(100%-4rem))] lg:grid-cols-[0.78fr_1.22fr] lg:gap-14">
            <div>
              <p className="mb-3 text-[0.72rem] font-extrabold uppercase tracking-[0.1em] text-bastly-blue">
                What can we help with?
              </p>
              <h2 className="mb-4 font-heading text-[clamp(2.1rem,4.4vw,3.7rem)] font-bold tracking-[-0.055em] text-bastly-navy">
                Start with WhatsApp when the answer depends on
                your course.
              </h2>
              <p className="mb-0 text-sm leading-7 text-muted">
                Bastly course prices and group availability can
                change, so those details are confirmed directly
                instead of being guessed or left stale on the
                website.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {helpTopics.map(({ icon: Icon, title, text }) => (
                <div
                  key={title}
                  className="rounded-[24px] border border-line bg-surface p-5"
                >
                  <Icon
                    size={18}
                    className="mb-4 text-bastly-blue"
                  />
                  <p className="mb-1 font-heading text-base font-bold text-bastly-navy">
                    {title}
                  </p>
                  <p className="mb-0 text-xs leading-6 text-muted">
                    {text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-bastly-navy py-14 text-white lg:py-18">
          <div className="mx-auto flex w-[min(900px,calc(100%-2rem))] flex-col items-center text-center">
            <MessageCircle
              size={28}
              className="mb-4 text-[#82c8ff]"
            />
            <h2 className="mb-3 font-heading text-[clamp(2rem,4vw,3.2rem)] font-bold tracking-[-0.05em]">
              Ready to ask?
            </h2>
            <p className="mb-6 max-w-[620px] text-sm leading-7 text-white/60">
              Tell Bastly which course or account you need help
              with, and include the student name when the issue
              is account-specific.
            </p>
            <a
              href="https://wa.me/201000883609?text=Hi%20Bastly%20Academy%20%F0%9F%91%8B%0AI%20need%20help%20with%3A%20"
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-5 text-sm font-extrabold text-bastly-navy no-underline"
            >
              <MessageCircle size={18} />
              Start WhatsApp chat
            </a>
          </div>
        </section>
      </main>
    </>
  );
}
