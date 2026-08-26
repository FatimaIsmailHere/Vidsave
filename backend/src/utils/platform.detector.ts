import { Platform, PlatformDetectionResult } from '../types/media.types.js';

const YOUTUBE_HOSTS = new Set([
  'youtube.com',
  'www.youtube.com',
  'm.youtube.com',
  'music.youtube.com',
  'youtu.be',
]);

const INSTAGRAM_HOSTS = new Set([
  'instagram.com',
  'www.instagram.com',
  'instagr.am',
]);

const TIKTOK_HOSTS = new Set([
  'tiktok.com',
  'www.tiktok.com',
  'vm.tiktok.com',
  'vt.tiktok.com',
  'm.tiktok.com',
  'v.douyin.com',
]);

export function detectPlatform(rawUrl: string): PlatformDetectionResult {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { platform: null, isSupported: false, error: 'URL must be a non-empty string' };
  }

  const trimmed = rawUrl.trim();
  let parsedUrl: URL;

  try {
    // Add protocol if missing
    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    parsedUrl = new URL(withProtocol);
  } catch {
    return { platform: null, isSupported: false, error: 'Invalid URL format' };
  }

  const hostname = parsedUrl.hostname.toLowerCase().replace(/^www\./, '');
  const fullHostname = parsedUrl.hostname.toLowerCase();

  // Check YouTube
  if (
    YOUTUBE_HOSTS.has(hostname) ||
    YOUTUBE_HOSTS.has(fullHostname) ||
    hostname.endsWith('.youtube.com') ||
    hostname === 'youtu.be'
  ) {
    return {
      platform: 'youtube',
      isSupported: true,
      sanitizedUrl: parsedUrl.toString(),
    };
  }

  // Check Instagram
  if (
    INSTAGRAM_HOSTS.has(hostname) ||
    INSTAGRAM_HOSTS.has(fullHostname) ||
    hostname.endsWith('.instagram.com') ||
    hostname === 'instagr.am'
  ) {
    return {
      platform: 'instagram',
      isSupported: true,
      sanitizedUrl: parsedUrl.toString(),
    };
  }

  // Check TikTok
  if (
    TIKTOK_HOSTS.has(hostname) ||
    TIKTOK_HOSTS.has(fullHostname) ||
    hostname.endsWith('.tiktok.com')
  ) {
    return {
      platform: 'tiktok',
      isSupported: true,
      sanitizedUrl: parsedUrl.toString(),
    };
  }

  return {
    platform: null,
    isSupported: false,
    error: 'This platform is not supported. Only YouTube, Instagram, and TikTok are supported.',
  };
}
