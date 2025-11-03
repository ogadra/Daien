# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Daien (代演) is a React-based web application that allows manual invocation of Model Context Protocol (MCP) tools instead of LLM automatic execution. The project uses a monorepo structure with pnpm workspaces.

## Architecture

- **Client (`packages/client/`)**: React + TypeScript + Vite frontend application
  - Uses Yamada UI component library via shared UI package
  - Connects to MCP servers via HTTP transport
  - Provides manual tool execution interface
- **UI (`packages/ui/`)**: Shared component library wrapping Yamada UI
- **Containers**: Docker setup for Playwright MCP server

## Development Commands

### Setup and Installation
```bash
pnpm install
```

### Development
```bash
# Start development environment with Docker (recommended)
docker compose up -d

# This runs both:
# - playwright-mcp service on port 8010
# - client service on port 5173 (pnpm dev inside container)
```

### Build and Format
```bash
# Build all packages
pnpm build

# Format code with Biome
pnpm format

# Check code with Biome linter
pnpm check
```

### Docker Development
The project is designed to run in Docker:
- `playwright-mcp` service: Runs Playwright MCP server on port 8010
- `client` service: Runs `pnpm dev` inside container on port 5173 with proxy to MCP server

## Environment Configuration

Client requires environment variables:
- `VITE_MCP_SERVER_URL`: URL for MCP server connection
- `VITE_PROXY_TARGET_URL`: Target URL for Vite dev server proxy

Environment files should be placed in `packages/client/.env.local` and copied to container.

## Code Style

- Uses Biome for formatting and linting (tab indentation, double quotes)
- Pre-commit hooks with Lefthook enforce code quality
- TypeScript strict mode enabled
- React 19 with SWC for fast refresh

## Key Files

- `packages/client/lib/MCPClient.ts`: MCP connection handling
- `packages/client/vite.config.ts`: Vite configuration with MCP proxy
- `packages/client/src/App.tsx`: Main application component
- `compose.yml`: Docker services configuration
- `biome.jsonc`: Code formatting and linting rules
- `lefthook.yml`: Git hooks configuration

## MCP Integration

The application uses Model Context Protocol SDK to connect to MCP servers:
- Streamable HTTP transport for real-time communication
- Tool listing and execution through standardized MCP interface
- Manual tool parameter input and result display

## Workspace Structure

Uses pnpm workspaces with:
- Shared UI components in `@packages/ui`
- Client application consuming shared components
- Centralized dependency management at root level
