import { MessageCircle } from 'lucide-react';

import PublicPageHero from '../../components/public/PublicPageHero';
import Seo from '../../components/seo/Seo';
import { bastlyWhatsAppUrl } from '../../config/publicConfig';
import { faqSections } from '../../data/faqData';

export default function FaqPage() {
  const allItems = faqSections.flatMap(
    (section) => section.items,
  );

  return (
    <>
      <Seo
        title="Bastly Academy FAQ | Enrollment, Learning & Rewards"
        description="Answers about Bastly enrollment, course access, quizzes, homework, attendance, weekly performance, parent accounts, video lessons, and Bastly Spin rewards."
        canonicalPath="/faq"
        schema={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: allItems.map((item) => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: item.answer,
            },
          })),
        }}
      />

      <main>
        <PublicPageHero
          eyebrow="Frequently asked questions"
          title="The details, without the mystery."
          description="Enrollment, access, learning, grades, parents, attendance, and rewards — here is how Bastly works."
        />

        <section className="bg-[#f6f9fc] py-14 lg:py-20">
          <div className="mx-auto grid w-[min(1100px,calc(100%-2rem))] gap-10 lg:w-[min(1100px,calc(100%-4rem))]">
            {faqSections.map((section, sectionIndex) => (
              <div
                key={section.title}
                className="grid gap-5 lg:grid-cols-[260px_1fr] lg:gap-12"
              >
                <div>
                  <p className="mb-2 text-[0.68rem] font-extrabold uppercase tracking-[0.08em] text-bastly-blue">
                    Section {sectionIndex + 1}
                  </p>
                  <h2 className="mb-0 font-heading text-2xl font-bold tracking-[-0.04em] text-bastly-navy">
                    {section.title}
                  </h2>
                </div>

                <div className="overflow-hidden rounded-[26px] border border-line bg-white shadow-soft">
                  {section.items.map((item, index) => (
                    <details
                      key={item.question}
                      className="group border-b border-line last:border-b-0"
                    >
                      <summary className="flex cursor-pointer list-none items-start justify-between gap-5 px-5 py-5 marker:hidden sm:px-6">
                        <span className="font-heading text-base font-bold leading-6 text-bastly-navy sm:text-lg">
                          <span className="mr-3 text-xs font-extrabold text-bastly-blue">
                            {String(index + 1).padStart(
                              2,
                              '0',
                            )}
                          </span>
                          {item.question}
                        </span>

                        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-bastly-blue-pale font-bold text-bastly-blue transition group-open:rotate-45">
                          +
                        </span>
                      </summary>

                      <p className="mb-0 max-w-[780px] px-5 pb-5 text-sm leading-7 text-muted sm:px-6 sm:pl-[54px]">
                        {item.answer}
                      </p>
                    </details>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white py-14 lg:py-18">
          <div className="mx-auto flex w-[min(900px,calc(100%-2rem))] flex-col items-center text-center">
            <p className="mb-2 text-[0.72rem] font-extrabold uppercase tracking-[0.1em] text-bastly-blue">
              Still unsure?
            </p>
            <h2 className="mb-3 font-heading text-[clamp(2rem,4vw,3.1rem)] font-bold tracking-[-0.05em] text-bastly-navy">
              Ask Bastly directly.
            </h2>
            <p className="mb-6 max-w-[620px] text-sm leading-7 text-muted">
              Course prices, group availability, payment, and
              account-specific questions are best confirmed
              directly with the academy.
            </p>
            <a
              href={bastlyWhatsAppUrl('Hi Bastly Academy 👋\nI need help with a course or my account.')}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[#1fa855] px-5 text-sm font-extrabold text-white no-underline"
            >
              <MessageCircle size={18} />
              WhatsApp Bastly
            </a>
          </div>
        </section>
      </main>
    </>
  );
}
