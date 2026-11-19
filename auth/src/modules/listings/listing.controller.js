import { listingService } from './listing.service.js';
import { validateCreateListing, validateUpdateListing } from './listing.validator.js';
import { successResponse, errorResponse } from '../../utils/apiResponse.js';

export function createListingController(service = listingService) {
  async function getAll(req, res) {
    try {
      const userId = req.user?.id || null;
      const { listings, meta } = await service.getListings(req.query, userId);
      return successResponse(res, { listings }, 200, meta);
    } catch (error) {
      return errorResponse(res, error.message || 'Failed to fetch listings.', 500);
    }
  }

  async function getById(req, res) {
    try {
      const userId = req.user?.id || null;
      const listing = await service.getListingById(req.params.id, userId);
      return successResponse(res, { listing });
    } catch (error) {
      const status = error.statusCode || 500;
      return errorResponse(res, error.message || 'Failed to fetch listing.', status);
    }
  }

  async function create(req, res) {
    const validation = validateCreateListing(req.body);
    if (!validation.success) {
      return errorResponse(res, 'Validation failed.', 400, validation.error.flatten().fieldErrors);
    }

    try {
      const created = await service.createListing(req.user.id, validation.data);
      return successResponse(res, { listing: created }, 201);
    } catch (error) {
      const status = error.statusCode || 500;
      return errorResponse(res, error.message || 'Failed to create listing.', status);
    }
  }

  async function update(req, res) {
    const validation = validateUpdateListing(req.body);
    if (!validation.success) {
      return errorResponse(res, 'Validation failed.', 400, validation.error.flatten().fieldErrors);
    }

    try {
      const updated = await service.updateListing(
        req.params.id,
        req.user.id,
        req.user.role,
        validation.data
      );
      return successResponse(res, { listing: updated });
    } catch (error) {
      const status = error.statusCode || 500;
      return errorResponse(res, error.message || 'Failed to update listing.', status, null, error.code);
    }
  }

  async function remove(req, res) {
    try {
      const result = await service.deleteListing(req.params.id, req.user.id, req.user.role);
      return successResponse(res, result);
    } catch (error) {
      const status = error.statusCode || 500;
      return errorResponse(res, error.message || 'Failed to delete listing.', status, null, error.code);
    }
  }

  return {
    getAll,
    getById,
    create,
    update,
    remove,
  };
}

export const listingController = createListingController();
