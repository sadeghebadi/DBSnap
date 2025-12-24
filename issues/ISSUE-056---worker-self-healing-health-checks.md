### ISSUE-056 — Worker Self-Healing & Health Checks
Level: L2 | Type: Infra

Goal:
Ensure high availability of worker processes.

Requirements:
- Health check API per worker
- Auto-restart logic on hung processes
- Liveness/Readiness probes (K8s compatible)

Acceptance Criteria:
- System detects and recovers a crashed worker within 30s

---
