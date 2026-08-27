/**
 * Client-side YouTube extraction using youtubei.js.
 *
 * When the server-side yt-dlp extraction fails (YouTube blocks the server's
 * datacenter IP), this module falls back to extracting video URLs directly
 * in the user's browser. The browser has a residential IP that YouTube
 * does not block.
 */
import { Innertube, Platform, Types } from 'youtubei.js/web';
import { MediaFormat } from '../types';

// Set up the JS interpreter needed for deciphering YouTube's obfuscated URLs
Platform.shim.eval = async (data: Types.BuildScriptResult) => {
  // eslint-disable-next-line no-eval
  return new Function(data.output)();
};

let innertubeInstance: Awaited<ReturnType<typeof Innertube.create>> | null = null;

async function getInnertube() {
  if (!innertubeInstance) {
    innertubeInstance = await Innertube.create({
      lang: 'en',
      location: 'US',
      retrieve_player: true,
    });
  }
  return innertubeInstance;
}

/**
 * Extract YouTube video info using the browser's residential IP.
 * Returns metadata + format URLs that can be used for download.
 */
export async function extractYouTubeClientSide(url: string): Promise<{
  title: string;
  thumbnail: string;
  duration: number;
  author: string;
  formats: MediaFormat[];
}> {
  const innertube = await getInnertube();
  const info = await innertube.getInfo(url);

  const title = info.basic_info.title || 'YouTube Video';
  const duration = info.basic_info.duration || 0;
  const author = info.basic_info.author || 'YouTube Creator';
  const thumbnail = info.basic_info.thumbnail?.[0]?.url || '';

  const formats: MediaFormat[] = [];

  // Get progressive formats (combined audio+video) for direct download
  const streamingData = info.streaming_data;
  if (streamingData) {
    const progressiveFormats = streamingData.formats || [];
    const adaptiveFormats = streamingData.adaptive_formats || [];

    // Find best progressive formats (audio+video combined)
    const targetHeights = [1080, 720, 480, 360];
    const seenQualities = new Set<string>();

    for (const height of targetHeights) {
      const matching = progressiveFormats
        .filter((f) => f.height && f.height <= height && f.mime_type?.includes('video/mp4'))
        .sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0))[0];

      if (matching && !seenQualities.has(`${matching.height}p`)) {
        seenQualities.add(`${matching.height}p`);
        formats.push({
          id: `video-${matching.itag}`,
          format: 'MP4',
          ext: 'mp4',
          type: 'video',
          quality: `${matching.height}p`,
          resolution: `${matching.width}x${matching.height}`,
          mimeType: matching.mime_type || 'video/mp4',
          fileSize: matching.content_length,
          fileSizeFormatted: matching.content_length
            ? formatBytes(Number(matching.content_length))
            : undefined,
          downloadable: true,
          note: `${matching.height}p Video`,
        });
      }
    }

    // Fallback: if no progressive formats, use adaptive video-only + audio
    if (formats.length === 0 && adaptiveFormats.length > 0) {
      const bestVideo = adaptiveFormats
        .filter((f) => f.mime_type?.includes('video/mp4') && f.height)
        .sort((a, b) => (b.height || 0) - (a.height || 0))[0];

      if (bestVideo) {
        formats.push({
          id: `video-${bestVideo.itag}`,
          format: 'MP4',
          ext: 'mp4',
          type: 'video',
          quality: `${bestVideo.height}p`,
          resolution: `${bestVideo.width}x${bestVideo.height}`,
          mimeType: bestVideo.mime_type || 'video/mp4',
          fileSize: bestVideo.content_length,
          fileSizeFormatted: bestVideo.content_length
            ? formatBytes(Number(bestVideo.content_length))
            : undefined,
          downloadable: true,
          note: `${bestVideo.height}p Video (no audio)`,
        });
      }
    }

    // Add audio-only format
    const bestAudio = adaptiveFormats
      .filter((f) => f.mime_type?.includes('audio/mp4'))
      .sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0))[0];

    if (bestAudio) {
      formats.push({
        id: `audio-${bestAudio.itag}`,
        format: 'MP3',
        ext: 'mp3',
        type: 'audio',
        quality: bestAudio.bitrate
          ? `${Math.round(bestAudio.bitrate / 1000)} kbps`
          : '128 kbps',
        mimeType: 'audio/mpeg',
        fileSize: bestAudio.content_length,
        fileSizeFormatted: bestAudio.content_length
          ? formatBytes(Number(bestAudio.content_length))
          : undefined,
        downloadable: true,
        note: 'High Quality Audio',
      });
    }
  }

  // If no formats found, add defaults
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
    title,
    thumbnail,
    duration,
    author,
    formats,
  };
}

/**
 * Get a direct download URL for a YouTube video using client-side extraction.
 * Returns a URL that can be used with window.open() or fetch().
 */
export async function getClientSideDownloadUrl(
  url: string,
  formatId: string
): Promise<string> {
  const innertube = await getInnertube();
  const info = await innertube.getInfo(url);
  const streamingData = info.streaming_data;

  if (!streamingData) {
    throw new Error('No streaming data available');
  }

  // Extract itag from formatId (e.g., "video-251" -> 251)
  const itag = parseInt(formatId.replace(/^(video|audio)-/, ''), 10);

  // Find the matching format
  const allFormats = [
    ...(streamingData.formats || []),
    ...(streamingData.adaptive_formats || []),
  ];

  const matching = allFormats.find((f) => f.itag === itag);

  if (matching && matching.decipher) {
    const url = matching.decipher(innertube.session.player);
    return url;
  }

  // Fallback: return the best progressive format URL
  const progressive = streamingData.formats;
  if (progressive && progressive.length > 0) {
    const best = progressive.sort(
      (a, b) => (b.bitrate || 0) - (a.bitrate || 0)
    )[0];
    if (best.decipher) {
      return best.decipher(innertube.session.player);
    }
  }

  throw new Error('Could not extract download URL');
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}
