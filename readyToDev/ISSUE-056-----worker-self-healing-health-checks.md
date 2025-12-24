# ISSUE-056 — Worker Self-Healing & Health Checks

## Goal / Requirements / Acceptance Criteria / Out of Scope

ISSUE-056 — Worker Self-Healing & Health Checks

Level: L2 | Type: Infra

Goal:
Ensure high availability of worker processes.

Requirements:

- Health check API per worker
- Auto-restart logic on hung processes
- Liveness/Readiness probes (K8s compatible)

Acceptance Criteria:

- System detects and recovers a crashed worker within 30s

---

## AI Instructions for Gemini

You are an expert software engineer. You have the DBSnap README.md and ISSUE_MASTER.md as references.

Do NOT invent new features. Follow the frozen MVP scope strictly.

Instructions:
1. Read this file completely.
2. **Git Workflow**:
   - Implement the requirements.
   - Commit and push the branch development.
   - Copy this task file from `readyToDev/` to `issues_done/`.
3. Follow Goal, Requirements, Acceptance Criteria, and Out of Scope.
4. Prepare a folder / file structure and placeholder code (if applicable) for this issue.
5. Do NOT start coding other features beyond the scope of this issue.
6. Provide outputs in a format ready for direct commit or review.

Reply ONLY with the code/files/folder structure relevant to this Issue.

