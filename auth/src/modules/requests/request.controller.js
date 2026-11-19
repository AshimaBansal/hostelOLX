import { requestService } from './request.service.js';
import { validateCreateRequest, validateUpdateRequest } from './request.validator.js';
import { successResponse, errorResponse } from '../../utils/apiResponse.js';

export function createRequestController(service = requestService) {
  async function getAll(req, res) {
    try {
      const { requests, meta } = await service.getAll(req.query);
      return successResponse(res, { requests, items: requests }, 200, meta);
    } catch (error) {
      return errorResponse(res, error.message || 'Failed to fetch requests.', 500);
    }
  }

  async function getById(req, res) {
    try {
      const request = await service.getById(req.params.id);
      return successResponse(res, { request });
    } catch (error) {
      const status = error.statusCode || 500;
      return errorResponse(res, error.message || 'Failed to fetch request.', status);
    }
  }

  async function create(req, res) {
    const validation = validateCreateRequest(req.body);
    if (!validation.success) {
      return errorResponse(res, 'Validation failed.', 400, validation.error.flatten().fieldErrors);
    }

    try {
      const created = await service.create(req.user.id, validation.data);
      return successResponse(res, { request: created }, 201);
    } catch (error) {
      const status = error.statusCode || 500;
      return errorResponse(res, error.message || 'Failed to create request.', status);
    }
  }

  async function update(req, res) {
    const validation = validateUpdateRequest(req.body);
    if (!validation.success) {
      return errorResponse(res, 'Validation failed.', 400, validation.error.flatten().fieldErrors);
    }

    try {
      const updated = await service.update(
        req.params.id,
        req.user.id,
        req.user.role,
        validation.data
      );
      return successResponse(res, { request: updated });
    } catch (error) {
      const status = error.statusCode || 500;
      return errorResponse(res, error.message || 'Failed to update request.', status, null, error.code);
    }
  }

  async function remove(req, res) {
    try {
      const result = await service.remove(req.params.id, req.user.id, req.user.role);
      return successResponse(res, result);
    } catch (error) {
      const status = error.statusCode || 500;
      return errorResponse(res, error.message || 'Failed to delete request.', status, null, error.code);
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

export const requestController = createRequestController();
