import { z } from 'zod';

const password = z
  .string()
  .min(8, 'Password must be at least 8 characters.')
  .max(128, 'Password is too long.')
  .regex(/[a-z]/, 'Password must contain a lowercase letter.')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter.')
  .regex(/[0-9]/, 'Password must contain a number.');

const optionalPhone = z
  .string()
  .trim()
  .max(30, 'Phone number is too long.')
  .refine(
    (value) => !value || value.length >= 10,
    'Phone number is too short.',
  );

export const updateAccountProfileSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  phone: optionalPhone,
  school: z.string().trim().min(2).max(160).optional(),
  academicLevel: z.string().trim().min(1).max(100).optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1).max(128),
    newPassword: password,
    confirmPassword: z.string().min(1).max(128),
  })
  .refine(
    (data) => data.newPassword === data.confirmPassword,
    {
      path: ['confirmPassword'],
      message: 'Passwords do not match.',
    },
  );
