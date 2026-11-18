import { z } from 'zod';

export const listingIdParam = z.object({
  listingId: z.coerce.number().int().positive(),
});
