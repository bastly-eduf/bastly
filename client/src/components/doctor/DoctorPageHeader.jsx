export default function DoctorPageHeader({
  eyebrow = 'Bastly Doctor',
  title,
  description,
  action,
}) {
  return (
    <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="mb-2 text-[0.72rem] font-extrabold uppercase tracking-[0.1em] text-bastly-blue">
          {eyebrow}
        </p>
        <h1 className="mb-2 font-heading text-[clamp(2rem,5vw,3.3rem)] font-bold tracking-[-0.055em] text-bastly-navy">
          {title}
        </h1>
        {description && (
          <p className="mb-0 max-w-[760px] text-sm leading-6 text-muted">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
