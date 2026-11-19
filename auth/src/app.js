import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'node:path';

import authRoutes from './auth.routes.js';
import profileRoutes from './modules/profiles/profile.routes.js';
import listingRoutes from './modules/listings/listing.routes.js';
import wishlistRoutes from './modules/wishlist/wishlist.routes.js';
import requestRoutes from './modules/requests/request.routes.js';
import chatRoutes from './modules/chats/chat.routes.js';
import claimRoutes from './modules/claims/claim.routes.js';
import reportRoutes from './modules/reports/report.routes.js';
import metaRoutes from './modules/meta/meta.routes.js';
import uploadRoutes from './modules/upload/upload.routes.js';
import env from './env.js';

const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/users', profileRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/conversations', chatRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin/reports', reportRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api', metaRoutes);

app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: 'HostelOLX Auth Service is running',
  });
});

app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    service: 'hostelolx-auth',
    status: 'healthy',
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

export default app;
