import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createClaimService } from '../src/modules/claims/claim.service.js';

describe('Lost and Found Claims Module', () => {
  const sampleClaim = {
    id: '1',
    listingId: '101',
    claimantId: 'user-claimant',
    sellerId: 'user-poster',
    proofDetails: 'Black case with initial A',
    meetingLocation: 'Nescafe Circle',
    meetingTime: 'Today 5 PM',
    status: 'pending',
    claimantName: 'Claimant Student',
    sellerName: 'Poster Student',
    listingTitle: 'Found AirPods',
  };

  function createMockClaimRepo() {
    let claims = [{ ...sampleClaim }];

    return {
      findUserClaims: async (userId) => {
        return claims.filter((c) => c.claimantId === userId || c.sellerId === userId);
      },
      findById: async (id) => claims.find((c) => String(c.id) === String(id)) ?? null,
      findExistingClaim: async (listingId, claimantId) => {
        return claims.find((c) => c.listingId === String(listingId) && c.claimantId === claimantId) ?? null;
      },
      createClaim: async (data) => {
        const c = {
          id: String(Date.now()),
          ...data,
          status: 'pending',
          sellerId: 'user-poster',
        };
        claims.push(c);
        return c;
      },
      updateStatus: async (id, status) => {
        const c = claims.find((item) => String(item.id) === String(id));
        if (c) c.status = status;
        return c;
      },
    };
  }

  function createMockListingRepo() {
    return {
      findById: async (id) => {
        if (id === '101') {
          return { id: '101', sellerId: 'user-poster', title: 'Found AirPods' };
        }
        return null;
      },
    };
  }

  it('should submit claim on found listing successfully', async () => {
    const cRepo = createMockClaimRepo();
    const lRepo = createMockListingRepo();
    const service = createClaimService(cRepo, lRepo);

    const claim = await service.submitClaim('101', 'user-claimant-2', {
      proofDetails: 'Silver ring with engraving',
      meetingSpot: 'Library Steps',
    });

    assert.equal(claim.status, 'pending');
    assert.equal(claim.claimantId, 'user-claimant-2');
  });

  it('should prevent seller from claiming own item', async () => {
    const cRepo = createMockClaimRepo();
    const lRepo = createMockListingRepo();
    const service = createClaimService(cRepo, lRepo);

    await assert.rejects(
      () => service.submitClaim('101', 'user-poster', { proofDetails: 'My item' }),
      (err) => err.statusCode === 400
    );
  });

  it('should prevent duplicate pending claims by same user', async () => {
    const cRepo = createMockClaimRepo();
    const lRepo = createMockListingRepo();
    const service = createClaimService(cRepo, lRepo);

    await assert.rejects(
      () => service.submitClaim('101', 'user-claimant', { proofDetails: 'Another claim' }),
      (err) => err.statusCode === 409
    );
  });

  it('should allow item owner to approve claim', async () => {
    const cRepo = createMockClaimRepo();
    const lRepo = createMockListingRepo();
    const service = createClaimService(cRepo, lRepo);

    const approved = await service.updateClaimStatus('1', 'user-poster', 'STUDENT', 'approved');
    assert.equal(approved.status, 'approved');
  });

  it('should allow item owner to reject claim', async () => {
    const cRepo = createMockClaimRepo();
    const lRepo = createMockListingRepo();
    const service = createClaimService(cRepo, lRepo);

    const rejected = await service.updateClaimStatus('1', 'user-poster', 'STUDENT', 'rejected');
    assert.equal(rejected.status, 'rejected');
  });

  it('should allow claimant to cancel own claim', async () => {
    const cRepo = createMockClaimRepo();
    const lRepo = createMockListingRepo();
    const service = createClaimService(cRepo, lRepo);

    const cancelled = await service.updateClaimStatus('1', 'user-claimant', 'STUDENT', 'cancelled');
    assert.equal(cancelled.status, 'cancelled');
  });

  it('should prevent unauthorized third party from modifying claim status', async () => {
    const cRepo = createMockClaimRepo();
    const lRepo = createMockListingRepo();
    const service = createClaimService(cRepo, lRepo);

    await assert.rejects(
      () => service.updateClaimStatus('1', 'unrelated-user', 'STUDENT', 'approved'),
      (err) => err.statusCode === 403
    );
  });
});
