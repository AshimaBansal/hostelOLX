import { Router } from 'express';
import * as lostFound from '../controllers/lostFound.controller.js';
import validate from '../middleware/validate.js';
import { optionalAuth, requireAuth } from '../middleware/auth.js';
import { idParam } from '../validators/common.js';
import {
  createClaimBody,
  createLostFoundBody,
  listLostFoundQuery,
  updateLostFoundBody,
} from '../validators/lostFound.validator.js';

const router = Router();

router.get('/', optionalAuth, validate({ query: listLostFoundQuery }), lostFound.list);
router.get('/:id', optionalAuth, validate({ params: idParam }), lostFound.getById);
router.post('/', requireAuth, validate({ body: createLostFoundBody }), lostFound.create);
router.patch('/:id', requireAuth, validate({ params: idParam, body: updateLostFoundBody }), lostFound.update);

router.post('/:id/claims', requireAuth, validate({ params: idParam, body: createClaimBody }), lostFound.createClaim);
router.get('/:id/claims', requireAuth, validate({ params: idParam }), lostFound.getClaimsForItem);

export default router;
