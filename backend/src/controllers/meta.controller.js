import * as categoryService from '../services/category.service.js';
import * as handoverSpotService from '../services/handoverSpot.service.js';
import * as listingRepo from '../repositories/listing.repository.js';
import * as lostFoundRepo from '../repositories/lostFound.repository.js';
import { sendSuccess } from '../utils/response.js';

export async function getCategories(_req, res) {
  sendSuccess(res, await categoryService.getAll());
}

export async function getHandoverSpots(_req, res) {
  sendSuccess(res, await handoverSpotService.getAll());
}

export async function getHandoverSpot(req, res) {
  sendSuccess(res, await handoverSpotService.getById(req.valid.params.id));
}

// Small numbers for the homepage ("Campus Pulse")
export async function getStats(_req, res) {
  const [active, sold, openLostFound] = await Promise.all([
    listingRepo.findAll({ status: 'active' }),
    listingRepo.findAll({ status: 'sold' }),
    lostFoundRepo.findAll({ status: 'open' }),
  ]);

  sendSuccess(res, {
    activeListings: active.length,
    freeItems: active.filter((l) => l.price === 0).length,
    itemsSold: sold.length,
    openLostAndFound: openLostFound.length,
  });
}
