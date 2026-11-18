import { Router } from 'express';
import * as lostFound from '../controllers/lostFound.controller.js';
import validate from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { idParam } from '../validators/common.js';
import { updateClaimBody } from '../validators/lostFound.validator.js';

const router = Router();

router.use(requireAuth);

router.get('/mine', lostFound.getMyClaims);
router.patch('/:id', validate({ params: idParam, body: updateClaimBody }), lostFound.updateClaim);

export default router;
