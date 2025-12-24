# Product Requirements Document (PRD)

## Product Name (Working Title)

**DBSnap** – Simple Database Backup & Visual Compare

---

## 1. Overview

### 1.1 Problem Statement

Small teams, startups, and solo developers rely on MongoDB / SQL databases but:

- Backups are often manual, inconsistent, or forgotten
- Existing tools are too complex (enterprise-level)
- Comparing backups is extremely hard (no visual diff)
- Debugging data corruption or accidental deletes is painful

### 1.2 Solution

A **lightweight Micro-SaaS** that:

- Takes automated backups of MongoDB & SQL databases
- Stores versioned snapshots
- Visually compares backups (diffs at table/collection & row/document level)
- Allows fast restore or export
- Focuses on _clarity, speed, and simplicity_

### 1.3 Target Audience

- Indie hackers
- Small startups
- Backend developers
- Freelancers managing client DBs
- Early-stage SaaS teams

### 1.4 Value Proposition

> “See exactly what changed in your database — before it breaks production.”

---

## 2. Goals & Non‑Goals

### 2.1 Goals

- Extremely easy onboarding (≤ 5 minutes)
- Human‑readable visual diffs
- Safe, encrypted backups
- Affordable pricing
- Support MongoDB & PostgreSQL/MySQL in v1

### 2.2 Non‑Goals (v1)

- Real‑time replication
- Enterprise HA / clustering
- Data analytics or BI
- Full DBA replacement

---

## 3. User Personas

### 3.1 Solo Developer

- Needs peace of mind
- Wants simple UI
- Budget‑sensitive

### 3.2 Startup Engineer

- Needs rollback & debugging
- Multiple environments (staging/prod)
- Wants alerts

### 3.3 Freelancer

- Manages multiple client DBs
- Needs separation & access control

---

## 4. Core Features (MVP)

### 4.1 Authentication & Accounts

- Email/password login
- OAuth (GitHub, Google)
- Email verification
- Password reset

---

### 4.2 Project & Database Management

#### Create Project

- Project name
- Environment (prod / staging / dev)

#### Add Database

- Database type: MongoDB / PostgreSQL / MySQL
- Connection method:
  - URI / host + port + credentials
- Test connection button
- Read‑only permission validation

---

### 4.3 Backup Engine

#### Backup Types

- Manual backup
- Scheduled backup (cron‑like)

#### Backup Scope

- Full database
- Selected collections/tables

#### Storage

- Encrypted at rest (AES‑256)
- Cloud object storage (S3 compatible)
- Retention rules

#### Metadata

- Timestamp
- Size
- Duration
- Status (success / failed)

---

### 4.4 Visual Compare (Core Differentiator)

#### Compare Modes

- Backup vs Backup
- Backup vs Live DB

#### MongoDB Diff

- Collection‑level changes
- Document added / removed
- Field‑level diff (JSON diff)

#### SQL Diff

- Table‑level changes
- Row added / deleted
- Column value changes

#### UI Requirements

- Side‑by‑side view
- Color‑coded diffs:
  - Green = added
  - Red = removed
  - Yellow = changed
- Pagination for large datasets

---

### 4.5 Restore & Export

#### Restore Options

- Full restore
- Selective restore (collection/table)
- Restore to new database

#### Export

- JSON / SQL dump download

---

### 4.6 Notifications & Alerts

- Backup success / failure
- Slack / Email / Webhook
- Threshold alerts (size change, record spike)

---

## 5. Admin Panel (Internal)

### 5.1 Admin Dashboard

- Total users
- Active projects
- Storage usage
- Backup frequency

### 5.2 User Management

- View users
- Disable / enable accounts
- Force password reset

### 5.3 Project Oversight

- View projects & databases
- Backup logs
- Error diagnostics

### 5.4 Billing & Plans

- View subscriptions
- Storage usage per user
- Manual plan override

### 5.5 System Health

- Worker status
- Queue depth
- Backup failure rate

---

## 6. Billing & Pricing (Proposed)

### Free

- 1 DB
- Manual backups
- 7‑day retention

### Pro ($10–15/month)

- 3–5 DBs
- Scheduled backups
- Visual diff
- 30‑day retention

### Team ($30+/month)

- Unlimited DBs
- Multi‑user
- Webhooks
- 90‑day retention

---

## 7. Security & Compliance

- Encrypted credentials
- Read‑only DB access
- IP allowlist
- Audit logs
- GDPR‑ready data deletion

---

## 8. Technical Architecture (High Level)

### Frontend

- Next.js
- Tailwind
- Monaco / custom diff viewer

### Backend

- Node.js (NestJS)
- PostgreSQL (metadata)
- Redis (queues)

### Workers

- Backup workers
- Diff workers

### Storage

