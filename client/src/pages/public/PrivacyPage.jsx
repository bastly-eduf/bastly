import PublicPageHero from '../../components/public/PublicPageHero';
import Seo from '../../components/seo/Seo';

const sections = [
  {
    title: 'Information Bastly may collect',
    body: [
      'Account information such as your name, email address, phone number, role, school or level information, and account security records.',
      'Academic information created through the platform, including course enrollment, lesson progress, quiz and homework attempts, attendance, weekly performance, rewards, and linked parent relationships.',
      'Messages or support information you choose to send to Bastly through official channels such as WhatsApp or Instagram.',
      'Technical and security information needed to operate the service, such as request logs, device/browser information, and essential session data.',
    ],
  },
  {
    title: 'How the information is used',
    body: [
      'To create and secure accounts, provide course access, deliver learning features, calculate academic progress, support parent visibility, and operate Bastly rewards.',
      'To communicate important account, enrollment, security, and service information.',
      'To protect Bastly, its students, instructors, parents, and administrators from misuse, fraud, unauthorized access, or technical abuse.',
      'To improve the reliability, usability, and performance of the platform.',
    ],
  },
  {
    title: 'Service providers and external services',
    body: [
      'Bastly may use trusted infrastructure, database, storage, email, security, and hosting providers to operate the platform. Those providers receive only the information needed to perform their services.',
      'Video lessons may be embedded from YouTube. WhatsApp and Instagram links take you to services operated by Meta. Your use of those third-party services is also subject to their own privacy practices.',
      'Bastly does not sell student or parent personal information to advertisers.',
    ],
  },
  {
    title: 'Cookies and sessions',
    body: [
      'Bastly uses an essential secure session cookie to keep signed-in users authenticated. This cookie is required for account functionality and security.',
      'The platform does not need advertising cookies to provide its core learning experience. Embedded or external third-party services may apply their own cookies when you interact with them.',
    ],
  },
  {
    title: 'Students, parents, and account access',
    body: [
      'Student information is visible only to authorized roles that need it for the learning service, such as the student, assigned instructors, the academy administration, and securely linked parent accounts where applicable.',
      'Parent access is based on a verified account relationship and is limited to linked children. A typed email address alone is not treated as proof of a parent relationship.',
      'Where age or local law requires parent or guardian involvement, Bastly may request it before providing certain account or enrollment features.',
    ],
  },
  {
    title: 'Retention and security',
    body: [
      'Bastly keeps information for as long as reasonably needed to provide the service, preserve legitimate academic history, meet legal or operational obligations, and resolve disputes.',
      'Reasonable technical and organizational safeguards are used to protect information, but no online service can guarantee absolute security.',
    ],
  },
  {
    title: 'Your choices and questions',
    body: [
      'You may contact Bastly through its official WhatsApp or Instagram channels to ask about your account information, request corrections, or raise a privacy concern.',
      'Some academic records may need to be retained even after course access ends so that the academy can preserve legitimate learning history and administrative records.',
    ],
  },
];

export default function PrivacyPage() {
  return (
    <>
      <Seo
        title="Privacy Policy | Bastly Academy"
        description="Read how Bastly Academy handles account, academic, parent, security, and service information across the Bastly learning platform."
        canonicalPath="/privacy"
      />

      <main>
        <PublicPageHero
          eyebrow="Legal"
          title="Privacy Policy"
          description="How Bastly handles the information needed to operate accounts, learning, progress, parent access, support, and platform security."
        />

        <article className="bg-white py-14 lg:py-20">
          <div className="mx-auto w-[min(860px,calc(100%-2rem))] lg:w-[min(860px,calc(100%-4rem))]">
            <p className="mb-10 text-sm text-muted">Effective: September 13, 2026</p>

            <div className="grid gap-10">
              {sections.map((section) => (
                <section key={section.title} aria-labelledby={`privacy-${section.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>
                  <h2
                    id={`privacy-${section.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
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
              This policy may be updated as Bastly's services, providers, or legal obligations change. The current version will be published on this page.
            </div>
          </div>
        </article>
      </main>
    </>
  );
}
