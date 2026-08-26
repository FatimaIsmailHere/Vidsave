export type Platform = 'youtube' | 'instagram' | 'tiktok';

export interface MediaFormat {
  id: string;
  format: string; // 'MP4', 'WEBM', 'MP3', 'M4A'
  ext: string; // 'mp4', 'mp3', etc.
  type: 'video' | 'audio';
  quality?: string; // '1080p', '720p', '480p', '360p', '192 kbps'
  resolution?: string; // '1920x1080'
  mimeType?: string;
  fileSize?: number;
  fileSizeFormatted?: string;
  downloadable: boolean;
  note?: string;
  url?: string;
}

export interface MediaInfo {
  id: string;
  platform: Platform;
  url: string;
  title: string;
  description?: string;
  thumbnail?: string;
  duration?: number;
  durationFormatted?: string;
  author?: string;
  authorUrl?: string;
  likeCount?: number;
  viewCount?: number;
  uploadDate?: string;
  formats: MediaFormat[];
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

export interface PlatformDetectionResult {
  platform: Platform | null;
  isSupported: boolean;
  label?: string;
}
