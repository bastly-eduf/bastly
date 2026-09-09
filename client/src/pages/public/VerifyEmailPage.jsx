import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';

import AuthShell from '../../components/auth/AuthShell';
import Seo from '../../components/seo/Seo';
import { useAuth } from '../../context/AuthContext';
import { api, apiErrorMessage } from '../../services/api';

export default function VerifyEmailPage() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [status, setStatus] = useState('Verifying your email…');
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;

    async function verify() {
      try {
        const { data } = await api.post('/account/verify-email', { token });

        if (!active) return;

        setUser(data.user);
        setStatus('Email verified. Taking you to Bastly…');

        setTimeout(() => {
          navigate('/student', { replace: true });
        }, 650);
      } catch (error) {
        if (!active) return;
        setFailed(true);
        setStatus(apiErrorMessage(error, 'This verification link cannot be used.'));
      }
    }

    verify();

    return () => {
      active = false;
    };
  }, [token, navigate, setUser]);

  return (
    <>
      <Seo title="Verify Email | Bastly Academy" noIndex />
      <AuthShell
        eyebrow="Email verification"
        title={failed ? 'We could not verify this link.' : 'Securing your account.'}
        description={status}
      >
        {failed && (
          <Link to="/login" className="font-extrabold text-bastly-blue-dark">
            Go to login
          </Link>
        )}
      </AuthShell>
    </>
  );
}
