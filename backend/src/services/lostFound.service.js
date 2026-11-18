import * as lostFoundRepo from '../repositories/lostFound.repository.js';
import * as claimRepo from '../repositories/claim.repository.js';
import { getCurrentProfileOrFail, getPublicProfileMap } from './profile.service.js';
import ApiError from '../utils/ApiError.js';
import { paginate } from '../utils/pagination.js';

async function presentItems(items, userId) {
  const people = await getPublicProfileMap(items.map((i) => i.postedBy));
  const result = [];
  for (const item of items) {
    const claims = await claimRepo.findByItem(item.id);
    const myClaim = userId ? claims.find((c) => c.claimantId === userId) : null;
    result.push({
      ...item,
      postedByUser: people.get(item.postedBy) ?? null,
      isMine: item.postedBy === userId,
      claimCount: claims.filter((c) => c.status !== 'cancelled').length,
      myClaimStatus: myClaim?.status ?? null,
    });
  }
  return result;
}

export async function list(query, userId) {
  const { page, limit, type, status, q } = query;
  const all = await lostFoundRepo.findAll({ itemType: type, status: status ?? 'open', search: q });
  const { data, meta } = paginate(all, page, limit);
  return { data: await presentItems(data, userId), meta };
}

async function getItemOrFail(id) {
  const item = await lostFoundRepo.findById(id);
  if (!item) throw ApiError.notFound('Lost & found item');
  return item;
}

export async function getById(id, userId) {
  const [item] = await presentItems([await getItemOrFail(id)], userId);
  return item;
}

export async function create(userId, body) {
  await getCurrentProfileOrFail(userId);
  const item = await lostFoundRepo.create({ ...body, postedBy: userId });
  return getById(item.id, userId);
}

export async function update(id, userId, body) {
  const item = await getItemOrFail(id);
  if (item.postedBy !== userId) throw ApiError.forbidden('Only the person who posted this can edit it');
  if (item.status === 'claimed') throw ApiError.badRequest('This item has already been claimed');

  await lostFoundRepo.update(id, body);
  return getById(id, userId);
}

/* ---------------- Claims ---------------- */

async function presentClaims(claims) {
  const people = await getPublicProfileMap(claims.map((c) => c.claimantId));
  return claims.map((c) => ({ ...c, claimant: people.get(c.claimantId) ?? null }));
}

export async function createClaim(itemId, userId, { claimMessage }) {
  await getCurrentProfileOrFail(userId);
  const item = await getItemOrFail(itemId);

  if (item.postedBy === userId) throw ApiError.badRequest('You cannot claim an item you posted');
  if (item.status !== 'open') throw ApiError.badRequest('This item is no longer open for claims');

  const existing = await claimRepo.findExisting(itemId, userId);
  if (existing) {
    if (existing.status === 'cancelled') {
      // Allow re-claiming after cancelling: reopen the same claim row
      existing.claimMessage = claimMessage;
      await claimRepo.updateStatus(existing.id, 'pending');
      const [claim] = await presentClaims([existing]);
      return claim;
    }
    throw ApiError.conflict('You have already claimed this item');
  }

  const [claim] = await presentClaims([await claimRepo.create({ itemId, claimantId: userId, claimMessage })]);
  return claim;
}

// Only the person who posted the item can see who claimed it.
export async function getClaimsForItem(itemId, userId) {
  const item = await getItemOrFail(itemId);
  if (item.postedBy !== userId) throw ApiError.forbidden('Only the person who posted this can see its claims');
  return presentClaims(await claimRepo.findByItem(itemId));
}

export async function getMyClaims(userId) {
  await getCurrentProfileOrFail(userId);
  const claims = await claimRepo.findByClaimant(userId);
  const result = [];
  for (const claim of claims) {
    const item = await lostFoundRepo.findById(claim.itemId);
    result.push({ ...claim, item: item ? { id: item.id, title: item.title, itemType: item.itemType, status: item.status } : null });
  }
  return result;
}

/*
 * Poster: pending -> approved | rejected
 * Claimant: pending -> cancelled
 * Approving marks the item as "claimed" and rejects the other pending claims.
 */
export async function updateClaimStatus(claimId, userId, status) {
  const claim = await claimRepo.findById(claimId);
  if (!claim) throw ApiError.notFound('Claim');
  const item = await getItemOrFail(claim.itemId);

  const isPoster = item.postedBy === userId;
  const isClaimant = claim.claimantId === userId;

  if (!isPoster && !isClaimant) throw ApiError.notFound('Claim');
  if (claim.status !== 'pending') throw ApiError.badRequest(`This claim is already ${claim.status}`);

  if (status === 'cancelled' && !isClaimant) {
    throw ApiError.forbidden('Only the claimant can cancel a claim');
  }
  if ((status === 'approved' || status === 'rejected') && !isPoster) {
    throw ApiError.forbidden('Only the person who posted the item can approve or reject claims');
  }

  if (status === 'approved') {
    if (item.status !== 'open') throw ApiError.badRequest('This item is no longer open for claims');
    await lostFoundRepo.update(item.id, { status: 'claimed' });
    await claimRepo.rejectOtherPending(item.id, claim.id);
  }

  const [updated] = await presentClaims([await claimRepo.updateStatus(claimId, status)]);
  return updated;
}
