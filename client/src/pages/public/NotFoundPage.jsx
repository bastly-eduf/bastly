import { Link } from 'react-router-dom';
import Seo from '../../components/seo/Seo';

export default function NotFoundPage() {
  return (
    <>
      <Seo title="Page Not Found | Bastly Academy" noIndex />
      <main className="placeholder-page">
        <div className="container">
          <p className="eyebrow">404</p>
          <h1>That page isn’t here.</h1>
          <p>Head back to Bastly and keep going.</p>
          <Link className="button button--primary" to="/">
            Back home
          </Link>
        </div>
      </main>
    </>
  );
}
