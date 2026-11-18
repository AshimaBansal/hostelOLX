import * as seed from './seedData.js';

/*
 * Simple in-memory "tables". Data resets every time the server restarts.
 * This exists only because the database is handled by another member.
 * Repositories are the ONLY files that touch this store, so replacing it
 * with PostgreSQL later does not affect services, controllers or routes.
 */

const clone = (value) => structuredClone(value);

const store = {};
const counters = {};

const TABLES = [
  'profiles',
  'categories',
  'handoverSpots',
  'listings',
  'wishlists',
  'conversations',
  'messages',
  'conversationMembers',
  'lostFoundItems',
  'claims',
];

export function resetStore() {
  for (const table of TABLES) {
    store[table] = clone(seed[table]);
    const ids = store[table].map((row) => row.id).filter((id) => typeof id === 'number');
    counters[table] = ids.length ? Math.max(...ids) : 0;
  }
}

// Works like an auto-increment / IDENTITY column.
export function nextId(table) {
  counters[table] += 1;
  return counters[table];
}

export function now() {
  return new Date().toISOString();
}

resetStore();

export default store;
