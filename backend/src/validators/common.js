import { z } from 'zod';

export const idParam = z.object({
  id: z.coerce.number().int().positive({ message: 'id must be a positive number' }),
});

export const paginationQuery = {
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
};

// "true"/"false" in a query string -> boolean
export const booleanQuery = z
  .enum(['true', 'false'])
  .transform((value) => value === 'true')
  .optional();

export const trimmedText = (max) => z.string().trim().min(1).max(max);
