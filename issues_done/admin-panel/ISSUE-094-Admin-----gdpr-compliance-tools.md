# ISSUE-094-Admin — GDPR & Compliance Data Exporter

## Goal / Requirements / Acceptance Criteria / Out of Scope

Level: L2 | Type: Admin / Privacy

---

Goal:
Fulfill GDPR "Right to Access" and "Right to Erasure" (Right to be Forgotten) requests.

Requirements:
- "Export All Data" button for a User/Organization (Generates a ZIP with all metadata and backup info).
- "Permanent Deletion" (Hard delete) tool that wipes all metadata, logs, and associated snapshots from object storage.
- Audit trail for every compliance-related export or deletion.
- Legal hold flag: Ability to prevent deletion if a customer is under investigation.

Acceptance Criteria:
- Admins can cleanly purge a customer's entire footprint from the system.
- Export provides a machine-readable format of the user's data.

---

## AI Instructions for Gemini

You are an expert software engineer. Follow the standard Git workflow for this project.
1. Implement the requirements.
2. Commit and push to the development branch.
3. Move this task file to issues_done/.
