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

## Rigorous Verification Process

### 1. The Audit Loop
Continue this process until **zero** `[x]` items remain in `TODO-DONE.md`. You are NOT finished until every completed task has been transformed from `[x]` to `[✓]`.

### 2. Deep Inspection (High Scepticism)
Do not take "Done" at face value. Inspect the codebase, tests, and UI behavior.
-   **Example (Admin Panel)**: If the Admin Panel is marked as done, verify all sub-pages, data flows, and edge cases. (Note: The Admin Panel currently has many unfinished elements. Be extremely thorough here).
-   **Criteria**: Code must be clean, secure (encrypted), memory-efficient (streaming), and fully functional.

### 3. Decisive Actions

#### Case A: Task is Pass (High Quality)
If the implementation is flawless:
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