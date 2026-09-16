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

const doctorSchema = z
  .object({
    password: passwordRule,
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match.',
  });

const parentSchema = z
  .object({
    fullName: z.string().trim().min(2, 'Enter your full name.'),
    email: z.string().trim().email('Enter a valid email address.'),
    phone: z.string().trim().min(10, 'Enter a valid phone number.'),
    password: passwordRule,
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match.',
  });

async function loadInvitation(token, type) {
  const { data } = await api.get('/invitations/validate', {
    params: { token, type },
  });

  return data.invitation;
}

export default function InvitationPage({ kind }) {
  if (kind === 'parent') {
    return <ParentInvitationPage />;
  }

  return <DoctorInvitationPage />;
}

function DoctorInvitationPage() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [invitation, setInvitation] = useState(null);
  const [loadingInvite, setLoadingInvite] = useState(true);
  const [pageError, setPageError] = useState('');

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(doctorSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    let active = true;

    loadInvitation(token, 'doctor_invite')
      .then((nextInvitation) => {
        if (active) setInvitation(nextInvitation);
      })
      .catch((error) => {
        if (active) {
          setPageError(
            apiErrorMessage(error, 'This invitation is not available.'),
          );
        }
      })
      .finally(() => {
        if (active) setLoadingInvite(false);
      });

    return () => {
      active = false;
    };
  }, [token]);

  const onSubmit = async (values) => {
    setPageError('');

    try {
      const { data } = await api.post('/invitations/doctor/accept', {
        token,
        password: values.password,
        confirmPassword: values.confirmPassword,
      });

      if (data.user) {
        setUser(data.user);
        navigate(roleHome[data.user.role] || '/', { replace: true });
      }
    } catch (error) {
      const fields = apiFieldErrors(error);

      Object.entries(fields).forEach(([field, message]) => {
        setError(field, { type: 'server', message });
      });

      setPageError(
        apiErrorMessage(error, 'Unable to accept this invitation.'),
      );
    }
  };

  if (loadingInvite) return <InvitationLoading />;
  if (pageError && !invitation) {
    return <UnavailableInvitation message={pageError} />;
  }

  return (
    <>
      <Seo title="Doctor Invitation | Bastly Academy" noIndex />
      <AuthShell
        eyebrow="Doctor invitation"
        title="Set up your doctor account."
        description={`This secure invitation is for ${
          invitation?.fullName || invitation?.email
        }. Choose your password to activate the account.`}
      >
        <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="rounded-2xl border border-line bg-surface px-4 py-3 text-sm">
            <p className="mb-0 font-extrabold text-bastly-navy">
              {invitation?.email}
            </p>
          </div>

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

          {pageError && <FormError message={pageError} />}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-bastly-blue px-5 font-extrabold text-white transition hover:bg-bastly-blue-dark disabled:opacity-60"
          >
            {isSubmitting ? 'Working…' : 'Activate account'}
          </button>
        </form>
      </AuthShell>
    </>
  );
}

