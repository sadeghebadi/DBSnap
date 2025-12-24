### ISSUE-037 — Stream-based Snapshot Storage
Level: L3 | Type: Core

Goal:
Handle massive databases without memory exhaustion.

Requirements:
- Stream data directly from DB cursor to S3
- Chunked upload integration
- No local intermediate file if possible

Acceptance Criteria:
- Backup of 10GB+ DB finishes with <512MB RAM usage

---
