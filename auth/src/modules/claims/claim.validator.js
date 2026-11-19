import { z } from 'zod';

export const createClaimSchema = z.object({
  proofDetails: z.string().trim().max(2000).optional().default(''),
  proof: z.string().trim().max(2000).optional(),
  claimMessage: z.string().trim().max(2000).optional(),
  meetingLocation: z.string().trim().max(150).optional().default('Nescafe Circle'),
  meetingSpot: z.string().trim().max(150).optional(),
  spot: z.string().trim().max(150).optional(),
  meetingTime: z.string().trim().max(100).optional().default('Today 5:00 PM – 5:30 PM'),
  time: z.string().trim().max(100).optional(),
  timeSlot: z.string().trim().max(100).optional(),
});

export const updateClaimStatusSchema = z.object({
  status: z.enum(['approved', 'rejected', 'cancelled', 'completed']),
});

export function validateCreateClaim(data) {
  return createClaimSchema.safeParse(data);
}

export function validateUpdateClaimStatus(data) {
  return updateClaimStatusSchema.safeParse(data);
}
