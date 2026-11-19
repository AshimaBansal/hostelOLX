import { z } from 'zod';

export const createReportSchema = z.object({
  listingId: z.coerce.number().optional().nullable(),
  reportedUserId: z.string().uuid().optional().nullable(),
  reason: z.string().trim().min(2, 'Reason is required.').max(100),
  description: z.string().trim().max(3000).optional().default(''),
});

export const updateReportSchema = z.object({
  status: z.enum(['reviewed', 'resolved', 'dismissed']),
  adminNotes: z.string().trim().max(3000).optional(),
  removeListing: z.boolean().optional().default(false),
});

export function validateCreateReport(data) {
  return createReportSchema.safeParse(data);
}

export function validateUpdateReport(data) {
  return updateReportSchema.safeParse(data);
}
