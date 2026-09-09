import { Link } from 'react-router-dom';

export default function AuthShell({ eyebrow, title, description, children, footer }) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_85%_10%,rgba(35,127,209,0.12),transparent_25%)] bg-bastly-blue-pale px-4 pb-12 pt-[calc(var(--header-height)+3rem)] sm:px-6 lg:pt-[calc(var(--header-height)+4rem)]">
      <div className="mx-auto grid max-w-[1080px] overflow-hidden rounded-[30px] border border-bastly-navy/10 bg-white shadow-card lg:grid-cols-[0.86fr_1.14fr]">
        <aside className="relative hidden min-h-[680px] overflow-hidden bg-bastly-navy p-10 text-white lg:flex lg:flex-col">
          <div className="absolute -right-24 -top-24 size-72 rounded-full border border-white/5" />
          <div className="absolute -bottom-20 -left-20 size-60 rounded-full bg-bastly-blue/15 blur-3xl" />

          <Link to="/" className="relative z-10 inline-flex w-fit">
            <span className="grid size-16 place-items-center overflow-hidden rounded-2xl bg-white">
              <img src="/brand/bastly-logo.webp" alt="Bastly Academy" className="size-full object-contain" />
            </span>
          </Link>

          <div className="relative z-10 mt-auto max-w-[390px]">
            <p className="mb-3 text-[0.75rem] font-extrabold uppercase tracking-[0.12em] text-[#82c8ff]">
              Bastly Academy
            </p>
            <h2 className="mb-4 font-heading text-4xl font-bold tracking-[-0.05em]">
              Learn. Practice. Progress.
            </h2>
            <p className="mb-0 text-sm leading-7 text-white/65">
              Your courses, quizzes, homework, attendance, performance, and rewards in
              one secure account.
            </p>
          </div>
        </aside>

        <section className="px-5 py-8 sm:px-10 sm:py-10 lg:px-12 lg:py-12">
          <Link to="/" className="mb-8 inline-flex lg:hidden">
            <span className="grid size-14 place-items-center overflow-hidden rounded-2xl bg-white shadow-soft">
              <img src="/brand/bastly-logo.webp" alt="Bastly Academy" className="size-full object-contain" />
            </span>
          </Link>

          <p className="mb-2 text-[0.72rem] font-extrabold uppercase tracking-[0.1em] text-bastly-blue">
            {eyebrow}
          </p>
          <h1 className="mb-3 font-heading text-[clamp(2rem,5vw,3.2rem)] leading-[1.05] font-bold tracking-[-0.05em] text-bastly-navy">
            {title}
          </h1>
          <p className="mb-7 max-w-[560px] text-sm leading-7 text-muted">{description}</p>

          {children}

          {footer && <div className="mt-7 border-t border-line pt-5 text-sm text-muted">{footer}</div>}
        </section>
      </div>
    </main>
  );
}
