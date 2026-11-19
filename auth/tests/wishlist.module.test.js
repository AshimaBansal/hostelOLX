import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createWishlistService } from '../src/modules/wishlist/wishlist.service.js';

describe('Wishlist Module', () => {
  function createMockWishlistRepo() {
    const list = new Map();
    return {
      findUserWishlist: async (userId) => {
        const userItems = [];
        for (const [key, val] of list.entries()) {
          if (key.startsWith(`${userId}:`)) {
            userItems.push(val);
          }
        }
        return userItems;
      },
      addToWishlist: async (userId, listingId) => {
        const key = `${userId}:${listingId}`;
        list.set(key, {
          id: listingId,
          listingId,
          title: 'Sample Item',
          price: 500,
          originalPrice: 800,
          images: ['/images/arc_lamp.png'],
          sellerName: 'Ashi',
        });
        return { userId, listingId: String(listingId), saved: true };
      },
      removeFromWishlist: async (userId, listingId) => {
        const key = `${userId}:${listingId}`;
        list.delete(key);
        return { userId, listingId: String(listingId), saved: false };
      },
    };
  }

  function createMockListingRepo() {
    return {
      findById: async (id) => {
        if (id === '101') {
          return { id: '101', title: 'Sample Item', price: 500 };
        }
        return null;
      },
    };
  }

  it('should add item to wishlist successfully', async () => {
    const wRepo = createMockWishlistRepo();
    const lRepo = createMockListingRepo();
    const service = createWishlistService(wRepo, lRepo);

    const result = await service.add('user-1', '101');
    assert.equal(result.saved, true);

    const items = await service.getWishlist('user-1');
    assert.equal(items.length, 1);
    assert.equal(items[0].id, '101');
    assert.equal(items[0].isWishlisted, true);
  });

  it('should throw 404 when adding non-existent listing', async () => {
    const wRepo = createMockWishlistRepo();
    const lRepo = createMockListingRepo();
    const service = createWishlistService(wRepo, lRepo);

    await assert.rejects(
      () => service.add('user-1', '999'),
      (err) => err.statusCode === 404
    );
  });

  it('should remove item from wishlist successfully', async () => {
    const wRepo = createMockWishlistRepo();
    const lRepo = createMockListingRepo();
    const service = createWishlistService(wRepo, lRepo);

    await service.add('user-1', '101');
    const result = await service.remove('user-1', '101');
    assert.equal(result.saved, false);

    const items = await service.getWishlist('user-1');
    assert.equal(items.length, 0);
  });

  it('should prevent access to another users wishlist items', async () => {
    const wRepo = createMockWishlistRepo();
    const lRepo = createMockListingRepo();
    const service = createWishlistService(wRepo, lRepo);

    await service.add('user-1', '101');
    const user2Items = await service.getWishlist('user-2');
    assert.equal(user2Items.length, 0);
  });
});
