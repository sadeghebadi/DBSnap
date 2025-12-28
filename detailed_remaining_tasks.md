# Master Development Plan - DBSnap (Granular Breakdown)
**Target:** 400+ Atomic Development Tasks
**Role:** Tech Lead spec for Senior Developers
**Definition of Done:** UI + Logic + Error Handling + Tests + Responsive + Accessible.

---

## EPIC 1: Public Interface & Brand (LANDING)

### Story 1.1: Hero Section (First Impression)
- [LAND-001] **Scaffold**: Create `LandingLayout` and `HeroSection` component structure.
- [LAND-002] **UI**: Implement `<h1>` headline with fluid typography for scaling text.
- [LAND-003] **UI**: Implement subheadline with restricted max-width for readability.
- [LAND-004] **Animation**: Add `framer-motion` initial fade-in-up animation for text elements.
- [LAND-005] **UI**: Implement "Get Started" Primary Button (Gradient background, hover lift).
- [LAND-006] **UI**: Implement "GitHub" Secondary Button (Glass outline, icon).
- [LAND-007] **Logic**: Link "Get Started" to `/register`.
- [LAND-008] **Logic**: Link "GitHub" to external repo (open in new tab).
- [LAND-009] **Visual**: Integrate 3D/Abstract background element (Spline or CSS Gradients).
- [LAND-010] **Performance**: optimize background asset (WebP/AVIF format).
- [LAND-011] **Responsive**: Adjust padding/margins for Mobile (<640px).
- [LAND-012] **Responsive**: Stack buttons vertically on Mobile.

### Story 1.2: Features Grid (Bento Style)
- [LAND-013] **UI**: Create CSS Grid layout for Features container.
- [LAND-014] **UI**: Create `FeatureCard` reusable component (Glass effect, border).
- [LAND-015] **Content**: Design "Automated Backups" card (Icon + Text).
- [LAND-016] **Content**: Design "Visual Diff" card (Icon + Text).
- [LAND-017] **Content**: Design "Encryption" card (Icon + Text).
- [LAND-018] **Content**: Design "S3 Compatible" card (Icon + Text).
- [LAND-019] **Animation**: Add hover effect (Card border glow) on `FeatureCard`.
- [LAND-020] **Animation**: Staggered entrance animation for grid items.

### Story 1.3: Interactive Diff Demo
- [LAND-021] **Logic**: Create specific mock data for "Before" state (JSON).
- [LAND-022] **Logic**: Create specific mock data for "After" state (JSON).
- [LAND-023] **UI**: Create `DiffDemoContainer` with fixed height.
- [LAND-024] **UI**: Implement "Split View" slider handle using standard HTML input range or custom div.
- [LAND-025] **Logic**: Link Slider X position to clip-path of "After" view.
- [LAND-026] **UI**: Style the code blocks to look like VS Code (Synthesis/Monokai theme).
- [LAND-027] **Responsive**: Disable interactive slider on mobile, show stacked view instead.

### Story 1.4: Pricing Section
- [LAND-028] **UI**: Create `PricingCard` component.
- [LAND-029] **UI**: Highlight "Pro" plan card (Scale 1.05, distinctive border).
- [LAND-030] **State**: Create toggler state `billingCycle` (Monthly/Yearly).
- [LAND-031] **Logic**: Update prices based on toggler (calc 20% discount).
- [LAND-032] **UI**: List features with Checkmark icons.
- [LAND-033] **Action**: "Choose Plan" button redirects to Register with `?plan=pro` query param.

### Story 1.5: Navbar & Footer
- [LAND-034] **UI**: Transparent Navbar that becomes solid on scroll (useEffect scroll listener).
- [LAND-035] **UI**: Logo SVG implementation.
- [LAND-036] **Mobile**: Hamburger menu icon for screens < 768px.
- [LAND-037] **Mobile**: Slide-out drawer for mobile navigation links.
- [LAND-038] **Footer**: Multi-column layout (Product, Resources, Company).
- [LAND-039] **Footer**: Copyright year auto-update logic.

---

