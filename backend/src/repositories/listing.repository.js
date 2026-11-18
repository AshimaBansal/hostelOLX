import store, { nextId, now } from '../store/memoryStore.js';

/*
 * filters: { categoryId, sellerId, listingType, status, isFeatured,
 *            search, minPrice, maxPrice, sort }
 */
export async function findAll(filters = {}) {
  let rows = store.listings;

  if (filters.status) rows = rows.filter((l) => l.status === filters.status);
  if (filters.categoryId) rows = rows.filter((l) => l.categoryId === filters.categoryId);
  if (filters.sellerId) rows = rows.filter((l) => l.sellerId === filters.sellerId);
  if (filters.listingType) rows = rows.filter((l) => l.listingType === filters.listingType);
  if (filters.isFeatured !== undefined) rows = rows.filter((l) => l.isFeatured === filters.isFeatured);
  if (filters.minPrice !== undefined) rows = rows.filter((l) => l.price >= filters.minPrice);
  if (filters.maxPrice !== undefined) rows = rows.filter((l) => l.price <= filters.maxPrice);

  if (filters.search) {
    const q = filters.search.toLowerCase();
    rows = rows.filter(
      (l) =>
        l.title.toLowerCase().includes(q) ||
        (l.description ?? '').toLowerCase().includes(q) ||
        (l.locationText ?? '').toLowerCase().includes(q),
    );
  }

  const sorters = {
    newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
    oldest: (a, b) => a.createdAt.localeCompare(b.createdAt),
    price_asc: (a, b) => a.price - b.price,
    price_desc: (a, b) => b.price - a.price,
  };

  return [...rows].sort(sorters[filters.sort] ?? sorters.newest);
}

export async function findById(id) {
  return store.listings.find((l) => l.id === id) ?? null;
}

export async function findManyByIds(ids) {
  const wanted = new Set(ids);
  return store.listings.filter((l) => wanted.has(l.id));
}

export async function create(data) {
  const timestamp = now();
  const listing = {
    id: nextId('listings'),
    status: 'active',
    isFeatured: false,
    images: [],
    ...data,
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  store.listings.push(listing);
  return listing;
}

export async function update(id, changes) {
  const listing = store.listings.find((l) => l.id === id);
  if (!listing) return null;
  Object.assign(listing, changes, { updatedAt: now() });
  return listing;
}
