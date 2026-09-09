import { Link } from 'react-router-dom';

export default function FinalCta() {
  return (
    <section className="bg-white px-4 py-8 sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-[1200px] overflow-hidden rounded-[32px] bg-[radial-gradient(circle_at_80%_20%,rgba(35,127,209,0.34),transparent_28%)] bg-bastly-navy px-6 py-14 text-center text-white sm:px-10 lg:py-20">
        <div className="pointer-events-none absolute -left-24 -top-24 size-64 rounded-full border border-white/5" />
        <div className="pointer-events-none absolute -bottom-28 -right-20 size-72 rounded-full border border-white/5" />

        <div className="relative z-10 mx-auto max-w-[820px]">
          <p className="mb-3 text-[0.78rem] font-extrabold uppercase tracking-[0.12em] text-[#82c8ff]">
            Ready when you are
          </p>
          <h2 className="mb-5 font-heading text-[clamp(2.5rem,6vw,5.2rem)] leading-[1.02] font-bold tracking-[-0.06em] text-white">
            Your next course starts here.
          </h2>
          <p className="mx-auto mb-8 max-w-[620px] text-base leading-7 text-white/70">
            Find your instructor, choose your level, and let Bastly keep the learning
            organised from your first lesson to your next Star.
          </p>

          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/courses"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-bastly-blue px-5 font-extrabold text-white no-underline transition hover:-translate-y-0.5 hover:bg-[#3290e5]"
            >
              Explore Courses <span aria-hidden="true">→</span>
            </Link>
            <Link
              to="/register"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/20 bg-white/8 px-5 font-extrabold text-white no-underline backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white/12"
            >
              Create your account
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
