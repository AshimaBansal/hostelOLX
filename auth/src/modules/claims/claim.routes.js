import { Router } from 'express';
import { claimController } from './claim.controller.js';
import { authenticate } from '../../auth.middleware.js';

const router = Router();

router.get('/', authenticate, claimController.getUserClaims);
router.get('/:id', authenticate, claimController.getById);
router.post('/', authenticate, claimController.submitListingClaim);
router.patch('/:id', authenticate, claimController.updateStatus);

export default router;
