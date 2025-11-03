FROM node:24-alpine

RUN apt-get update && \
  apt-get install -y \
    wait-for-it


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

# Install dependencies
RUN pnpm install --frozen-lockfile

# Set working directory to client
WORKDIR /app/packages/client

# # Expose port
# EXPOSE 5173

# Start development server
CMD ["pnpm", "dev", "--host", "0.0.0.0"]
