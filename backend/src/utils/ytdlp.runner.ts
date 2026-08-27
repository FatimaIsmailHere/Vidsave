import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

let cachedYtDlpPath: string | null = null;

export function getYtDlpPath(): string {
  if (cachedYtDlpPath) return cachedYtDlpPath;

  if (process.env.YT_DLP_PATH && fs.existsSync(process.env.YT_DLP_PATH)) {
    cachedYtDlpPath = process.env.YT_DLP_PATH;
    return cachedYtDlpPath;
  }

  const commonPaths = [
    'yt-dlp',
    'yt-dlp.exe',
    'C:\\Users\\Admin\\AppData\\Roaming\\Python\\Python313\\Scripts\\yt-dlp.exe',
    path.join(process.env.APPDATA || '', 'Python', 'Python313', 'Scripts', 'yt-dlp.exe'),
    path.join(process.env.APPDATA || '', 'Python', 'Python312', 'Scripts', 'yt-dlp.exe'),
    path.join(process.env.APPDATA || '', 'Python', 'Python311', 'Scripts', 'yt-dlp.exe'),
    '/usr/local/bin/yt-dlp',
    '/usr/bin/yt-dlp',
  ];

  for (const candidate of commonPaths) {
    if (candidate === 'yt-dlp' || candidate === 'yt-dlp.exe') {
      cachedYtDlpPath = candidate;
      return candidate;
    }
    if (fs.existsSync(candidate)) {
      cachedYtDlpPath = candidate;
      return candidate;
    }
  }

  cachedYtDlpPath = 'yt-dlp';
  return cachedYtDlpPath;
}

export interface YtDlpRawFormat {
  format_id: string;
  format_note?: string;
  ext: string;
  resolution?: string;
  width?: number;
  height?: number;
  fps?: number;
  filesize?: number;
  filesize_approx?: number;
  vcodec?: string;
  acodec?: string;
  abr?: number;
  vbr?: number;
  tbr?: number;
  url?: string;
  has_drm?: boolean;
  protocol?: string;
}

export interface YtDlpRawMetadata {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  thumbnails?: Array<{ url: string; width?: number; height?: number }>;
  duration?: number;
  duration_string?: string;
  uploader?: string;
  uploader_url?: string;
  channel?: string;
  like_count?: number;
  view_count?: number;
  upload_date?: string;
  formats?: YtDlpRawFormat[];
  url?: string;
  extractor?: string;
  _has_drm?: boolean;
}

/** Build common yt-dlp base args shared by analysis and download. */
export function buildYtDlpBaseArgs(): string[] {
  const args: string[] = [
    '--no-playlist',
    '--no-warnings',
    '--ignore-errors',
    '--js-runtimes',
    'node',
    '--remote-components',
    'ejs:github',
  ];
  const proxy = process.env.YTDLP_PROXY;
  if (proxy) {
    args.push('--proxy', proxy);
  }
  return args;
}

/** Player clients to try in order when YouTube blocks the default extraction. */
const YT_PLAYER_CLIENTS = ['web', 'mweb', 'tv'];

function extractCurrentClient(stderr: string): string | null {
  const match = stderr.match(/player_client=(\w+)/);
  return match ? match[1] : null;
}

function getNextPlayerClient(current: string | null): string | null {
  const idx = current ? YT_PLAYER_CLIENTS.indexOf(current) : -1;
  const next = idx + 1;
  return next < YT_PLAYER_CLIENTS.length ? YT_PLAYER_CLIENTS[next] : null;
}

function retryWithClient(ytPath: string, url: string, client: string): Promise<YtDlpRawMetadata> {
  return new Promise((resolve, reject) => {
    const args = [
      '--dump-json',
      ...buildYtDlpBaseArgs(),
      '--extractor-args',
      `youtube:player_client=${client}`,
      url,
    ];

    const proc = spawn(ytPath, args);
    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data: Buffer) => { stdout += data.toString(); });
    proc.stderr.on('data', (data: Buffer) => { stderr += data.toString(); });

    const timeout = setTimeout(() => {
      proc.kill('SIGTERM');
      reject(new Error('Retry timed out. Please try again later.'));
    }, 30000);

    proc.on('close', () => {
      clearTimeout(timeout);
      if (stdout.trim()) {
        const lines = stdout.trim().split(/\r?\n/);
        for (let i = lines.length - 1; i >= 0; i--) {
          const line = lines[i].trim();
          if (line.startsWith('{') && line.endsWith('}')) {
            try {
              const parsed = JSON.parse(line);
              if (parsed && (parsed.id || parsed.title || parsed.formats)) {
                return resolve(parsed);
              }
            } catch {}
          }
        }
      }
      reject(new Error('YouTube is blocking this request. Please try again in a few minutes.'));
    });

    proc.on('error', (err: Error) => {
      clearTimeout(timeout);
      reject(new Error(`Retry failed: ${err.message}`));
    });
  });
}