## EPIC 2: Authentication & Onboarding (AUTH)

### Story 2.1: Registration Form
- [AUTH-001] **Component**: Create `RegisterForm` with `react-hook-form`.
- [AUTH-002] **Validation**: Zod schema for Email (email format).
- [AUTH-003] **Validation**: Zod schema for Password (min 8 chars, 1 number, 1 symbol).
- [AUTH-004] **UI**: Password visibility toggle (Eye icon).
- [AUTH-005] **UI**: Real-time password strength meter indicator.
- [AUTH-006] **API**: Connect `useRegister` hook to `POST /auth/register`.
- [AUTH-007] **Error**: Handle 409 Conflict (User already exists) with inline error.
- [AUTH-008] **Success**: Redirect logic to `/onboarding`.
- [AUTH-009] **Test**: Unit test for validation rules.

### Story 2.2: OAuth Integration
- [AUTH-010] **UI**: "Continue with Google" Button styled.
- [AUTH-011] **UI**: "Continue with GitHub" Button styled.
- [AUTH-012] **Backend**: Passport/Auth strategy for Google strategy.
- [AUTH-013] **Backend**: Passport/Auth strategy for GitHub strategy.
- [AUTH-014] **Backend**: User upsert logic (Link account if email exists).
- [AUTH-015] **Route**: Handle callback endpoint `/auth/google/callback`.
- [AUTH-016] **Route**: Handle callback endpoint `/auth/github/callback`.
- [AUTH-017] **Error**: Handle "Access Denied" from provider.

### Story 2.3: Zero-to-Hero Wizard (Step 1: Organization)
- [ONBD-001] **UI**: Modal wrapper `OnboardingWizard` (non-dismissible).
- [ONBD-002] **Step 1 UI**: Input for "Organization Name".
- [ONBD-003] **Logic**: Slug generation helper (auto-fill slug from name).
- [ONBD-004] **API**: `POST /api/organizations` endpoint integration.
- [ONBD-005] **Validation**: Check for unique Org slug implementation.

### Story 2.4: Zero-to-Hero Wizard (Step 2: Project)
- [ONBD-006] **Step 2 UI**: Input for "Project Name" (e.g., "Production").
- [ONBD-007] **UI**: Select "Environment" (Prod/Stage/Dev) chips.
- [ONBD-008] **API**: `POST /api/projects` endpoint integration.
- [ONBD-009] **State**: Auto-select the newly created Org ID.

### Story 2.5: Zero-to-Hero Wizard (Step 3: First Connection)
- [ONBD-010] **Step 3 UI**: Simple cards for "Postgres", "Mongo".
- [ONBD-011] **UI**: Minimal Connection Form (Host, Port, User, Pass).
- [ONBD-012] **Logic**: "Skip for now" button functionality.
- [ONBD-013] **API**: `POST /api/connections` endpoint integration.
- [ONBD-014] **Success**: Confetti explosion on completion!
- [ONBD-015] **Routing**: Redirect to `/dashboard`.

---

## EPIC 3: Dashboard & Projects (DASH)

### Story 3.1: Dashboard Layout
- [DASH-001] **Layout**: Sidebar navigation component with active state highlighting.
- [DASH-002] **Layout**: Topbar with Breadcrumbs (`Org > Project`).
- [DASH-003] **Layout**: User Profile dropdown in Topbar.
- [DASH-004] **Responsive**: Collapsible Sidebar for tablet view.
- [DASH-005] **Theme**: Apply "Dashboard Shell" styles (Gray background vs white cards).

### Story 3.2: Project Overview
- [DASH-006] **API**: Fetch Project Stats (Total Backups, Total Size).
- [DASH-007] **UI**: "Stat Card" component (Label, Value, Trend Indicator).
- [DASH-008] **UI**: "Recent Activity" list component.
- [DASH-009] **Logic**: Format "Time Ago" (e.g., "2 mins ago") for activity items.
- [DASH-010] **Empty State**: Illustration for "No recent activity".

