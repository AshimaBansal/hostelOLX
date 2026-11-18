import { Router } from 'express';
import metaRoutes from './meta.routes.js';
import listingRoutes from './listing.routes.js';
import wishlistRoutes from './wishlist.routes.js';
import chatRoutes from './chat.routes.js';
import lostFoundRoutes from './lostFound.routes.js';
import claimRoutes from './claim.routes.js';
import profileRoutes from './profile.routes.js';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ success: true, status: 'ok', uptime: Math.round(process.uptime()) });
});

router.use('/', metaRoutes);
router.use('/listings', listingRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/conversations', chatRoutes);
router.use('/lost-found', lostFoundRoutes);
router.use('/claims', claimRoutes);
router.use('/profiles', profileRoutes);

export default router;
