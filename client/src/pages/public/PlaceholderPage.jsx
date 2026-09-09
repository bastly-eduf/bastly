import Seo from '../../components/seo/Seo';

export default function PlaceholderPage({ title, noIndex = false }) {
  return (
    <>
      <Seo
        title={`${title} | Bastly Academy`}
        description={`${title} at Bastly Academy.`}
        noIndex={noIndex}
      />

      <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_70%_20%,rgba(35,127,209,0.15),transparent_35%)] bg-gradient-to-b from-white to-bastly-blue-pale px-4 pt-[calc(var(--header-height)+5rem)] pb-20">
        <div className="w-full max-w-[760px]">
          <p className="mb-3 text-[0.78rem] font-extrabold uppercase tracking-[0.12em] text-bastly-blue">
            Bastly Academy
          </p>
          <h1 className="mb-4 font-heading text-[clamp(2.6rem,8vw,5.6rem)] leading-[1.08] font-bold tracking-[-0.045em] text-bastly-navy">
            {title}
          </h1>
          <p className="max-w-[650px] text-[clamp(1rem,2vw,1.2rem)] leading-8 text-muted">
            This route is reserved and will be built in its dedicated project step.
          </p>
        </div>
      </main>
    </>
  );
}
