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
   **Services:**
   - **PostgreSQL**: `localhost:5432` (User/Pass: admin/admin, DB: dbsnap)
   - **Redis**: `localhost:6380` (Mapped from 6379 to avoid conflicts)
   - **MinIO**: `localhost:9000` (Console: `localhost:9001`)
   - **MongoDB**: `localhost:27018` (Mapped from 27017 to avoid conflicts)

3. Build all packages:
   ```bash
   turbo run build
   ```
