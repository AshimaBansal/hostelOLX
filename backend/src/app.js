import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import env from './config/env.js';
import routes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.corsOrigins,
    allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id'],
  }),
);
app.use(express.json({ limit: '100kb' }));
if (!env.isTest) app.use(morgan('dev'));

app.get('/', (_req, res) => {
  res.json({ success: true, message: 'HostelOLX API is running. See /api/health' });
});

app.use('/api', routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
