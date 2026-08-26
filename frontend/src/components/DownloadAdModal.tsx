'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Download, X, Megaphone, CheckCircle2, Loader2, Sparkles, ExternalLink, FolderDown } from 'lucide-react';
import { MediaFormat, Platform } from '../types';
import { getDownloadEndpoint } from '../lib/api';

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
  const isTriggeredRef = useRef(false);

  useEffect(() => {
    if (!isOpen || !format || !platform) {
      setCountdown(3);
      setHasStartedDownload(false);
      isTriggeredRef.current = false;
      return;
    }

    setCountdown(3);
    setHasStartedDownload(false);
    isTriggeredRef.current = false;

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          triggerActualDownload();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, format, platform]);

  const triggerActualDownload = () => {
    if (!format || !platform || isTriggeredRef.current) return;
    isTriggeredRef.current = true;
    setHasStartedDownload(true);

    const cleanTitle = (title || 'SnapVid_Video').replace(/[^a-zA-Z0-9_\-\s]/g, '').trim().replace(/\s+/g, '_');
    const downloadUrl = getDownloadEndpoint(url, format.id, platform, cleanTitle);

    // Trigger download with direct hidden iframe stream
    let iframe = document.getElementById('hidden-download-iframe') as HTMLIFrameElement | null;
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = 'hidden-download-iframe';
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
    }
    iframe.src = downloadUrl;

    // Close modal after confirmation
    setTimeout(() => {
      onClose();
    }, 4000);
  };

  if (!isOpen || !format || !platform) return null;

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
              Preparing Your Download
            </h3>
            <p className="text-xs text-slate-400">
              {format.quality || format.format} • {format.ext.toUpperCase()}
              {format.fileSizeFormatted ? ` • ${format.fileSizeFormatted}` : ''}
            </p>
          </div>
        </div>

        {/* Interstitial Advertisement Slot */}
        <div className="my-4 rounded-2xl border border-dashed border-violet-500/30 bg-violet-950/20 p-4 text-center relative overflow-hidden">
          <div className="text-[10px] uppercase tracking-widest text-violet-400 font-semibold mb-2 flex items-center justify-center gap-1.5">
            <Megaphone className="w-3.5 h-3.5" />
            <span>Sponsored Advertisement</span>
          </div>

          <div className="py-6 px-4 rounded-xl bg-slate-900/70 border border-white/5 flex flex-col items-center justify-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-[11px] font-semibold text-cyan-300 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Partner Promotion</span>
            </div>
            <p className="text-sm font-bold text-white mb-1">
              High-Speed Cloud Storage & Media Player
            </p>
            <p className="text-xs text-slate-400 max-w-xs mb-3">
              Stream, convert, and store your media library with infinite bandwidth.
            </p>
            <a
              href="https://google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-white/10 hover:bg-white/15 border border-white/10 transition-colors"
            >
              <span>Learn More</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          </div>

          <div className="mt-2.5 flex items-center justify-center gap-1.5 text-[11px] text-emerald-400">
            <FolderDown className="w-3.5 h-3.5" />
            <span>File saves directly to your device&apos;s Downloads folder</span>
          </div>
        </div>

        {/* Countdown & Trigger Section */}
        <div className="mt-5 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs">
            {hasStartedDownload ? (
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold animate-pulse">
                <CheckCircle2 className="w-4 h-4" />
                <span>Download started! Saving to Downloads folder...</span>
              </span>
            ) : countdown > 0 ? (
              <span className="flex items-center gap-2 text-slate-300">
                <Loader2 className="w-4 h-4 text-violet-400 animate-spin" />
                <span>Starting in <strong className="text-white text-sm font-mono">{countdown}s</strong>...</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-cyan-300">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Transferring file to your device...</span>
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={triggerActualDownload}
            disabled={hasStartedDownload}
            className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
              hasStartedDownload
                ? 'bg-emerald-600 text-white'
                : 'glow-purple-button text-white'
            }`}
          >
            {hasStartedDownload ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Downloaded</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>{countdown > 0 ? 'Skip & Download' : 'Download Now'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
