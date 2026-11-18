import * as profileService from '../services/profile.service.js';
import { sendSuccess } from '../utils/response.js';

export async function getMe(req, res) {
  sendSuccess(res, await profileService.getMe(req.user.id));
}

export async function updateMe(req, res) {
  sendSuccess(res, await profileService.updateMe(req.user.id, req.valid.body));
}

export async function getPublic(req, res) {
  sendSuccess(res, await profileService.getPublicProfile(req.params.id));
}
