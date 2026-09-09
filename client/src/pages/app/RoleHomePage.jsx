import { Link } from 'react-router-dom';

export default function RoleHomePage({ role }) {
  return (
    <main className="grid min-h-screen place-items-center bg-bastly-blue-pale px-4 py-20">
      <div className="w-full max-w-[720px] rounded-[30px] border border-bastly-navy/10 bg-white p-8 text-center shadow-card sm:p-12">
        <img
          src="/brand/bastly-logo.webp"
          alt="Bastly Academy"
          className="mx-auto mb-6 size-20 rounded-2xl object-contain shadow-soft"
        />
        <p className="mb-2 text-[0.72rem] font-extrabold uppercase tracking-[0.1em] text-bastly-blue">
          {role} area
        </p>
        <h1 className="mb-4 font-heading text-4xl font-bold tracking-[-0.05em] text-bastly-navy">
          Authentication route ready.
        </h1>
        <p className="mx-auto mb-6 max-w-[560px] leading-7 text-muted">
          This is a temporary protected-area destination. The actual {role.toLowerCase()}
          dashboard is built in its dedicated step.
        </p>
        <Link to="/" className="font-extrabold text-bastly-blue-dark">
          Back to homepage
        </Link>
      </div>
    </main>
  );
}
