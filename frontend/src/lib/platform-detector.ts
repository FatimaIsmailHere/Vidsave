import { PlatformDetectionResult } from '../types';

export function detectPlatformClient(inputUrl: string): PlatformDetectionResult {
  if (!inputUrl || typeof inputUrl !== 'string') {
    return { platform: null, isSupported: false };
  }

  const trimmed = inputUrl.trim();
  if (!trimmed) {
    return { platform: null, isSupported: false };
  }

  try {
    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const parsed = new URL(withProtocol);
    const host = parsed.hostname.toLowerCase().replace(/^www\./, '');
    const fullHost = parsed.hostname.toLowerCase();

    // YouTube
    if (
      host === 'youtube.com' ||
      fullHost === 'youtube.com' ||
      fullHost === 'www.youtube.com' ||
      fullHost === 'm.youtube.com' ||
      fullHost === 'music.youtube.com' ||
      host === 'youtu.be' ||
      fullHost === 'youtu.be'
    ) {
      return { platform: 'youtube', isSupported: true, label: 'YouTube detected' };
    }

    // Instagram
    if (
      host === 'instagram.com' ||
      fullHost === 'instagram.com' ||
      fullHost === 'www.instagram.com' ||
      host === 'instagr.am' ||
      fullHost === 'instagr.am'
    ) {
      return { platform: 'instagram', isSupported: true, label: 'Instagram detected' };
    }

    // TikTok
    if (
      host === 'tiktok.com' ||
      fullHost === 'tiktok.com' ||
      fullHost === 'www.tiktok.com' ||
      fullHost === 'vm.tiktok.com' ||
      fullHost === 'vt.tiktok.com' ||
      fullHost === 'm.tiktok.com'
    ) {
      return { platform: 'tiktok', isSupported: true, label: 'TikTok detected' };
    }

    return { platform: null, isSupported: false };
  } catch {
    return { platform: null, isSupported: false };
  }
}
