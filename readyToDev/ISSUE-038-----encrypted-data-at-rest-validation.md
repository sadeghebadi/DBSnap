# ISSUE-038 — Encrypted Data-at-Rest Validation

## Goal / Requirements / Acceptance Criteria / Out of Scope

ISSUE-038 — Encrypted Data-at-Rest Validation
Level: L2 | Type: Security

Goal:
Ensure backups are valid and encrypted as expected.

Requirements:
- Post-backup checksum validation
- Decryption test on 1% sample
- Audit logs for encryption metadata

Acceptance Criteria:
- System flags any corrupted or insecure backup immediately

---

## PHASE 4 — DIFF ENGINE (CORE VALUE)

## AI Instructions for Gemini

You are an expert software engineer. You have the DBSnap README.md and ISSUE_MASTER.md as references.

Do NOT invent new features. Follow the frozen MVP scope strictly.

Instructions:
1. Read this file completely.
2. Follow Goal, Requirements, Acceptance Criteria, and Out of Scope.
3. Prepare a folder / file structure and placeholder code (if applicable) for this issue.
4. Do NOT start coding other features beyond the scope of this issue.
5. Provide outputs in a format ready for direct commit or review.

Reply ONLY with the code/files/folder structure relevant to this Issue.

