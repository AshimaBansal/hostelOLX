import { Router } from 'express';
import * as chat from '../controllers/chat.controller.js';
import validate from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { idParam } from '../validators/common.js';
import { sendMessageBody, startConversationBody } from '../validators/chat.validator.js';

const router = Router();

router.use(requireAuth);

router.get('/', chat.getMine);
router.get('/unread-count', chat.getUnreadCount);
router.post('/', validate({ body: startConversationBody }), chat.start);
router.get('/:id', validate({ params: idParam }), chat.getOne);
router.get('/:id/messages', validate({ params: idParam }), chat.getMessages);
router.post('/:id/messages', validate({ params: idParam, body: sendMessageBody }), chat.sendMessage);
router.patch('/:id/read', validate({ params: idParam }), chat.markRead);

export default router;
