import { z } from 'zod';

function normalizeCondition(val) {
  if (typeof val !== 'string') return 'good';
  const v = val.trim().toLowerCase().replace(/\s+/g, '_');
  if (v === 'brand_new' || v === 'new') return 'new';
  if (v === 'like_new') return 'like_new';
  if (v === 'good') return 'good';
  if (v === 'fair') return 'fair';
  if (v === 'poor') return 'poor';
  return 'good';
}

function normalizeType(val) {
  if (typeof val !== 'string') return 'sale';
  const v = val.trim().toLowerCase().replace(/_/g, '-');
  if (v === 'free' || v === 'giveaway') return 'giveaway';
  if (v === 'lost-found' || v === 'lost_found') return 'lost-found';
  if (v === 'exchange') return 'exchange';
  return 'sale';
}

export const createListingSchema = z
  .object({
    title: z.string().trim().min(2, 'Title must have at least 2 characters.').max(200),
    description: z.string().trim().max(5000).optional().default(''),
    price: z.coerce.number().min(0, 'Price must be 0 or greater.').default(0),
    originalPrice: z.coerce.number().min(0).optional().nullable(),
    listingType: z.string().optional().default('sale').transform(normalizeType),
    type: z.string().optional().transform((val) => (val ? normalizeType(val) : undefined)),
    itemCondition: z.string().optional().default('good').transform(normalizeCondition),
    condition: z.string().optional().transform((val) => (val ? normalizeCondition(val) : undefined)),
    category: z.string().optional(),
    categoryId: z.coerce.number().optional(),
    locationText: z.string().trim().max(150).optional().default('Hostel 1'),
    location: z.string().trim().max(150).optional(),
    isFeatured: z.boolean().optional().default(false),
    images: z.array(z.string()).optional().default([]),
    image: z.string().optional(),
  })
  .refine(
    (data) => {
      const type = data.type || data.listingType;
      if (type === 'giveaway' || type === 'free' || type === 'lost-found') {
        return data.price === 0;
      }
      return data.price > 0;
    },
    {
      message: 'Paid listings must have a price greater than 0; free and lost & found listings must have price 0.',
      path: ['price'],
    }
  );

export const updateListingSchema = z
  .object({
    title: z.string().trim().min(2).max(200).optional(),
    description: z.string().trim().max(5000).optional(),
    price: z.coerce.number().min(0).optional(),
    originalPrice: z.coerce.number().min(0).optional().nullable(),
    listingType: z.string().optional().transform((v) => (v ? normalizeType(v) : undefined)),
    type: z.string().optional().transform((v) => (v ? normalizeType(v) : undefined)),
    itemCondition: z.string().optional().transform((v) => (v ? normalizeCondition(v) : undefined)),
    condition: z.string().optional().transform((v) => (v ? normalizeCondition(v) : undefined)),
    category: z.string().optional(),
    categoryId: z.coerce.number().optional(),
    locationText: z.string().trim().max(150).optional(),
    location: z.string().trim().max(150).optional(),
    status: z.enum(['active', 'reserved', 'sold', 'inactive', 'removed']).optional(),
    isFeatured: z.boolean().optional(),
    images: z.array(z.string()).optional(),
  })
  .refine(
    (data) => {
      const type = data.type || data.listingType;
      if (type && (type === 'giveaway' || type === 'free' || type === 'lost-found')) {
        return data.price === undefined || data.price === 0;
      }
      if (type === 'sale' && data.price !== undefined) {
        return data.price > 0;
      }
      return true;
    },
    {
      message: 'Paid listings must have a price greater than 0; free and lost & found listings must have price 0.',
      path: ['price'],
    }
  );

export function validateCreateListing(data) {
  return createListingSchema.safeParse(data);
}

export function validateUpdateListing(data) {
  return updateListingSchema.safeParse(data);
}
