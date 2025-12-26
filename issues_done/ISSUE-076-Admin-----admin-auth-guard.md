# ISSUE-076-Admin — Admin Authentication & Authorization Guard

## Goal / Requirements / Acceptance Criteria / Out of Scope

Level: L2 | Type: Admin / Security

---

Goal:
Ensure that the Admin Panel is inaccessible to regular customers and properly integrated with the auth flow.

Requirements:
- Create an `AdminGuard` for both Frontend and Backend API routes.
- If a user tries to access `/admin` without the `ADMIN` role:
  - Frontend: Redirect to Unauthorized page or Home dashboard with a toast notification.
  - Backend: Return `403 Forbidden`.
- Handle session expiration: Ensure that if an admin's session expires, they are redirected back to the login page.
- Role check logic: Ensure roles are fetched from a secure JWT claim or database check.

Acceptance Criteria:
- A user with a 'MEMBER' role cannot see or access any route under `/admin`.
- Unauthorized attempts are logged in the security audit.

---

## AI Instructions for Gemini

You are an expert software engineer. Follow the standard Git workflow for this project.
1. Implement the requirements.
2. Commit and push to the development branch.
3. Move this task file to issues_done/.
