export type Platform = 'youtube' | 'instagram' | 'tiktok';

export interface MediaFormat {
  id: string;
  format: string; // e.g. 'MP4', 'WEBM', 'MP3', 'M4A'
  ext: string; // 'mp4', 'webm', 'mp3', 'm4a'
  type: 'video' | 'audio';
  quality?: string; // '1080p', '720p', '480p', '360p', '320kbps', '128kbps'
  resolution?: string; // '1920x1080', '1280x720'
  mimeType?: string;
  fileSize?: number; // in bytes
  fileSizeFormatted?: string; // '14.2 MB'
  downloadable: boolean;
  note?: string;
  url?: string; // Direct progressive stream if available safely
}

export interface MediaInfo {
  id: string;
  platform: Platform;
  url: string;
  title: string;
  description?: string;
  thumbnail?: string;
  duration?: number; // in seconds
  durationFormatted?: string; // '03:42'
  author?: string;
  authorUrl?: string;
  likeCount?: number;
  viewCount?: number;
  uploadDate?: string;
  formats: MediaFormat[];
}

export interface PlatformDetectionResult {
  platform: Platform | null;
  isSupported: boolean;
  sanitizedUrl?: string;
  error?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export interface DownloadRequestPayload {
  url: string;
  formatId: string;
  platform: Platform;
  ext?: string;
}
