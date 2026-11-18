import store, { now } from '../store/memoryStore.js';

export async function findByUser(userId) {
  return store.wishlists
    .filter((w) => w.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function exists(userId, listingId) {
  return store.wishlists.some((w) => w.userId === userId && w.listingId === listingId);
}

export async function add(userId, listingId) {
  const entry = { userId, listingId, createdAt: now() };
  store.wishlists.push(entry);
  return entry;
}

export async function remove(userId, listingId) {
  const before = store.wishlists.length;
  store.wishlists = store.wishlists.filter((w) => !(w.userId === userId && w.listingId === listingId));
  return store.wishlists.length < before;
}
