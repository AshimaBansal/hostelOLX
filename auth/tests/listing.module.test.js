import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createListingService } from '../src/modules/listings/listing.service.js';
import { validateCreateListing } from '../src/modules/listings/listing.validator.js';

describe('Listings Module', () => {
  const sampleListing = {
    id: '101',
    sellerId: 'user-1',
    categoryId: 1,
    title: 'Study Lamp',
    description: 'Bright LED lamp',
    price: 500,
    originalPrice: 800,
    listingType: 'sale',
    itemCondition: 'good',
    condition: 'Good',
    status: 'active',
    location: 'Hostel 1',
    isFeatured: true,
    sellerName: 'Ashi Bansal',
    sellerHostel: 'Hostel 1',
    sellerRoom: '102',
    sellerProgram: 'Tech 27',
    images: ['/images/arc_lamp.png'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  function createMockListingRepo(listings = [sampleListing]) {
    let items = [...listings];
    return {
      findAll: async (filters = {}) => {
        let rows = [...items];
        if (filters.status) rows = rows.filter((i) => i.status === filters.status);
        if (filters.type) rows = rows.filter((i) => i.listingType === filters.type);
        if (filters.search) {
          const q = filters.search.toLowerCase();
          rows = rows.filter((i) => i.title.toLowerCase().includes(q));
        }
        return { rows, meta: { total: rows.length, page: 1, limit: 20 } };
      },
      findById: async (id) => items.find((i) => String(i.id) === String(id)) ?? null,
      createListing: async (data) => {
        const newItem = {
          id: String(Date.now()),
          ...data,
          status: 'active',
          sellerName: 'Test Seller',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        items.push(newItem);
        return newItem;
      },
      updateListing: async (id, updates, images) => {
        const idx = items.findIndex((i) => String(i.id) === String(id));
        if (idx === -1) return null;
        items[idx] = { ...items[idx], ...updates, images: images ?? items[idx].images };
        return items[idx];
      },
      deleteListing: async (id) => {
        const item = items.find((i) => String(i.id) === String(id));
        if (item) item.status = 'removed';
        return item;
      },
      findCategoryBySlugOrName: async () => ({ id: 1, name: 'Study', slug: 'study' }),
    };
  }

  it('should create a valid paid listing', async () => {
    const repo = createMockListingRepo();
    const service = createListingService(repo);

    const created = await service.createListing('user-1', {
      title: 'Ergonomic Chair',
      description: 'Used for one semester',
      price: 1200,
      originalPrice: 2000,
      listingType: 'sale',
      itemCondition: 'like_new',
      category: 'seating',
      images: ['/images/chair.png'],
    });

    assert.equal(created.title, 'Ergonomic Chair');
    assert.equal(created.price, 1200);
    assert.equal(created.sellerId, 'user-1');
  });

  it('should enforce price validation for free giveaways and paid items', () => {
    const invalidPaid = validateCreateListing({
      title: 'Free Book But Price Set',
      price: 0,
      listingType: 'sale',
    });
    assert.equal(invalidPaid.success, false);

    const validFree = validateCreateListing({
      title: 'Calculus Notes',
      price: 0,
      listingType: 'free',
    });
    assert.equal(validFree.success, true);

    const invalidFree = validateCreateListing({
      title: 'Calculus Notes',
      price: 100,
      listingType: 'free',
    });
    assert.equal(invalidFree.success, false);
  });

  it('should enforce price 0 for lost and found items', () => {
    const validLost = validateCreateListing({
      title: 'Found Smartwatch',
      price: 0,
      listingType: 'lost-found',
    });
    assert.equal(validLost.success, true);

    const invalidLost = validateCreateListing({
      title: 'Found Smartwatch',
      price: 500,
      listingType: 'lost-found',
    });
    assert.equal(invalidLost.success, false);
  });

  it('should update own listing successfully', async () => {
    const repo = createMockListingRepo();
    const service = createListingService(repo);

    const updated = await service.updateListing('101', 'user-1', 'STUDENT', {
      title: 'Updated Study Lamp',
      price: 450,
    });

    assert.equal(updated.title, 'Updated Study Lamp');
    assert.equal(updated.price, 450);
  });

  it('should prevent updating another users listing', async () => {
    const repo = createMockListingRepo();
    const service = createListingService(repo);

    await assert.rejects(
      () => service.updateListing('101', 'user-2', 'STUDENT', { price: 300 }),
      (err) => err.statusCode === 403
    );
  });

  it('should allow ADMIN to update another users listing', async () => {
    const repo = createMockListingRepo();
    const service = createListingService(repo);

    const updated = await service.updateListing('101', 'admin-user', 'ADMIN', {
      title: 'Moderated Title',
    });

    assert.equal(updated.title, 'Moderated Title');
  });

  it('should delete own listing successfully', async () => {
    const repo = createMockListingRepo();
    const service = createListingService(repo);

    const result = await service.deleteListing('101', 'user-1', 'STUDENT');
    assert.equal(result.status, 'removed');
  });

  it('should prevent deleting another users listing', async () => {
    const repo = createMockListingRepo();
    const service = createListingService(repo);

    await assert.rejects(
      () => service.deleteListing('101', 'user-2', 'STUDENT'),
      (err) => err.statusCode === 403
    );
  });

  it('should filter listings by search query', async () => {
    const repo = createMockListingRepo();
    const service = createListingService(repo);

    const { listings } = await service.getListings({ search: 'Lamp' });
    assert.equal(listings.length, 1);
    assert.equal(listings[0].title, 'Study Lamp');

    const empty = await service.getListings({ search: 'NonExistent' });
    assert.equal(empty.listings.length, 0);
  });
});
