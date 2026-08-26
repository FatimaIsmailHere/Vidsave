import React from 'react';
import { DownloadCloud, ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-white/10 bg-slate-950/80 backdrop-blur-md pt-12 pb-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-400">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-white/5">
        {/* Col 1: Brand */}
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-violet-600 to-cyan-400 p-0.5">
              <div className="w-full h-full bg-slate-950 rounded-[6px] flex items-center justify-center">
                <DownloadCloud className="w-4 h-4 text-cyan-400" />
              </div>
            </div>
            <span className="text-base font-bold text-white tracking-tight">
              Snap<span className="text-violet-400">Vid</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
            The free online social media downloader for YouTube, Instagram, and TikTok. Download your authorized content in crystal-clear MP4 and MP3 formats.
          </p>
          <div className="flex items-center gap-2 text-[11px] text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Encrypted Streams • Zero File Retention Policy</span>
          </div>
        </div>

        {/* Col 2: Navigation */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Quick Links
          </h4>
          <ul className="space-y-2">
            <li>
              <a href="#downloader-card" className="hover:text-white transition-colors">
                Video Downloader
              </a>
            </li>
            <li>
              <a href="#how-it-works" className="hover:text-white transition-colors">
                How It Works
              </a>
            </li>
            <li>
              <a href="#platforms" className="hover:text-white transition-colors">
                Supported Platforms
              </a>
            </li>
            <li>
              <a href="#faq" className="hover:text-white transition-colors">
                FAQ
              </a>
            </li>
          </ul>
        </div>

        {/* Col 3: Legal & Disclaimer */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            Legal & Compliance
          </h4>
          <ul className="space-y-2">
            <li>
              <span className="hover:text-white cursor-pointer transition-colors">
                Terms of Service
              </span>
            </li>
            <li>
              <span className="hover:text-white cursor-pointer transition-colors">
                Privacy Policy
              </span>
            </li>
            <li>
              <span className="hover:text-white cursor-pointer transition-colors">
                Fair Use & Copyright
              </span>
            </li>
            <li>
              <span className="hover:text-white cursor-pointer transition-colors">
                DMCA Notice
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Copyright & Disclaimer */}
      <div className="max-w-7xl mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
        <p className="text-center sm:text-left text-slate-400">
          Disclaimer: SnapVid is an independent online tool for authorized personal use and is not affiliated with, endorsed by, or sponsored by YouTube, Instagram, or TikTok. All product names, logos, and brands are property of their respective owners.
        </p>

        <p className="shrink-0 text-slate-400 flex items-center gap-1">
          © {new Date().getFullYear()} SnapVid. Built with <Heart className="w-3 h-3 text-rose-500 fill-rose-500 inline" /> for creators.
        </p>
      </div>
    </footer>
  );
};
