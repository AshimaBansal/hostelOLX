import { wishlistService } from './wishlist.service.js';
import { successResponse, errorResponse } from '../../utils/apiResponse.js';

export function createWishlistController(service = wishlistService) {
  async function getWishlist(req, res) {
    try {
      const items = await service.getWishlist(req.user.id);
      return successResponse(res, { wishlist: items, items });
    } catch (error) {
      return errorResponse(res, error.message || 'Failed to fetch wishlist.', 500);
    }
  }

  async function add(req, res) {
    try {
      const result = await service.add(req.user.id, req.params.listingId);
      return successResponse(res, result, 201);
    } catch (error) {
      const status = error.statusCode || 500;
      return errorResponse(res, error.message || 'Failed to add item to wishlist.', status);
    }
  }

  async function remove(req, res) {
    try {
      const result = await service.remove(req.user.id, req.params.listingId);
      return successResponse(res, result);
    } catch (error) {
      const status = error.statusCode || 500;
      return errorResponse(res, error.message || 'Failed to remove item from wishlist.', status);
    }
  }

  return {
    getWishlist,
    add,
    remove,
  };
}

export const wishlistController = createWishlistController();
