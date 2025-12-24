# ISSUE-026 — SSL/TLS Certificate Support

## Goal / Requirements / Acceptance Criteria / Out of Scope

ISSUE-026 — SSL/TLS Certificate Support
Level: L2 | Type: Core

Goal:
Support databases requiring custom CA or client certificates.

Requirements:
- CA, Certificate, and Key file upload
- Secure storage of certificates
- Connector integration for TLS

Acceptance Criteria:
- Connect successfully to a DB requiring mutual TLS (mTLS)

---

## PHASE 3 — SNAPSHOT & BACKUP CORE

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

