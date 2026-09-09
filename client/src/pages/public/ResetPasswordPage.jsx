import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useSearchParams } from 'react-router-dom';
import { z } from 'zod';

import AuthShell from '../../components/auth/AuthShell';
import FormField from '../../components/auth/FormField';
import Seo from '../../components/seo/Seo';
import { api, apiErrorMessage, apiFieldErrors } from '../../services/api';

const passwordRule = z
  .string()
  .min(8, 'Use at least 8 characters.')
  .regex(/[a-z]/, 'Add a lowercase letter.')
  .regex(/[A-Z]/, 'Add an uppercase letter.')
  .regex(/[0-9]/, 'Add a number.');

const schema = z
  .object({
    password: passwordRule,
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match.',
  });

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [message, setMessage] = useState('');
  const [pageError, setPageError] = useState('');

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

  const onSubmit = async (values) => {
    setPageError('');

    try {
      const { data } = await api.post('/account/reset-password', {
        token,
        ...values,
      });

      setMessage(data.message);
    } catch (error) {
      Object.entries(apiFieldErrors(error)).forEach(([field, value]) => {
        setError(field, { type: 'server', message: value });
      });
      setPageError(apiErrorMessage(error, 'Unable to reset your password.'));
    }
  };

  return (
    <>
      <Seo title="Reset Password | Bastly Academy" noIndex />
      <AuthShell
        eyebrow="Account recovery"
        title="Choose a new password."
        description="Once changed, old Bastly sessions are invalidated automatically."
      >
        {message ? (
          <div className="grid gap-4">
            <div className="rounded-2xl border border-[#4b9e73]/25 bg-[#eef8f1] px-4 py-3 text-sm font-bold leading-6 text-[#18764a]">
              {message}
            </div>
            <Link
              to="/login"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-bastly-blue px-5 font-extrabold text-white no-underline"
            >
              Log in
            </Link>
          </div>
        ) : (
          <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                label="New password"
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

            {pageError && (
              <div className="rounded-2xl border border-[#d1605a]/25 bg-[#fff0ef] px-4 py-3 text-sm font-bold text-[#a83d36]">
                {pageError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-bastly-blue px-5 font-extrabold text-white disabled:opacity-60"
            >
              {isSubmitting ? 'Updating…' : 'Update password'}
            </button>
          </form>
        )}
      </AuthShell>
    </>
  );
}
