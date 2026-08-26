import { z } from 'zod';
import { detectPlatform } from '../utils/platform.detector.js';

const DISALLOWED_HOSTNAMES = new Set([
  'localhost',
  '127.0.0.1',
  '0.0.0.0',
  '::1',
  '169.254.169.254',
  'metadata.google.internal',
]);

const IPV4_PRIVATE_REGEX = /^(10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.)/;

export const analyzeRequestSchema = z.object({
  url: z.string().min(1, 'URL is required').max(2048, 'URL is too long'),
});

export const downloadRequestSchema = z.object({
  url: z.string().min(1, 'URL is required').max(2048, 'URL is too long'),
  formatId: z.string().min(1, 'Format ID is required'),
  platform: z.enum(['youtube', 'instagram', 'tiktok']),
  ext: z.string().optional(),
});

export function validateSafeUrl(rawUrl: string): { isValid: boolean; error?: string; sanitizedUrl?: string } {
  try {
    const trimmed = rawUrl.trim();
    if (!trimmed) {
      return { isValid: false, error: 'URL cannot be empty' };
    }

    const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const parsed = new URL(withProtocol);

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { isValid: false, error: 'Only HTTP and HTTPS protocols are permitted' };
    }

    const host = parsed.hostname.toLowerCase();

    // Security SSRF check
    if (DISALLOWED_HOSTNAMES.has(host) || IPV4_PRIVATE_REGEX.test(host) || host.endsWith('.local')) {
      return { isValid: false, error: 'Invalid URL target' };
    }

    // Platform validation
    const detection = detectPlatform(parsed.toString());
    if (!detection.isSupported || !detection.platform) {
      return { isValid: false, error: detection.error || 'Unsupported platform' };
    }

    return { isValid: true, sanitizedUrl: detection.sanitizedUrl || parsed.toString() };
  } catch {
    return { isValid: false, error: 'Malformed or invalid URL' };
  }
}
