import * as wishlistService from '../services/wishlist.service.js';
import { sendSuccess } from '../utils/response.js';

export async function getMine(req, res) {
  sendSuccess(res, await wishlistService.getMine(req.user.id));
}

export async function add(req, res) {
  const { listingId } = req.valid.params;
  const { created } = await wishlistService.add(req.user.id, listingId);
  sendSuccess(res, { listingId, wishlisted: true }, created ? 201 : 200);
}

export async function remove(req, res) {
  await wishlistService.remove(req.user.id, req.valid.params.listingId);
  res.status(204).end();
}
