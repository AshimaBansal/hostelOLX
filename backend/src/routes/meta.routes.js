import { Router } from 'express';
import * as meta from '../controllers/meta.controller.js';
import validate from '../middleware/validate.js';
import { idParam } from '../validators/common.js';

const router = Router();

router.get('/categories', meta.getCategories);
router.get('/handover-spots', meta.getHandoverSpots);
router.get('/handover-spots/:id', validate({ params: idParam }), meta.getHandoverSpot);
router.get('/stats', meta.getStats);

export default router;