function ParentInvitationPage() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [invitation, setInvitation] = useState(null);
  const [loadingInvite, setLoadingInvite] = useState(true);
  const [pageError, setPageError] = useState('');

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(parentSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    let active = true;

    loadInvitation(token, 'parent_invite')
      .then((nextInvitation) => {
        if (!active) return;

        setInvitation(nextInvitation);
        reset({
          fullName: nextInvitation.fullName || '',
          email: nextInvitation.email || '',
          phone: nextInvitation.phone || '',
          password: '',
          confirmPassword: '',
        });
      })
      .catch((error) => {
        if (active) {
          setPageError(
            apiErrorMessage(error, 'This invitation is not available.'),
          );
        }
      })
      .finally(() => {
        if (active) setLoadingInvite(false);
      });

    return () => {
      active = false;
    };
  }, [reset, token]);

  const title = useMemo(
    () =>
      invitation?.studentName
        ? `Connect with ${invitation.studentName}.`
        : 'Connect your parent account.',
    [invitation?.studentName],
  );

  const onSubmit = async (values) => {
    setPageError('');

    try {
      const { data } = await api.post('/invitations/parent/accept', {
        token,
        ...values,
      });

      if (data.emailVerificationRequired) {
        navigate('/check-email', {
          replace: true,
          state: {
            message:
              'Check your email and verify your Bastly Parent account to continue.',
          },
        });
        return;
      }

      if (data.user) {
        setUser(data.user);
        navigate('/parent', { replace: true });
      }
    } catch (error) {
      const fields = apiFieldErrors(error);

      Object.entries(fields).forEach(([field, message]) => {
        setError(field, { type: 'server', message });
      });

      setPageError(
        apiErrorMessage(error, 'Unable to link this parent account.'),
      );
    }
  };

  if (loadingInvite) return <InvitationLoading />;
  if (pageError && !invitation) {
    return <UnavailableInvitation message={pageError} />;
  }

  return (
    <>
      <Seo title="Parent Invitation | Bastly Academy" noIndex />
      <AuthShell
        eyebrow="Parent invitation"
        title={title}
        description="Enter your own details below. If you already have a Bastly Parent account, use the same email and your current password; Bastly will securely link this student instead of creating a duplicate account."
      >
        <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          {invitation?.studentName && (
            <div className="rounded-2xl border border-line bg-bastly-blue-pale px-4 py-3 text-sm">
              <p className="mb-1 text-[0.68rem] font-extrabold uppercase tracking-[0.08em] text-bastly-blue">
                Student requesting access
              </p>
              <p className="mb-0 font-heading font-bold text-bastly-navy">
                {invitation.studentName}
              </p>
            </div>
          )}

          <FormField
            label="Your full name"
            name="fullName"
            autoComplete="name"
            register={register}
            error={errors.fullName?.message}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Your email"
              name="email"
              type="email"
              autoComplete="email"
              register={register}
              error={errors.email?.message}
              readOnly={Boolean(invitation?.email && !invitation?.selfService)}
            />
            <FormField
              label="Your phone / WhatsApp"
              name="phone"
              type="tel"
              autoComplete="tel"
              register={register}
              error={errors.phone?.message}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Password"
              name="password"
              type="password"
              autoComplete={invitation?.selfService ? 'current-password' : 'new-password'}
              register={register}
              error={errors.password?.message}
            />
            <FormField
              label="Confirm password"
              name="confirmPassword"
              type="password"
              autoComplete="off"
              register={register}
              error={errors.confirmPassword?.message}
            />
          </div>

          <p className="mb-0 rounded-2xl bg-surface px-4 py-3 text-xs leading-6 text-muted">
            New to Bastly? This password creates your Parent account. Already have a Parent account? Enter your current password so Bastly can verify it is really you before linking the student.
          </p>

          {pageError && <FormError message={pageError} />}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-bastly-blue px-5 font-extrabold text-white transition hover:bg-bastly-blue-dark disabled:opacity-60"
          >
            {isSubmitting ? 'Connecting…' : 'Connect parent account'}
          </button>
        </form>
      </AuthShell>
    </>
  );
}

function InvitationLoading() {
  return (
    <main className="grid min-h-screen place-items-center bg-bastly-blue-pale">
      <div className="size-8 animate-spin rounded-full border-2 border-bastly-blue/20 border-t-bastly-blue" />
    </main>
  );
}

function UnavailableInvitation({ message }) {
  return (
    <>
      <Seo title="Invitation | Bastly Academy" noIndex />
      <AuthShell
        eyebrow="Bastly invitation"
        title="This link cannot be used."
        description={message}
      >
        <Link to="/login" className="font-extrabold text-bastly-blue-dark">
          Go to login
        </Link>
      </AuthShell>
    </>
  );
}

function FormError({ message }) {
  return (
    <div className="rounded-2xl border border-[#d1605a]/25 bg-[#fff0ef] px-4 py-3 text-sm font-bold text-[#a83d36]">
      {message}
    </div>
  );
}
