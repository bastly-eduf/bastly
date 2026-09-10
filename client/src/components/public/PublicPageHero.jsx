export default function PublicPageHero({
  eyebrow,
  title,
  description,
  aside,
}) {
  return (
    <section className="relative overflow-hidden bg-[#061f49] pb-14 pt-[calc(var(--header-height)+3.5rem)] text-white sm:pb-18 lg:pt-[calc(var(--header-height)+5rem)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_22%,rgba(35,127,209,0.36),transparent_32%),radial-gradient(circle_at_12%_85%,rgba(130,200,255,0.12),transparent_28%)]" />

      <div className="relative mx-auto grid w-[min(1200px,calc(100%-2rem))] gap-8 lg:w-[min(1200px,calc(100%-4rem))] lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="mb-3 text-[0.75rem] font-extrabold uppercase tracking-[0.12em] text-[#82c8ff]">
            {eyebrow}
          </p>
          <h1 className="mb-4 max-w-[850px] font-heading text-[clamp(2.8rem,7vw,5.6rem)] font-bold leading-[0.98] tracking-[-0.065em]">
            {title}
          </h1>
          <p className="mb-0 max-w-[720px] text-sm leading-7 text-white/65 sm:text-base">
            {description}
          </p>
        </div>

        {aside}
      </div>
    </section>
  );
}
