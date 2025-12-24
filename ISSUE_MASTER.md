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

### ISSUE-005 — Dockerized Development Environment
Level: L2 | Type: Infra

Goal:
Standardize local development with all dependencies.

Requirements:
- docker-compose.yml for local infrastructure
- Services: PostgreSQL, MongoDB, Redis
- Health checks for each service

Acceptance Criteria:
- `docker-compose up` provides a fully working local infra

---

### ISSUE-006 — CI Pipeline for Quality Gating
Level: L2 | Type: Infra

Goal:
Automate lint and test checks on PRs.

Requirements:
- GitHub Actions workflow
- Run ESLint, Prettier, and Jest tests
- Prevent merging if checks fail

Acceptance Criteria:
- CI runs on every PR and push

---

### ISSUE-007 — CD Pipeline for Staging
Level: L3 | Type: Infra

Goal:
Automate deployment to a staging environment.

Requirements:
- Deploy to cloud (AWS/Vercel/etc)
- Environment secret management
- Automated migrations

Acceptance Criteria:
- Merge to `develop` triggers staging deploy

---

### ISSUE-008 — Structured Logging System
Level: L2 | Type: Infra

Goal:
Enable easier debugging through structured data.

Requirements:
- Winston or Pino integration
- JSON format in production
- Request ID correlation across services

Acceptance Criteria:
- Logs include TraceID and consistent metadata

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

### ISSUE-014 — Email Verification & Password Reset
Level: L2 | Type: Product

Goal:
Secure user accounts via verification and recovery.

Requirements:
- Send verification email on signup
- Password reset flow (request + token + change)

Acceptance Criteria:
- Unverified users cannot access core features
- Password can be reset via email link

---

### ISSUE-015 — OAuth Integration
Level: L3 | Type: Product

Goal:
Simplify onboarding with social login.

Requirements:
- GitHub OAuth
- Google OAuth

Acceptance Criteria:
- User can sign up/login via 3rd party
- Existing email accounts can link to OAuth

---

### ISSUE-016 — Project Management API
Level: L2 | Type: Core

Goal:
Manage projects as containers for DB connections.

Requirements:
- Create/Read/Update/Delete projects
- Assign projects to organizations

Acceptance Criteria:
- Project ownership enforced

---

### ISSUE-017 — Multi-Factor Authentication (MFA)
Level: L3 | Type: Product

Goal:
Add an extra layer of security for user accounts.

Requirements:
- TOTP (Google Authenticator) support
- QR code generation
- Backup recovery codes

Acceptance Criteria:
- User can enable MFA and it is enforced at login

---

### ISSUE-018 — Session management & Revocation
Level: L2 | Type: Product

Goal:
Allow users to see and manage active login sessions.

Requirements:
- List active sessions with IP and User Agent
- "Logout from all devices" functionality
- Individual session revocation

Acceptance Criteria:
- Revoking a session immediately invalidates the JWT

---

### ISSUE-019 — API Key Management
Level: L2 | Type: Product

Goal:
Allow programmatic access to DBSnap.

Requirements:
- Generate API keys with scopes
- Secret rotation logic
- Usage tracking per key

Acceptance Criteria:
- User can trigger backups via API key

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

### ISSUE-023 — Backup Scheduling & Retention
Level: L2 | Type: Core

Goal:
Automate periodic backups and cleanup.

Requirements:
- CRON expression support
- Retention days/count setting

Acceptance Criteria:
- Workers trigger at specified times
- Old snapshots are purged based on policy

---

### ISSUE-024 — SSH Tunnel Support
Level: L3 | Type: Core

Goal:
Support databases behind a bastion host.

Requirements:
- SSH private key management
- Port forwarding logic
- Tunnel health monitoring

Acceptance Criteria:
- User can connect to a DB that is only accessible via SSH tunnel

---

### ISSUE-025 — Static IP / Proxy Support
Level: L2 | Type: Infra

Goal:
Support IP whitelisting for strict DB firewalls.

Requirements:
- Outbound traffic routing through static IP
- Proxy configuration in DB connectors

Acceptance Criteria:
- All backup traffic originates from a known, fixed IP address

---

### ISSUE-026 — SSL/TLS Certificate Support
Level: L2 | Type: Core

Goal:
Support databases requiring custom CA or client certificates.

Requirements:
- CA, Certificate, and Key file upload
- Secure storage of certificates
- Connector integration for TLS

Acceptance Criteria:
- Connect successfully to a DB requiring mutual TLS (mTLS)

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

### ISSUE-034 — Selective Restore Logic
Level: L3 | Type: Core

Goal:
Restore specific parts of a database.

Requirements:
- Selection by collection/table
- Overwrite vs Append options

Acceptance Criteria:
- Targeted data is restored without affecting others

---

### ISSUE-035 — Snapshot Export
Level: L2 | Type: Product

Goal:
Allow users to download their data.

Requirements:
- Generate JSON/SQL dump
- Signed download link

Acceptance Criteria:
- User receives valid dump file

---

### ISSUE-036 — Compression Algorithm Benchmarking
Level: L2 | Type: Infra

Goal:
Optimize storage costs and transfer speeds.

Requirements:
- Benchmark Gzip, Deflate, and Zstandard
- Implement configurable compression levels
- Track compression ratio metrics

Acceptance Criteria:
- Clear recommendation and implementation of the best compression for the project

---

