import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#07080c',
};

const SITE_NAME = 'SnapVid';
const SITE_TITLE = 'SnapVid — Free Online Video Downloader | YouTube, Instagram & TikTok';
const SITE_DESC =
  'SnapVid is the fastest free online video downloader. Download YouTube videos and shorts, Instagram reels, and TikTok videos in HD MP4 and MP3 audio with zero registration.';
const SITE_URL = 'https://snapvid.app';

export const metadata: Metadata = {
  title: SITE_TITLE,
  description: SITE_DESC,
  keywords: [
    'video downloader',
    'youtube video downloader',
    'youtube to mp4',
    'youtube to mp3',
    'download youtube shorts',
    'instagram video downloader',
    'instagram reels downloader',
    'tiktok downloader',
    'tiktok video downloader without watermark',
    'free online video downloader',
    'mp4 converter',
    'snapvid',
    'snap save',
  ],
  authors: [{ name: 'SnapVid Team' }],
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESC,
    url: SITE_URL,
    siteName: SITE_NAME,
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESC,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebApplication',
      '@id': `${SITE_URL}/#webapp`,
      name: SITE_NAME,
      url: SITE_URL,
      applicationCategory: 'MultimediaApplication',
      operatingSystem: 'All (Web, iOS, Android, Windows, macOS)',
      offers: {
        '@type': 'Offer',
        price: '0.00',
        priceCurrency: 'USD',
      },
      description: SITE_DESC,
      featureList: [
        'YouTube Video & Shorts Downloader (1080p, 720p, MP4)',
        'YouTube to MP3 Audio Extractor (320kbps, 192kbps)',
        'Instagram Reels & Video Downloader',
        'TikTok HD Video Downloader Without Watermark',
        'No Account or Registration Required',
        'High Speed Progressive Streaming',
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adsenseClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {adsenseClientId && adsenseClientId.startsWith('ca-pub-') && (
          <Script
            id="adsbygoogle-init"
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClientId}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
      </head>
      <body className="bg-background text-slate-100 min-h-screen flex flex-col antialiased selection:bg-violet-500/30 selection:text-violet-200">
        {children}
      </body>
    </html>
  );
}
