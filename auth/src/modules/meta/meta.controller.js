import { metaRepository } from './meta.repository.js';
import { successResponse, errorResponse } from '../../utils/apiResponse.js';

export function createMetaController(repository = metaRepository) {
  async function getCategories(_req, res) {
    try {
      const categories = await repository.findCategories();
      return successResponse(res, { categories });
    } catch (error) {
      return errorResponse(res, error.message || 'Failed to fetch categories.', 500);
    }
  }

  async function getHandoverSpots(_req, res) {
    try {
      const spots = await repository.findHandoverSpots();
      return successResponse(res, { handoverSpots: spots, spots });
    } catch (error) {
      return errorResponse(res, error.message || 'Failed to fetch handover spots.', 500);
    }
  }

  async function getStats(_req, res) {
    try {
      const stats = await repository.getCampusStats();
      return successResponse(res, { stats });
    } catch (error) {
      return errorResponse(res, error.message || 'Failed to fetch campus stats.', 500);
    }
  }

  return {
    getCategories,
    getHandoverSpots,
    getStats,
  };
}

export const metaController = createMetaController();
