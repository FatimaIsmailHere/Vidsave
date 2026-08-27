import { Response } from 'express';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import ffmpegStatic from 'ffmpeg-static';
import { getYtDlpPath } from '../utils/ytdlp.runner.js';
import { sanitizeFilename } from '../utils/format.utils.js';
import { Platform } from '../types/media.types.js';

const TEMP_DIR = path.resolve(process.env.TEMP_STORAGE_PATH || './temp_media');

if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

function getFFmpegExecutable(): string | null {
  const candidates = [
    '/usr/bin/ffmpeg',
    '/usr/local/bin/ffmpeg',
    ffmpegStatic,
  ];

  for (const candidate of candidates) {
    if (candidate && fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return null;
}

export function cleanupStaleTempFiles(): void {
  try {
    const files = fs.readdirSync(TEMP_DIR);
    const now = Date.now();
    for (const file of files) {
      const filePath = path.join(TEMP_DIR, file);
      const stats = fs.statSync(filePath);
      if (now - stats.mtimeMs > 15 * 60 * 1000) {
        fs.unlinkSync(filePath);
      }
    }
  } catch (err) {
    console.error('Error during temp file cleanup:', err);
  }
}

export class MediaProcessorService {
  public static async processAndStream(
    url: string,
    formatId: string,
    platform: Platform,
    customTitle: string = 'media',
    res: Response
  ): Promise<void> {
    const isAudio = formatId.startsWith('audio');
    const rawFormatCode = formatId.replace(/^(video|audio)-/, '').trim();

    const fileExt = isAudio ? 'mp3' : 'mp4';
    const cleanBaseName = sanitizeFilename(customTitle) || 'SnapVid_Download';
    const tempFileId = `dl_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const outputTemplate = path.join(TEMP_DIR, `${tempFileId}.%(ext)s`);

    const ytPath = getYtDlpPath();
    const ffmpegBin = getFFmpegExecutable();

    const args: string[] = [
      '--no-playlist',
      '--no-warnings',
      '--ignore-errors',
      '--js-runtimes',
      'node',
      '--remote-components',
      'ejs:github',
    ];

    if (ffmpegBin) {
      args.push('--ffmpeg-location', ffmpegBin);
    }

    if (isAudio) {
      if (ffmpegBin) {
        args.push('-x', '--audio-format', 'mp3', '--audio-quality', '0');
      } else {
        args.push('-f', 'bestaudio/best');
      }
    } else if (platform === 'instagram' || platform === 'tiktok') {
      // Instagram & TikTok formats already contain audio; avoid merging non-existent separate audio tracks
      if (rawFormatCode && rawFormatCode !== 'best' && rawFormatCode !== 'hd') {
        args.push('-f', `${rawFormatCode}/best[ext=mp4]/best`);
      } else {
        args.push('-f', 'best[ext=mp4]/best');
      }
    } else {
      // YouTube video format handling
      const knownHeights = ['2160', '1440', '1080', '720', '480', '360', '240', '144'];
      
      if (knownHeights.includes(rawFormatCode)) {
        const height = parseInt(rawFormatCode, 10);
        args.push('-f', `best[height<=${height}][ext=mp4]/best[height<=${height}]/bestvideo[height<=${height}]+bestaudio/best`);
      } else if (rawFormatCode && rawFormatCode !== 'best' && rawFormatCode !== 'hd') {
        args.push('-f', `${rawFormatCode}/best[ext=mp4]/best`);
      } else {
        args.push('-f', 'best[ext=mp4]/bestvideo[ext=mp4]+bestaudio/best');
      }

      if (ffmpegBin) {
        args.push('--merge-output-format', 'mp4');
      }
    }

    args.push('-o', outputTemplate);
    args.push(url);

    // Spawn yt-dlp to download to temporary file
    const proc = spawn(ytPath, args);
    let stderr = '';

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    const timeout = setTimeout(() => {
      proc.kill('SIGTERM');
      const files = fs.readdirSync(TEMP_DIR).filter((f) => f.startsWith(tempFileId));
      for (const f of files) {
        try { fs.unlinkSync(path.join(TEMP_DIR, f)); } catch {}
      }
      if (!res.headersSent) {
        res.status(504).json({
          success: false,
          error: { code: 'DOWNLOAD_TIMEOUT', message: 'Download preparation timed out. Please try another format.' },
        });
      }
    }, 90000);

    proc.on('close', (code) => {
      clearTimeout(timeout);

      const matchingFiles = fs.readdirSync(TEMP_DIR).filter((f) => f.startsWith(tempFileId));

      if (matchingFiles.length === 0 || code !== 0) {
        console.error('yt-dlp download failed:', stderr);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            error: {
              code: 'DOWNLOAD_FAILED',
              message: 'Failed to process media file for download. Please try another format or URL.',
            },
          });
        }
        return;
      }

      const actualFilePath = path.join(TEMP_DIR, matchingFiles[0]);
      const stat = fs.statSync(actualFilePath);
      const downloadedExt = path.extname(actualFilePath).replace(/^\./, '').toLowerCase();
      const finalExt = downloadedExt || fileExt;
      const actualOutputFilename = `${cleanBaseName}.${finalExt}`;
      const encodedUtf8 = encodeURIComponent(actualOutputFilename);
      const mimeType = isAudio || finalExt === 'mp3' ? 'audio/mpeg' : 'video/mp4';

      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${actualOutputFilename}"; filename*=UTF-8''${encodedUtf8}`
      );
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Length', stat.size);

      const fileStream = fs.createReadStream(actualFilePath);
      fileStream.pipe(res);

      const cleanup = () => {
        try {
          if (fs.existsSync(actualFilePath)) {
            fs.unlinkSync(actualFilePath);
          }
        } catch (cleanupErr) {
          console.error('Failed to cleanup temp file:', cleanupErr);
        }
      };

      res.on('finish', cleanup);
      res.on('close', cleanup);
      fileStream.on('error', (err) => {
        console.error('Stream error:', err);
        cleanup();
      });
    });

    proc.on('error', (err) => {
      clearTimeout(timeout);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          error: { code: 'EXECUTION_ERROR', message: `Download execution error: ${err.message}` },
        });
      }
    });
  }
}
