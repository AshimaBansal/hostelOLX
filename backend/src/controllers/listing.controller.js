import * as listingService from '../services/listing.service.js';
import { sendSuccess } from '../utils/response.js';

export async function list(req, res) {
  const { data, meta } = await listingService.list(req.valid.query, req.user?.id);
  sendSuccess(res, data, 200, meta);
}

export async function getById(req, res) {
  sendSuccess(res, await listingService.getById(req.valid.params.id, req.user?.id));
}

export async function create(req, res) {
  sendSuccess(res, await listingService.create(req.user.id, req.valid.body), 201);
}

export async function update(req, res) {
  sendSuccess(res, await listingService.update(req.valid.params.id, req.user.id, req.valid.body));
}

export async function updateStatus(req, res) {
  sendSuccess(res, await listingService.updateStatus(req.valid.params.id, req.user.id, req.valid.body.status));
}

export async function remove(req, res) {
  await listingService.remove(req.valid.params.id, req.user.id);
  res.status(204).end();
}
