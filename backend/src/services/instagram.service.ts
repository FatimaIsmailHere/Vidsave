import axios from 'axios';
import { MediaFormat, MediaInfo } from '../types/media.types.js';
import { executeYtDlpJson } from '../utils/ytdlp.runner.js';
import { formatBytes, formatDuration } from '../utils/format.utils.js';

export class InstagramService {
  public static async analyze(url: string): Promise<MediaInfo> {
    try {
      // 1. First attempt extraction via yt-dlp
      const raw = await executeYtDlpJson(url);

      if (raw._has_drm) {
        throw new Error('This Instagram media is protected and cannot be downloaded.');
      }

      const title = raw.title || raw.description?.substring(0, 60) || 'Instagram Media';
      const duration = raw.duration || 0;
      const author = raw.uploader || raw.channel || 'Instagram User';
      const authorUrl = raw.uploader_url;

      let thumbnail = raw.thumbnail;
      if (raw.thumbnails && raw.thumbnails.length > 0) {
        const sorted = [...raw.thumbnails].sort((a, b) => (b.width || 0) - (a.width || 0));
        thumbnail = sorted[0]?.url || thumbnail;
      }

      const formats: MediaFormat[] = [];

      if (raw.formats && Array.isArray(raw.formats)) {
        const bestVideo = raw.formats
          .filter((f) => f.vcodec !== 'none' || f.ext === 'mp4')
          .sort((a, b) => (b.height || 0) - (a.height || 0))[0];

        if (bestVideo) {
          const size = bestVideo.filesize || bestVideo.filesize_approx;
          const qualityLabel = bestVideo.height ? `${bestVideo.height}p HD` : 'HD Video';
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
            note: 'Best HD Video',
          });
        }

        const audioFormat = raw.formats.find((f) => f.acodec && f.acodec !== 'none') || raw.formats[0];
        if (audioFormat) {
          const size = audioFormat.filesize || audioFormat.filesize_approx;
          formats.push({
            id: `audio-${audioFormat.format_id || 'original'}`,
            format: 'MP3',
            ext: 'mp3',
            type: 'audio',
            quality: 'Original Audio',
            mimeType: 'audio/mpeg',
            fileSize: size,
            fileSizeFormatted: size ? formatBytes(size) : undefined,
            downloadable: true,
            note: 'Audio Track',
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
          note: 'HD MP4 Video',
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
        id: raw.id || 'ig-media',
        platform: 'instagram',
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
    } catch (primaryErr: unknown) {
      // 2. Fallback: Query Instagram oEmbed API
      console.log('Primary Instagram extraction failed, trying oEmbed fallback...');
      try {
        const oembedRes = await axios.get('https://www.instagram.com/api/v1/oembed/', {
          params: { url },
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'X-IG-App-ID': '936619743392459',
            'Sec-Fetch-Site': 'same-origin',
          },
          timeout: 10000,
        });

        if (oembedRes.data && (oembedRes.data.title || oembedRes.data.author_name)) {
          const data = oembedRes.data;
          const cleanTitle = data.title || `${data.author_name || 'Instagram'} Reel`;

          const formats: MediaFormat[] = [
            {
              id: 'video-hd',
              format: 'MP4',
              ext: 'mp4',
              type: 'video',
              quality: 'HD Video (720p)',
              downloadable: true,
              note: 'Instagram HD Video',
            },
            {
              id: 'audio-mp3',
              format: 'MP3',
              ext: 'mp3',
              type: 'audio',
              quality: 'Original Audio',
              downloadable: true,
              note: 'Audio Track',
            },
          ];

          return {
            id: data.media_id || 'ig-reel',
            platform: 'instagram',
            url,
            title: cleanTitle,
            thumbnail: data.thumbnail_url,
            author: data.author_name || 'Instagram Creator',
            authorUrl: data.author_url,
            formats,
          };
        }
      } catch (oembedErr) {
        console.error('oEmbed fallback also failed:', oembedErr);
      }

      // 3. Clear, helpful error explaining platform boundaries
      const origMsg = primaryErr instanceof Error ? primaryErr.message : '';
      if (
        origMsg.includes('empty media response') ||
        origMsg.includes('logged-in') ||
        origMsg.includes('require_login') ||
        origMsg.includes('authentication')
      ) {
        throw new Error(
          'Instagram requires account authentication to access this specific reel. Only publicly accessible reels open to guest viewers can be processed.'
        );
      }

      throw new Error(
        'Instagram restricts unauthenticated access to this content. Please verify that the account and reel are fully public.'
      );
    }
  }
}
