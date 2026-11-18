import * as spotRepo from '../repositories/handoverSpot.repository.js';
import ApiError from '../utils/ApiError.js';

export async function getAll() {
  return spotRepo.findAllActive();
}

export async function getById(id) {
  const spot = await spotRepo.findById(id);
  if (!spot || spot.isActive === false) throw ApiError.notFound('Handover spot');
  return spot;
}
