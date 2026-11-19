import { Router } from 'express';
import { listingController } from './listing.controller.js';
import { claimController } from '../claims/claim.controller.js';
import { authenticate, optionalAuthenticate } from '../../auth.middleware.js';

const router = Router();

router.get('/', optionalAuthenticate, listingController.getAll);
router.get('/:id', optionalAuthenticate, listingController.getById);
router.post('/', authenticate, listingController.create);
router.patch('/:id', authenticate, listingController.update);
router.delete('/:id', authenticate, listingController.remove);
router.post('/:id/claims', authenticate, claimController.submitListingClaim);

export default router;
