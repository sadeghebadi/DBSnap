# ISSUE-077-Admin — Admin Main Dashboard (Overview & Analytics)

## Goal / Requirements / Acceptance Criteria / Out of Scope

Level: L2 | Type: Admin / UI

---

Goal:
The "First Page" admins see. Provides high-level health and growth metrics for the entire platform.

Requirements:
- Summary cards for:
  - Total Active Users (and growth % this week)
  - Total Backups taken (last 24h)
  - Success vs Failure rate chart
  - Total Storage used globally
- "Recent Critical Events" feed (e.g., failed worker, high-value customer logout, security alert).
- "Quick Actions" panel (Toggle maintenance mode, Create promo code).
- Real-time "System Health" traffic light indicator.

Acceptance Criteria:
- Dashboard provides an immediate sense of system status without looking at detailed logs.
- Data is refreshed automatically or has a manual refresh button.

---

## AI Instructions for Gemini

You are an expert software engineer. Follow the standard Git workflow for this project.
1. Implement the requirements.
2. Commit and push to the development branch.
3. Move this task file to issues_done/.
