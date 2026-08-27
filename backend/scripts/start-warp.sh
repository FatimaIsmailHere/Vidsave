#!/bin/sh
# Start Cloudflare WARP as a SOCKS5 proxy for yt-dlp YouTube requests.
# YouTube does not block Cloudflare WARP IPs, making this a free alternative
# to residential proxies for bypassing datacenter IP blocks.

WARP_BIN="/usr/local/bin/warp"
WARP_DATA_DIR="${HOME}/.cloudflare-warp"
WARP_SOCKS_PORT="${WARP_SOCKS_PORT:-1080}"

# Skip if WARP binary not found or proxy already set externally
if [ ! -f "$WARP_BIN" ]; then
  echo "[warp] Binary not found at $WARP_BIN, skipping WARP proxy setup"
  exit 0
fi

if [ -n "$YTDLP_PROXY" ]; then
  echo "[warp] YTDLP_PROXY already set to $YTDLP_PROXY, skipping WARP"
  exit 0
fi

mkdir -p "$WARP_DATA_DIR"

# Register a new WARP account if not already registered
if [ ! -f "$WARP_DATA_DIR/reg.json" ]; then
  echo "[warp] Registering new WARP account..."
  "$WARP_BIN" generate --data-dir "$WARP_DATA_DIR" 2>&1 || true
fi

echo "[warp] Starting WARP SOCKS5 proxy on port $WARP_SOCKS_PORT..."
"$WARP_BIN" run \
  --data-dir "$WARP_DATA_DIR" \
  --socks-addr "127.0.0.1:$WARP_SOCKS_PORT" &

WARP_PID=$!
echo "[warp] WARP proxy started with PID $WARP_PID"

# Wait a few seconds for the proxy to connect
sleep 3

# Verify the proxy is working
if curl -s --max-time 5 --proxy "socks5://127.0.0.1:$WARP_SOCKS_PORT" https://cloudflare.com/cdn-cgi/trace 2>/dev/null | grep -q "warp=on"; then
  echo "[warp] WARP proxy verified and working!"
  export YTDLP_PROXY="socks5://127.0.0.1:$WARP_SOCKS_PORT"
  echo "[warp] YTDLP_PROXY=$YTDLP_PROXY"
else
  echo "[warp] WARNING: WARP proxy verification failed, yt-dlp will run without proxy"
fi
