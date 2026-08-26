import React from 'react';
import { Zap, ShieldCheck, HardDriveDownload, Sparkles, Smartphone, Music } from 'lucide-react';

export const Features: React.FC = () => {
  const features = [
    {
      title: 'Lightning Fast Online Analysis',
      description: 'Instant metadata resolution and fast progressive downloads without queues or artificial wait times.',
      icon: Zap,
      color: 'text-amber-400',
    },
    {
      title: 'Zero File Retention & Privacy',
      description: 'We do not maintain a permanent database or store your media files. Streams are purged immediately after download.',
      icon: ShieldCheck,
      color: 'text-emerald-400',
    },
    {
      title: 'Full HD & 4K Video Quality',
      description: 'Access high-bitrate video streams up to 1080p Full HD where supported by the host platform.',
      icon: HardDriveDownload,
      color: 'text-violet-400',
    },
    {
      title: 'Pure MP3 Audio Extractor',
      description: 'Separate background scores and audio tracks directly into high-fidelity MP3 and M4A sound files.',
      icon: Music,
      color: 'text-pink-400',
    },
    {
      title: 'Works on iOS, Android & PC',
      description: 'Engineered for smooth usability on iPhone, Android, iPads, tablets, laptops, and desktop computers.',
      icon: Smartphone,
      color: 'text-cyan-400',
    },
    {
      title: '100% Free & No Sign-up Needed',
      description: 'Enjoy unrestricted downloads for your permitted content without creating an account or providing personal info.',
      icon: Sparkles,
      color: 'text-purple-400',
    },
  ];

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="text-center max-w-3xl mx-auto mb-14">
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          Why Choose SnapVid?
        </h2>
        <p className="text-sm sm:text-base text-slate-400 mt-3">
          Engineered from the ground up for speed, privacy, and pristine media download quality.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((f, i) => {
          const Icon = f.icon;
          return (
            <div
              key={i}
              className="glass-panel glass-panel-hover rounded-2xl p-6 flex flex-col justify-between"
            >
              <div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 w-fit mb-4">
                  <Icon className={`w-6 h-6 ${f.color}`} />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{f.title}</h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                  {f.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
