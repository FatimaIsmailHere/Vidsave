import React from 'react';
import { Youtube, Instagram, Music2, CheckCircle2, Sparkles } from 'lucide-react';

export const PlatformCards: React.FC = () => {
  const platforms = [
    {
      name: 'YouTube',
      tagline: 'Videos, Shorts & MP3 Audio',
      description:
        'Extract high-definition MP4 video up to 1080p Full HD as well as crisp MP3/M4A audio tracks from public YouTube videos and shorts.',
      icon: Youtube,
      color: 'from-red-600/20 to-orange-600/10 border-red-500/30 text-red-400',
      glow: 'group-hover:shadow-red-900/20',
      features: [
        '1080p, 720p, 480p MP4 formats',
        'High quality MP3 audio extraction',
        'Standard & Short-form video support',
        'Full metadata & thumbnail previews',
      ],
    },
    {
      name: 'Instagram',
      tagline: 'Reels & Public Video Content',
      description:
        'Download authorized public Instagram reels, video posts, and IGTV clips seamlessly with crystal clear audio and video quality.',
      icon: Instagram,
      color: 'from-pink-600/20 to-purple-600/10 border-pink-500/30 text-pink-400',
      glow: 'group-hover:shadow-pink-900/20',
      features: [
        'Public Reels & Video post support',
        'High-resolution MP4 video stream',
        'Original sound/audio track saving',
        'Fast direct link resolution',
      ],
    },
    {
      name: 'TikTok',
      tagline: 'Shorts & Audio Tracks',
      description:
        'Save public TikTok videos and original sound files in crisp HD quality without annoying watermarks where legally permitted.',
      icon: Music2,
      color: 'from-cyan-600/20 to-blue-600/10 border-cyan-500/30 text-cyan-400',
      glow: 'group-hover:shadow-cyan-900/20',
      features: [
        'HD clean video streams',
        'Original sound & BGM extraction',
        'Supports standard and short share URLs',
        'Instant mobile & desktop compatibility',
      ],
    },
  ];

  return (
    <section id="platforms" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-950/40 border border-violet-500/30 text-xs font-semibold text-violet-300 mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Supported Platforms</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          Built Specifically for Top Social Platforms
        </h2>
        <p className="text-sm sm:text-base text-slate-400 mt-3 leading-relaxed">
          Optimized lightweight extractors engineered specifically for each platform’s unique media structure.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {platforms.map((p) => {
          const Icon = p.icon;
          return (
            <div
              key={p.name}
              className={`glass-panel glass-panel-hover rounded-3xl p-6 sm:p-8 flex flex-col justify-between group relative overflow-hidden transition-all duration-300 ${p.glow}`}
            >
              {/* Background gradient hint */}
              <div
                className={`absolute top-0 right-0 w-36 h-36 bg-gradient-to-br ${p.color} blur-3xl opacity-40 group-hover:opacity-70 transition-opacity`}
              />

              <div>
                <div
                  className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${p.color} border flex items-center justify-center mb-5`}
                >
                  <Icon className="w-6 h-6" />
                </div>

                <h3 className="text-xl font-bold text-white mb-1">{p.name}</h3>
                <p className="text-xs font-medium text-violet-400 mb-3">{p.tagline}</p>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
                  {p.description}
                </p>

                <ul className="space-y-2.5 pt-4 border-t border-white/5">
                  {p.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-8 pt-4">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  100% Compliant & Public Only
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
