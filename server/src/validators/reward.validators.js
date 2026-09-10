import { z } from 'zod';

export const createRewardCardSchema = z.object({
  partnerName: z.string().trim().min(2).max(140),
  partnerLogoUrl: z.string().trim().max(1000).optional().default(''),
  title: z.string().trim().min(2).max(180),
  offer: z.string().trim().min(2).max(220),
  description: z.string().trim().max(2500).optional().default(''),
  instructions: z.string().trim().max(2500).optional().default(''),
  redemptionCode: z.string().trim().max(180).optional().default(''),
  expiresAt: z.coerce.date().nullable().optional(),
  quantity: z.coerce.number().int().min(1).max(100000),
  status: z.enum(['active', 'paused']).optional().default('active'),
});

export const updateRewardCardSchema = z.object({
  partnerName: z.string().trim().min(2).max(140).optional(),
  partnerLogoUrl: z.string().trim().max(1000).optional(),
  title: z.string().trim().min(2).max(180).optional(),
  offer: z.string().trim().min(2).max(220).optional(),
  description: z.string().trim().max(2500).optional(),
  instructions: z.string().trim().max(2500).optional(),
  redemptionCode: z.string().trim().max(180).optional(),
  expiresAt: z.coerce.date().nullable().optional(),
  status: z.enum(['active', 'paused', 'expired']).optional(),
  sortOrder: z.coerce.number().int().min(0).max(100000).optional(),
});

export const restockRewardCardSchema = z.object({
  quantity: z.coerce.number().int().min(1).max(100000),
});
