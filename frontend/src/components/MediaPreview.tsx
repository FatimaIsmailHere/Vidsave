import React, { useState } from 'react';
import { Clock, User, ArrowLeft, Share2, Youtube, Instagram, Music2 } from 'lucide-react';
import { MediaFormat, MediaInfo } from '../types';
import { FormatSelector } from './FormatSelector';
import { DownloadAdModal } from './DownloadAdModal';

interface MediaPreviewProps {
  media: MediaInfo;
  onReset: () => void;
}

export const MediaPreview: React.FC<MediaPreviewProps> = ({ media, onReset }) => {
  const [selectedFormat, setSelectedFormat] = useState<MediaFormat | null>(null);
  const [isAdModalOpen, setIsAdModalOpen] = useState(false);

  const getPlatformIcon = () => {
    switch (media.platform) {
      case 'youtube':
        return <Youtube className="w-3.5 h-3.5 text-red-400" />;
      case 'instagram':
        return <Instagram className="w-3.5 h-3.5 text-pink-400" />;
      case 'tiktok':
        return <Music2 className="w-3.5 h-3.5 text-cyan-400" />;
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: media.title,
          url: media.url,
        });
      } else {
        await navigator.clipboard.writeText(media.url);
        alert('URL copied to clipboard!');
      }
    } catch {
      // User cancelled share
    }
  };

  const handleSelectDownload = (format: MediaFormat) => {
    setSelectedFormat(format);
    setIsAdModalOpen(true);
  };

  return (
    <div className="w-full glass-panel rounded-2xl p-4 sm:p-6 md:p-8 animate-in fade-in duration-300">
      {/* Top Header Actions */}
      <div className="flex items-center justify-between gap-2 pb-4 mb-6 border-b border-white/10">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Convert another URL</span>
        </button>

        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Share</span>
        </button>
      </div>

      {/* Main Media Metadata Overview */}
      <div className="flex flex-col md:flex-row gap-5 lg:gap-7 items-start">
        {/* Thumbnail Preview */}
        <div className="relative w-full md:w-72 lg:w-80 shrink-0 aspect-video rounded-xl overflow-hidden bg-slate-900 border border-white/10 shadow-lg">
          {media.thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={media.thumbnail}
              alt={media.title}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-600">
              No thumbnail preview
            </div>
          )}

          {/* Duration Badge */}
          {media.durationFormatted && (
            <div className="absolute bottom-2.5 right-2.5 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-sm text-[11px] font-semibold text-white flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{media.durationFormatted}</span>
            </div>
          )}

          {/* Platform Tag */}
          <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/80 backdrop-blur-sm text-[11px] font-semibold text-white flex items-center gap-1.5 capitalize">
            {getPlatformIcon()}
            <span>{media.platform}</span>
          </div>
        </div>

        {/* Info Column */}
        <div className="flex-1 flex flex-col justify-between w-full">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white leading-snug line-clamp-2">
              {media.title}
            </h2>

            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 mt-3">
              {media.author && (
                <div className="flex items-center gap-1.5 text-slate-300">
                  <User className="w-3.5 h-3.5 text-violet-400" />
                  <span className="font-medium">{media.author}</span>
                </div>
              )}

              {media.uploadDate && (
                <div>
                  <span>Uploaded: {media.uploadDate}</span>
                </div>
              )}
            </div>

            {media.description && (
              <p className="text-xs text-slate-400 mt-3 line-clamp-2 leading-relaxed">
                {media.description}
              </p>
            )}
          </div>

          <div className="mt-4 p-3 rounded-xl bg-violet-950/20 border border-violet-500/20 text-xs text-violet-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-violet-400 shrink-0" />
            <span>Select your preferred format below to start downloading.</span>
          </div>
        </div>
      </div>

      {/* Format Selector List */}
      <FormatSelector
        formats={media.formats}
        url={media.url}
        platform={media.platform}
        title={media.title}
        onSelectDownload={handleSelectDownload}
      />

      {/* Interstitial Ad & Download Modal */}
      <DownloadAdModal
        isOpen={isAdModalOpen}
        onClose={() => setIsAdModalOpen(false)}
        format={selectedFormat}
        url={media.url}
        platform={media.platform}
        title={media.title}
      />
    </div>
  );
};
