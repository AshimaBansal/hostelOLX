import * as categoryRepo from '../repositories/category.repository.js';
import * as listingRepo from '../repositories/listing.repository.js';
import ApiError from '../utils/ApiError.js';

export async function getAll() {
  const [categories, activeListings] = await Promise.all([
    categoryRepo.findAll(),
    listingRepo.findAll({ status: 'active' }),
  ]);

  return categories.map((category) => ({
    ...category,
    listingCount: activeListings.filter((l) => l.categoryId === category.id).length,
  }));
}

export async function getBySlugOrFail(slug) {
  const category = await categoryRepo.findBySlug(slug);
  if (!category) {
    throw ApiError.badRequest(`Unknown category "${slug}"`);
  }
  return category;
}
