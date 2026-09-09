import { Link, useLocation } from 'react-router-dom';

import AuthShell from '../../components/auth/AuthShell';
import Seo from '../../components/seo/Seo';

export default function CheckEmailPage() {
  const location = useLocation();

  return (
    <>
      <Seo title="Check Your Email | Bastly Academy" noIndex />
      <AuthShell
        eyebrow="Check your inbox"
        title="Your secure link is on the way."
        description={
          location.state?.message ||
          'Open the Bastly email we sent and follow its secure link.'
        }
      >
        <Link to="/login" className="font-extrabold text-bastly-blue-dark">
          Back to login
        </Link>
      </AuthShell>
    </>
  );
}
