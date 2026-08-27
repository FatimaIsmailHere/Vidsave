#!/bin/sh
# Main startup script: launches WARP proxy (if available) then the backend.

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Start WARP proxy in background
sh "$SCRIPT_DIR/start-warp.sh" &

# Give WARP a moment to connect
sleep 2

# Start the Node.js backend
exec node dist/server.js
