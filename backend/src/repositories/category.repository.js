import store from '../store/memoryStore.js';

export async function findAll() {
  return [...store.categories].sort((a, b) => a.name.localeCompare(b.name));
}

export async function findById(id) {
  return store.categories.find((c) => c.id === id) ?? null;
}

export async function findBySlug(slug) {
  return store.categories.find((c) => c.slug === slug) ?? null;
}