export function executeYtDlpJson(url: string): Promise<YtDlpRawMetadata> {
  return new Promise((resolve, reject) => {
    const ytPath = getYtDlpPath();
    const args = [
      '--dump-json',
      ...buildYtDlpBaseArgs(),
      url,
    ];

    const proc = spawn(ytPath, args);
    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    const timeout = setTimeout(() => {
      proc.kill('SIGTERM');
      reject(new Error('Media analysis request timed out. Please try again.'));
    }, 30000);

    proc.on('close', (code) => {
      clearTimeout(timeout);

      // Try to parse valid JSON from stdout (search line by line if needed)
      if (stdout.trim()) {
        const lines = stdout.trim().split(/\r?\n/);
        for (let i = lines.length - 1; i >= 0; i--) {
          const line = lines[i].trim();
          if (line.startsWith('{') && line.endsWith('}')) {
            try {
              const parsed = JSON.parse(line);
              if (parsed && (parsed.id || parsed.title || parsed.formats)) {
                return resolve(parsed);
              }
            } catch {}
          }
        }

        // Try parsing full stdout
        try {
          const parsed = JSON.parse(stdout.trim());
          return resolve(parsed);
        } catch {}
      }

      // If we couldn't parse stdout, inspect stderr for genuine failure reasons
      const errorLower = stderr.toLowerCase();
      console.error('yt-dlp stderr:', stderr.substring(0, 2000));
      if (errorLower.includes('private') || errorLower.includes('members only') || errorLower.includes('restricted video')) {
        return reject(new Error('This content cannot be accessed because it is private or restricted.'));
      }
      if (errorLower.includes('drm') || errorLower.includes('protected') || errorLower.includes('copyright')) {
        return reject(new Error('This content is protected by DRM or copyright and cannot be downloaded.'));
      }
      if (errorLower.includes('not found') || errorLower.includes('404') || errorLower.includes('unavailable') || errorLower.includes('this video has been removed')) {
        return reject(new Error('This content is unavailable or has been removed.'));
      }
      if (errorLower.includes('age-restricted') || errorLower.includes('sign in to confirm your age')) {
        return reject(new Error('This content is age-restricted and requires account authentication.'));
      }
      if (errorLower.includes('empty media response') || errorLower.includes('require_login') || errorLower.includes('login')) {
        return reject(new Error('Instagram requires login authentication to access this specific media.'));
      }
      if (errorLower.includes('no supported javascript runtime') || errorLower.includes('js runtime') || errorLower.includes('ejs')) {
        return reject(new Error('YouTube requires a JavaScript runtime. Please ensure yt-dlp-ejs and Node.js are installed.'));
      }
      if (errorLower.includes('sign in to confirm') || errorLower.includes('bot')) {
        // YouTube is blocking — retry with a different player client if available
        const currentClient = extractCurrentClient(stderr);
        const nextClient = getNextPlayerClient(currentClient);
        if (nextClient) {
          console.log(`yt-dlp blocked with client=${currentClient || 'default'}, retrying with client=${nextClient}`);
          return resolve(retryWithClient(ytPath, url, nextClient));
        }
        return reject(new Error('YouTube is blocking this request. The server IP may be rate-limited by YouTube.'));
      }

      // Generic failure — also try next client
      const currentClient = extractCurrentClient(stderr);
      const nextClient = getNextPlayerClient(currentClient);
      if (nextClient) {
        console.log(`yt-dlp extraction failed, retrying with client=${nextClient}`);
        return resolve(retryWithClient(ytPath, url, nextClient));
      }

      return reject(new Error('We could not process this URL right now. Please verify the link and try again.'));
    });

    proc.on('error', (err) => {
      clearTimeout(timeout);
      reject(new Error(`Extraction process failed: ${err.message}`));
    });
  });
}
