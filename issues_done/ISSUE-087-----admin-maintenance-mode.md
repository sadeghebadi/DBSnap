# ISSUE-087 — Admin Maintenance Mode Toggle

## Goal / Requirements / Acceptance Criteria / Out of Scope

Level: L2 | Type: Admin / Infra

---

Goal:
Allow admins to put the entire application or specific services into maintenance mode during upgrades.

Requirements:
- Global "Maintenance Mode" toggle in the Admin Dashboard.
- Option to provide a custom maintenance message for users.
- Whitelist specific IP addresses (e.g., developers) to bypass the maintenance screen.
- API requests should return a 503 Service Unavailable status when maintenance mode is active.

Acceptance Criteria:
- When enabled, non-whitelisted users see a maintenance page and cannot use the app.
- Critical background jobs (like scheduled backups) can be optionally paused or continued.

---

## AI Instructions for Gemini

You are an expert software engineer. Follow the standard Git workflow for this project.
1. Implement the requirements.
2. Commit and push to the development branch.
3. Move this task file to issues_done/.
