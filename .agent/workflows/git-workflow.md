---
description: How to implement a new task from readyToDev
---

# Git Workflow for Issues

Follow these steps for every new task:

1. **Identify the Task**: Find the relevant file in `readyToDev/` (e.g., `readyToDev/ISSUE-004-----minimal-contributingmd.md`).
2. **Switch to Development**: Ensure you are on the `development` branch.
   ```bash
   git checkout development
   ```
3. **Implementation**: Perform the required changes as specified in the issue.
4. **Verification**: Verify the changes (lint, build, tests, manual check).
5. **Documentation**: Copy the task file from `readyToDev/` to `issues_done/` to keep a record of completed work.
   ```bash
   cp readyToDev/ISSUE-XXX-----name-of-task.md issues_done/
   ```
6. **Commit & Push**: Commit all changes (implementation + documentation) and push to development.
   ```bash
   git add .
   git commit -m "feat: implement issue-XXX - brief description"
   git push origin development
   ```

// turbo-all