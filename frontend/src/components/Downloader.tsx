'use client';

import React, { useState, useEffect } from 'react';
import { UrlInput } from './UrlInput';
import { MediaPreview } from './MediaPreview';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';
import { MediaInfo, Platform } from '../types';
import { detectPlatformClient } from '../lib/platform-detector';
import { analyzeMediaUrl } from '../lib/api';
import { extractYouTubeClientSide } from '../lib/youtube-client';

export const Downloader: React.FC = () => {
  const [url, setUrl] = useState('');
  const [detectedPlatform, setDetectedPlatform] = useState<Platform | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mediaInfo, setMediaInfo] = useState<MediaInfo | null>(null);

  // Auto detect platform when URL changes
  useEffect(() => {
    if (url.trim()) {
      const detection = detectPlatformClient(url);
      setDetectedPlatform(detection.platform);
    } else {
      setDetectedPlatform(null);
    }
  }, [url]);

  const handleUrlChange = (value: string) => {
    setUrl(value);
    if (error) setError(null);
  };

  const handleClear = () => {
    setUrl('');
    setDetectedPlatform(null);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!url.trim()) return;

    setError(null);
    setIsLoading(true);

    try {
      // Try server-side extraction first
      const result = await analyzeMediaUrl(url.trim());
      setMediaInfo(result);
    } catch (serverErr: unknown) {
      const isYouTube = detectPlatformClient(url.trim()).platform === 'youtube';

      // If server failed and it's a YouTube URL, try client-side extraction
      if (isYouTube) {
        try {
          const clientResult = await extractYouTubeClientSide(url.trim());
          setMediaInfo({
            ...clientResult,
            platform: 'youtube',
            url: url.trim(),
            id: 'yt-client',
            _clientSide: true,
          } as MediaInfo & { _clientSide?: boolean });
          return;
        } catch (clientErr: unknown) {
          // Both server and client extraction failed
          console.error('Client-side YouTube extraction also failed:', clientErr);
        }
      }

      // Show server error message (or combined error)
      const message =
        serverErr instanceof Error
          ? serverErr.message
          : 'Unable to process this URL. Please verify the link and try again.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMediaInfo(null);
    setError(null);
    setUrl('');
    setDetectedPlatform(null);
  };

  return (
    <div id="downloader-card" className="w-full max-w-3xl mx-auto">
      {/* Downloader Card Container */}
      <div className="relative">
        {/* Glow ambient backdrops */}
        <div className="absolute -inset-1 bg-gradient-to-r from-violet-600/30 via-cyan-500/20 to-pink-500/30 rounded-3xl blur-xl opacity-70 pointer-events-none" />

        <div className="relative glass-panel rounded-3xl p-5 sm:p-7 md:p-9 shadow-2xl">
          {mediaInfo ? (
            <MediaPreview media={mediaInfo} onReset={handleReset} />
          ) : (
            <div className="space-y-6">
              <UrlInput
                url={url}
                onChange={handleUrlChange}
                onSubmit={handleAnalyze}
                onClear={handleClear}
                isLoading={isLoading}
                detectedPlatform={detectedPlatform}
                errorMessage={error}
              />

              {isLoading && <LoadingState />}

              {error && !isLoading && (
                <ErrorState message={error} onRetry={handleAnalyze} />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
