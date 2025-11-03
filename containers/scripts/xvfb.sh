#!/bin/bash

# https://github.dev/jam0824/docker_playwright

Xvfb :99 -screen 0 1920x1080x24 -ac -nolisten tcp &

export DISPLAY=:99

for i in {1..10}; do
  if xdpyinfo -display "$DISPLAY" > /dev/null 2>&1; then
    break
  fi
  sleep 0.5
done

x11vnc -display "$DISPLAY" -rfbport 5910 -localhost -forever &
websockify --web=/usr/share/novnc 8010 localhost:5910 &

pnpm dlx @playwright/mcp@latest --config scripts/playwright.config.json --allowed-hosts "*"
