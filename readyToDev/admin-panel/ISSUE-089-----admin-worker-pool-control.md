# ISSUE-089 — Admin Worker Pool Control

## Goal / Requirements / Acceptance Criteria / Out of Scope

Level: L3 | Type: Admin / Infra

---

Goal:
Directly manage the background worker infrastructure from the Admin Panel.

Requirements:
- View real-time status of all active workers (ID, Version, CPU/Mem usage, current job).
- Manually trigger a "Restart" signal for a worker process.
- Adjust the concurrency level (number of jobs processed simultaneously) for specific queues.
- Visual history of worker scaling events.

Acceptance Criteria:
- Admins can identify and recover hung workers or adjust processing power based on demand.

---

## AI Instructions for Gemini

You are an expert software engineer. Follow the standard Git workflow for this project.
1. Implement the requirements.
2. Commit and push to the development branch.
3. Move this task file to issues_done/.
