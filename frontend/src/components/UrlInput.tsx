import React from 'react';
import { Link2, ClipboardPaste, X, Loader2, ArrowRight } from 'lucide-react';
import { Platform } from '../types';
import { PlatformBadge } from './PlatformBadge';

interface UrlInputProps {
  url: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onClear: () => void;
  isLoading: boolean;
  detectedPlatform: Platform | null;
  errorMessage?: string | null;
}

export const UrlInput: React.FC<UrlInputProps> = ({
  url,
  onChange,
  onSubmit,
  onClear,
  isLoading,
  detectedPlatform,
  errorMessage,
}) => {
  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        onChange(text.trim());
      }
    } catch {
      // Fallback if clipboard permission is not granted
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading && url.trim()) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="w-full">
      <div
        className={`relative rounded-2xl glass-input p-2 sm:p-2.5 transition-all duration-300 ${
          errorMessage
            ? 'border-red-500/50 shadow-[0_0_25px_rgba(239,68,68,0.2)]'
            : 'border-white/10 hover:border-white/20'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <div className="flex items-center w-full flex-1 px-2.5">
            <Link2 className="w-5 h-5 text-violet-400 shrink-0 mr-3" />
            <input
              id="media-url-input"
              type="url"
              value={url}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              placeholder="Paste YouTube, Instagram, or TikTok URL here..."
              className="w-full bg-transparent text-sm sm:text-base text-white placeholder-slate-400 focus:outline-none disabled:opacity-50"
              aria-label="Social media video URL"
            />
            {url && (
              <button
                type="button"
                onClick={onClear}
                disabled={isLoading}
                aria-label="Clear URL input"
                className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors mr-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={handlePaste}
              disabled={isLoading}
              title="Paste from clipboard"
              className="hidden xs:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 bg-white/5 hover:bg-white/10 hover:text-white border border-white/5 transition-colors shrink-0"
            >
              <ClipboardPaste className="w-3.5 h-3.5" />
              <span>Paste</span>
            </button>
          </div>

          <button
            id="analyze-submit-button"
            type="button"
            onClick={onSubmit}
            disabled={isLoading || !url.trim()}
            className="w-full sm:w-auto px-6 py-3 rounded-xl glow-purple-button text-white text-sm font-semibold flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <span>Analyze Link</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 px-1">
        <PlatformBadge platform={detectedPlatform} />
        <span className="text-[11px] text-slate-400">
          Fast extraction • No registration required
        </span>
      </div>
    </div>
  );
};
