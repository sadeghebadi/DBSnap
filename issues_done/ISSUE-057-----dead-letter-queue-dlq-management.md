# ISSUE-057 — Dead Letter Queue (DLQ) Management

## Goal / Requirements / Acceptance Criteria / Out of Scope

ISSUE-057 — Dead Letter Queue (DLQ) Management

Level: L2 | Type: Admin

---

Goal:
Allow admins to inspect and retry failed jobs stored in the Dead Letter Queue.

Requirements:
- UI for viewing DLQ contents (failed jobs and their metadata)
- Inspect error stacks and reason for failure
- Bulk retry or individual job re-drive (moving from DLQ back to active queue)

Acceptance Criteria:
- Failed jobs can be analyzed and restarted through the Admin Panel interface.
- Admins can clear the DLQ or specific failed jobs.

---

## AI Instructions for Gemini

You are an expert software engineer. You have the DBSnap README.md and ISSUE_MASTER.md as references.

Do NOT invent new features. Follow the frozen MVP scope strictly.

Instructions:
1. Read this file completely.
2. **Git Workflow**:
   - Implement the requirements.
   - Commit and push the branch development.
   - Copy this task file from `readyToDev/admin-panel/` to `issues_done/`.
3. Follow Goal, Requirements, Acceptance Criteria, and Out of Scope.
4. Prepare a folder / file structure and placeholder code (if applicable) for this issue.
5. Do NOT start coding other features beyond the scope of this issue.
6. Provide outputs in a format ready for direct commit or review.

Reply ONLY with the code/files/folder structure relevant to this Issue.
