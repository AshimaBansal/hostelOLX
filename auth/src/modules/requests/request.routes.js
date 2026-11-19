import { Router } from 'express';
import { requestController } from './request.controller.js';
import { authenticate } from '../../auth.middleware.js';

const router = Router();

router.get('/', requestController.getAll);
router.get('/:id', requestController.getById);
router.post('/', authenticate, requestController.create);
router.patch('/:id', authenticate, requestController.update);
router.delete('/:id', authenticate, requestController.remove);

export default router;
