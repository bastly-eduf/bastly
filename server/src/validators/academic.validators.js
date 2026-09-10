import { z } from 'zod';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ID.');

export const createDoctorProfileSchema = z.object({
  displayName: z.string().trim().min(2).max(140),
  subject: z.string().trim().min(2).max(120),
  levels: z.array(z.string().trim().min(1).max(100)).max(20).optional().default([]),
  bio: z.string().trim().max(3000).optional().default(''),
  qualifications: z
    .array(z.string().trim().min(1).max(300))
    .max(30)
    .optional()
    .default([]),
  experience: z
    .array(z.string().trim().min(1).max(300))
    .max(30)
    .optional()
    .default([]),
  imageUrl: z.string().trim().max(1000).optional().default(''),
  isFeatured: z.boolean().optional().default(false),
  isPublished: z.boolean().optional().default(true),
});

export const updateDoctorProfileSchema = createDoctorProfileSchema.partial();

export const createCourseSchema = z.object({
  doctorProfileId: objectId,
  title: z.string().trim().min(2).max(180),
  subject: z.string().trim().min(2).max(120),
  level: z.string().trim().min(1).max(120),
  curriculum: z.string().trim().max(120).optional().default(''),
  academicYear: z.string().trim().max(30).optional(),
  description: z.string().trim().max(5000).optional().default(''),
  price: z.coerce.number().min(0).optional().default(5000),
  priceConfirmed: z.boolean().optional().default(false),
  accessEndDate: z.coerce.date().optional(),
  status: z.enum(['draft', 'published', 'archived']).optional().default('draft'),
  featured: z.boolean().optional().default(false),
});

export const updateCourseSchema = createCourseSchema
  .omit({ doctorProfileId: true })
  .partial()
  .extend({
    doctorProfileId: objectId.optional(),
  });

export const createGroupSchema = z.object({
  courseId: objectId,
  name: z.string().trim().min(1).max(100),
  scheduleLabel: z.string().trim().max(240).optional().default(''),
  meetingUrl: z.string().trim().max(1000).optional().default(''),
});

export const updateGroupSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  scheduleLabel: z.string().trim().max(240).optional(),
  meetingUrl: z.string().trim().max(1000).optional(),
  active: z.boolean().optional(),
});

export const createEnrollmentSchema = z.object({
  studentId: objectId,
  courseId: objectId,
  groupId: objectId,
  adminNote: z.string().trim().max(1000).optional().default(''),
});

export const confirmPaymentSchema = z.object({
  pricePaid: z.coerce.number().min(0).optional(),
  paidAt: z.coerce.date().optional(),
  adminNote: z.string().trim().max(1000).optional(),
});

export const unregisterEnrollmentSchema = z.object({
  note: z.string().trim().max(500).optional().default(''),
});

export const listEnrollmentQuerySchema = z.object({
  status: z
    .enum(['pending', 'active', 'unregistered', 'expired', 'completed'])
    .optional(),
  paymentStatus: z
    .enum(['pending', 'paid', 'cancelled', 'refunded'])
    .optional(),
  courseId: objectId.optional(),
  studentId: objectId.optional(),
});
