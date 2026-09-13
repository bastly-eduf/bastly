import { Link } from 'react-router-dom';

export default function Hero() {
  return (
    <section
      className="relative isolate flex min-h-svh overflow-hidden bg-bastly-navy text-white"
      aria-labelledby="hero-title"
    >
      <picture className="absolute inset-0 -z-30 size-full" aria-hidden="true">
        <source media="(max-width: 767px)" srcSet="/media/hero-mobile.webp" />
        <img
          src="/media/hero-desktop.webp"
          alt=""
          width="1672"
          height="941"
          fetchPriority="high"
          decoding="async"
          className="size-full object-cover object-center"
        />
      </picture>

      <div
        className="absolute inset-0 -z-20 bg-[linear-gradient(90deg,rgba(2,15,37,0.66)_0%,rgba(4,26,61,0.39)_30%,rgba(4,26,61,0.28)_62%,rgba(2,15,37,0.46)_100%),linear-gradient(180deg,rgba(1,10,26,0.42)_0%,rgba(1,10,26,0.04)_40%,rgba(1,10,26,0.34)_100%)] max-md:bg-[linear-gradient(180deg,rgba(2,15,37,0.58)_0%,rgba(2,15,37,0.24)_42%,rgba(2,15,37,0.48)_100%),linear-gradient(90deg,rgba(2,15,37,0.32)_0%,rgba(4,26,61,0.08)_65%,rgba(2,15,37,0.26)_100%)]"
        aria-hidden="true"
      />

      <div className="mx-auto flex min-h-svh w-[min(1200px,calc(100%-2rem))] items-start pt-[clamp(11.5rem,24svh,14.25rem)] pb-32 md:w-[min(1200px,calc(100%-4rem))] md:items-center md:pt-[calc(var(--header-height)+2.5rem)] md:pb-20">
        <div className="hero-enter w-full max-w-[650px] md:ml-[12vw] md:w-[70vw] lg:ml-[20vw] lg:w-[62vw] xl:ml-[25vw] xl:w-[55vw]">
          <h1
            id="hero-title"
            className="mb-6 font-heading text-[clamp(3rem,13vw,4.4rem)] leading-[0.98] font-bold tracking-[-0.06em] text-white text-shadow-lg md:mb-7 md:text-[clamp(3.2rem,6.6vw,5.2rem)] md:leading-[1.08] xl:text-[clamp(3.5rem,6vw,6.4rem)]"
          >
            <span className="block">Study smarter.</span>
            <span className="block text-[#71bfff]">Aim higher.</span>
          </h1>

          <p className="mb-8 max-w-[610px] text-base leading-[1.72] text-white/85 md:mb-9 md:text-[clamp(1rem,1.45vw,1.18rem)] md:leading-[1.82]">
            Learn with expert instructors, tackle quizzes and homework, track your
            progress, and unlock Bastly rewards — all in one place.
          </p>

          <div className="grid gap-4 min-[521px]:flex min-[521px]:flex-wrap">
            <Link
              to="/courses"
              className="inline-flex min-h-[52px] items-center justify-center gap-3 rounded-full bg-bastly-blue px-5 font-extrabold text-white no-underline shadow-[0_12px_34px_rgba(35,127,209,0.28)] transition hover:-translate-y-0.5 hover:bg-bastly-blue-dark hover:shadow-[0_15px_38px_rgba(35,127,209,0.34)]"
            >
              Explore Courses <span aria-hidden="true">→</span>
            </Link>

            <Link
              to="/doctors"
              className="inline-flex min-h-[52px] items-center justify-center rounded-full border border-white/35 bg-[#03142f]/20 px-5 font-extrabold text-white no-underline backdrop-blur-md transition hover:-translate-y-0.5 hover:border-white/60 hover:bg-white/10"
            >
              Meet Our Doctors
            </Link>
          </div>

          <p className="mt-5 mb-0 text-sm text-white/65">
            Already studying with Bastly?{' '}
            <Link
              to="/login"
              className="font-extrabold text-white underline decoration-white/50 underline-offset-4"
            >
              Log in
            </Link>
          </p>
        </div>
      </div>

      <a
        href="#homepage-content"
        aria-label="Explore Bastly"
        className="absolute right-4 bottom-6 hidden items-center gap-3 text-[0.76rem] font-bold uppercase tracking-[0.1em] text-white/70 no-underline md:flex lg:right-8"
      >
        
      </a>
    </section>
  );
}
