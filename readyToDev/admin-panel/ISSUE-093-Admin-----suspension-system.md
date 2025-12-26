# ISSUE-093-Admin — User & Organization Suspension System

## Goal / Requirements / Acceptance Criteria / Out of Scope

Level: L2 | Type: Admin / Security

---

Goal:
Allow admins to cleanly suspend or block users and organizations for security or non-payment reasons.

Requirements:
- Global "Suspend" button for both Users and Organizations.
- Ability to provide a reason for suspension (Internal note + Customer-facing message).
- Suspended users should be automatically logged out and blocked from logging back in.
- Suspended organizations should have their scheduled backup jobs paused.
- Automatic email notification to the customer when their account is suspended.

Acceptance Criteria:
- A suspended customer cannot access any DBSnap resources until an admin "Reactivates" them.
- All background job processing for the customer is safely halted.

---

## AI Instructions for Gemini

You are an expert software engineer. Follow the standard Git workflow for this project.
1. Implement the requirements.
2. Commit and push to the development branch.
3. Move this task file to issues_done/.