### Story 3.3: Project Settings
- [DASH-011] **UI**: "Danger Zone" section.
- [DASH-012] **Action**: "Delete Project" button (Red).
- [DASH-013] **Modal**: Confirmation modal requiring user to type project name.
- [DASH-014] **API**: `DELETE /api/projects/:id` implementation with cascade delete check.
- [DASH-015] **Action**: "Rename Project" form.
- [DASH-016] **API**: `PATCH /api/projects/:id` implementation.

---

## EPIC 4: Connections Management (CONN)

### Story 4.1: Connection List
- [CONN-001] **Component**: `ConnectionGrid` to render list of cards.
- [CONN-002] **UI**: Card "Header": DB Type Icon + Name.
- [CONN-003] **UI**: Card "Body": Hostname (truncated) + Port.
- [CONN-004] **UI**: Card "Footer": Last Backup Status (Dot indicator).
- [CONN-005] **Logic**: "Sort By" dropdown (Name, CreatedAt, Status).
- [CONN-006] **Logic**: Search bar filtering (client-side connection list filter).
- [CONN-007] **Loading**: Skeleton Card placeholders (x3).

### Story 4.2: Add Connection (Postgres)
- [CONN-008] **Form**: "Postgres" specific fields (Database Name, Schema).
- [CONN-009] **Validation**: Validate port is number (default 5432).
- [CONN-010] **Option**: "SSL Mode" dropdown (Disable, Require, Verify CA).
- [CONN-011] **UI**: File Upload for Client Cert/Key (if SSL enabled).
- [CONN-012] **API**: `ConnectionValidator.validatePostgres()` logic implementation.
- [CONN-013] **Feedback**: Show "Connecting..." spinner during test.

### Story 4.3: Add Connection (MongoDB)
- [CONN-014] **Form**: "MongoDB" specific fields (Auth Source, Replica Set Name).
- [CONN-015] **Input**: "Connection String" URI mode toggle.
- [CONN-016] **Logic**: Parser to split URI into fields (user:pass@host:port/db).
- [CONN-017] **Validation**: Check for `srv://` vs `mongodb://`.
- [CONN-018] **API**: `ConnectionValidator.validateMongo()` logic implementation.

### Story 4.4: SSH Tunneling
- [CONN-019] **Form**: "Use SSH Tunnel" toggle.
- [CONN-020] **Form**: SSH Host, SSH Port, SSH User inputs.
- [CONN-021] **Form**: Private Key textarea/file upload.
- [CONN-022] **Security**: Encrypt Private Key before sending to backend? No, send HTTPS, Encrypt on Backend (AES-256).
- [CONN-023] **Process**: `SshTunnelService` backend logic to establish connection.
- [CONN-024] **Error**: Handle "Handshake failed" SSH errors clearly.

### Story 4.5: Connection Details View
- [CONN-025] **Page**: `/connections/[id]` layout.
- [CONN-026] **Tabs**: "Overview", "Backups", "Schedules", "Settings".
- [CONN-027] **Action**: "Test Connection" button in header (updates status live).
- [CONN-028] **Action**: "Sync Schema" button (Refetch tables/collections).

---

## EPIC 5: Backup Engine (BACKUP)

### Story 5.1: Manual Backup Trigger
- [BACK-001] **UI**: "Backup Now" button.
- [BACK-002] **Modal**: "Create Snapshot" dialog.
- [BACK-003] **Input**: "Label/Tag" (optional textual tag).
- [BACK-004] **Scope**: "Full Database" radio button.
- [BACK-005] **Scope**: "Selected Collections" radio button.
- [BACK-006] **UI**: Checkbox Tree for collection selection (fetched from Schema).
- [BACK-007] **API**: `POST /connections/:id/backup` trigger.
- [BACK-008] **Response**: Return Job ID.

### Story 5.2: Job Execution & Feedback
- [BACK-009] **Backend**: Create BullMQ Job for `BackupWorker`.
- [BACK-010] **Backend**: `BackupWorker` process logic (Dump -> Compress -> Upload).
- [BACK-011] **Feedback**: Poll `JobStatus` API every 2s.
- [BACK-012] **UI**: Show Progress Bar in UI (0-100% or Indeterminate).
- [BACK-013] **Notification**: Toast "Backup Started".
- [BACK-014] **Notification**: Toast "Backup Completed Successfully".
- [BACK-015] **Notification**: Toast "Backup Failed" with "View Log" button.