- S3 compatible storage

---

## 9. API Design (Internal)

- Auth API
- Project API
- Database API
- Backup API
- Diff API
- Restore API

---

## 10. UX Principles

- Developer‑first
- Minimal clicks
- No hidden magic
- Explicit actions

---

## 11. Metrics & KPIs

- Backup success rate
- Time to restore
- Active DBs per user
- Churn rate

---

## 12. Risks & Mitigations

### Risk: Large DB size

- Mitigation: Sampling + pagination

### Risk: Security concerns

- Mitigation: Read‑only access + encryption

### Risk: Slow diffs

- Mitigation: Background diff workers

---

## 13. Roadmap (Post‑MVP)

- Point‑in‑time restore
- Schema change detection
- Git‑like history
- CLI tool
- On‑prem agent

---

## 14. Launch Checklist

- Landing page
- Docs
- Sample demo DB
- 5 beta users
- Feedback loop

---

## 15. Success Criteria

- User can backup DB in < 5 minutes
- Visual diff understandable without docs
- Restore works reliably

---

## 16. Technical Design Document (TDD)

### 16.1 System Components

#### Frontend

- Next.js (App Router)
- Tailwind CSS
- Auth-protected routes
- Diff Viewer (custom JSON/SQL diff renderer)

#### Backend API

- NestJS (modular architecture)
- REST + internal worker APIs
- Auth (JWT + refresh tokens)

#### Workers

- Backup Worker (cron-based)
- Diff Worker (async, heavy processing)
- Restore Worker

#### Queue & Messaging

- Redis + BullMQ
- Job retry & dead-letter queue

---

### 16.2 Data Flow – Backup

1. Scheduler triggers backup job
2. Worker pulls DB connection (decrypted in-memory)
3. Snapshot taken (dump or cursor streaming)
4. File encrypted
5. Upload to object storage
6. Metadata stored in main DB
7. Notification sent

---

### 16.3 Data Flow – Diff

1. User selects two backups
2. Diff job queued
3. Worker loads snapshots
4. Normalize structure
5. Run diff engine
6. Store diff summary
7. UI fetches paginated results

---

### 16.4 Database Schema (High-Level)

#### users

- id
- email
- password_hash
- plan

#### projects

- id
- user_id
- name
- environment

#### databases

- id
- project_id
- type
- connection_encrypted

#### backups

- id
- database_id
- size
- status
- created_at

#### diffs

- id
- backup_a
- backup_b
- summary

---

## 17. UX / UI Wireframes (Textual Specification)

### 17.1 Dashboard

- Project list
- Last backup status
- CTA: Backup now

### 17.2 Project View

- Databases list
- Backup schedule controls
- Retention settings

### 17.3 Backup History

- Timeline view
- Status icons
- Compare button

### 17.4 Visual Compare Screen

- Left: Backup A
- Right: Backup B
- Diff highlights
- Filter (added / removed / changed)

### 17.5 Restore Flow

- Select scope
- Warning modal
- Progress indicator

### 17.6 Admin Panel

- Metrics cards
- User table
- Storage usage graph

---

## 18. MVP Task Breakdown (Jira-Ready)

### Backend Tasks

- Auth module
- Project CRUD
- DB connection validation
- Backup worker
- Storage integration
- Diff engine v1
- Restore logic

### Frontend Tasks

- Auth pages
- Dashboard UI
- Project screens
- Backup history UI
- Diff viewer UI

### DevOps

- CI/CD
- Env secrets
- Monitoring

---

## 19. Development Timeline (30 Days)

### Week 1

- Auth + project setup
- DB models

### Week 2

- Backup engine
- Storage

### Week 3

- Diff engine
- UI compare

### Week 4

- Restore
- Admin panel
- Polish & beta

---

## 20. Diff Algorithm Design (Deep Dive)

### 20.1 MongoDB Diff Strategy

#### Snapshot Strategy

- Cursor-based streaming per collection
- Chunk size: configurable (e.g. 1k docs)
- Each document normalized (sorted keys)

#### Hashing

- Per-document hash (xxhash / murmur)
- Collection-level Merkle tree

#### Diff Levels

1. Collection added / removed
2. Document added / removed
3. Field-level diff (JSON patch)

#### Performance Optimizations

- Skip unchanged chunks via hash match
- Paginated diff loading in UI

---

### 20.2 SQL Diff Strategy

#### Snapshot Strategy

- Per-table ordered dump (PK required)
- Optional row sampling for large tables

#### Comparison

- Row hash comparison by PK
- Column-level value diff

#### Edge Cases

- Missing PK → fallback to full row hash
- Schema changes detected separately

---

## 21. Security Threat Model

### 21.1 Attack Surfaces

- Stored DB credentials
- Backup files
- Restore endpoints
- Admin panel

