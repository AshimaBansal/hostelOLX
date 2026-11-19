import { Router } from 'express';
import { profileController } from './profile.controller.js';
import { authenticate } from '../../auth.middleware.js';

const router = Router();

router.get('/me', authenticate, profileController.getMe);
router.patch('/me', authenticate, profileController.updateMe);
router.get('/:id', profileController.getById);

export default router;