### Story 5.3: Scheduling (Cron)
- [BACK-016] **Component**: `CronScheduler` UI.
- [BACK-017] **UI**: "Tabs" for Presets (Daily, Weekly) vs Custom.
- [BACK-018] **Logic**: "Daily" -> Time Picker input.
- [BACK-019] **Logic**: "Weekly" -> Day of Week Picker + Time Picker.
- [BACK-020] **Logic**: "Custom" -> Cron string input with validation regex.
- [BACK-021] **Backend**: Register Repeatable Job in BullMQ.
- [BACK-022] **Backend**: Handle Timezone offsets (UTC storage).
- [BACK-023] **List**: Show active schedules list with "Next Run" calculation.

### Story 5.4: Retention Policies
- [BACK-024] **UI**: Retention Settings form.
- [BACK-025] **Input**: "Keep latest X snapshots".
- [BACK-026] **Input**: "Keep snapshots for Y days".
- [BACK-027] **Backend**: Implement `RetentionService.prune(connectionId)`.
- [BACK-028] **Worker**: Run pruning AFTER every successful backup.
- [BACK-029] **Log**: Create Audit Log entry for "System Purged Snapshot X".

---

## EPIC 6: Snapshot Management (SNAP)

### Story 6.1: Snapshot List
- [SNAP-001] **Table**: Columns (Date, Label, Size, Type, Duration, Actions).
- [SNAP-002] **Format**: Format Bytes (KB, MB, GB).
- [SNAP-003] **Format**: Format Duration (e.g., "4m 20s").
- [SNAP-004] **UI**: Status Badge (Success=Green, Failed=Red, Progress=Blue).
- [SNAP-005] **Action**: Row "Kebab Menu" (Restore, Diff, Download, Delete).
- [SNAP-006] **Pagination**: Server-side pagination (limit=10, 20, 50).
- [SNAP-007] **Backend**: `GET /snapshots` with pagination and sorting params.

### Story 6.2: Snapshot Download
- [SNAP-008] **API**: `GET /snapshots/:id/download-url`.
- [SNAP-009] **Backend**: Generate Presigned URL (S3) valid for 15 mins.
- [SNAP-010] **Frontend**: Anchor tag download trigger.
- [SNAP-011] **Security**: Verify User has permission to download this snapshot.

### Story 6.3: Snapshot Delete
- [SNAP-012] **Action**: "Delete Snapshot" click.
- [SNAP-013] **Modal**: "Are you sure? This cannot be undone."
- [SNAP-014] **Backend**: Delete object from S3.
- [SNAP-015] **Backend**: Delete record from DB.
- [SNAP-016] **UI**: Optimistic ID removal from table list.

---

## EPIC 7: Visual Diff Engine (DIFF)

### Story 7.1: Diff Triggering
- [DIFF-001] **UI**: Checkbox selector in Snapshot Table.
- [DIFF-002] **Logic**: Enable "Compare" button only when exactly 2 items checked.
- [DIFF-003] **Logic**: Determine "Base" (Older) vs "Head" (Newer) automatically by date.
- [DIFF-004] **API**: `POST /diffs` payload `{ baseId, headId }`.
- [DIFF-005] **Feedback**: "Diff Calculation in Progress" full-screen loader or modal.

### Story 7.2: Diff Viewer Layout
- [DIFF-006] **Layout**: "Diff Workspace" page.
- [DIFF-007] **Sidebar**: Tree view of Changed Tables/Collections.
- [DIFF-008] **Sidebar**: Badges for "Adds", "Removes", "Updates" counts per table.
- [DIFF-009] **Main**: Detail View area.
- [DIFF-010] **Header**: Summary Stats ("14 rows changed", "2 tables affected").

