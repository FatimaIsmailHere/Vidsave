import React, { useState } from 'react';
import { Video, Music, HardDrive, FileVideo } from 'lucide-react';
import { MediaFormat, Platform } from '../types';
import { DownloadButton } from './DownloadButton';

interface FormatSelectorProps {
  formats: MediaFormat[];
  url: string;
  platform: Platform;
  title: string;
  onSelectDownload: (format: MediaFormat) => void;
}

export const FormatSelector: React.FC<FormatSelectorProps> = ({
  formats,
  url,
  platform,
  title,
  onSelectDownload,
}) => {
  const [activeTab, setActiveTab] = useState<'video' | 'audio'>('video');

  const videoFormats = formats.filter((f) => f.type === 'video');
  const audioFormats = formats.filter((f) => f.type === 'audio');

  const activeFormats = activeTab === 'video' ? videoFormats : audioFormats;

  return (
    <div className="w-full mt-6">
      {/* Tab Switcher */}
      <div className="flex items-center gap-2 p-1 rounded-xl bg-slate-950/60 border border-white/10 w-fit mb-4">
        <button
          type="button"
          onClick={() => setActiveTab('video')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
            activeTab === 'video'
              ? 'bg-violet-600 text-white shadow-md shadow-violet-900/40'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Video className="w-4 h-4" />
          <span>Video ({videoFormats.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('audio')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 ${
            activeTab === 'audio'
              ? 'bg-cyan-600 text-white shadow-md shadow-cyan-900/40'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Music className="w-4 h-4" />
          <span>Audio ({audioFormats.length})</span>
        </button>
      </div>

      {/* Formats List */}
      <div className="space-y-2.5">
        {activeFormats.length === 0 ? (
          <div className="p-6 rounded-xl border border-white/5 bg-slate-900/40 text-center text-xs text-slate-400">
            No specific {activeTab} streams available for this item.
          </div>
        ) : (
          activeFormats.map((fmt) => (
            <div
              key={fmt.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border border-white/10 bg-slate-900/50 hover:border-violet-500/40 hover:bg-slate-900/80 transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2.5 rounded-xl border shrink-0 ${
                    fmt.type === 'video'
                      ? 'bg-violet-500/10 border-violet-500/20 text-violet-400'
                      : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
                  }`}
                >
                  {fmt.type === 'video' ? (
                    <FileVideo className="w-5 h-5" />
                  ) : (
                    <Music className="w-5 h-5" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-white">
                      {fmt.quality || fmt.format}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-white/10 text-slate-300">
                      {fmt.format}
                    </span>
                    {fmt.note && (
                      <span className="text-[11px] text-slate-400 hidden xs:inline">
                        • {fmt.note}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                    {fmt.resolution && (
                      <span>Resolution: {fmt.resolution}</span>
                    )}
                    {fmt.fileSizeFormatted && (
                      <span className="flex items-center gap-1">
                        <HardDrive className="w-3 h-3 text-slate-500" />
                        {fmt.fileSizeFormatted}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <DownloadButton
                format={fmt}
                url={url}
                platform={platform}
                title={title}
                onSelectDownload={onSelectDownload}
                className="w-full sm:w-auto"
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};
