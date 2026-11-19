import { Router } from 'express';
import { wishlistController } from './wishlist.controller.js';
import { authenticate } from '../../auth.middleware.js';

const router = Router();

router.get('/', authenticate, wishlistController.getWishlist);
router.post('/:listingId', authenticate, wishlistController.add);
router.delete('/:listingId', authenticate, wishlistController.remove);

export default router;
