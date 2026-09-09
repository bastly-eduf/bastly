import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';

import AuthShell from '../../components/auth/AuthShell';
import FormField from '../../components/auth/FormField';
import Seo from '../../components/seo/Seo';
import { roleHome, useAuth } from '../../context/AuthContext';
import { api, apiErrorMessage, apiFieldErrors } from '../../services/api';

const schema = z.object({
  email: z.string().trim().email('Enter a valid email address.'),
  password: z.string().min(1, 'Enter your password.'),
});

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values) => {
    setServerError('');

    try {
      const { data } = await api.post('/auth/login', values);
      setUser(data.user);

      const intendedPath = location.state?.from;
      const defaultPath = roleHome[data.user?.role] || '/';

      navigate(intendedPath || defaultPath, { replace: true });
    } catch (error) {
      const fields = apiFieldErrors(error);

      Object.entries(fields).forEach(([field, message]) => {
        setError(field, { type: 'server', message });
      });

      setServerError(apiErrorMessage(error, 'Unable to log in.'));
    }
  };

  return (
    <>
      <Seo title="Log In | Bastly Academy" noIndex />
      <AuthShell
        eyebrow="Welcome back"
        title="Log in to Bastly."
        description="Open your courses, performance, quizzes, homework, and everything waiting for you."
        footer={
          <p className="mb-0">
            New to Bastly?{' '}
            <Link to="/register" className="font-extrabold text-bastly-blue-dark">
              Create a student account
            </Link>
          </p>
        }
      >
        <form className="grid gap-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <FormField
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            register={register}
            error={errors.email?.message}
          />

          <FormField
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="Your password"
            register={register}
            error={errors.password?.message}
          />

          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-xs font-extrabold text-bastly-blue-dark"
            >
              Forgot password?
            </Link>
          </div>

          {serverError && (
            <div className="rounded-2xl border border-[#d1605a]/25 bg-[#fff0ef] px-4 py-3 text-sm font-bold text-[#a83d36]">
              {serverError}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-1 inline-flex min-h-12 items-center justify-center rounded-full bg-bastly-blue px-5 font-extrabold text-white transition hover:bg-bastly-blue-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Logging in…' : 'Log in'}
          </button>
        </form>
      </AuthShell>
    </>
  );
}
