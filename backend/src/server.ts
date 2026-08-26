import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { mediaRouter } from './routes/media.routes.js';
import { cleanupStaleTempFiles } from './services/media-processor.service.js';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

// Immediate health check routes for cloud load balancers (Railway, Render, AWS)
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', time: new Date().toISOString() });
});

app.get('/api/health', (_req, res) => {
  res.status(200).json({ status: 'ok', time: new Date().toISOString() });
});

app.get('/', (_req, res) => {
  res.status(200).json({
    name: 'SnapVid Downloader API',
    status: 'online',
    version: '1.0.0',
    endpoints: {
      analyze: 'POST /api/media/analyze',
      download: 'POST|GET /api/media/download',
      health: 'GET /api/health',
    },
  });
});

// Security and middleware
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(
  cors({
    origin: CORS_ORIGIN === '*' ? true : CORS_ORIGIN.split(','),
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Initial cleanup of any stale temp media
cleanupStaleTempFiles();
// Recurring cleanup every 10 minutes
setInterval(cleanupStaleTempFiles, 10 * 60 * 1000);

// API routes
app.use('/api/media', mediaRouter);
app.use('/api', mediaRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'The requested endpoint does not exist.',
    },
  });
});

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected internal server error occurred.',
    },
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 SnapVid Backend API listening on 0.0.0.0:${PORT}`);
});
