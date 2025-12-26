# ISSUE-091-Admin — Custom Quota & Limits Overrider

## Goal / Requirements / Acceptance Criteria / Out of Scope

Level: L2 | Type: Admin / Billing

---

Goal:
Allow admins to grant special resource limits to specific customers without changing their global billing plan.

Requirements:
- Manual override fields for:
  - Max number of Organizations
  - Max number of Projects
  - Max number of Databases
  - Storage quota (GB)
  - Retention period (Days)
- Toggle to "Ignore Plan Limits" for troubleshooting or premium support.
- Audit log entry for every limit change.

Acceptance Criteria:
- A customer can be granted more storage or connections than their "Pro" plan normally allows.
- System accurately calculates usage against these manual overrides if they exist.

---

## AI Instructions for Gemini

You are an expert software engineer. Follow the standard Git workflow for this project.
1. Implement the requirements.
2. Commit and push to the development branch.
3. Move this task file to issues_done/.
