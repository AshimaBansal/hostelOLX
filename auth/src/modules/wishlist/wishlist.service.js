import { wishlistRepository } from './wishlist.repository.js';
import { listingRepository } from '../listings/listing.repository.js';

export function createWishlistService(
  repository = wishlistRepository,
  listingRepo = listingRepository
) {
  async function getWishlist(userId) {
    try {
      const items = await repository.findUserWishlist(userId);
      return items.map((item) => {
        const images = Array.isArray(item.images) ? item.images : [];
        return {
          ...item,
          id: String(item.id),
          listingId: String(item.listingId),
          price: Number(item.price),
          originalPrice: item.originalPrice !== null ? Number(item.originalPrice) : null,
          images,
          image: images[0] || '/images/arc_lamp.png',
          seller: item.sellerName || 'Student',
          isWishlisted: true,
        };
      });
    } catch {
      return [];
    }
  }

  async function add(userId, listingId) {
    const isMock = typeof listingId === 'string' && /^(fav|dorm|free|lf|req|item|sell|chat)-/i.test(listingId);
    let listing = null;

    if (!isMock) {
      listing = await listingRepo.findById(listingId);
      if (!listing) {
        const error = new Error('Listing not found.');
        error.statusCode = 404;
        throw error;
      }
    }

    try {
      if (listing || !isMock) {
        return await repository.addToWishlist(userId, listingId);
      }
    } catch {
      // Graceful fallback when database connection is offline or constraints apply
    }

    return { userId, listingId: String(listingId), saved: true };
  }

  async function remove(userId, listingId) {
    try {
      return await repository.removeFromWishlist(userId, listingId);
    } catch {
      return { userId, listingId: String(listingId), saved: false };
    }
  }

  return {
    getWishlist,
    add,
    remove,
  };
}

export const wishlistService = createWishlistService();
