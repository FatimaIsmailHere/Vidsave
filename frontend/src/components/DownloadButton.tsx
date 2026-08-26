import React from 'react';
import { Download } from 'lucide-react';
import { MediaFormat, Platform } from '../types';

interface DownloadButtonProps {
  format: MediaFormat;
  url: string;
  platform: Platform;
  title: string;
  onSelectDownload?: (format: MediaFormat) => void;
  className?: string;
}

export const DownloadButton: React.FC<DownloadButtonProps> = ({
  format,
  onSelectDownload,
  className = '',
}) => {
  const isAudio = format.type === 'audio';

  const handleClick = () => {
    if (onSelectDownload) {
      onSelectDownload(format);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!format.downloadable}
      className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-200 shrink-0 ${
        isAudio
          ? 'glow-cyan-button text-white'
          : 'glow-purple-button text-white'
      } ${className}`}
      aria-label={`Download ${format.quality || format.format} ${format.type}`}
    >
      <Download className="w-3.5 h-3.5" />
      <span>Download</span>
    </button>
  );
};
