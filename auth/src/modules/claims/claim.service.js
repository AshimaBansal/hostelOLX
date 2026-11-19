import { claimRepository } from './claim.repository.js';
import { listingRepository } from '../listings/listing.repository.js';

export function createClaimService(
  repository = claimRepository,
  listingRepo = listingRepository
) {
  async function getUserClaims(userId) {
    const claims = await repository.findUserClaims(userId);
    return claims.map((c) => ({
      ...c,
      id: String(c.id),
      listingId: c.listingId ? String(c.listingId) : null,
      isMine: c.claimantId === userId,
      isSeller: c.sellerId === userId,
    }));
  }

  async function getClaimById(id, userId, userRole) {
    const claim = await repository.findById(id);
    if (!claim) {
      const error = new Error('Claim not found.');
      error.statusCode = 404;
      throw error;
    }

    if (claim.claimantId !== userId && claim.sellerId !== userId && userRole !== 'ADMIN') {
      const error = new Error('You are not authorized to view this claim.');
      error.statusCode = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    return {
      ...claim,
      id: String(claim.id),
      listingId: claim.listingId ? String(claim.listingId) : null,
      isMine: claim.claimantId === userId,
      isSeller: claim.sellerId === userId,
    };
  }

  async function submitClaim(listingId, claimantId, input) {
    const listing = await listingRepo.findById(listingId);
    if (!listing) {
      const error = new Error('Listing not found.');
      error.statusCode = 404;
      throw error;
    }

    if (listing.sellerId === claimantId) {
      const error = new Error('You cannot claim your own listing.');
      error.statusCode = 400;
      error.code = 'CANNOT_CLAIM_OWN_ITEM';
      throw error;
    }

    const existing = await repository.findExistingClaim(listingId, claimantId);
    if (existing && existing.status === 'pending') {
      const error = new Error('You already have a pending claim for this item.');
      error.statusCode = 409;
      error.code = 'DUPLICATE_CLAIM';
      throw error;
    }

    const proofDetails = input.proofDetails || input.proof || input.claimMessage || '';
    const meetingLocation = input.meetingLocation || input.meetingSpot || input.spot || 'Nescafe Circle';
    const meetingTime = input.meetingTime || input.timeSlot || input.time || 'Today 5:00 PM – 5:30 PM';

    const claim = await repository.createClaim({
      listingId,
      claimantId,
      proofDetails,
      meetingLocation,
      meetingTime,
      claimMessage: input.claimMessage || proofDetails,
    });

    return {
      ...claim,
      id: String(claim.id),
      listingId: String(claim.listingId),
    };
  }

  async function updateClaimStatus(claimId, userId, userRole, newStatus) {
    const claim = await repository.findById(claimId);
    if (!claim) {
      const error = new Error('Claim not found.');
      error.statusCode = 404;
      throw error;
    }

    const isSeller = claim.sellerId === userId;
    const isClaimant = claim.claimantId === userId;
    const isAdmin = userRole === 'ADMIN';

    if (newStatus === 'cancelled') {
      if (!isClaimant && !isAdmin) {
        const error = new Error('Only the claimant can cancel this claim.');
        error.statusCode = 403;
        error.code = 'FORBIDDEN';
        throw error;
      }
    } else if (newStatus === 'approved' || newStatus === 'rejected') {
      if (!isSeller && !isAdmin) {
        const error = new Error('Only the item owner can approve or reject this claim.');
        error.statusCode = 403;
        error.code = 'FORBIDDEN';
        throw error;
      }
    } else if (newStatus === 'completed') {
      if (!isSeller && !isClaimant && !isAdmin) {
        const error = new Error('You are not authorized to mark this claim as completed.');
        error.statusCode = 403;
        error.code = 'FORBIDDEN';
        throw error;
      }
    }

    const updated = await repository.updateStatus(claimId, newStatus, claim.listingId);
    return {
      ...updated,
      id: String(updated.id),
      listingId: updated.listingId ? String(updated.listingId) : null,
    };
  }

  return {
    getUserClaims,
    getClaimById,
    submitClaim,
    updateClaimStatus,
  };
}

export const claimService = createClaimService();
