import { Response } from 'express';
import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import fs from 'fs';
import ffmpegStatic from 'ffmpeg-static';
import { getYtDlpPath, buildYtDlpBaseArgs } from '../utils/ytdlp.runner.js';
import { sanitizeFilename } from '../utils/format.utils.js';
import { Platform } from '../types/media.types.js';

/** Player clients to try when YouTube blocks the default extraction. */
const YT_PLAYER_CLIENTS = ['mweb', 'tv'];

/** Check if stderr indicates YouTube rate-limiting / bot detection. */
function isYouTubeBlocked(stderr: string): boolean {
  const lower = stderr.toLowerCase();
  return lower.includes('sign in to confirm') || lower.includes('bot') || lower.includes('blocked');
}

/** Spawn yt-dlp with the given args and resolve/reject on completion. */
function runYtDlp(ytPath: string, args: string[], timeoutMs: number): Promise<{ code: number | null; stderr: string }> {
  return new Promise((resolve) => {
    const proc: ChildProcess = spawn(ytPath, args);
    let stderr = '';

    proc.stderr?.on('data', (data) => { stderr += data.toString(); });

    const timer = setTimeout(() => {
      proc.kill('SIGTERM');
      resolve({ code: -1, stderr: 'timeout' });
    }, timeoutMs);

    proc.on('close', (code) => {
      clearTimeout(timer);
      resolve({ code, stderr });
    });

    proc.on('error', (err) => {
      clearTimeout(timer);
      resolve({ code: -1, stderr: err.message });
    });
  });
}

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

    const args: string[] = buildYtDlpBaseArgs();

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

    const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
    const timeoutMs = 90000;

    // Helper: clean up temp files for this download
    const cleanupTemp = () => {
      const files = fs.readdirSync(TEMP_DIR).filter((f) => f.startsWith(tempFileId));
      for (const f of files) {
        try { fs.unlinkSync(path.join(TEMP_DIR, f)); } catch {}
      }
    };

    // --- Download with retry for YouTube ---
    // yt-dlp may fail on the first attempt if YouTube blocks the default player client.
    // We retry with alternative player clients (mweb, tv) before giving up.
    let lastStderr = '';
    let downloadSucceeded = false;

    const clientAttempts = isYouTube ? [null, ...YT_PLAYER_CLIENTS] : [null];

    for (const client of clientAttempts) {
      // Build per-attempt args: clone base args and add player_client override if needed
      const attemptArgs = [...args];
      if (client) {
        // Insert player_client override before the URL arg (last two entries: -o and url)
        attemptArgs.splice(attemptArgs.length - 2, 0,
          '--extractor-args', `youtube:player_client=${client}`
        );
        console.log(`yt-dlp download retry: player_client=${client}`);
      }

      const result = await runYtDlp(ytPath, attemptArgs, timeoutMs);
      lastStderr = result.stderr;

      // Check if files were produced
      const matchingFiles = fs.readdirSync(TEMP_DIR).filter((f) => f.startsWith(tempFileId));
      const success = matchingFiles.length > 0 && result.code === 0;

      if (success) {
        downloadSucceeded = true;

        // Stream the file to the response
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

        break; // success — exit retry loop
      }

      // Attempt failed — clean up temp files before retry
      cleanupTemp();

      // If not YouTube, no point retrying with player clients
      if (!isYouTube) break;

      // If blocked, continue to next player client; otherwise break early
      if (!isYouTubeBlocked(result.stderr)) break;
    }

    // All attempts exhausted — return error
    if (!downloadSucceeded && !res.headersSent) {
      console.error('yt-dlp download failed:', lastStderr);
      let errorMessage = 'Failed to process media file for download. Please try another format or URL.';
      let errorCode = 'DOWNLOAD_FAILED';

      if (isYouTube) {
        if (isYouTubeBlocked(lastStderr)) {
          errorMessage = 'YouTube is temporarily blocking downloads from this server. Please try again in a few minutes or try a different video.';
          errorCode = 'YOUTUBE_RATE_LIMITED';
        } else {
          errorMessage = 'YouTube download failed. This may be a temporary issue — please try again or try a different format.';
          errorCode = 'YOUTUBE_FAILED';
        }
      }

      res.status(500).json({
        success: false,
        error: { code: errorCode, message: errorMessage },
      });
    }
  }
}
