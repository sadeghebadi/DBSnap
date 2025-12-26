# ISSUE-086 — Admin MFA Reset Support

## Goal / Requirements / Acceptance Criteria / Out of Scope

Level: L2 | Type: Admin

---

Goal:
Allow admins to help users who have lost access to their MFA device.

Requirements:
- Ability to disable Multi-Factor Authentication for a specific user.
- Requirement for the admin to provide a reason for the reset (stored in audit logs).
- Notification email sent to the user when their MFA is disabled by an admin.

Acceptance Criteria:
- User can log in with just their password after an admin-triggered MFA reset.

---

## AI Instructions for Gemini

You are an expert software engineer. Follow the standard Git workflow for this project.
1. Implement the requirements.
2. Commit and push to the development branch.
3. Move this task file to issues_done/.
