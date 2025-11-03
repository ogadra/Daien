FROM node:24-alpine

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set working directory
WORKDIR /app

# Copy root package.json and pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./

# Copy packages
COPY packages/ui ./packages/ui
COPY packages/client ./packages/client

# Copy environment files
COPY packages/client/.env.local ./packages/client/.env

# Install dependencies
RUN pnpm install --frozen-lockfile

# Set working directory to client
WORKDIR /app/packages/client

# Start development server
CMD ["pnpm", "dev", "--host", "0.0.0.0"]
