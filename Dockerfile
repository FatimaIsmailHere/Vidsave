FROM node:20-alpine

# Install Python3, ffmpeg, curl and yt-dlp with curl-cffi support
RUN apk update && \
    apk add --no-cache python3 py3-pip ffmpeg curl gcc musl-dev python3-dev && \
    python3 -m venv /opt/venv && \
    /opt/venv/bin/pip install --upgrade pip && \
    /opt/venv/bin/pip install yt-dlp curl-cffi

ENV PATH="/opt/venv/bin:$PATH"

WORKDIR /app

COPY backend/package*.json ./backend/
RUN cd backend && npm install

COPY backend ./backend
RUN cd backend && npm run build

EXPOSE 5000

ENV PORT=5000
ENV NODE_ENV=production

WORKDIR /app/backend
CMD ["node", "dist/server.js"]
