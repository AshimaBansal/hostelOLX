import { Router } from 'express';
import * as profiles from '../controllers/profile.controller.js';
import validate from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { updateProfileBody } from '../validators/profile.validator.js';

const router = Router();

router.get('/me', requireAuth, profiles.getMe);
router.patch('/me', requireAuth, validate({ body: updateProfileBody }), profiles.updateMe);
router.get('/:id', profiles.getPublic);

export default router;
