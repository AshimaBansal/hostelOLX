import { claimService } from './claim.service.js';
import { validateCreateClaim, validateUpdateClaimStatus } from './claim.validator.js';
import { successResponse, errorResponse } from '../../utils/apiResponse.js';

export function createClaimController(service = claimService) {
  async function getUserClaims(req, res) {
    try {
      const claims = await service.getUserClaims(req.user.id);
      return successResponse(res, { claims });
    } catch (error) {
      return errorResponse(res, error.message || 'Failed to fetch claims.', 500);
    }
  }

  async function getById(req, res) {
    try {
      const claim = await service.getClaimById(req.params.id, req.user.id, req.user.role);
      return successResponse(res, { claim });
    } catch (error) {
      const status = error.statusCode || 500;
      return errorResponse(res, error.message || 'Failed to fetch claim.', status, null, error.code);
    }
  }

  async function submitListingClaim(req, res) {
    const validation = validateCreateClaim(req.body);
    if (!validation.success) {
      return errorResponse(res, 'Validation failed.', 400, validation.error.flatten().fieldErrors);
    }

    try {
      const listingId = req.params.id || req.params.listingId || req.body.listingId;
      const claim = await service.submitClaim(listingId, req.user.id, validation.data);
      return successResponse(res, { claim }, 201);
    } catch (error) {
      const status = error.statusCode || 500;
      return errorResponse(res, error.message || 'Failed to submit claim.', status, null, error.code);
    }
  }

  async function updateStatus(req, res) {
    const validation = validateUpdateClaimStatus(req.body);
    if (!validation.success) {
      return errorResponse(res, 'Validation failed.', 400, validation.error.flatten().fieldErrors);
    }

    try {
      const updated = await service.updateClaimStatus(
        req.params.id,
        req.user.id,
        req.user.role,
        validation.data.status
      );
      return successResponse(res, { claim: updated });
    } catch (error) {
      const status = error.statusCode || 500;
      return errorResponse(res, error.message || 'Failed to update claim.', status, null, error.code);
    }
  }

  return {
    getUserClaims,
    getById,
    submitListingClaim,
    updateStatus,
  };
}

export const claimController = createClaimController();
