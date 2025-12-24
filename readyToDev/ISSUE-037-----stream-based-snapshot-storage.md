# ISSUE-037 — Stream-based Snapshot Storage

## Goal / Requirements / Acceptance Criteria / Out of Scope

ISSUE-037 — Stream-based Snapshot Storage
Level: L3 | Type: Core

Goal:
Handle massive databases without memory exhaustion.

Requirements:
- Stream data directly from DB cursor to S3
- Chunked upload integration
- No local intermediate file if possible

Acceptance Criteria:
- Backup of 10GB+ DB finishes with <512MB RAM usage

---

## AI Instructions for Gemini

You are an expert software engineer. You have the DBSnap README.md and ISSUE_MASTER.md as references.

Do NOT invent new features. Follow the frozen MVP scope strictly.

Instructions:
1. Read this file completely.
2. **Git Workflow**:
   - Create a new branch named EXACTLY like this filename: `ISSUE-037-----stream-based-snapshot-storage.md`.
   - Implement the requirements.
   - Commit and push the branch.
   - Copy this task file from `readyToDev/` to `issues_done/`.
3. Follow Goal, Requirements, Acceptance Criteria, and Out of Scope.
4. Prepare a folder / file structure and placeholder code (if applicable) for this issue.
5. Do NOT start coding other features beyond the scope of this issue.
6. Provide outputs in a format ready for direct commit or review.

Reply ONLY with the code/files/folder structure relevant to this Issue.

