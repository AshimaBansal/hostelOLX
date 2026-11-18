import * as lostFoundService from '../services/lostFound.service.js';
import { sendSuccess } from '../utils/response.js';

export async function list(req, res) {
  const { data, meta } = await lostFoundService.list(req.valid.query, req.user?.id);
  sendSuccess(res, data, 200, meta);
}

export async function getById(req, res) {
  sendSuccess(res, await lostFoundService.getById(req.valid.params.id, req.user?.id));
}

export async function create(req, res) {
  sendSuccess(res, await lostFoundService.create(req.user.id, req.valid.body), 201);
}

export async function update(req, res) {
  sendSuccess(res, await lostFoundService.update(req.valid.params.id, req.user.id, req.valid.body));
}

export async function createClaim(req, res) {
  sendSuccess(res, await lostFoundService.createClaim(req.valid.params.id, req.user.id, req.valid.body), 201);
}

export async function getClaimsForItem(req, res) {
  sendSuccess(res, await lostFoundService.getClaimsForItem(req.valid.params.id, req.user.id));
}

export async function getMyClaims(req, res) {
  sendSuccess(res, await lostFoundService.getMyClaims(req.user.id));
}

export async function updateClaim(req, res) {
  sendSuccess(res, await lostFoundService.updateClaimStatus(req.valid.params.id, req.user.id, req.valid.body.status));
}
