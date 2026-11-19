import { listingRepository } from './listing.repository.js';

function formatListingOutput(listing) {
  if (!listing) return null;

  const images = Array.isArray(listing.images) ? listing.images : [];
  const primaryImage = images[0] || '/images/arc_lamp.png';

  let section = 'essentials';
  const type = (listing.listingType || '').toLowerCase();
  if (type === 'giveaway' || type === 'free' || Number(listing.price) === 0) {
    if (type === 'lost-found' || type === 'lost_found') {
      section = 'lost-found';
    } else {
      section = 'free';
    }
  } else if (listing.isFeatured) {
    section = 'favorites';
  }

  const sellerHostel = listing.sellerHostel || 'Hostel 1';
  const sellerRoom = listing.sellerRoom || '';
  const sellerProgram = listing.sellerProgram || 'Student';
  const sellerRole = sellerRoom ? `${sellerRoom} • ${sellerProgram}` : sellerProgram;

  return {
    ...listing,
    id: String(listing.id),
    price: Number(listing.price),
    originalPrice: listing.originalPrice !== null ? Number(listing.originalPrice) : null,
    images,
    image: primaryImage,
    section,
    seller: listing.sellerName || 'Student',
    sellerRole,
    location: listing.location || sellerHostel,
    condition: listing.condition || 'Good',
  };
}

export function createListingService(repository = listingRepository) {
  async function getListings(filters = {}, userId = null) {
    const { rows, meta } = await repository.findAll(filters, userId);
    return {
      listings: rows.map(formatListingOutput),
      meta,
    };
  }

  async function getListingById(id, userId = null) {
    const listing = await repository.findById(id, userId);
    if (!listing) {
      const error = new Error('Listing not found.');
      error.statusCode = 404;
      throw error;
    }
    return formatListingOutput(listing);
  }

  async function createListing(sellerId, input) {
    let categoryId = input.categoryId;

    if (!categoryId && input.category) {
      const cat = await repository.findCategoryBySlugOrName(input.category);
      if (cat) {
        categoryId = cat.id;
      }
    }

    const images = Array.isArray(input.images) && input.images.length > 0
      ? input.images
      : input.image
      ? [input.image]
      : [];

    const listingType = input.type || input.listingType || 'sale';
    const itemCondition = input.condition || input.itemCondition || 'good';
    const locationText = input.locationText || input.location || 'Hostel 1';

    const created = await repository.createListing({
      sellerId,
      categoryId: categoryId ? Number(categoryId) : null,
      title: input.title,
      description: input.description,
      price: input.price,
      originalPrice: input.originalPrice ?? null,
      listingType,
      itemCondition,
      locationText,
      isFeatured: input.isFeatured ?? false,
      images,
    });

    return formatListingOutput(created);
  }

  async function updateListing(id, userId, userRole, input) {
    const existing = await repository.findById(id);
    if (!existing) {
      const error = new Error('Listing not found.');
      error.statusCode = 404;
      throw error;
    }

    if (existing.sellerId !== userId && userRole !== 'ADMIN') {
      const error = new Error('You are not authorized to update this listing.');
      error.statusCode = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    let categoryId = input.categoryId;
    if (categoryId === undefined && input.category) {
      const cat = await repository.findCategoryBySlugOrName(input.category);
      if (cat) {
        categoryId = cat.id;
      }
    }

    const updates = {};
    if (input.title !== undefined) updates.title = input.title;
    if (input.description !== undefined) updates.description = input.description;
    if (input.price !== undefined) updates.price = input.price;
    if (input.originalPrice !== undefined) updates.originalPrice = input.originalPrice;
    if (input.type !== undefined || input.listingType !== undefined) {
      updates.listingType = input.type || input.listingType;
    }
    if (input.condition !== undefined || input.itemCondition !== undefined) {
      updates.itemCondition = input.condition || input.itemCondition;
    }
    if (input.status !== undefined) updates.status = input.status;
    if (input.locationText !== undefined || input.location !== undefined) {
      updates.locationText = input.locationText || input.location;
    }
    if (categoryId !== undefined) updates.categoryId = categoryId ? Number(categoryId) : null;
    if (input.isFeatured !== undefined) updates.isFeatured = input.isFeatured;

    const images = Array.isArray(input.images)
      ? input.images
      : input.image
      ? [input.image]
      : undefined;

    const updated = await repository.updateListing(id, updates, images);
    return formatListingOutput(updated);
  }

  async function deleteListing(id, userId, userRole) {
    const existing = await repository.findById(id);
    if (!existing) {
      const error = new Error('Listing not found.');
      error.statusCode = 404;
      throw error;
    }

    if (existing.sellerId !== userId && userRole !== 'ADMIN') {
      const error = new Error('You are not authorized to delete this listing.');
      error.statusCode = 403;
      error.code = 'FORBIDDEN';
      throw error;
    }

    await repository.deleteListing(id);
    return { id: String(id), status: 'removed' };
  }

  return {
    getListings,
    getListingById,
    createListing,
    updateListing,
    deleteListing,
  };
}

export const listingService = createListingService();