### ISSUE-037 — Stream-based Snapshot Storage
Level: L3 | Type: Core

Goal:
Handle massive databases without memory exhaustion.

Requirements:
- Stream data directly from DB cursor to S3
- Chunked upload integration
- No local intermediate file if possible

Acceptance Criteria:
- Backup of 10GB+ DB finishes with <512MB RAM usage

---

### ISSUE-038 — Encrypted Data-at-Rest Validation
Level: L2 | Type: Security

Goal:
Ensure backups are valid and encrypted as expected.

Requirements:
- Post-backup checksum validation
- Decryption test on 1% sample
- Audit logs for encryption metadata

Acceptance Criteria:
- System flags any corrupted or insecure backup immediately

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

### ISSUE-045 — Live Diff Mode
Level: L3 | Type: Core

Goal:
Compare backup against current database state.

Requirements:
- Efficient streaming from live DB
- No impact on live DB performance

Acceptance Criteria:
- Accurate diff between static snapshot and live data

---

### ISSUE-046 — Paginated Diff Results
Level: L3 | Type: Core

Goal:
Support visual diff for large datasets.

Requirements:
- API support for diff pagination
- UI support for infinite scroll or paging
- Search/Filter within diff result

Acceptance Criteria:
- Loading a diff with 10k changes remains snappy in UI

---

### ISSUE-047 — Index & Schema Constraint Comparison
Level: L3 | Type: Core

Goal:
Detect changes beyond just the data.

Requirements:
- Compare table indexes (Postgres)
- Compare foreign keys and constraints
- Compare views and stored procedures (Optional)

Acceptance Criteria:
- System reports missing or modified indexes

---

### ISSUE-048 — Visual JSON Delta Representation
Level: L2 | Type: UI

Goal:
Better visual clarity for modified documents.

Requirements:
- Monaco Diff Editor integration
- Line-by-line highlight of changed fields
- Side-by-side or inline view toggle

Acceptance Criteria:
- User can clearly see which nested field changed in a Mongo doc

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

### ISSUE-054 — Alert & Notification System
Level: L2 | Type: Product

Goal:
Notify users of job outcomes.

Requirements:
- Slack/Webhooks integration
- Email alerts

Acceptance Criteria:
- Notifications sent on failure/success

---

### ISSUE-055 — Threshold Alert Worker
Level: L2 | Type: Infra

Goal:
Monitor size/growth anomalies.

Requirements:
- Compare snapshot size with previous
- Trigger alert if exceeds threshold

Acceptance Criteria:
- Automated alerts for unusual data spikes

---

### ISSUE-056 — Worker Self-Healing & Health Checks
Level: L2 | Type: Infra

Goal:
Ensure high availability of worker processes.

Requirements:
- Health check API per worker
- Auto-restart logic on hung processes
- Liveness/Readiness probes (K8s compatible)

Acceptance Criteria:
- System detects and recovers a crashed worker within 30s

---

### ISSUE-057 — Dead Letter Queue (DLQ) Management
Level: L2 | Type: Admin

Goal:
Allow admins to inspect and retry failed jobs.

Requirements:
- UI for viewing DLQ contents
- Inspect error stacks for failed jobs
- Bulk retry or individual job re-drive

Acceptance Criteria:
- Failed jobs can be analyzed and restarted from the Admin Panel

---

### ISSUE-058 — Dynamic Worker Scaling Logic
Level: L3 | Type: Infra

Goal:
Optimize cost and performance by scaling workers based on load.

Requirements:
- Monitor queue depth across all jobs
- Trigger autoscaling events (simulated or real K8s/Docker)
- Graceful shutdown of workers during down-scaling

Acceptance Criteria:
- Workers scale up during peak backup hours and down at night

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

### ISSUE-082 — Billing & Subscriptions
Level: L3 | Type: Admin

Goal:
Monetize the platform.

Requirements:
- Stripe integration (or equivalent)
- Plan-based feature gating

Acceptance Criteria:
- Users can subscribe/upgrade/cancel

---

### ISSUE-083 — System Health Dashboard
Level: L2 | Type: Admin

Goal:
Monitor internal system state.

Metrics:
- Queue depth
- Worker CPU/Memory
- Backup success rate

Acceptance Criteria:
- Real-time visibility for admins

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

Acceptance Criteria:
- Playwright/Cypress tests for signup, backup, and diff viewing

---

### ISSUE-094 — Engine Unit Test Suite
Level: L3 | Type: QA

Goal:
100% test coverage for core backup/diff logic.

Requirements:
- Jest tests for Mongo/SQL adapters
- Mock storage and DB interfaces
- Table-driven tests for edge cases (empty collections, large docs)

Acceptance Criteria:
- Core engine passes 100% tests in CI

---

### ISSUE-095 — Performance Benchmark Suite
Level: L2 | Type: QA

Goal:
Track system performance over time.

Requirements:
- Measure duration for 1GB/10GB backups
- Measure CPU/Memory usage during diff
- Historical tracking of performance metrics

Acceptance Criteria:
- New code must not degrade performance beyond 5% tolerance

---

### ISSUE-096 — Automated Security Scan
Level: L2 | Type: Security

Goal:
Keep dependencies and code secure.

Requirements:
- Snyk or `npm audit` integration in CI
- Owasp ZAP scan for API endpoints
- Secret scanning forcommitted code

Acceptance Criteria:
- No high/critical vulnerabilities in production code

---

END OF FILE
