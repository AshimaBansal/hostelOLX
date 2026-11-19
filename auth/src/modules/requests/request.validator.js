import { z } from 'zod';

export const createRequestSchema = z.object({
  title: z.string().trim().min(3, 'Title must have at least 3 characters.').max(255),
  description: z.string().trim().max(3000).optional().default(''),
  category: z.string().trim().max(100).optional().default('General'),
  categoryId: z.coerce.number().optional(),
  budget: z.string().trim().max(100).optional().default('Flexible'),
  urgency: z.string().trim().max(100).optional().default('Needed this week'),
  location: z.string().trim().max(150).optional().default('Hostel 1'),
});

export const updateRequestSchema = z.object({
  title: z.string().trim().min(3).max(255).optional(),
  description: z.string().trim().max(3000).optional(),
  category: z.string().trim().max(100).optional(),
  categoryId: z.coerce.number().optional(),
  budget: z.string().trim().max(100).optional(),
  urgency: z.string().trim().max(100).optional(),
  location: z.string().trim().max(150).optional(),
  status: z.enum(['active', 'fulfilled', 'closed', 'cancelled']).optional(),
});

export function validateCreateRequest(data) {
  return createRequestSchema.safeParse(data);
}

export function validateUpdateRequest(data) {
  return updateRequestSchema.safeParse(data);
}
