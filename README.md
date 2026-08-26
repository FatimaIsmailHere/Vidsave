# SnapVid — Free Online Social Media Video Downloader

A production-ready, SEO-optimized web application and lightweight API for downloading public media from **YouTube**, **Instagram**, and **TikTok**. Built with **React 18**, **Next.js 14**, **TypeScript**, **Tailwind CSS**, and a modular **Node.js/Express** backend with static FFmpeg media processor.

---

## Key Features

- **Supported Platforms**:
  - **YouTube**: Videos, Shorts, 1080p Full HD, 720p HD, 480p SD, and high-fidelity MP3/M4A audio extraction.
  - **Instagram**: Public Reels and Video posts.
  - **TikTok**: Public HD videos (no watermark) and original sound MP3 extraction.
- **Modern SaaS Aesthetics & User Experience**:
  - Deep obsidian dark theme with purple, cyan, and rose lighting.
  - Glassmorphic panels with backdrop filters (`backdrop-blur-xl`).
  - Instant client-side platform auto-detection badge.
  - Interactive **Download Interstitial Ad Modal** with countdown before triggering file downloads.
  - Clean format selector tabs for Video and Audio with estimated file sizes.
- **SEO & Google Rich Results Optimized**:
  - Semantic HTML5 structure with optimized `<h1>`, `<h2>`, `<h3>` hierarchy.
  - Schema.org `WebApplication` and `SoftwareApplication` JSON-LD structured data for enhanced Google search ranking.
  - High-converting, high-volume keyword targeting (*YouTube Video Downloader*, *Instagram Reels Downloader*, *TikTok Video Downloader*).
- **Google AdSense Ready**:
  - Pre-configured modular `<AdSlot />` components with standard AdSense responsive formats.
  - Instant activation: Simply set `NEXT_PUBLIC_ADSENSE_CLIENT_ID` in `.env.local` to go live without touching code.
- **Architecture & Security**:
  - **Zero Database & No User Accounts**: Fully stateless and private.
  - **Zero File Retention**: Temporary stream buffers are purged immediately after transfer.
  - **Embedded Cross-Platform FFmpeg**: Bundled `ffmpeg-static` for high-quality audio and progressive video merging on any server.
  - **Domain Allowlisting & SSRF Protection**: Strictly restricts outbound requests to authorized domains.
  - **Rate Limiting**: Defends endpoints against excessive traffic.
  - **DRM & Fair Use Compliance**: Respects access controls and private-content restrictions.

---

## Directory Structure

```text
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── globals.css
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   ├── components/
│   │   │   ├── AdSlot.tsx
│   │   │   ├── DownloadAdModal.tsx
│   │   │   ├── DownloadButton.tsx
│   │   │   ├── Downloader.tsx
│   │   │   ├── ErrorState.tsx
│   │   │   ├── FAQ.tsx
│   │   │   ├── Features.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── FormatSelector.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── Hero.tsx
│   │   │   ├── HowItWorks.tsx
│   │   │   ├── LoadingState.tsx
│   │   │   ├── MediaPreview.tsx
│   │   │   ├── PlatformBadge.tsx
│   │   │   ├── PlatformCards.tsx
│   │   │   └── UrlInput.tsx
│   │   ├── lib/
│   │   │   ├── api.ts
│   │   │   └── platform-detector.ts
│   │   └── types/
│   │       └── index.ts
│   ├── .env.example
│   ├── next.config.js
│   ├── package.json
│   ├── tailwind.config.ts
│   └── tsconfig.json
│
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   └── media.controller.ts
│   │   ├── routes/
│   │   │   └── media.routes.ts
│   │   ├── services/
│   │   │   ├── instagram.service.ts
│   │   │   ├── media-processor.service.ts
│   │   │   ├── tiktok.service.ts
│   │   │   └── youtube.service.ts
│   │   ├── types/
│   │   │   └── media.types.ts
│   │   ├── utils/
│   │   │   ├── format.utils.ts
│   │   │   ├── platform.detector.ts
│   │   │   └── ytdlp.runner.ts
│   │   ├── validators/
│   │   │   └── url.validator.ts
│   │   └── server.ts
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
├── package.json
└── README.md
```

---

## Quick Start & Local Development

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **yt-dlp**: Installed and in PATH.

### 2. Installation
```bash
npm run install:all
```

### 3. Environment Variables
Frontend (`frontend/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/media

# To activate Google AdSense, paste your Publisher ID:
NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-XXXXXXXXXXXXXXXX
```

Backend (`backend/.env`):
```env
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
TEMP_STORAGE_PATH=./temp_media
```

### 4. Run Both Frontend and Backend
```bash
npm run dev
```
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`

---

## Google AdSense Integration Guide

To connect your Google AdSense account:
1. Open `frontend/.env.local`.
2. Add your AdSense Publisher ID:
   ```env
   NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-1234567890123456
   ```
3. Restart or rebuild the frontend (`npm run build`).
4. All `<AdSlot />` components will automatically render live Google Ads across desktop and mobile positions.

---

## Production Deployment

### Frontend (Vercel)
1. Link the repository on [Vercel](https://vercel.com).
2. Set root directory to `frontend`.
3. Set environment variable `NEXT_PUBLIC_API_URL` to your live backend URL (e.g. `https://api.yourdomain.com/api/media`).
4. (Optional) Set `NEXT_PUBLIC_ADSENSE_CLIENT_ID`.
5. Click **Deploy**.

### Backend (Node.js VPS / Render / Railway / Docker)
1. Deploy the `backend/` directory to a Node.js runtime.
2. Ensure `yt-dlp` is installed on the container/host (`pip install yt-dlp` or binary download).
3. Set `PORT=5000`, `NODE_ENV=production`, `CORS_ORIGIN=https://yourdomain.com`.
4. Run `npm run build && npm start`.
