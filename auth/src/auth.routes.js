
import express from 'express';
import { authController } from './auth.controller.js';
import { authenticate } from './auth.middleware.js';

const router = express.Router();

router.post('/register', authController.register);
router.post('/google', authController.googleLogin);
router.get('/me', authenticate, authController.me);

export default router;
