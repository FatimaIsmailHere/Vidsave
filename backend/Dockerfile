FROM node:20-alpine

# Install Python3, ffmpeg, curl and yt-dlp with curl-cffi support
RUN apk update && \
    apk add --no-cache python3 py3-pip ffmpeg curl gcc musl-dev python3-dev && \
    python3 -m venv /opt/venv && \
    /opt/venv/bin/pip install --upgrade pip && \
    /opt/venv/bin/pip install 'yt-dlp[default]>=2024.8.6' curl-cffi

ENV PATH="/opt/venv/bin:$PATH"

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 5000

ENV PORT=5000
ENV NODE_ENV=production

CMD ["npm", "start"]
