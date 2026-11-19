import { Router } from 'express';
import { reportController } from './report.controller.js';
import { authenticate, requireAdmin } from '../../auth.middleware.js';

const router = Router();

router.post('/', authenticate, reportController.submit);
router.get('/', authenticate, requireAdmin, reportController.getAdminReports);
router.patch('/:id', authenticate, requireAdmin, reportController.updateAdminReport);

export default router;
