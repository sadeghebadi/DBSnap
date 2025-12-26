# ISSUE-092-Admin — Global Database & Snapshot Browser

## Goal / Requirements / Acceptance Criteria / Out of Scope

Level: L2 | Type: Admin

---

Goal:
Allow admins to find any customer resource (DB or Snapshot) by ID for debugging.

Requirements:
- Global searchable list of all Databases across all customers.
- Global searchable list of all Snapshots across all customers.
- Search by ID, name, or connection string hash.
- Display failure reasons and logs directly in the list for quick diagnosis.
- Filter by "Failed only" or "Stuck in Progress" states.

Acceptance Criteria:
- When a customer says "My snapshot with ID X failed", the admin can instantly find it without knowing the user's email.

---

## AI Instructions for Gemini

You are an expert software engineer. Follow the standard Git workflow for this project.
1. Implement the requirements.
2. Commit and push to the development branch.
3. Move this task file to issues_done/.
