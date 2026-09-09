import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { z } from 'zod';

import AuthShell from '../../components/auth/AuthShell';
import FormField from '../../components/auth/FormField';
import Seo from '../../components/seo/Seo';
import { roleHome, useAuth } from '../../context/AuthContext';
import { api, apiErrorMessage, apiFieldErrors } from '../../services/api';

const passwordRule = z
  .string()
  .min(8, 'Use at least 8 characters.')
  .regex(/[a-z]/, 'Add a lowercase letter.')
  .regex(/[A-Z]/, 'Add an uppercase letter.')
  .regex(/[0-9]/, 'Add a number.');

const schema = z
  .object({
    password: passwordRule.optional(),
    confirmPassword: z.string().optional(),
  })
  .refine(
    (values) =>
      (!values.password && !values.confirmPassword) ||
      values.password === values.confirmPassword,
    {
      path: ['confirmPassword'],
      message: 'Passwords do not match.',
    },
  );

export default function InvitationPage({ kind }) {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [invitation, setInvitation] = useState(null);
  const [loadingInvite, setLoadingInvite] = useState(true);
  const [pageError, setPageError] = useState('');
  const [success, setSuccess] = useState('');

  const invitationType = kind === 'doctor' ? 'doctor_invite' : 'parent_invite';

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const { data } = await api.get('/invitations/validate', {
          params: {
            token,
            type: invitationType,
          },
        });

        if (active) {
          setInvitation(data.invitation);
        }
      } catch (error) {
        if (active) {
          setPageError(apiErrorMessage(error, 'This invitation is not available.'));
        }
      } finally {
        if (active) {
          setLoadingInvite(false);
        }
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [token, invitationType]);

  const existingParent =
    kind === 'parent' && invitation?.existingAccount === true;

  const title = useMemo(() => {
    if (kind === 'doctor') return 'Set up your doctor account.';
    if (existingParent) return 'Link this student to your account.';
    return 'Create your parent account.';
  }, [kind, existingParent]);

  const onSubmit = async (values) => {
    setPageError('');

    if (!existingParent && !values.password) {
      setError('password', {
        type: 'manual',
        message: 'Choose a password.',
      });
      return;
    }

    try {
      const endpoint =
        kind === 'doctor'
          ? '/invitations/doctor/accept'
          : '/invitations/parent/accept';

      const { data } = await api.post(endpoint, {
        token,
        ...(!existingParent && {
          password: values.password,
          confirmPassword: values.confirmPassword,
        }),
      });

      if (data.existingAccount) {
        setSuccess(data.message);
        return;
      }

      if (data.user) {
        setUser(data.user);
        navigate(roleHome[data.user.role] || '/', { replace: true });
      }
    } catch (error) {
      const fields = apiFieldErrors(error);

      Object.entries(fields).forEach(([field, message]) => {
        setError(field, { type: 'server', message });
      });

      setPageError(apiErrorMessage(error, 'Unable to accept this invitation.'));
    }
  };

  if (loadingInvite) {
    return (
      <main className="grid min-h-screen place-items-center bg-bastly-blue-pale">
        <div className="size-8 animate-spin rounded-full border-2 border-bastly-blue/20 border-t-bastly-blue" />
      </main>
    );
  }

  if (pageError && !invitation) {
    return (
      <>
        <Seo title="Invitation | Bastly Academy" noIndex />
        <AuthShell
          eyebrow="Bastly invitation"
          title="This link cannot be used."
          description={pageError}
        >
          <Link to="/login" className="font-extrabold text-bastly-blue-dark">
            Go to login
          </Link>
        </AuthShell>
      </>
    );
  }

  return (
    <>
      <Seo title="Bastly Invitation" noIndex />
      <AuthShell
        eyebrow={kind === 'doctor' ? 'Doctor invitation' : 'Parent invitation'}
        title={title}
        description={
          kind === 'doctor'
            ? `This secure invitation is for ${invitation?.fullName || invitation?.email}. Choose your password to activate the account.`
            : existingParent
              ? `${invitation?.studentName || 'This student'} will be linked to your existing Bastly parent account (${invitation?.email}).`
              : `Create the parent account for ${invitation?.fullName || invitation?.email} and connect ${invitation?.studentName || 'the student'} securely.`
        }
      >
        {success ? (
          <div className="grid gap-4">
            <div className="rounded-2xl border border-[#4b9e73]/25 bg-[#eef8f1] px-4 py-4 text-sm font-bold leading-6 text-[#18764a]">
              {success}
            </div>
            <Link
              to="/login"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-bastly-blue px-5 font-extrabold text-white no-underline"
            >
              Log in to Bastly
            </Link>
          </div>
        ) : (
          <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="rounded-2xl border border-line bg-surface px-4 py-3 text-sm">
              <p className="mb-1 font-extrabold text-bastly-navy">{invitation?.email}</p>
              {invitation?.studentName && (
                <p className="mb-0 text-xs text-muted">
                  Linked student: {invitation.studentName}
                </p>
              )}
            </div>

            {!existingParent && (
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  label="Password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  register={register}
                  error={errors.password?.message}
                />
                <FormField
                  label="Confirm password"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  register={register}
                  error={errors.confirmPassword?.message}
                />
              </div>
            )}

            {pageError && (
              <div className="rounded-2xl border border-[#d1605a]/25 bg-[#fff0ef] px-4 py-3 text-sm font-bold text-[#a83d36]">
                {pageError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-bastly-blue px-5 font-extrabold text-white transition hover:bg-bastly-blue-dark disabled:opacity-60"
            >
              {isSubmitting
                ? 'Working…'
                : existingParent
                  ? 'Link student to my account'
                  : 'Activate account'}
            </button>
          </form>
        )}
      </AuthShell>
    </>
  );
}
