import { Router } from 'express';
import { chatController } from './chat.controller.js';
import { authenticate } from '../../auth.middleware.js';

const router = Router();

router.get('/', authenticate, chatController.getConversations);
router.post('/', authenticate, chatController.startChat);
router.get('/:id/messages', authenticate, chatController.getMessages);
router.post('/:id/messages', authenticate, chatController.sendMessage);
router.patch('/:id/read', authenticate, chatController.markRead);

export default router;
