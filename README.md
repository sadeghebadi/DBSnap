# DBSnap Monorepo

## Overview
DBSnap is a database snapshot and versioning tool.

## Structure
- `apps/web`: Next.js frontend
- `apps/api`: NestJS API gateway
- `apps/worker`: NestJS background worker
- `packages/database`: Shared Prisma client
- `packages/config`: Shared configurations

## Getting Started
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start infrastructure:
   ```bash
   docker compose up -d
   ```
3. Build all packages:
   ```bash
   turbo run build
   ```
