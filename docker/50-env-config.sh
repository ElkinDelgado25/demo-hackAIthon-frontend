#!/bin/sh
set -eu

API_BASE_URL="${VITE_API_BASE_URL:-https://demo-hackaithon-backend.onrender.com/api}"

cat > /usr/share/nginx/html/env-config.js <<EOF
window.__APP_CONFIG__ = {
  VITE_API_BASE_URL: "${API_BASE_URL}"
};
EOF
