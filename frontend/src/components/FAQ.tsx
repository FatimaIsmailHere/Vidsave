'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

export const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FAQItem[] = [
    {
      question: 'Which platforms does SnapVid support?',
      answer:
        'SnapVid currently supports YouTube (standard videos, shorts, and music), Instagram (public reels, videos, and posts), and TikTok (public short videos). Only authorized public content from these platforms is supported.',
    },
    {
      question: 'Do I need an account or registration to use SnapVid?',
      answer:
        'No. SnapVid is 100% free and requires no account creation, logins, credit cards, or personal data.',
    },
    {
      question: 'Why can’t some social media URLs be processed?',
      answer:
        'If a URL cannot be processed, it may be due to one of several reasons: the media is marked private or restricted by its author, requires an active account login, contains DRM protection, or the link format is malformed. SnapVid strictly respects platform access controls and privacy settings.',
    },
    {
      question: 'Can private videos or stories be downloaded?',
      answer:
        'No. SnapVid does not bypass authentication or access private accounts. Only publicly accessible media that you have the right or permission to download can be processed.',
    },
    {
      question: 'Does SnapVid store or track my downloaded files?',
      answer:
        'No. We do not retain copies of any downloaded media on our servers. Files are processed statelessly and temporary buffers are purged automatically immediately after transfer.',
    },
    {
      question: 'Which download formats are available?',
      answer:
        'Depending on the source video, SnapVid offers MP4 video formats (1080p Full HD, 720p HD, 480p SD, 360p) and high-bitrate audio formats (MP3/M4A). Available options are detected and displayed dynamically upon URL analysis.',
    },
    {
      question: 'Is SnapVid free to use?',
      answer:
        'Yes, the service is 100% free. We support server bandwidth and maintenance costs through non-intrusive banner advertisements.',
    },
    {
      question: 'How do I download videos to my mobile phone (iPhone / Android)?',
      answer:
        'Simply paste the video link into the URL field in your mobile browser (Safari, Chrome, etc.), tap "Analyze Link", and select your desired format. The download will start automatically in your device’s downloads manager.',
    },
  ];

  const toggleIndex = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-950/40 border border-violet-500/30 text-xs font-semibold text-violet-300 mb-3">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Frequently Asked Questions</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
          Got Questions? We Have Answers.
        </h2>
        <p className="text-sm sm:text-base text-slate-400 mt-3">
          Everything you need to know about our downloader, supported formats, and privacy policies.
        </p>
      </div>

      <div className="space-y-3.5">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isOpen
                  ? 'border-violet-500/40 bg-slate-900/80 shadow-lg shadow-violet-950/20'
                  : 'border-white/10 bg-slate-900/40 hover:border-white/20'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleIndex(idx)}
                aria-expanded={isOpen}
                className="w-full p-5 text-left flex items-center justify-between gap-4 focus:outline-none"
              >
                <span className="text-sm sm:text-base font-semibold text-white">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-violet-400 shrink-0 transition-transform duration-300 ${
                    isOpen ? 'rotate-180 text-cyan-400' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-white/5 animate-in fade-in duration-200">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
