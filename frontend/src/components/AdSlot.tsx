'use client';

import React, { useEffect, useRef } from 'react';
import { Megaphone, Sparkles } from 'lucide-react';
import { AdsterraAd } from './AdsterraAd';

export type AdVariant = 'top' | 'banner' | 'sidebar' | 'mobile' | 'bottom';

interface AdSlotProps {
  variant: AdVariant;
  slotId?: string; // Optional specific Google AdSense Slot ID
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>;
  }
}

function getAdsterraKey(variant: AdVariant): { key: string; width: number; height: number } | null {
  if (variant === 'mobile') {
    const key = process.env.NEXT_PUBLIC_ADSTERRA_BANNER_KEY_320;
    if (key) return { key, width: 320, height: 50 };
  } else if (variant === 'top' || variant === 'banner' || variant === 'bottom') {
    const key = process.env.NEXT_PUBLIC_ADSTERRA_BANNER_KEY_728;
    if (key) return { key, width: 728, height: 90 };
  }
  return null;
}

export const AdSlot: React.FC<AdSlotProps> = ({ variant, slotId, className = '' }) => {
  const adClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
  const isAdSenseActive = Boolean(adClient && adClient.startsWith('ca-pub-'));
  const adRef = useRef<HTMLModElement | null>(null);
  const adsterraConfig = getAdsterraKey(variant);
  const isAdsterraActive = Boolean(adsterraConfig);

  // Use Adsterra if AdSense is not active but Adsterra keys are configured
  const useAdsterra = !isAdSenseActive && isAdsterraActive;

  useEffect(() => {
    if (isAdSenseActive && typeof window !== 'undefined') {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (err) {
        console.error('Google AdSense push error:', err);
      }
    }
  }, [isAdSenseActive]);

  const getDimensionsAndStyle = () => {
    switch (variant) {
      case 'top':
        return {
          wrapper: 'w-full max-w-5xl mx-auto my-4',
          box: 'h-20 sm:h-24 md:h-28',
          label: 'Top Header Leaderboard (728x90 / 970x90)',
          format: 'horizontal',
        };
      case 'banner':
        return {
          wrapper: 'w-full max-w-4xl mx-auto my-8',
          box: 'h-28 sm:h-36',
          label: 'In-Content Responsive Banner (728x90 / Responsive)',
          format: 'auto',
        };
      case 'sidebar':
        return {
          wrapper: 'w-full max-w-[300px] my-4 hidden lg:block',
          box: 'h-[600px]',
          label: 'Sidebar Half-Page Ad (300x600)',
          format: 'vertical',
        };
      case 'mobile':
        return {
          wrapper: 'w-full max-w-sm mx-auto my-5 block md:hidden',
          box: 'h-24',
          label: 'Mobile In-Stream Ad (320x50 / 300x100)',
          format: 'auto',
        };
      case 'bottom':
        return {
          wrapper: 'w-full max-w-5xl mx-auto my-8',
          box: 'h-24 sm:h-32',
          label: 'Footer Leaderboard Ad (970x90 / 728x90)',
          format: 'horizontal',
        };
    }
  };

  const config = getDimensionsAndStyle();

  return (
    <aside
      aria-label="Sponsored Advertisement"
      className={`ad-container select-none ${config.wrapper} ${className}`}
    >
      <div className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mb-1.5 flex items-center justify-center gap-1.5">
        <Megaphone className="w-3 h-3 text-slate-400" />
        <span>Sponsored Advertisement</span>
      </div>

      {isAdSenseActive ? (
        <div className={`w-full ${config.box} flex items-center justify-center overflow-hidden`}>
          <ins
            ref={adRef}
            className="adsbygoogle block w-full h-full"
            data-ad-client={adClient}
            data-ad-slot={slotId || '1234567890'}
            data-ad-format={config.format}
            data-full-width-responsive="true"
          />
        </div>
      ) : useAdsterra && adsterraConfig ? (
        <div className={`w-full ${config.box} flex items-center justify-center overflow-hidden`}>
          <AdsterraAd
            adKey={adsterraConfig.key}
            width={adsterraConfig.width}
            height={adsterraConfig.height}
          />
        </div>
      ) : (
        <div
          className={`w-full ${config.box} rounded-2xl border border-dashed border-white/10 bg-slate-900/40 backdrop-blur-sm flex flex-col items-center justify-center text-center p-4 transition-all hover:border-violet-500/30 group`}
        >
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 group-hover:text-violet-300 transition-colors">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Google AdSense Ready Slot</span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1">
            {config.label}
          </span>
          <span className="text-[9px] text-slate-400 mt-1">
            Set NEXT_PUBLIC_ADSENSE_CLIENT_ID to display live Google Ads
          </span>
        </div>
      )}
    </aside>
  );
};
