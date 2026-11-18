import store, { now } from '../store/memoryStore.js';

export async function findById(id) {
  return store.profiles.find((p) => p.id === id) ?? null;
}

export async function findManyByIds(ids) {
  const wanted = new Set(ids);
  return store.profiles.filter((p) => wanted.has(p.id));
}

// Profiles are created by the auth system; here we only update them.
export async function update(id, changes) {
  const profile = store.profiles.find((p) => p.id === id);
  if (!profile) return null;
  Object.assign(profile, changes, { updatedAt: now() });
  return profile;
}
