import { z } from 'zod';
import { paginationQuery, trimmedText } from './common.js';

export const ITEM_TYPES = ['lost', 'found'];
export const ITEM_STATUSES = ['open', 'claimed', 'closed'];

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'Use the format YYYY-MM-DD' })
  .refine((value) => !Number.isNaN(Date.parse(value)), { message: 'Invalid date' })
  .refine((value) => value <= new Date().toISOString().slice(0, 10), { message: 'Date cannot be in the future' });

export const listLostFoundQuery = z.object({
  type: z.enum(ITEM_TYPES).optional(),
  status: z.enum(ITEM_STATUSES).optional(),
  q: z.string().trim().max(100).optional(),
  ...paginationQuery,
});

const itemFields = {
  itemType: z.enum(ITEM_TYPES),
  title: trimmedText(200),
  description: z.string().trim().max(2000).optional(),
  locationDescription: z.string().trim().max(300).optional(),
  imageUrl: z.string().trim().max(500).optional(),
  dateOccurred: isoDate.optional(),
};

export const createLostFoundBody = z.object(itemFields);

export const updateLostFoundBody = z
  .object({ ...itemFields, status: z.enum(['open', 'closed']) })
  .partial()
  .refine((data) => Object.keys(data).length > 0, { message: 'Send at least one field to update' });

export const createClaimBody = z.object({
  claimMessage: z.string().trim().min(10, { message: 'Describe the item in at least 10 characters so the owner can verify' }).max(1000),
});

export const updateClaimBody = z.object({
  status: z.enum(['approved', 'rejected', 'cancelled']),
});
