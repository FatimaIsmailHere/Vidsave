import React from 'react';
import { Header } from '../components/Header';
import { Hero } from '../components/Hero';
import { PlatformCards } from '../components/PlatformCards';
import { HowItWorks } from '../components/HowItWorks';
import { Features } from '../components/Features';
import { FAQ } from '../components/FAQ';
import { Footer } from '../components/Footer';
import { AdSlot } from '../components/AdSlot';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Global Header */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1">
        {/* Top Ad Slot (Desktop Leaderboard) */}
        <div className="px-4">
          <AdSlot variant="top" />
        </div>

        {/* Hero & Downloader Section */}
        <Hero />

        {/* In-Content Banner Ad */}
        <div className="px-4">
          <AdSlot variant="banner" />
        </div>

        {/* Supported Platforms Section */}
        <PlatformCards />

        {/* Mobile Ad Slot (Visible only on mobile devices) */}
        <div className="px-4">
          <AdSlot variant="mobile" />
        </div>

        {/* How It Works Section */}
        <HowItWorks />

        {/* Features & Why Choose Us */}
        <Features />

        {/* Frequently Asked Questions */}
        <FAQ />

        {/* Bottom Banner Ad */}
        <div className="px-4">
          <AdSlot variant="bottom" />
        </div>
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}
