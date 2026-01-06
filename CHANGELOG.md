# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

## [0.0.1] - 2026-01-06

### Added
- **Foundation**: Initial monorepo setup with Turborepo, NestJS (API/Worker), and Next.js (Web).
- **Configuration**: Centralized `@dbsnap/config` package using Zod for strong environment variable validation.
- **Web**: Integrated shared config into `apps/web` to enforce environment variable presence during build.
- **Linting**: Created shared ESLint (Flat Config) & Prettier configuration in `@dbsnap/config`.
- **Formatting**: Standardized linting across `apps/api`, `apps/web`, and `packages/database`.
- **Docs**: Added `CONTRIBUTING.md` to establish development guidelines.
- **Infrastructure**: Finalized `docker-compose.yml` with MongoDB (Replica Set), Postgres, Redis, and MinIO.
- **Port Mapping**: Remapped MongoDB (27018) and Redis (6380) to avoid local port conflicts.
- **CI**: Added GitHub Actions workflow `quality-gate` running lint, build, and test.
