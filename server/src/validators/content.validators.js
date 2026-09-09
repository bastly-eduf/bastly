import { z } from 'zod';

const status = z.enum(['draft', 'published', 'archived']);

const resource = z.object({
  label: z.string().trim().min(1).max(120),
  url: z.string().trim().url().max(1200),
});

export const createModuleSchema = z.object({
  title: z.string().trim().min(2).max(180),
  description: z.string().trim().max(2500).optional().default(''),
  status: z.enum(['draft', 'published']).optional().default('draft'),
});

export const updateModuleSchema = z.object({
  title: z.string().trim().min(2).max(180).optional(),
  description: z.string().trim().max(2500).optional(),
  status: status.optional(),
  sortOrder: z.coerce.number().int().min(0).optional(),
});

export const createLessonSchema = z.object({
  title: z.string().trim().min(2).max(180),
  description: z.string().trim().max(4000).optional().default(''),
  youtube: z.string().trim().min(1).max(1200),
  durationMinutes: z.coerce.number().min(0).max(10000).nullable().optional(),
  resources: z.array(resource).max(20).optional().default([]),
  status: z.enum(['draft', 'published']).optional().default('draft'),
});

export const updateLessonSchema = z.object({
  title: z.string().trim().min(2).max(180).optional(),
  description: z.string().trim().max(4000).optional(),
  youtube: z.string().trim().max(1200).optional(),
  durationMinutes: z.coerce.number().min(0).max(10000).nullable().optional(),
  resources: z.array(resource).max(20).optional(),
  status: status.optional(),
  sortOrder: z.coerce.number().int().min(0).optional(),
});
