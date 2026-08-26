import { MediaFormat, MediaInfo } from '../types/media.types.js';
import { executeYtDlpJson, YtDlpRawMetadata } from '../utils/ytdlp.runner.js';
import { formatBytes, formatDuration } from '../utils/format.utils.js';

export class YouTubeService {
  public static async analyze(url: string): Promise<MediaInfo> {
    const raw = await executeYtDlpJson(url);

    if (raw._has_drm) {
      throw new Error('This YouTube video is DRM protected and cannot be downloaded.');
    }

    const title = raw.title || 'YouTube Video';
    const duration = raw.duration || 0;
    const author = raw.uploader || raw.channel || 'YouTube Creator';
    const authorUrl = raw.uploader_url;

    // Pick best thumbnail
    let thumbnail = raw.thumbnail;
    if (raw.thumbnails && raw.thumbnails.length > 0) {
      const sorted = [...raw.thumbnails].sort((a, b) => (b.width || 0) - (a.width || 0));
      thumbnail = sorted[0]?.url || thumbnail;
    }

    const formats: MediaFormat[] = [];
    const seenQualities = new Set<string>();

    // Process video formats
    if (raw.formats && Array.isArray(raw.formats)) {
      // Find standard video resolutions (1080p, 720p, 480p, 360p)
      const targetResolutions = [
        { height: 1080, label: '1080p Full HD' },
        { height: 720, label: '720p HD' },
        { height: 480, label: '480p SD' },
        { height: 360, label: '360p Medium' },
      ];

      for (const target of targetResolutions) {
        const matching = raw.formats
          .filter((f) => f.height === target.height && (f.vcodec !== 'none' || !f.vcodec))
          .sort((a, b) => (b.tbr || b.vbr || 0) - (a.tbr || a.vbr || 0))[0];

        if (matching && !seenQualities.has(target.label)) {
          seenQualities.add(target.label);
          const size = matching.filesize || matching.filesize_approx;
          formats.push({
            id: `video-${matching.format_id || target.height}`,
            format: 'MP4',
            ext: 'mp4',
            type: 'video',
            quality: `${target.height}p`,
            resolution: matching.resolution || `${matching.width || '?'}x${target.height}`,
            mimeType: 'video/mp4',
            fileSize: size,
            fileSizeFormatted: size ? formatBytes(size) : undefined,
            downloadable: true,
            note: target.label,
          });
        }
      }

      // If no target resolutions found, grab best available video
      if (formats.length === 0) {
        const bestVideo = raw.formats
          .filter((f) => f.vcodec !== 'none' && f.height)
          .sort((a, b) => (b.height || 0) - (a.height || 0))[0];

        if (bestVideo) {
          const height = bestVideo.height || 720;
          const size = bestVideo.filesize || bestVideo.filesize_approx;
          formats.push({
            id: `video-${bestVideo.format_id || 'best'}`,
            format: 'MP4',
            ext: 'mp4',
            type: 'video',
            quality: `${height}p`,
            resolution: bestVideo.resolution || `${height}p`,
            mimeType: 'video/mp4',
            fileSize: size,
            fileSizeFormatted: size ? formatBytes(size) : undefined,
            downloadable: true,
            note: `${height}p Video`,
          });
        }
      }

      // Add Best Audio option (MP3/M4A)
      const audioFormat = raw.formats
        .filter((f) => f.acodec && f.acodec !== 'none')
        .sort((a, b) => (b.abr || 0) - (a.abr || 0))[0];

      if (audioFormat) {
        const size = audioFormat.filesize || audioFormat.filesize_approx;
        formats.push({
          id: `audio-${audioFormat.format_id || 'best'}`,
          format: 'MP3',
          ext: 'mp3',
          type: 'audio',
          quality: audioFormat.abr ? `${Math.round(audioFormat.abr)} kbps` : '192 kbps',
          mimeType: 'audio/mpeg',
          fileSize: size,
          fileSizeFormatted: size ? formatBytes(size) : undefined,
          downloadable: true,
          note: 'High Quality Audio',
        });
      }
    }

    // Default fallback format if extraction returned minimal format list
    if (formats.length === 0) {
      formats.push({
        id: 'video-best',
        format: 'MP4',
        ext: 'mp4',
        type: 'video',
        quality: 'Best Quality',
        downloadable: true,
        note: 'Default Video Format',
      });
      formats.push({
        id: 'audio-best',
        format: 'MP3',
        ext: 'mp3',
        type: 'audio',
        quality: '128 kbps',
        downloadable: true,
        note: 'Audio Only',
      });
    }

    return {
      id: raw.id || 'yt-media',
      platform: 'youtube',
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
