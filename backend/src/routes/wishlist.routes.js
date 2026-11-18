import { Router } from 'express';
import * as wishlist from '../controllers/wishlist.controller.js';
import validate from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { listingIdParam } from '../validators/wishlist.validator.js';

const router = Router();

router.use(requireAuth);

router.get('/', wishlist.getMine);
router.post('/:listingId', validate({ params: listingIdParam }), wishlist.add);
router.delete('/:listingId', validate({ params: listingIdParam }), wishlist.remove);

export default router;
