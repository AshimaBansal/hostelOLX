import { wishlistRepository } from './wishlist.repository.js';
import { listingRepository } from '../listings/listing.repository.js';

export function createWishlistService(
  repository = wishlistRepository,
  listingRepo = listingRepository
) {
  async function getWishlist(userId) {
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
  }

  async function add(userId, listingId) {
    const listing = await listingRepo.findById(listingId);
    if (!listing) {
      const error = new Error('Listing not found.');
      error.statusCode = 404;
      throw error;
    }
    return repository.addToWishlist(userId, listingId);
  }

  async function remove(userId, listingId) {
    return repository.removeFromWishlist(userId, listingId);
  }

  return {
    getWishlist,
    add,
    remove,
  };
}

export const wishlistService = createWishlistService();
