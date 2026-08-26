import { ApiResponse, MediaInfo, Platform } from '../types';

function getApiBaseUrl(): string {
  let envUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/media').trim();
  envUrl = envUrl.replace(/\/+$/, '');

  if (!envUrl.includes('/api/media')) {
    if (envUrl.endsWith('/api')) {
      envUrl += '/media';
    } else {
      envUrl += '/api/media';
    }
  }

  return envUrl;
}

const API_BASE_URL = getApiBaseUrl();

export async function analyzeMediaUrl(url: string): Promise<MediaInfo> {
  const response = await fetch(`${API_BASE_URL}/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    let errMsg = 'Failed to analyze media URL';
    try {
      const errorJson = await response.json();
      errMsg = errorJson.error?.message || errorJson.message || errMsg;
    } catch {}
    throw new Error(errMsg);
  }

  const data: ApiResponse<MediaInfo> = await response.json();

  if (!data.success || !data.data) {
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
