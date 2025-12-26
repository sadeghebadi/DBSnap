# DBSnap Master Project Roadmap

این پکیج شامل تمام مراحل ساخت و توسعه پروژه DBSnap از ابتدا تا انتها است. تمام تسک‌های موجود در `readyToDev` بر اساس وابستگی‌های فنی و اولویت‌های محصول دسته‌بندی شده‌اند.

---

## 🏗 Phase 0: Foundation (زیربنای پروژه)
*   **ISSUE-001 - 005**: Repo Bootstrap, Env, Linting, Docker Environment.
*   **ISSUE-006 - 008**: CI/CD Pipelines, Structured Logging.

---

## 🔑 Phase 1: Core Models & Auth (مدل‌ها و احراز هویت)
*   **ISSUE-010 - 011**: User, Organization, Project Models.
*   **ISSUE-012 - 013**: JWT Auth, RBAC Roles (Admin/Member).

---

## 🛡 Phase 2: Security & Identity (امنیت و هویت پیشرفته)
*   **ISSUE-014 - 015**: Email Verification, Password Reset, OAuth (Google/GitHub).
*   **ISSUE-017 - 019**: MFA (2FA), Session Management, API Key Management.

---

## 🔌 Phase 3: DB Connections (اتصالات دیتابیس)
*   **ISSUE-020 - 022**: Connection Schema, Validator, CRUD API.
*   **ISSUE-024 - 026**: SSH Tunnel, Static IP Proxy, SSL/TLS Certificates.

---

## 📦 Phase 4: Snapshot Engine (هسته بک‌آپ‌گیری)
*   **ISSUE-030 - 032**: Metadata, Creation Logic, Storage Adapters (S3/Local).
*   **ISSUE-036 - 038**: Compression, Streaming, Encryption Validation at Rest.
*   **ISSUE-033 - 035**: Restore Logic, Selective Restore, Export Data.

---

## 🔍 Phase 5: Diff Engine (موتور مقایسه داده‌ها)
*   **ISSUE-040 - 043**: Diff Interface, Mongo & SQL Diff Logic, Summary Generator.
*   **ISSUE-045 - 048**: Live Diff, Paginated Results, Schema Comparison, Visual JSON Delta.

---

## ⚙️ Phase 6: Jobs & Automation (پردازش‌های پس‌زمینه)
*   **ISSUE-050 - 053**: Queue Setup (BullMQ), Snapshot & Diff Workers, Job Status API.
*   **ISSUE-023**: Backup Scheduling & Retention Policy.
*   **ISSUE-054 - 058**: Alerting System, Self-healing Workers, Dynamic Scaling.

---

## 🌐 Phase 7: Public APIs & Rate Limiting (رابط‌های عمومی)
*   **ISSUE-060 - 062**: Snapshot/Diff APIs, Rate Limiting & Security.

---

## 🎨 Phase 8: User Web UI (رابط کاربری کاربران)
*   **ISSUE-070 - 073**: Auth Pages, Connections Management, Snapshot History, Diff Viewer UI.

---

## 🛡 Phase 9: Admin Panel (پنل مدیریت پلتفرم)
*   این بخش شامل **۲۱ تسک** اختصاصی در فولدر `readyToDev/admin-panel/` است.
*   نقشه راه اختصاصی آن در فایل `admin-panel/ADMIN_ROADMAP.md` قرار دارد.

---

## 🚀 Phase 10: QA, Hardening & Launch (تست و محکم‌کاری)
*   **ISSUE-091 - 092**: Error Handling Strategy, Monitoring.
*   **ISSUE-093 - 095**: E2E Tests, Unit Test Suite, Performance Benchmarks.
*   **ISSUE-096**: Automated Security Scan.

---

### چگونه از این نقشه راه استفاده کنید؟
شما می‌توانید هر فاز را به ترتیب یا بر اساس نیاز خود انتخاب کنید. هر فاز شامل مجموعه‌ای از تسک‌های مرتبط است که با انجام آن‌ها، یک قابلیت کامل به سیستم اضافه می‌شود.
برای شروع هر فاز، کافیست شماره یا نام آن را به من بگویید.
