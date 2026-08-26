import { ApiResponse, MediaInfo, Platform } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/media';

export async function analyzeMediaUrl(url: string): Promise<MediaInfo> {
  const response = await fetch(`${API_BASE_URL}/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  });

  const data: ApiResponse<MediaInfo> = await response.json();

  if (!response.ok || !data.success || !data.data) {
    throw new Error(data.error?.message || 'Failed to analyze media URL');
  }

  return data.data;
}

export function getDownloadEndpoint(url: string, formatId: string, platform: Platform, title?: string): string {
  const params = new URLSearchParams({
    url,
    formatId,
    platform,
    title: title || 'media',
  });
  return `${API_BASE_URL}/download?${params.toString()}`;
}
