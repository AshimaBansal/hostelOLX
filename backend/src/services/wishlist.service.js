import * as wishlistRepo from '../repositories/wishlist.repository.js';
import * as listingRepo from '../repositories/listing.repository.js';
import { getRawOrFail, presentOne } from './listing.service.js';
import { getCurrentProfileOrFail } from './profile.service.js';
import ApiError from '../utils/ApiError.js';

export async function getMine(userId) {
  await getCurrentProfileOrFail(userId);
  const entries = await wishlistRepo.findByUser(userId);
  const listings = await listingRepo.findManyByIds(entries.map((e) => e.listingId));
  const byId = new Map(listings.map((l) => [l.id, l]));

  const result = [];
  for (const entry of entries) {
    const listing = byId.get(entry.listingId);
    // Hide listings the seller removed
    if (!listing || listing.status === 'removed') continue;
    result.push({ addedAt: entry.createdAt, listing: await presentOne(listing, userId) });
  }
  return result;
}

// Returns { created } so the controller can answer 201 or 200.
export async function add(userId, listingId) {
  await getCurrentProfileOrFail(userId);
  const listing = await getRawOrFail(listingId);

  if (listing.status === 'removed') throw ApiError.notFound('Listing');
  if (listing.sellerId === userId) {
    throw ApiError.badRequest('You cannot add your own listing to your wishlist');
  }

  if (await wishlistRepo.exists(userId, listingId)) {
    return { created: false };
  }
  await wishlistRepo.add(userId, listingId);
  return { created: true };
}

export async function remove(userId, listingId) {
  const removed = await wishlistRepo.remove(userId, listingId);
  if (!removed) throw ApiError.notFound('Wishlist item');
}
