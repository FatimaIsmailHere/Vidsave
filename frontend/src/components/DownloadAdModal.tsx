'use client';

import React, { useState, useEffect } from 'react';
import { Download, X, Megaphone, CheckCircle2, Loader2, FolderDown } from 'lucide-react';
import { MediaFormat, Platform } from '../types';
import { getDownloadEndpoint } from '../lib/api';
import { AdsterraAd } from './AdsterraAd';

interface DownloadAdModalProps {
  isOpen: boolean;
  onClose: () => void;
  format: MediaFormat | null;
  url: string;
  platform: Platform | null;
  title: string;
}

export const DownloadAdModal: React.FC<DownloadAdModalProps> = ({
  isOpen,
  onClose,
  format,
  url,
  platform,
  title,
}) => {
  const [countdown, setCountdown] = useState(3);
  const [hasStartedDownload, setHasStartedDownload] = useState(false);

  const adsterraKey728 = process.env.NEXT_PUBLIC_ADSTERRA_BANNER_KEY_728;

  useEffect(() => {
    if (!isOpen || !format || !platform) {
      setCountdown(3);
      setHasStartedDownload(false);
      return;
    }

    setCountdown(3);
    setHasStartedDownload(false);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, format, platform]);

  if (!isOpen || !format || !platform) return null;

  const cleanTitle = (title || 'SnapVid_Video')
    .replace(/[^a-zA-Z0-9_\-\s]/g, '')
    .trim()
    .replace(/\s+/g, '_');
  const directDownloadUrl = getDownloadEndpoint(url, format.id, platform, cleanTitle);

  const handleDownloadClick = () => {
    setHasStartedDownload(true);
    // Let the browser handle the download natively via Content-Disposition: attachment
    // The fetch+blob+createObjectURL pattern breaks on mobile browsers (Chrome/Safari)
    const a = document.createElement('a');
    a.href = directDownloadUrl;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => {
      onClose();
    }, 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg glass-panel rounded-3xl p-6 sm:p-7 shadow-2xl border border-white/15 bg-slate-950/95 overflow-hidden">
        {/* Top Glow Ambient */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-64 h-32 bg-violet-600/30 blur-3xl rounded-full pointer-events-none" />

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-400 p-0.5 shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Download className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <div>
            <h3 className="text-base font-bold text-white leading-tight">
              Preparing Your Media File
            </h3>
            <p className="text-xs text-slate-400">
              {format.quality || format.format} &bull; {format.ext.toUpperCase()}
              {format.fileSizeFormatted ? ` &bull; ${format.fileSizeFormatted}` : ''}
            </p>
          </div>
        </div>

        {/* Interstitial Advertisement Slot */}
        <div className="my-4 rounded-2xl border border-dashed border-violet-500/30 bg-violet-950/20 p-4 text-center relative overflow-hidden">
          <div className="text-[10px] uppercase tracking-widest text-violet-400 font-semibold mb-2 flex items-center justify-center gap-1.5">
            <Megaphone className="w-3.5 h-3.5" />
            <span>Sponsored Advertisement</span>
          </div>

          {adsterraKey728 ? (
            <div className="flex items-center justify-center py-2">
              <AdsterraAd adKey={adsterraKey728} width={728} height={90} />
            </div>
          ) : (
            <div className="py-6 px-4 rounded-xl bg-slate-900/70 border border-white/5 flex flex-col items-center justify-center">
              <span className="text-xs text-slate-500">Advertisement</span>
            </div>
          )}

          <div className="mt-2.5 flex items-center justify-center gap-1.5 text-[11px] text-emerald-400">
            <FolderDown className="w-3.5 h-3.5" />
            <span>File saves directly to your device Downloads folder</span>
          </div>
        </div>

        {/* Countdown & Direct Mobile Download Button */}
        <div className="mt-5 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs">
            {hasStartedDownload ? (
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold animate-pulse">
                <CheckCircle2 className="w-4 h-4" />
                <span>Downloading... Check your Downloads folder!</span>
              </span>
            ) : countdown > 0 ? (
              <span className="flex items-center gap-2 text-slate-300">
                <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />
                <span>Ready in <strong className="text-white text-sm font-mono">{countdown}s</strong>...</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>File ready for download!</span>
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleDownloadClick}
            disabled={countdown > 0 && !hasStartedDownload}
            className={`w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
              hasStartedDownload
                ? 'bg-emerald-600 text-white'
                : countdown > 0
                  ? 'bg-white/10 text-slate-400 cursor-not-allowed'
                  : 'glow-purple-button text-white hover:scale-105'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>{hasStartedDownload ? 'Downloading...' : countdown > 0 ? 'Skip & Download Now' : 'Download File Now'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
