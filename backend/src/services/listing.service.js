import * as listingRepo from '../repositories/listing.repository.js';
import * as categoryRepo from '../repositories/category.repository.js';
import * as wishlistRepo from '../repositories/wishlist.repository.js';
import * as categoryService from './category.service.js';
import { getCurrentProfileOrFail, getPublicProfileMap } from './profile.service.js';
import ApiError from '../utils/ApiError.js';
import { paginate } from '../utils/pagination.js';

/*
 * The frontend groups items into sections. We compute it here so the
 * frontend does not need to know the business rule.
 */
function sectionFor(listing) {
  if (listing.listingType === 'giveaway' || listing.price === 0) return 'free';
  if (listing.isFeatured) return 'favorites';
  return 'essentials';
}

function discountPercent(listing) {
  if (!listing.originalPrice || listing.originalPrice <= listing.price) return 0;
  return Math.round(((listing.originalPrice - listing.price) / listing.originalPrice) * 100);
}

// Adds seller, category, section etc. to raw listings for the API response.
async function present(listings, userId) {
  const sellers = await getPublicProfileMap(listings.map((l) => l.sellerId));
  const categories = new Map((await categoryRepo.findAll()).map((c) => [c.id, c]));
  const wishlisted = userId
    ? new Set((await wishlistRepo.findByUser(userId)).map((w) => w.listingId))
    : new Set();

  return listings.map((listing) => ({
    ...listing,
    category: categories.get(listing.categoryId) ?? null,
    seller: sellers.get(listing.sellerId) ?? null,
    section: sectionFor(listing),
    discountPercent: discountPercent(listing),
    isWishlisted: wishlisted.has(listing.id),
    isMine: listing.sellerId === userId,
  }));
}

export async function presentOne(listing, userId) {
  const [result] = await present([listing], userId);
  return result;
}

export async function list(query, userId) {
  const { page, limit, category, type, featured, q, ...rest } = query;

  if (rest.minPrice !== undefined && rest.maxPrice !== undefined && rest.minPrice > rest.maxPrice) {
    throw ApiError.badRequest('minPrice cannot be greater than maxPrice');
  }

  const filters = {
    ...rest,
    listingType: type,
    isFeatured: featured,
    search: q,
    status: rest.status ?? 'active',
  };

  // Only the seller can browse their own removed listings
  if (filters.status === 'removed' && filters.sellerId !== userId) {
    throw ApiError.forbidden('You can only view your own removed listings');
  }

  if (category) {
    filters.categoryId = (await categoryService.getBySlugOrFail(category)).id;
  }

  const all = await listingRepo.findAll(filters);
  const { data, meta } = paginate(all, page, limit);
  return { data: await present(data, userId), meta };
}

export async function getRawOrFail(id) {
  const listing = await listingRepo.findById(id);
  if (!listing) throw ApiError.notFound('Listing');
  return listing;
}

export async function getById(id, userId) {
  const listing = await getRawOrFail(id);
  if (listing.status === 'removed' && listing.sellerId !== userId) {
    throw ApiError.notFound('Listing');
  }
  return presentOne(listing, userId);
}

async function getOwnedOrFail(id, userId) {
  const listing = await getRawOrFail(id);
  if (listing.sellerId !== userId) {
    throw ApiError.forbidden('Only the seller can change this listing');
  }
  if (listing.status === 'removed') {
    throw ApiError.notFound('Listing');
  }
  return listing;
}

export async function create(userId, body) {
  await getCurrentProfileOrFail(userId);
  const { category, ...fields } = body;
  const categoryRow = await categoryService.getBySlugOrFail(category);

  const listing = await listingRepo.create({
    ...fields,
    originalPrice: fields.originalPrice ?? null,
    sellerId: userId,
    categoryId: categoryRow.id,
  });
  return presentOne(listing, userId);
}

export async function update(id, userId, body) {
  const listing = await getOwnedOrFail(id, userId);
  if (listing.status === 'sold') {
    throw ApiError.badRequest('A sold listing cannot be edited');
  }

  const { category, ...changes } = body;
  if (category) {
    changes.categoryId = (await categoryService.getBySlugOrFail(category)).id;
  }

  const merged = { ...listing, ...changes };
  if (merged.listingType === 'giveaway' && merged.price !== 0) {
    throw ApiError.badRequest('A giveaway must have price 0');
  }

  return presentOne(await listingRepo.update(id, changes), userId);
}

// Allowed moves: active <-> reserved, active/reserved -> sold, sold -> active (relist)
const ALLOWED_STATUS_CHANGES = {
  active: ['reserved', 'sold', 'removed'],
  reserved: ['active', 'sold', 'removed'],
  sold: ['active', 'removed'],
};

export async function updateStatus(id, userId, status) {
  const listing = await getOwnedOrFail(id, userId);
  if (listing.status === status) return presentOne(listing, userId);

  if (!ALLOWED_STATUS_CHANGES[listing.status]?.includes(status)) {
    throw ApiError.badRequest(`Cannot change status from "${listing.status}" to "${status}"`);
  }
  return presentOne(await listingRepo.update(id, { status }), userId);
}

// Soft delete: keeps chats/history working, just hides the listing.
export async function remove(id, userId) {
  await getOwnedOrFail(id, userId);
  await listingRepo.update(id, { status: 'removed' });
}
