import React from 'react';
import { ClipboardCopy, Cpu, DownloadCloud, ArrowRight } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Paste URL',
      description:
        'Copy the media link from YouTube, Instagram, or TikTok and paste it into the downloader field above.',
      icon: ClipboardCopy,
      color: 'from-violet-500/20 to-purple-500/10 border-violet-500/30 text-violet-400',
    },
    {
      step: '02',
      title: 'Analyze Link',
      description:
        'Our lightweight engine identifies the platform and queries all authorized media formats and resolutions.',
      icon: Cpu,
      color: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/30 text-cyan-400',
    },
    {
      step: '03',
      title: 'Download File',
      description:
        'Select your preferred video resolution (1080p, 720p, etc.) or audio track and save it directly to your device.',
      icon: DownloadCloud,
      color: 'from-pink-500/20 to-rose-500/10 border-pink-500/30 text-pink-400',
    },
  ];

  return (
    <section id="how-it-works" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-14">
        <span className="text-xs font-bold uppercase tracking-widest text-violet-400 mb-2 block">
          Simple Workflow
        </span>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          How It Works in 3 Quick Steps
        </h2>
        <p className="text-sm sm:text-base text-slate-400 mt-3">
          Zero software installation, zero registration, and instantaneous conversion.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 relative">
        {steps.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div
              key={s.step}
              className="glass-panel glass-panel-hover rounded-3xl p-6 sm:p-8 relative flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${s.color} border flex items-center justify-center`}
                  >
                    <Icon className="w-7 h-7" />
                  </div>
                  <span className="text-4xl font-black text-white/10 font-mono">
                    {s.step}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mb-2">{s.title}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {s.description}
                </p>
              </div>

              {idx < 2 && (
                <div className="hidden md:flex items-center gap-1 text-xs text-slate-400 mt-6 pt-4 border-t border-white/5">
                  <span>Next step</span>
                  <ArrowRight className="w-3.5 h-3.5 text-violet-400" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
