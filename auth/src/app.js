import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import env from './config/env.js';
import authRoutes from './routes/auth.routes.js';

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  })
);

app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());
app.use('/api/auth', authRoutes);

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