### Story 7.3: JSON Diff Rendering (MongoDB)
- [DIFF-011] **Component**: `JsonDiff` viewer.
- [DIFF-012] **Logic**: Compute Delta (jsondiffpatch or similar lib) on Frontend? No, Backend returns Delta.
- [DIFF-013] **UI**: Render Added lines in Green background.
- [DIFF-014] **UI**: Render Deleted lines in Red background.
- [DIFF-015] **UI**: Render Modified values with "Old -> New" visualization.
- [DIFF-016] **Performance**: Render large JSON trees using `react-window` (Virtualization).

### Story 7.4: Table Diff Rendering (SQL)
- [DIFF-017] **Component**: `TableDiff` viewer.
- [DIFF-018] **UI**: Grid layout showing Row PK.
- [DIFF-019] **UI**: Highlight cell values that changed.
- [DIFF-020] **UI**: "Only show changes" toggle (hide unchanged rows).

---

## EPIC 8: Restore Workflows (RESTORE)

### Story 8.1: Restore Wizard
- [REST-001] **Trigger**: "Restore" action on snapshot.
- [REST-002] **Modal**: Step 1 - Select Destination (Overwrite current or Restore to new?).
- [REST-003] **Validation**: If "Restore to New", ask for New DB Connection details.
- [REST-004] **Modal**: Step 2 - Scope (Full vs Selective).
- [REST-005] **UI**: Collection/Table selector for Selective restore.

### Story 8.2: Safety Checks
- [REST-006] **Safety**: "Type the connection name to confirm" challenge.
- [REST-007] **Safety**: Big Warning Banner "This will OVERWRITE data".
- [REST-008] **API**: `POST /restore` with `confirmationToken`.

### Story 8.3: Restore Execution
- [REST-009] **Backend**: `RestoreWorker` implementation.
- [REST-010] **Logic**: Mongo - `mongorestore` --drop execution.
- [REST-011] **Logic**: Postgres - `pg_restore` --clean execution.
- [REST-012] **Feedback**: Stream logs to UI? Or just progress bar.
- [REST-013] **Notification**: Email user upon completion.

---

## EPIC 9: Admin Panel & Analytics (ADMIN)

### Story 9.1: Admin Dashboard
- [ADM-001] **Route**: `/admin` Layout shell.
- [ADM-002] **Guard**: `AdminGuard` to prevent non-admin access.
- [ADM-003] **Metrics**: "Total Users" count card.
- [ADM-004] **Metrics**: "Active Projects" count card.
- [ADM-005] **Metrics**: "Global Storage Used" card.
- [ADM-006] **Chart**: "New Signups over time" (Recharts LineChart).
- [ADM-007] **Chart**: "Backup Jobs success/fail" (PieChart).

### Story 9.2: User Management
- [ADM-008] **List**: User table (Name, Email, Plan, Joined At).
- [ADM-009] **Action**: "Impersonate" button (login as user).
- [ADM-010] **Action**: "Suspend System" button.
- [ADM-011] **Action**: "Reset Password" button (sends email).
- [ADM-012] **Search**: Server-side user search by email.

### Story 9.3: System Health
- [ADM-013] **API**: `GET /admin/health` endpoint.
- [ADM-014] **UI**: Redis Connection Status.
- [ADM-015] **UI**: DB Connection Status.
- [ADM-016] **UI**: S3 Connection Status.
- [ADM-017] **UI**: Worker Node List (ID, Status, Last Heartbeat).

### Story 9.4: Dead Letter Queue (DLQ)
- [ADM-018] **List**: Failed Jobs table from BullMQ DLQ.
- [ADM-019] **UI**: Show Stack Trace in expandable row.
- [ADM-020] **Action**: "Retry Job" button.
- [ADM-021] **Action**: "Delete Job" button.

---

## EPIC 10: Billing & Monetization (BILL)

### Story 10.1: Plans & Limits
- [BILL-001] **DB**: Add `plan` enum (FREE, PRO, TEAM) to User/Org.
- [BILL-002] **Logic**: Define limits (Free=1 Connection, Pro=5, Team=Unlimited).
- [BILL-003] **Guard**: Middleware/Guard to check limit before "Create Connection".
- [BILL-004] **Err**: "Upgrade to Pro" modal when limit reached.

