import store, { nextId, now } from '../store/memoryStore.js';

// filters: { itemType, status, postedBy, search }
export async function findAll(filters = {}) {
  let rows = store.lostFoundItems;

  if (filters.itemType) rows = rows.filter((i) => i.itemType === filters.itemType);
  if (filters.status) rows = rows.filter((i) => i.status === filters.status);
  if (filters.postedBy) rows = rows.filter((i) => i.postedBy === filters.postedBy);
  if (filters.search) {
    const q = filters.search.toLowerCase();
    rows = rows.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        (i.description ?? '').toLowerCase().includes(q) ||
        (i.locationDescription ?? '').toLowerCase().includes(q),
    );
  }

  return [...rows].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function findById(id) {
  return store.lostFoundItems.find((i) => i.id === id) ?? null;
}

export async function create(data) {
  const timestamp = now();
  const item = { id: nextId('lostFoundItems'), status: 'open', ...data, createdAt: timestamp, updatedAt: timestamp };
  store.lostFoundItems.push(item);
  return item;
}

export async function update(id, changes) {
  const item = store.lostFoundItems.find((i) => i.id === id);
  if (!item) return null;
  Object.assign(item, changes, { updatedAt: now() });
  return item;
}
