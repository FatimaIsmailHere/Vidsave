import React from 'react';
import { Platform } from '../types';
import { Youtube, Instagram, Music2, CheckCircle2 } from 'lucide-react';

interface PlatformBadgeProps {
  platform: Platform | null;
  className?: string;
}

export const PlatformBadge: React.FC<PlatformBadgeProps> = ({ platform, className = '' }) => {
  if (!platform) {
    return (
      <div className={`inline-flex items-center gap-2 text-xs text-slate-400 ${className}`}>
        <span className="w-2 h-2 rounded-full bg-slate-600 animate-pulse" />
        <span>Supported: YouTube • Instagram • TikTok</span>
      </div>
    );
  }

  const getPlatformConfig = () => {
    switch (platform) {
      case 'youtube':
        return {
          name: 'YouTube',
          icon: Youtube,
          badgeBg: 'bg-red-500/15 border-red-500/30 text-red-300',
          dotBg: 'bg-red-400',
        };
      case 'instagram':
        return {
          name: 'Instagram',
          icon: Instagram,
          badgeBg: 'bg-pink-500/15 border-pink-500/30 text-pink-300',
          dotBg: 'bg-pink-400',
        };
      case 'tiktok':
        return {
          name: 'TikTok',
          icon: Music2,
          badgeBg: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300',
          dotBg: 'bg-cyan-400',
        };
    }
  };

  const config = getPlatformConfig();
  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border backdrop-blur-md transition-all duration-300 ${config.badgeBg} ${className}`}
    >
      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{config.name} Detected</span>
    </div>
  );
};
