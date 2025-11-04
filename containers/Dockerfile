FROM node:24-slim
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
