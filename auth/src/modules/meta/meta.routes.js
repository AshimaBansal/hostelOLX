import { Router } from 'express';
import { metaController } from './meta.controller.js';

const router = Router();

router.get('/categories', metaController.getCategories);
router.get('/handover-spots', metaController.getHandoverSpots);
router.get('/stats', metaController.getStats);

export default router;
