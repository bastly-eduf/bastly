import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
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
    fullName: z.string().trim().min(2, 'Enter your full name.'),
    email: z.string().trim().email('Enter a valid email address.'),
    phone: z.string().trim().min(10, 'Enter a valid phone number.'),
    school: z.string().trim().min(2, 'Enter your school.'),
    academicLevel: z.string().trim().min(1, 'Enter your current level.'),
    password: passwordRule,
    confirmPassword: z.string(),
    parentName: z.string().trim().min(2, 'Enter your parent/guardian name.'),
    parentEmail: z.string().trim().email('Enter a valid parent email address.'),
    parentPhone: z.string().trim().min(10, 'Enter a valid parent phone number.'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match.',
  })
  .refine((values) => values.email !== values.parentEmail, {
    path: ['parentEmail'],
    message: 'Use a different email for the parent/guardian.',
  });

export default function RegisterPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      school: '',
      academicLevel: '',
      password: '',
      confirmPassword: '',
      parentName: '',
      parentEmail: '',
      parentPhone: '',
    },
  });

  const onSubmit = async (values) => {
    setServerError('');

    try {
      await api.post('/auth/register/student', values);
      navigate('/student');
    } catch (error) {
      const fields = apiFieldErrors(error);

      Object.entries(fields).forEach(([field, message]) => {
        setError(field, { type: 'server', message });
      });

      setServerError(apiErrorMessage(error, 'Unable to create your account.'));
    }
  };

  return (
    <>
      <Seo title="Create Student Account | Bastly Academy" noIndex />
      <AuthShell
        eyebrow="Student registration"
        title="Create your Bastly account."
        description="We only ask for the information Bastly needs to identify your academic level and securely connect your parent or guardian."
        footer={
          <p className="mb-0">
            Already registered?{' '}
            <Link to="/login" className="font-extrabold text-bastly-blue-dark">
              Log in
            </Link>
          </p>
        }
      >
        <form className="grid gap-6" onSubmit={handleSubmit(onSubmit)} noValidate>
          <fieldset className="grid gap-4">
            <legend className="mb-3 font-heading text-lg font-bold text-bastly-navy">
              Your information
            </legend>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Full name" name="fullName" autoComplete="name" register={register} error={errors.fullName?.message} />
              <FormField label="Phone / WhatsApp" name="phone" type="tel" autoComplete="tel" register={register} error={errors.phone?.message} />
            </div>

            <FormField label="Email" name="email" type="email" autoComplete="email" register={register} error={errors.email?.message} />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="School" name="school" register={register} error={errors.school?.message} />
              <FormField label="Current grade / level" name="academicLevel" placeholder="e.g. Year 10 / O Level" register={register} error={errors.academicLevel?.message} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Password" name="password" type="password" autoComplete="new-password" register={register} error={errors.password?.message} />
              <FormField label="Confirm password" name="confirmPassword" type="password" autoComplete="new-password" register={register} error={errors.confirmPassword?.message} />
            </div>
          </fieldset>

          <fieldset className="grid gap-4 border-t border-line pt-6">
            <legend className="mb-3 font-heading text-lg font-bold text-bastly-navy">
              Parent / guardian
            </legend>

            <FormField label="Parent / guardian full name" name="parentName" autoComplete="off" register={register} error={errors.parentName?.message} />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Parent email" name="parentEmail" type="email" autoComplete="off" register={register} error={errors.parentEmail?.message} />
              <FormField label="Parent phone" name="parentPhone" type="tel" autoComplete="off" register={register} error={errors.parentPhone?.message} />
            </div>

            <p className="mb-0 rounded-2xl bg-bastly-blue-pale px-4 py-3 text-xs leading-6 text-muted">
              Bastly will use this information to create a secure parent relationship.
              The actual invitation email is added in the dedicated email step.
            </p>
          </fieldset>

          {serverError && (
            <div className="rounded-2xl border border-[#d1605a]/25 bg-[#fff0ef] px-4 py-3 text-sm font-bold text-[#a83d36]">
              {serverError}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-bastly-blue px-5 font-extrabold text-white transition hover:bg-bastly-blue-dark disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Creating account…' : 'Create student account'}
          </button>
        </form>
      </AuthShell>
    </>
  );
}
