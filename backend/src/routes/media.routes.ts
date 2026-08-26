import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { MediaController } from '../controllers/media.controller.js';

export const mediaRouter = Router();

// Rate limiter for analyze: 30 requests per minute per IP
const analyzeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please wait a minute and try again.',
    },
  },
});

// Rate limiter for downloads: 15 downloads per minute per IP
const downloadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Download rate limit reached. Please wait a minute before downloading again.',
    },
  },
});

mediaRouter.post('/analyze', analyzeLimiter, MediaController.analyze);
mediaRouter.post('/download', downloadLimiter, MediaController.download);
mediaRouter.get('/download', downloadLimiter, MediaController.download);
mediaRouter.get('/health', MediaController.healthCheck);
