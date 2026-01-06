---
description: Automates the cycle of coding, reviewing, and documenting tasks from todo.md until all tasks are complete.
---

# DBSnap Automated Development Cycle

This workflow automates the software development lifecycle for DBSnap. It continuously picks up tasks from `todo.md`, implements them, reviews them, and updates documentation until no incomplete tasks remain.

## Step 1: Initialization against todo.md

1. Open @todo.md.
2. Check for any incomplete tasks (marked as `[ ]`).
3. If ALL tasks are marked as `[x]`, output "ALL TASKS COMPLETED. Exiting workflow." and **STOP**.
4. If there are incomplete tasks, proceed to God Mode Loop.

## Step 2: The Development Loop

**Perform the following steps continuously until NO incomplete tasks remain in @todo.md:**

### A. Task Selection
1. Read @todo.md.
2. Identify the **first** incomplete task `[ ]`.
3. Capture the Task Title and Details.
4. **Goal:** You are now working on: `<Task Name>`.

### B. Implementation (Developer)
1. Call @developer.
2. **Instruction:** "Implement the task: '<Task Name>'. Review `ard_DBSnap.md` and `prd_DBSnap.md` for context. Write the necessary code. When finished, do NOT ask for permission. Simply state that you are done and ready for review."

### C. Review (Tech Lead)
1. Call @techlead.
2. **Instruction:** "Review the implementation of '<Task Name>'.
   - If REJECTED -> Provide feedback to @developer and repeat Step B.
   - If APPROVED -> Mark the task as `[x]` in @todo.md immediately."

### D. Documentation (Docs)
1. Call @docs.
2. **Instruction:** "Update @README.md and @CHANGELOG.md if necessary based on the completed task."

### E. Loop Continuation
1. **CRITICAL:** Do NOT stop here.
2. Go back to **Step 2A (Task Selection)**.
3. Check `todo.md` again.
   - If a new `[ ]` task exists, repeat the cycle.
   - If no `[ ]` tasks exist, print "Work Complete" and Terminate.