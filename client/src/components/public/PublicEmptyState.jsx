export default function PublicEmptyState({
  title,
  description,
}) {
  return (
    <div className="rounded-[26px] border border-line bg-white px-5 py-12 text-center shadow-soft">
      <p className="mb-2 font-heading text-xl font-bold text-bastly-navy">
        {title}
      </p>
      <p className="mx-auto mb-0 max-w-[560px] text-sm leading-6 text-muted">
        {description}
      </p>
    </div>
  );
}
