# ISSUE-083 — System Health Dashboard

## Goal / Requirements / Acceptance Criteria / Out of Scope

ISSUE-083 — System Health Dashboard

Level: L2 | Type: Admin

---

Goal:
Monitor the internal health and stability of the DBSnap system.

Metrics:
- Queue depth (number of pending/failed/running jobs)
- Worker resource usage (CPU/Memory)
- Overall backup success rate (last 24h / 7d)

Acceptance Criteria:
- Admins have real-time visibility into the system's operational state.
- Dashboard provides clear indicators for system anomalies.

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
