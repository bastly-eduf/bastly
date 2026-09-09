import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { z } from 'zod';

import AuthShell from '../../components/auth/AuthShell';
import FormField from '../../components/auth/FormField';
import Seo from '../../components/seo/Seo';
import { api, apiErrorMessage } from '../../services/api';

const schema = z.object({
  email: z.string().trim().email('Enter a valid email address.'),
});

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState('');
  const [pageError, setPageError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (values) => {
    setPageError('');
    setMessage('');

    try {
      const { data } = await api.post('/account/forgot-password', values);
      setMessage(data.message);
    } catch (error) {
      setPageError(apiErrorMessage(error, 'Unable to process this request.'));
    }
  };

  return (
    <>
      <Seo title="Forgot Password | Bastly Academy" noIndex />
      <AuthShell
        eyebrow="Account recovery"
        title="Reset your password."
        description="Enter your Bastly account email. If an active account exists, we will send a secure reset link."
        footer={
          <Link to="/login" className="font-extrabold text-bastly-blue-dark">
            Back to login
          </Link>
        }
      >
        <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormField
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            register={register}
            error={errors.email?.message}
          />

          {message && (
            <div className="rounded-2xl border border-[#4b9e73]/25 bg-[#eef8f1] px-4 py-3 text-sm font-bold leading-6 text-[#18764a]">
              {message}
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
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-bastly-blue px-5 font-extrabold text-white disabled:opacity-60"
          >
            {isSubmitting ? 'Sending…' : 'Send reset link'}
          </button>
        </form>
      </AuthShell>
    </>
  );
}
