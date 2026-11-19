import { Router } from 'express';
import { uploadController } from './upload.controller.js';
import { authenticate } from '../../auth.middleware.js';

const router = Router();

router.post('/', authenticate, uploadController.upload);

export default router;
