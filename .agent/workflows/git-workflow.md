---
description: How to implement a new task from readyToDev
---

# Git Workflow for Issues

Follow these steps for every new task:

1. **Identify the Task**: Find the relevant file in `readyToDev/` (e.g., `readyToDev/ISSUE-004-----minimal-contributingmd.md`).
2. **Implementation**: Perform the required changes as specified in the issue.
3. **Verification**: Verify the changes (lint, build, tests, manual check).
4. **Commit**: Commit the changes with a clear message.
   ```bash
   git add .
   git commit -m "feat: implement issue-XXX - brief description"
   ```
5. **Push**: Push the branch to the remote repository.
   ```bash
   git push origin main
   ```
6. **Documentation**: Copy the task file from `readyToDev/` to `issues_done/` to keep a record of completed work.
   ```bash
   cp readyToDev/ISSUE-XXX-----name-of-task.md issues_done/
   git add issues_done/
   git commit -m "chore: record issue-XXX in issues_done"
   git push origin main
   ```

// turbo-all