### 21.2 Mitigations

- Credentials encrypted (KMS)
- Read-only DB users
- Time-limited credential decryption
- IP allowlisting (optional)
- Full audit logs

### 21.3 Compliance Readiness

- Data deletion on request
- Region-based storage (future)
- SOC2-ready architecture

---

## 22. MVP Scope Freeze (DBSnap v1)

### 22.1 In-Scope (MVP – Must Have)

#### Core

- MongoDB & PostgreSQL support
- Manual backup
- Scheduled backup (daily / weekly)
- Encrypted snapshot storage
- Backup history
- Visual diff (backup vs backup)
- Visual diff (backup vs live – read-only)
- Full restore
- Selective restore (collection/table)

#### UI

- Dashboard
- Project view
- Backup timeline
- Diff viewer
- Restore flow

#### Platform

- Email + OAuth auth
- Single-user per account
- One environment per project
- S3-compatible storage
- Email notifications

---

### 22.2 Out-of-Scope (Explicitly Excluded v1)

- MySQL support
- Point-in-time recovery
- Multi-user teams
- Role-based access
- CLI tool
- On-prem agent
- Schema migration tooling
- Realtime replication

---

## 23. README.md (Developer & AI-Friendly Specification)

### Project Name

DBSnap

### Tagline

Visual database backups & diffs for developers

---

## 1. Purpose

DBSnap is a lightweight developer-first SaaS that provides:

- Automated database backups
- Versioned snapshots
- Visual diffs between backups
- Safe restore workflows

Designed for MongoDB and SQL users who want **clarity instead of complexity**.

---

## 2. Product Scope (Frozen – MVP)

This repository implements **DBSnap v1**.

### Supported Databases

- MongoDB (ReplicaSet / Atlas)
- PostgreSQL

### Core Capabilities

- Connect database using read-only credentials
- Run manual & scheduled backups
- Encrypt and store snapshots
- View backup history
- Compare backups visually
- Restore data safely

---

## 3. Architecture Overview

### High-Level Diagram (Logical)

- Web App (Next.js)
- API Server (NestJS)
- Worker Services
- Object Storage (S3)
- Metadata Database (PostgreSQL)
- Queue (Redis)

---

## 4. Tech Stack

### Frontend

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- React Query
- Monaco Editor (diff viewer)

### Backend

- Node.js
- NestJS
- Prisma ORM
- PostgreSQL (metadata)

### Workers & Infra

- BullMQ + Redis
- Docker
- S3-compatible storage
- KMS for encryption

---

## 5. Repository Structure (Expected)

```
/apps
  /web        # Next.js frontend
  /api        # NestJS backend
  /workers    # Backup / Diff / Restore workers
/packages
  /db-core    # DB connectors & snapshot logic
  /diff-engine# Mongo & SQL diff logic
  /crypto     # Encryption utilities
  /shared     # Shared types & utils
/infra
  docker-compose.yml
  env.example
```

---

## 6. Core Modules (What to Build)

### Auth Module

- JWT + refresh token
- OAuth (GitHub, Google)

### Project Module

- Create / delete project
- Environment tagging

### Database Connector Module

- Mongo connector (cursor streaming)
- Postgres connector (ordered dump)
- Read-only validation

### Backup Engine

- Snapshot orchestration
- Chunking
- Compression
- Encryption
- Upload to storage

### Diff Engine

- Hash-based comparison
- Mongo JSON diff
- SQL row diff
- Summary generation

### Restore Engine

- Full restore
- Selective restore
- Safety confirmation

---

## 7. Diff Logic (Summary)

### MongoDB

- Normalize documents
- Hash per document
- Merkle-tree per collection
- JSON patch for changed docs

### PostgreSQL

- PK-based row hashing
- Column diff

---

## 8. Security Model

- Credentials encrypted at rest
- Decrypted only in worker memory
- Read-only DB users
- Encrypted backups
- Audit logs

---

## 9. Development Workflow

### Local Setup

- Docker Compose
- Seed demo DBs

### Environments

- dev
- staging
- prod

---

## 10. Non-Goals (Strict)

- Analytics
- BI queries
- Schema migration
- High availability replication

---

## 11. MVP Completion Checklist

- [ ] User can connect DB in <5 minutes
- [ ] Backup completes successfully
- [ ] Diff renders clearly
- [ ] Restore works safely
- [ ] No plaintext credentials stored

---

## 12. Naming & Branding

Product Name: DBSnap

Positioning:
"Git-style snapshots and diffs for your database"

---

## 13. Notes for AI / Code Generation Tools

This README is intentionally explicit.

When generating code:

- Follow the frozen scope
- Do not add extra features
- Prefer clarity over optimization
- Treat diff engine as critical path

---

**End of README / PRD**
