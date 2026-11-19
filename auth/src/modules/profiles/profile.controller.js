import { profileService } from './profile.service.js';
import { validateUpdateProfile } from './profile.validator.js';
import { successResponse, errorResponse } from '../../utils/apiResponse.js';

export function createProfileController(service = profileService) {
  async function getMe(req, res) {
    try {
      const profile = await service.getProfile(req.user.id);
      return successResponse(res, { profile, user: profile });
    } catch (error) {
      const status = error.statusCode || 500;
      return errorResponse(res, error.message || 'Failed to fetch user profile.', status);
    }
  }

  async function updateMe(req, res) {
    const validation = validateUpdateProfile(req.body);
    if (!validation.success) {
      return errorResponse(res, 'Validation failed.', 400, validation.error.flatten().fieldErrors);
    }

    try {
      const updated = await service.updateProfile(req.user.id, validation.data);
      return successResponse(res, { profile: updated, user: updated });
    } catch (error) {
      const status = error.statusCode || 500;
      return errorResponse(res, error.message || 'Failed to update profile.', status);
    }
  }

  async function getById(req, res) {
    try {
      const profile = await service.getPublicProfile(req.params.id);
      return successResponse(res, { profile, user: profile });
    } catch (error) {
      const status = error.statusCode || 500;
      return errorResponse(res, error.message || 'User not found.', status);
    }
  }

  return {
    getMe,
    updateMe,
    getById,
  };
}

export const profileController = createProfileController();
