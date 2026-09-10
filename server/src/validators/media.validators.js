import { z } from 'zod';

const objectId = z
  .string()
  .regex(/^[a-f\d]{24}$/i, 'Invalid ID.');

const mediaFile = z.object({
  variant: z.string().trim().min(1).max(40),
  width: z.coerce.number().int().min(1).max(5000),
  height: z.coerce.number().int().min(1).max(5000),
  bytes: z.coerce.number().int().min(1).max(3_000_000),
  contentType: z.literal('image/webp'),
});

export const createMediaUploadSchema = z.object({
  entityType: z.enum(['doctor', 'reward']),
  entityId: objectId,
  slot: z.enum([
    'portrait',
    'rewardImage',
    'partnerLogo',
  ]),
  files: z.array(mediaFile).min(1).max(4),
});

export const commitMediaUploadSchema = z.object({
  uploadId: z.string().uuid(),
});