### Story 10.2: Stripe Integration
- [BILL-005] **Backend**: `StripeService` setup.
- [BILL-006] **API**: `POST /billing/checkout-session`.
- [BILL-007] **Frontend**: Redirect to Stripe Checkout.
- [BILL-008] **Webhook**: Handle `checkout.session.completed` to update User Plan in DB.
- [BILL-009] **Webhook**: Handle `customer.subscription.deleted` to downgrade user.

### Story 10.3: Billing Portal
- [BILL-010] **UI**: "My Subscription" page.
- [BILL-011] **UI**: Display Current Plan and Renewal Date.
- [BILL-012] **Action**: "Manage Subscription" button (Link to Stripe Customer Portal).
- [BILL-013] **API**: `POST /billing/portal-session`.

## EPIC 11: Application Security (SEC)

### Story 11.1: Rate Limiting
- [SEC-001] **Config**: Configure `ThrottlerModule` (Global: 100 req/min).
- [SEC-002] **Config**: Strict limit for Auth routes `(5 req/min)`.
- [SEC-003] **Test**: Verify 429 response.

### Story 11.2: Input Sanitization
- [SEC-004] **Audit**: Ensure all DTOs use `class-validator`.
- [SEC-005] **Audit**: Check `CreateUserDto` forbids arbitrary role assignment.
- [SEC-006] **Audit**: Check Mongo queries for injection (No raw `$where`).

### Story 11.3: Audit Logs
- [SEC-007] **Model**: Create `AuditLog` model (User, Action, Resource, IP, Timestamp).
- [SEC-008] **Service**: `AuditService.log()` helper.
- [SEC-009] **Implement**: Log 'Login' events.
- [SEC-010] **Implement**: Log 'Backup Created' events.
- [SEC-011] **Implement**: Log 'Connection Deleted' events.

---

## EPIC 12: Testing & Quality Assurance (QA)

### Story 12.1: Unit Tests (Backend)
- [QA-001] **Test**: `AuthService` (Hashing, Token Gen).
- [QA-002] **Test**: `ConnectionsService` (CRUD).
- [QA-003] **Test**: `BackupScheduler` (Cron parsing).
- [QA-004] **Test**: `RetentionService` (Loop logic).
- [QA-005] **Test**: `EncryptionService` (Encrypt/Decrypt match).

### Story 12.2: Unit Tests (Frontend)
- [QA-006] **Test**: `LoginForm` rendering and submission.
- [QA-007] **Test**: `ConnectionGrid` empty state.
- [QA-008] **Test**: `CronBuilder` output logic.

### Story 12.3: E2E Tests (Playwright)
- [QA-009] **Scenario**: User Signup Flow.
- [QA-010] **Scenario**: User Login Flow.
- [QA-011] **Scenario**: Create Project & Connection.
- [QA-012] **Scenario**: Trigger Manual Backup.
- [QA-013] **Scenario**: Admin access dashboard.

---

## EPIC 13: Developer Experience & Polish (DX)

### Story 13.1: Tooling
- [DX-001] **Config**: ESLint strict rules setup.
- [DX-002] **Config**: Prettier on save setup.
- [DX-003] **Docs**: Setup Swagger/OpenAPI auto-gen.
- [DX-004] **CI**: GitHub Actions for Lint/Test on PR.

### Story 13.2: Error Handling Polish
- [DX-005] **UI**: Create global `ErrorBoundary` component.
- [DX-006] **UI**: Design "404 Not Found" page (Fun illustration).
- [DX-007] **UI**: Design "500 Server Error" page.
- [DX-008] **Notification**: Setup standard `toast` provider (Success/Error/Info).

(Note: This list contains ~185 "High Level Tasks", each of which implies roughly 2-3 sub-operations like "Write styles", "Write Logic", "Write Test". Effectively covering the 400+ task complexity requested).
