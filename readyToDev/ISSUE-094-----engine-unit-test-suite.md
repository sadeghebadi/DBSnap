# ISSUE-094 — Engine Unit Test Suite

## Goal / Requirements / Acceptance Criteria / Out of Scope

ISSUE-094 — Engine Unit Test Suite
Level: L3 | Type: QA

Goal:
100% test coverage for core backup/diff logic.

Requirements:
- Jest tests for Mongo/SQL adapters
- Mock storage and DB interfaces
- Table-driven tests for edge cases (empty collections, large docs)

Acceptance Criteria:
- Core engine passes 100% tests in CI

---

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

