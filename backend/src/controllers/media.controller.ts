import { Request, Response } from 'express';
import { analyzeRequestSchema, downloadRequestSchema, validateSafeUrl } from '../validators/url.validator.js';
import { detectPlatform } from '../utils/platform.detector.js';
import { YouTubeService } from '../services/youtube.service.js';
import { InstagramService } from '../services/instagram.service.js';
import { TikTokService } from '../services/tiktok.service.js';
import { MediaProcessorService } from '../services/media-processor.service.js';
import { ApiResponse, MediaInfo } from '../types/media.types.js';

export class MediaController {
  public static async analyze(req: Request, res: Response): Promise<void> {
    try {
      const parsedBody = analyzeRequestSchema.safeParse(req.body);
      if (!parsedBody.success) {
        const response: ApiResponse = {
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: parsedBody.error.errors[0]?.message || 'Invalid request payload',
          },
        };
        res.status(400).json(response);
        return;
      }

      const { url } = parsedBody.data;
      const validation = validateSafeUrl(url);

      if (!validation.isValid || !validation.sanitizedUrl) {
        const response: ApiResponse = {
          success: false,
          error: {
            code: 'INVALID_URL',
            message: validation.error || 'Please enter a valid YouTube, Instagram, or TikTok URL.',
          },
        };
        res.status(400).json(response);
        return;
      }

      const detection = detectPlatform(validation.sanitizedUrl);
      if (!detection.isSupported || !detection.platform) {
        const response: ApiResponse = {
          success: false,
          error: {
            code: 'UNSUPPORTED_PLATFORM',
            message: 'This platform is not supported yet. Only YouTube, Instagram, and TikTok are supported.',
          },
        };
        res.status(400).json(response);
        return;
      }

      let mediaInfo: MediaInfo;

      switch (detection.platform) {
        case 'youtube':
          mediaInfo = await YouTubeService.analyze(validation.sanitizedUrl);
          break;
        case 'instagram':
          mediaInfo = await InstagramService.analyze(validation.sanitizedUrl);
          break;
        case 'tiktok':
          mediaInfo = await TikTokService.analyze(validation.sanitizedUrl);
          break;
        default:
          res.status(400).json({
            success: false,
            error: { code: 'UNSUPPORTED_PLATFORM', message: 'Unsupported platform' },
          });
          return;
      }

      const response: ApiResponse<MediaInfo> = {
        success: true,
        data: mediaInfo,
      };

      res.status(200).json(response);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze media';
      console.error('Analyze controller error:', errorMessage);

      let statusCode = 500;
      let errorCode = 'SERVER_ERROR';

      if (errorMessage.includes('private') || errorMessage.includes('restricted')) {
        statusCode = 403;
        errorCode = 'PRIVATE_CONTENT';
      } else if (errorMessage.includes('authentication') || errorMessage.includes('login')) {
        statusCode = 401;
        errorCode = 'AUTHENTICATION_REQUIRED';
      } else if (errorMessage.includes('DRM') || errorMessage.includes('protected')) {
        statusCode = 403;
        errorCode = 'DRM_PROTECTED';
      } else if (errorMessage.includes('unavailable') || errorMessage.includes('removed')) {
        statusCode = 404;
        errorCode = 'MEDIA_NOT_FOUND';
      }

      const response: ApiResponse = {
        success: false,
        error: {
          code: errorCode,
          message: errorMessage,
        },
      };

      res.status(statusCode).json(response);
    }
  }

  public static async download(req: Request, res: Response): Promise<void> {
    try {
      // Support both POST body and GET query for versatility
      const url = (req.body.url || req.query.url) as string;
      const formatId = (req.body.formatId || req.query.formatId) as string;
      const platform = (req.body.platform || req.query.platform) as string;
      const title = (req.body.title || req.query.title || 'media') as string;

      const parsedPayload = downloadRequestSchema.safeParse({ url, formatId, platform });
      if (!parsedPayload.success) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: parsedPayload.error.errors[0]?.message || 'Invalid download parameters',
          },
        });
        return;
      }

      const validation = validateSafeUrl(parsedPayload.data.url);
      if (!validation.isValid || !validation.sanitizedUrl) {
        res.status(400).json({
          success: false,
          error: { code: 'INVALID_URL', message: validation.error || 'Invalid media URL' },
        });
        return;
      }

      await MediaProcessorService.processAndStream(
        validation.sanitizedUrl,
        parsedPayload.data.formatId,
        parsedPayload.data.platform,
        title,
        res
      );
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Download processing failed';
      console.error('Download controller error:', errorMessage);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          error: { code: 'DOWNLOAD_FAILED', message: errorMessage },
        });
      }
    }
  }

  public static healthCheck(_req: Request, res: Response): void {
    res.status(200).json({
      success: true,
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        supportedPlatforms: ['youtube', 'instagram', 'tiktok'],
        service: 'OmniMedia Downloader API',
      },
    });
  }
}
