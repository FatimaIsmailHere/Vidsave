import React from 'react';
import { Downloader } from './Downloader';
import { Youtube, Instagram, Music2, Shield, Zap, Lock, Sparkles } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <section className="relative pt-6 sm:pt-10 md:pt-16 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Lighting Meshes */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[450px] bg-hero-glow pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto text-center">
        {/* Top Feature Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 border border-violet-500/30 backdrop-blur-md mb-6 shadow-sm">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-violet-500" />
          </span>
          <span className="text-xs font-medium text-slate-300">
            #1 Free Online Social Media Downloader
          </span>
        </div>

        {/* Main SEO Headline */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-[1.15] mb-5">
          Download Online Videos.{' '}
          <span className="glow-gradient-text block sm:inline">
            Simple. Fast. Clean.
          </span>
        </h1>

        {/* Subtext */}
        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed">
          Download YouTube Videos & Shorts, Instagram Reels, and TikTok clips in crystal-clear HD MP4 and MP3 audio instantly.
        </p>

        {/* Downloader Card Component */}
        <Downloader />

        {/* Supported Platform Badges */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-6">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-white/5 text-xs text-slate-300">
            <Youtube className="w-4 h-4 text-red-500" />
            <span>YouTube HD & MP3</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-white/5 text-xs text-slate-300">
            <Instagram className="w-4 h-4 text-pink-500" />
            <span>Instagram Reels & Video</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-white/5 text-xs text-slate-300">
            <Music2 className="w-4 h-4 text-cyan-400" />
            <span>TikTok HD No Watermark</span>
          </div>
        </div>

        {/* Trust Points */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl mx-auto pt-6 border-t border-white/5">
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Ultra Fast Processing</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>100% Free & Secure</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
            <Lock className="w-3.5 h-3.5 text-violet-400" />
            <span>Zero File Retention</span>
          </div>
        </div>
      </div>
    </section>
  );
};
