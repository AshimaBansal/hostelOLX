import store, { nextId, now } from '../store/memoryStore.js';

export async function findById(id) {
  return store.claims.find((c) => c.id === id) ?? null;
}

export async function findByItem(itemId) {
  return store.claims.filter((c) => c.itemId === itemId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function findByClaimant(claimantId) {
  return store.claims.filter((c) => c.claimantId === claimantId).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function findExisting(itemId, claimantId) {
  return store.claims.find((c) => c.itemId === itemId && c.claimantId === claimantId) ?? null;
}

export async function create({ itemId, claimantId, claimMessage }) {
  const claim = { id: nextId('claims'), itemId, claimantId, claimMessage, status: 'pending', createdAt: now() };
  store.claims.push(claim);
  return claim;
}

export async function updateStatus(id, status) {
  const claim = store.claims.find((c) => c.id === id);
  if (!claim) return null;
  claim.status = status;
  return claim;
}

// When one claim is approved, the other pending claims on that item are rejected.
export async function rejectOtherPending(itemId, approvedClaimId) {
  for (const claim of store.claims) {
    if (claim.itemId === itemId && claim.id !== approvedClaimId && claim.status === 'pending') {
      claim.status = 'rejected';
    }
  }
}
