'use client';

import React, { useState } from 'react';
import { DownloadCloud, Menu, X, Sparkles } from 'lucide-react';

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const elem = document.getElementById(id);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/80 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <a
          href="#"
          className="flex items-center gap-2.5 group cursor-pointer focus:outline-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-purple-600 to-cyan-400 p-0.5 shadow-lg shadow-violet-900/30 group-hover:scale-105 transition-transform duration-200">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <DownloadCloud className="w-5 h-5 text-cyan-400 group-hover:text-violet-300 transition-colors" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-1.5">
              Snap<span className="text-violet-400">Vid</span>
              <span className="hidden xs:inline-block px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-violet-500/20 text-violet-300 border border-violet-500/30">
                PRO
              </span>
            </span>
            <span className="text-[10px] text-slate-400 -mt-1 hidden sm:block">
              Free Video Downloader
            </span>
          </div>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <button
            type="button"
            onClick={() => scrollToSection('downloader-card')}
            className="hover:text-white transition-colors"
          >
            Downloader
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('how-it-works')}
            className="hover:text-white transition-colors"
          >
            How It Works
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('platforms')}
            className="hover:text-white transition-colors"
          >
            Supported Platforms
          </button>
          <button
            type="button"
            onClick={() => scrollToSection('faq')}
            className="hover:text-white transition-colors"
          >
            FAQ
          </button>
        </nav>

        {/* Right CTA Button & Mobile Trigger */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => scrollToSection('downloader-card')}
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl glow-purple-button text-white text-xs font-semibold"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Paste Link</span>
          </button>

          {/* Mobile Menu Hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
            className="md:hidden p-2 rounded-xl text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/10 bg-slate-950/95 backdrop-blur-2xl px-4 pt-3 pb-6 animate-in slide-in-from-top duration-200">
          <div className="flex flex-col space-y-3 text-sm font-medium text-slate-300">
            <button
              type="button"
              onClick={() => scrollToSection('downloader-card')}
              className="text-left px-3 py-2 rounded-lg hover:bg-white/5 hover:text-white"
            >
              Downloader
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('how-it-works')}
              className="text-left px-3 py-2 rounded-lg hover:bg-white/5 hover:text-white"
            >
              How It Works
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('platforms')}
              className="text-left px-3 py-2 rounded-lg hover:bg-white/5 hover:text-white"
            >
              Supported Platforms
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('faq')}
              className="text-left px-3 py-2 rounded-lg hover:bg-white/5 hover:text-white"
            >
              FAQ
            </button>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => scrollToSection('downloader-card')}
                className="w-full py-2.5 rounded-xl glow-purple-button text-white text-xs font-semibold flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Start Downloading</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
