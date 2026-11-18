import store from '../store/memoryStore.js';

export async function findAllActive() {
  return store.handoverSpots.filter((spot) => spot.isActive !== false);
}

export async function findById(id) {
  return store.handoverSpots.find((spot) => spot.id === id) ?? null;
}
