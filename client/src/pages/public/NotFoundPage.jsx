import { Link } from 'react-router-dom';
import Seo from '../../components/seo/Seo';

export default function NotFoundPage() {
  return (
    <>
      <Seo title="Page Not Found | Bastly Academy" noIndex />
      <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_70%_20%,rgba(35,127,209,0.15),transparent_35%)] bg-gradient-to-b from-white to-bastly-blue-pale px-4 py-20">
        <div className="w-full max-w-[760px]">
          <p className="mb-3 text-[0.78rem] font-extrabold uppercase tracking-[0.12em] text-bastly-blue">404</p>
          <h1 className="mb-4 font-heading text-[clamp(2.6rem,8vw,5.6rem)] leading-[1.08] font-bold tracking-[-0.045em] text-bastly-navy">
            That page isn’t here.
          </h1>
          <p className="mb-6 max-w-[650px] text-[clamp(1rem,2vw,1.2rem)] leading-8 text-muted">
            Head back to Bastly and keep going.
          </p>
          <Link
            to="/"
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-bastly-blue px-5 font-extrabold text-white no-underline transition hover:-translate-y-0.5 hover:bg-bastly-blue-dark"
          >
            Back home
          </Link>
        </div>
      </main>
    </>
  );
}
