# ISSUE-085 — Admin User Impersonation

## Goal / Requirements / Acceptance Criteria / Out of Scope

Level: L3 | Type: Admin

---

Goal:
Allow support admins to view the application exactly as a specific user sees it to troubleshoot issues.

Requirements:
- "Log in as user" button on the Admin User List.
- Visual indicator (banner) prominently showing that the admin is currently impersonating a user.
- Audit log entry whenever an impersonation session starts and ends.
- Ability to quickly switch back to the admin account.

Acceptance Criteria:
- Admin can access the dashboard of the impersonated user with their permissions.
- Security boundary is maintained (Admin cannot see the user's actual password).

---

## AI Instructions for Gemini

You are an expert software engineer. Follow the standard Git workflow for this project.
1. Implement the requirements.
2. Commit and push to the development branch.
3. Move this task file to issues_done/.
