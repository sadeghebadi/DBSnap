---
description: Automates the cycle of coding, reviewing, and documenting tasks from todo.md
---

# Title: DBSnap Automated Development (Infinite Loop)
# Description: Fully autonomous loop for coding, reviewing, and progressing through todo.md

## Step 1: Task Selection & Status Check
- Open @todo.md. 
- Identify the VERY FIRST incomplete task `[ ]`.
- If no incomplete tasks remain, output "PROJECT COMPLETE" and terminate.
- Otherwise, proceed to Step 2 with the selected task details.

## Step 2: Implementation
Call @developer. 
Instructions: "Execute the task. Write the code. Once done, DO NOT ask the user for permission. Your final sentence MUST be: 'Done. @techlead please review my code for Task [Name].'"

## Step 3: Quality Control
Call @techlead.
Instructions: "Review the code. If APPROVED, mark [x] in @todo.md. Then, immediately call @docs and then trigger the next task by typing /dbsnap-dev. NEVER wait for user input if the code is approved."
## Step 4: Documentation & Cleanup
- Call @docs to update @README.md and @CHANGELOG.md.
- Summarize the completion of the current task.

## Step 5: Autonomous Re-trigger (CRITICAL)
- **Instruction:** "Immediately return to Step 1 and pick the next available task. DO NOT wait for user input. Continue this cycle until @todo.md is fully checked `[x]`."