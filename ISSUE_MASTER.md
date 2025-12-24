# ISSUE_MASTER.md
Frozen Issue List for DBSnap MVP
================================

This is the single source of truth for all MVP work items.
Each issue is designed to be split into its own markdown file under `/issues`.

Rules:
- One Issue = one PR
- Levels > L3 must NOT be given to AI
- No feature creep beyond this file

---

## PHASE 0 — FOUNDATION (Repo & Discipline)

### ISSUE-001 — Repo Bootstrap
Level: L3 | Type: Meta

Goal:
Initialize DBSnap monorepo with base structure.

Requirements:
- /apps/api
- /apps/web
- /apps/worker
- /packages/shared

Acceptance Criteria:
- Repo installs without errors
- All services start with placeholder code

Out of Scope:
- Business logic

---

### ISSUE-002 — Environment Configuration
Level: L2 | Type: Infra

Goal:
Standardize environment configuration.

Requirements:
- .env.example
- Central config loader
- No secrets committed

Acceptance Criteria:
- App fails gracefully if env missing

Out of Scope:
- Secret managers

---

### ISSUE-003 — Linting & Formatting
Level: L2 | Type: Meta

Goal:
Ensure consistent code style.

Requirements:
- ESLint
- Prettier
- Shared config

Acceptance Criteria:
- Lint passes in CI

Out of Scope:
- Custom lint rules

---

### ISSUE-004 — Minimal CONTRIBUTING.md
Level: L1 | Type: Docs

Goal:
Define contribution rules.

Requirements:
- One issue → one PR
- AI usage rules
- Commit conventions

Acceptance Criteria:
- CONTRIBUTING.md exists

Out of Scope:
- Code of conduct

---

## PHASE 1 — AUTH & TENANCY

### ISSUE-010 — User Model
Level: L2 | Type: Core

Fields:
- id
- email
- passwordHash
- createdAt

Acceptance Criteria:
- Model persists correctly

---

### ISSUE-011 — Organization / Project Model
Level: L2 | Type: Core

Requirements:
- User belongs to organization
- Org owns DB connections

Acceptance Criteria:
- Referential integrity enforced

---

### ISSUE-012 — Auth API (JWT)
Level: L3 | Type: Product

Endpoints:
- Login
- Logout
- Refresh token

Acceptance Criteria:
- Protected routes require token

Out of Scope:
- OAuth

---

### ISSUE-013 — RBAC Roles
Level: L2 | Type: Product

Roles:
- Admin
- Member
- Read-only

Acceptance Criteria:
- Permissions enforced on APIs

---

## PHASE 2 — DATABASE CONNECTIONS

### ISSUE-020 — DB Connection Schema
Level: L2 | Type: Core

Supports:
- MongoDB
- PostgreSQL
- MySQL

Requirements:
- Encrypted credentials

---

### ISSUE-021 — Connection Validator
Level: L2 | Type: Core

Goal:
Validate DB connectivity.

Acceptance Criteria:
- Returns sanitized metadata

---

### ISSUE-022 — Connection API
Level: L3 | Type: Product

Endpoints:
- Create
- Update
- Delete
- List

Acceptance Criteria:
- Permission checks enforced

---

## PHASE 3 — SNAPSHOT & BACKUP CORE

### ISSUE-030 — Snapshot Metadata Model
Level: L2 | Type: Core

Fields:
- connectionId
- timestamp
- schemaVersion
- storagePath

---

### ISSUE-031 — Snapshot Creation Logic
Level: L3 | Type: Core

Requirements:
- Dump DB
- Normalize structure
- Store as JSON

Out of Scope:
- Compression optimizations

---

### ISSUE-032 — Snapshot Storage Adapter
Level: L2 | Type: Infra

Adapters:
- Local FS
- S3-compatible

---

### ISSUE-033 — Snapshot Restore (Read-only)
Level: L3 | Type: Core

Goal:
Load snapshot without modifying DB.

---

## PHASE 4 — DIFF ENGINE (CORE VALUE)

### ISSUE-040 — Diff Engine Interface
Level: L2 | Type: Core

Input:
- Snapshot A
- Snapshot B

Output:
- DiffResult

---

### ISSUE-041 — Mongo Document Diff
Level: L3 | Type: Core

Detect:
- Added
- Removed
- Modified fields

---

### ISSUE-042 — SQL Table Diff
Level: L3 | Type: Core

Detect:
- Table changes
- Column changes
- Row count delta

---

### ISSUE-043 — Diff Summary Generator
Level: L2 | Type: Core

Goal:
Human-readable diff summary.

---

### ISSUE-044 — Diff Persistence
Level: L2 | Type: Core

Goal:
Store diff results for later viewing.

---

## PHASE 5 — WORKER & QUEUE

### ISSUE-050 — Job Queue Setup
Level: L2 | Type: Infra

Requirements:
- BullMQ or equivalent
- Retry logic

---

### ISSUE-051 — Snapshot Job Worker
Level: L3 | Type: Infra

Goal:
Execute snapshot creation jobs.

---

### ISSUE-052 — Diff Job Worker
Level: L3 | Type: Infra

Goal:
Execute diff engine jobs.

---

### ISSUE-053 — Job Status API
Level: L2 | Type: Product

States:
- Pending
- Running
- Failed
- Completed

---

## PHASE 6 — API LAYER

### ISSUE-060 — Snapshot API
Level: L3 | Type: Product

Endpoints:
- List snapshots
- Trigger snapshot

---

### ISSUE-061 — Diff API
Level: L3 | Type: Product

Endpoints:
- Request diff
- Fetch result

---

### ISSUE-062 — Rate Limiting
Level: L2 | Type: Security

Goal:
Prevent abuse.

---

## PHASE 7 — WEB UI (MINIMAL)

### ISSUE-070 — Auth Pages
Level: L2 | Type: UI

Pages:
- Login
- Register

---

### ISSUE-071 — Connections UI
Level: L3 | Type: UI

Features:
- Add
- Test
- List

---

### ISSUE-072 — Snapshot List Page
Level: L3 | Type: UI

Features:
- Table view
- Status indicators

---

### ISSUE-073 — Diff Viewer (Simple)
Level: L3 | Type: UI

Features:
- Added / Removed / Changed
- Collapsible sections

---

## PHASE 8 — ADMIN PANEL

### ISSUE-080 — Admin User List
Level: L2 | Type: Admin

---

### ISSUE-081 — Admin Org Usage Stats
Level: L2 | Type: Admin

Metrics:
- Snapshot count
- Storage usage

---

## PHASE 9 — HARDENING & QUALITY

### ISSUE-090 — Audit Log
Level: L2 | Type: Security

Events:
- Snapshot created
- Diff requested
- Login

---

### ISSUE-091 — Error Handling Strategy
Level: L2 | Type: Core

Goal:
Typed errors only.

---

### ISSUE-092 — Logging & Monitoring
Level: L2 | Type: Infra

---

### ISSUE-093 — Basic E2E Tests
Level: L3 | Type: QA

Goal:
Critical flows covered.

---

END OF FILE
