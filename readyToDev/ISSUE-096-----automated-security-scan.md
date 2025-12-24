# ISSUE-096 — Automated Security Scan

## Goal / Requirements / Acceptance Criteria / Out of Scope

ISSUE-096 — Automated Security Scan

Level: L2 | Type: Security

Goal:
Keep dependencies and code secure.

Requirements:

- Snyk or `npm audit` integration in CI
- Owasp ZAP scan for API endpoints
- Secret scanning forcommitted code

Acceptance Criteria:

- No high/critical vulnerabilities in production code

---

END OF FILE

## AI Instructions for Gemini

You are an expert software engineer. You have the DBSnap README.md and ISSUE_MASTER.md as references.

Do NOT invent new features. Follow the frozen MVP scope strictly.

Instructions:

1. Read this file completely.
2. **Git Workflow**:
   - Implement the requirements.
   - Commit and push the branch main.
   - Copy this task file from `readyToDev/` to `issues_done/`.
3. Follow Goal, Requirements, Acceptance Criteria, and Out of Scope.
4. Prepare a folder / file structure and placeholder code (if applicable) for this issue.
5. Do NOT start coding other features beyond the scope of this issue.
6. Provide outputs in a format ready for direct commit or review.

Reply ONLY with the code/files/folder structure relevant to this Issue.
