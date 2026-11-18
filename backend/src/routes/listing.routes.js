import { Router } from 'express';
import * as listings from '../controllers/listing.controller.js';
import validate from '../middleware/validate.js';
import { optionalAuth, requireAuth } from '../middleware/auth.js';
import { idParam } from '../validators/common.js';
import {
  createListingBody,
  listListingsQuery,
  updateListingBody,
  updateListingStatusBody,
} from '../validators/listing.validator.js';

const router = Router();

router.get('/', optionalAuth, validate({ query: listListingsQuery }), listings.list);
router.get('/:id', optionalAuth, validate({ params: idParam }), listings.getById);

router.post('/', requireAuth, validate({ body: createListingBody }), listings.create);
router.patch('/:id', requireAuth, validate({ params: idParam, body: updateListingBody }), listings.update);
router.patch('/:id/status', requireAuth, validate({ params: idParam, body: updateListingStatusBody }), listings.updateStatus);
router.delete('/:id', requireAuth, validate({ params: idParam }), listings.remove);

export default router;
