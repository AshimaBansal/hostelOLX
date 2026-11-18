import { z } from 'zod';
import { booleanQuery, paginationQuery, trimmedText } from './common.js';

export const LISTING_TYPES = ['sale', 'giveaway', 'exchange'];
export const CONDITIONS = ['new', 'like_new', 'good', 'fair', 'poor'];
export const LISTING_STATUSES = ['active', 'reserved', 'sold', 'removed'];

const imageUrl = z.string().trim().min(1).max(500);

export const listListingsQuery = z.object({
  category: z.string().trim().toLowerCase().optional(), // category slug
  type: z.enum(LISTING_TYPES).optional(),
  status: z.enum(LISTING_STATUSES).optional(),
  featured: booleanQuery,
  sellerId: z.string().trim().optional(),
  q: z.string().trim().max(100).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  sort: z.enum(['newest', 'oldest', 'price_asc', 'price_desc']).default('newest'),
  ...paginationQuery,
});

const listingFields = {
  title: trimmedText(200),
  description: z.string().trim().max(2000).optional(),
  price: z.coerce.number().min(0).max(1_000_000),
  originalPrice: z.coerce.number().min(0).max(1_000_000).nullable().optional(),
  listingType: z.enum(LISTING_TYPES),
  itemCondition: z.enum(CONDITIONS),
  category: z.string().trim().toLowerCase(), // category slug, e.g. "study"
  locationText: z.string().trim().max(150).optional(),
  images: z.array(imageUrl).max(6),
};

// Giveaways must be free (same rule as the CHECK constraint in the schema)
const giveawayMustBeFree = (data) => data.listingType !== 'giveaway' || data.price === 0;
const giveawayMessage = { message: 'A giveaway must have price 0', path: ['price'] };

// Defaults only apply when creating; an update must change only the fields sent.
export const createListingBody = z
  .object({
    ...listingFields,
    price: listingFields.price.default(0),
    listingType: listingFields.listingType.default('sale'),
    images: listingFields.images.default([]),
  })
  .refine(giveawayMustBeFree, giveawayMessage);

export const updateListingBody = z
  .object(listingFields)
  .partial()
  .refine((data) => Object.keys(data).length > 0, { message: 'Send at least one field to update' });

export const updateListingStatusBody = z.object({
  status: z.enum(LISTING_STATUSES),
});
