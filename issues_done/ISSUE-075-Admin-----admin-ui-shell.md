# ISSUE-075-Admin — Admin Panel UI Shell & Navigation

## Goal / Requirements / Acceptance Criteria / Out of Scope

Level: L2 | Type: Admin / UI

---

Goal:
Create the foundational layout for the Admin Panel that provides consistent navigation and a professional look.

Requirements:
- Dedicated Layout wrapper for all `/admin/*` routes.
- Responsive Sidebar containing links to:
  - Dashboard (Overview)
  - User Management
  - Organization Explorer
  - Worker Status & DLQ
  - Audit Logs
  - Billing & Promo Codes
  - System Settings (Maintenance Mode)
- Top Header displaying:
  - Current page title
  - Admin identity / logout
  - "Back to Client Dashboard" button
- Consistent branding (e.g., distinct color theme for Admin vs Client UI).

Acceptance Criteria:
- Navigation between all admin sections is smooth.
- Admin shell is separate from the customer dashboard shell to prevent UI bleed.

---

## AI Instructions for Gemini

You are an expert software engineer. Follow the standard Git workflow for this project.
1. Implement the requirements.
2. Commit and push to the development branch.
3. Move this task file to issues_done/.
