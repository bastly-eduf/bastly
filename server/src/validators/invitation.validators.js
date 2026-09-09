import { z } from 'zod';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ID.');

const strongPassword = z
  .string()
  .min(8, 'Password must be at least 8 characters.')
  .max(128, 'Password is too long.')
  .regex(/[a-z]/, 'Password must contain a lowercase letter.')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter.')
  .regex(/[0-9]/, 'Password must contain a number.');

export const createDoctorInviteSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email(),
  phone: z.string().trim().max(30).optional().default(''),
  doctorProfileId: objectId.optional(),
});

export const acceptInviteSchema = z
  .object({
    token: z.string().min(20),
    password: strongPassword.optional(),
    confirmPassword: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.password !== undefined || data.confirmPassword !== undefined) {
      if (!data.password) {
        ctx.addIssue({
          code: 'custom',
          path: ['password'],
          message: 'Enter a password.',
        });
      }

      if (data.password !== data.confirmPassword) {
        ctx.addIssue({
          code: 'custom',
          path: ['confirmPassword'],
          message: 'Passwords do not match.',
        });
      }
    }
  });

export const forgotPasswordSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().min(20),
    password: strongPassword,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match.',
  });

export const tokenSchema = z.object({
  token: z.string().min(20),
});
