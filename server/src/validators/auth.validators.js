import { z } from 'zod';

const egyptPhone = z
  .string()
  .trim()
  .min(10, 'Phone number is too short.')
  .max(30, 'Phone number is too long.');

const password = z
  .string()
  .min(8, 'Password must be at least 8 characters.')
  .max(128, 'Password is too long.')
  .regex(/[a-z]/, 'Password must contain a lowercase letter.')
  .regex(/[A-Z]/, 'Password must contain an uppercase letter.')
  .regex(/[0-9]/, 'Password must contain a number.');

export const studentRegistrationSchema = z
  .object({
    fullName: z.string().trim().min(2).max(120),
    email: z.string().trim().toLowerCase().email(),
    phone: egyptPhone,
    password,
    confirmPassword: z.string(),
    school: z.string().trim().min(2).max(160),
    academicLevel: z.string().trim().min(1).max(100),
    parentName: z.string().trim().min(2).max(120),
    parentEmail: z.string().trim().toLowerCase().email(),
    parentPhone: egyptPhone,
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match.',
  })
  .refine((data) => data.email !== data.parentEmail, {
    path: ['parentEmail'],
    message: 'Parent email must be different from the student email.',
  });

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(128),
});
