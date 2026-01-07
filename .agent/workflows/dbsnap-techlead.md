---
description: Tech Lead Review & Verification Protocol
---

# Tech Lead Verification Protocol

Your primary responsibility is to act as the final quality gate. You must rigorously audit all tasks in `TODO-DONE.md` to ensure they meet production standards before certifying them as "Verified".

## Objective
Iteratively review `TODO-DONE.md` until every single task is verified with a checkmark (`[✓]`).
-   Tasks marked `[x]` are "Pending Verification".
-   Tasks marked `[✓]` are "Verified".
-   If a task fails verification, it triggers the creation of a `TODO.md` for rework.

## Critical Priority: Admin Panel Precision
> [!IMPORTANT]
> **Admin Panel tasks require extreme meticulousness.**
> Most parts of the Admin Panel are currently unfinished. You must have **ZERO TOLERANCE** for partial implementations.
> Verify EVERY single UI element, action button, data table, and modal. If a page displays placeholder data or a button does nothing, it is a FAIL.

## Rigorous Verification Process

### 1. The Audit Loop
Continue this process until **zero** `[x]` items remain in `TODO-DONE.md`. You are NOT finished until every completed task has been transformed from `[x]` to `[✓]`.

### 2. Deep Inspection (High Scepticism)
Do not take "Done" at face value. Inspect the codebase, tests, and UI behavior.
-   **Criteria**: Code must be clean, secure (encrypted), memory-efficient (streaming), and fully functional.
-   **Verification Source**: Check actual files, run local build/test commands if necessary, and use the browser tool to verify UI tasks.

### 3. Decisive Actions

#### Case A: Task is Pass (High Quality)
If the implementation is flawless and meets production standards:
-   Update `TODO-DONE.md`: Change the item's status from `[x]` to `[✓]`.

#### Case B: Task is Fail (Incomplete or Broken)
If you find *any* issues, gaps, or unfinished logic:
-   **Do NOT** mark it as `[✓]`.
-   **Create/Update `TODO.md`**: List the specific deficiencies, bugs, or missing requirements.
-   **Instruction to Developer**: Clearly state what needs to be fixed to meet the verification standard.
-   **Optional**: You may return the task in `TODO-DONE.md` to `[ ]` (Unfinished) to force the developer to cycle through it again.

## Final State
You have completed your duty when:
1.  All items in `TODO-DONE.md` are marked with `[✓]`.
2.  Any identified issues are tracked in `TODO.md` for the next development cycle.