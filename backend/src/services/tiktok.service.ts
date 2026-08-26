import { MediaFormat, MediaInfo } from '../types/media.types.js';
import { executeYtDlpJson } from '../utils/ytdlp.runner.js';
import { formatBytes, formatDuration } from '../utils/format.utils.js';

export class TikTokService {
  public static async analyze(url: string): Promise<MediaInfo> {
    const raw = await executeYtDlpJson(url);

    if (raw._has_drm) {
      throw new Error('This TikTok media is protected and cannot be downloaded.');
    }

    const title = raw.title || raw.description?.substring(0, 60) || 'TikTok Video';
    const duration = raw.duration || 0;
    const author = raw.uploader || raw.channel || 'TikTok Creator';
    const authorUrl = raw.uploader_url;

    // Pick best thumbnail
    let thumbnail = raw.thumbnail;
    if (raw.thumbnails && raw.thumbnails.length > 0) {
      const sorted = [...raw.thumbnails].sort((a, b) => (b.width || 0) - (a.width || 0));
      thumbnail = sorted[0]?.url || thumbnail;
    }

    const formats: MediaFormat[] = [];

    if (raw.formats && Array.isArray(raw.formats)) {
      // Find best video format
      const bestVideo = raw.formats
        .filter((f) => f.vcodec !== 'none' || f.ext === 'mp4')
        .sort((a, b) => (b.height || 0) - (a.height || 0))[0];

      if (bestVideo) {
        const size = bestVideo.filesize || bestVideo.filesize_approx;
        const qualityLabel = bestVideo.height ? `${bestVideo.height}p HD` : 'HD (No Watermark)';
        formats.push({
          id: `video-${bestVideo.format_id || 'hd'}`,
          format: 'MP4',
          ext: 'mp4',
          type: 'video',
          quality: qualityLabel,
          resolution: bestVideo.resolution || (bestVideo.height ? `${bestVideo.height}p` : undefined),
          mimeType: 'video/mp4',
          fileSize: size,
          fileSizeFormatted: size ? formatBytes(size) : undefined,
          downloadable: true,
          note: 'HD MP4 Video',
        });
      }

      // Find audio format
      const audioFormat = raw.formats.find((f) => f.acodec && f.acodec !== 'none') || raw.formats[0];
      if (audioFormat) {
        const size = audioFormat.filesize || audioFormat.filesize_approx;
        formats.push({
          id: `audio-${audioFormat.format_id || 'sound'}`,
          format: 'MP3',
          ext: 'mp3',
          type: 'audio',
          quality: 'Original Sound',
          mimeType: 'audio/mpeg',
          fileSize: size,
          fileSizeFormatted: size ? formatBytes(size) : undefined,
          downloadable: true,
          note: 'Original Audio Track',
        });
      }
    }

    if (formats.length === 0) {
      formats.push({
        id: 'video-hd',
        format: 'MP4',
        ext: 'mp4',
        type: 'video',
        quality: 'HD Video',
        downloadable: true,
        note: 'Default Video Format',
      });
      formats.push({
        id: 'audio-mp3',
        format: 'MP3',
        ext: 'mp3',
        type: 'audio',
        quality: 'Original Audio',
        downloadable: true,
        note: 'Audio Only',
      });
    }

    return {
      id: raw.id || 'tt-media',
      platform: 'tiktok',
      url,
      title,
      description: raw.description?.substring(0, 200),
      thumbnail,
      duration,
      durationFormatted: formatDuration(duration),
      author,
      authorUrl,
      likeCount: raw.like_count,
      viewCount: raw.view_count,
      uploadDate: raw.upload_date,
      formats,
    };
  }
}
