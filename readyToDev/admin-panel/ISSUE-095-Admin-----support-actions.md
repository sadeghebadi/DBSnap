# ISSUE-095-Admin — Admin-Triggered Customer Support Actions

## Goal / Requirements / Acceptance Criteria / Out of Scope

Level: L3 | Type: Admin / Support

---

Goal:
Empower support agents to solve technical issues by performing actions on behalf of a customer without sharing credentials.

Requirements:
- "Test Connection" button on a customer's database from the Admin panel.
- "Trigger Manual Backup" button on a customer's database.
- "Request Diff" button between two of a customer's snapshots.
- All actions triggered by an admin must be tagged with `triggeredByAdmin: true` and the Admin ID in the database.

Acceptance Criteria:
- Admins can verify if a customer's DB connection is actually working without having to impersonate the user or see their password.
- Results of these actions (logs, status) are visible to the admin.

---

## AI Instructions for Gemini

You are an expert software engineer. Follow the standard Git workflow for this project.
1. Implement the requirements.
2. Commit and push to the development branch.
3. Move this task file to issues_done/.
