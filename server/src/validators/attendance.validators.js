import { z } from 'zod';

const objectId = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid ID.');

export const createAttendanceSessionSchema = z.object({
  title: z.string().trim().max(180).optional().default(''),
  heldAt: z.coerce.date(),
});

export const markAttendanceSchema = z.object({
  records: z
    .array(
      z.object({
        studentId: objectId,
        status: z.enum(['present', 'absent']),
      }),
    )
    .min(1)
    .max(500),
});
