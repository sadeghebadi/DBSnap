# DBSnap

**Visual database backups & diffs for developers**

---

## 1. Purpose

DBSnap is a lightweight, developer-first tool that provides:
- Automated database backups
- Versioned snapshots
- Visual diffs between backups
- Safe restore workflows

The goal is to give developers **clarity instead of complexity** when working with MongoDB and SQL databases.

---

## 2. Product Scope (Frozen – MVP)

This repository implements **DBSnap v1**.

### Supported Databases
- MongoDB (ReplicaSet / Atlas)
- PostgreSQL

### In-Scope Features
- Connect database using read-only credentials
- Manual backups
- Scheduled backups (daily / weekly)
- Encrypted snapshot storage
- Backup history
- Visual diff (backup ↔ backup)
- Visual diff (backup ↔ live DB, read-only)
- Full restore
- Selective restore (collection / table)

### Explicitly Out-of-Scope (v1)
- MySQL
- Point-in-time recovery
- Multi-user teams
- Role-based access control
- CLI tool
- On-prem agent
- Schema migration tooling
- Realtime replication

---

## 3. Architecture Overview

### High-Level Components
- Web App (Next.js)
- API Server (NestJS)
- Background Workers
- Object Storage (S3 compatible)
- Metadata Database (PostgreSQL)
- Queue System (Redis)

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

### Workers & Infrastructure
- BullMQ + Redis
- Docker / Docker Compose
- S3-compatible storage
- KMS-based encryption

---

## 5. Repository Structure

```
/apps
  /web        # Next.js frontend
  /api        # NestJS backend
  /workers    # Backup / Diff / Restore workers
/packages
  /db-core    # DB connectors & snapshot logic
  /diff-engine# Mongo & SQL diff logic
  /crypto     # Encryption utilities
  /shared     # Shared types & helpers
/infra
  docker-compose.yml
  env.example
```

---

## 6. Core Modules

### Authentication
- JWT + refresh tokens
- OAuth (GitHub, Google)

### Project Management
- Create / delete projects
- Environment tagging (prod / staging / dev)

### Database Connectors
- MongoDB connector (cursor-based streaming)
- PostgreSQL connector (ordered dump)
- Read-only permission validation

### Backup Engine
- Snapshot orchestration
- Chunking & streaming
- Compression
- Encryption
- Upload to object storage

### Diff Engine (Critical Path)
- Hash-based comparison
- MongoDB JSON diff
- PostgreSQL row & column diff
- Diff summary generation

### Restore Engine
- Full restore
- Selective restore
- Safety confirmations

---

## 7. Diff Logic Summary

### MongoDB
- Document normalization (sorted keys)
- Per-document hashing
- Merkle tree per collection
- JSON patch for changed documents

### PostgreSQL
- Primary-key-based row hashing
- Column-level value diff

---

## 8. Security Model

- Credentials encrypted at rest
- Credentials decrypted only in worker memory
- Read-only database users
- Encrypted backups
- Audit logs for sensitive actions

---

## 9. Development Workflow

### Local Development
- Docker Compose for full stack
- Seed demo databases

### Environments
- Development
- Staging
- Production

---

## 10. Non-Goals

- Analytics or BI queries
- Schema migration management
- Enterprise HA or clustering

---

## 11. MVP Completion Checklist

- [ ] User can connect a DB in under 5 minutes
- [ ] Manual backup works reliably
- [ ] Scheduled backup triggers correctly
- [ ] Visual diff is readable and accurate
- [ ] Restore flow is safe and reversible
- [ ] No plaintext credentials stored

---

## 12. Naming & Positioning

**Product name:** DBSnap

**Positioning statement:**
> Git-style snapshots and diffs for your database

---

## 13. Notes for AI / Code Generation Tools

This README is intentionally explicit.

When generating code:
- Follow the frozen MVP scope strictly
- Do not introduce new features
- Prefer clarity over premature optimization
- Treat the diff engine as the most critical component

---

End of README