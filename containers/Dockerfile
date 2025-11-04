FROM node:24-slim@sha256:76d0ed0ed93bed4f4376211e9d8fddac4d8b3fbdb54cc45955696001a3c91152
WORKDIR /app

RUN apt-get update && \
	apt-get install -y \
    curl \
    gnupg \
    wget \
    fonts-noto \
    x11vnc \
    websockify \
    novnc \
    xvfb && \
  apt-get clean && \
  rm -rf /var/lib/apt/lists/*

RUN corepack enable pnpm && pnpm dlx playwright@1.56.1 install --with-deps chromium
