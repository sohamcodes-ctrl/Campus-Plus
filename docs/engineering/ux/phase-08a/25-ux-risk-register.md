# Phase 08-A: Forensic UX & Operational Risk Register

**Document Identifier:** `25-ux-risk-register.md`  
**Classification:** Enterprise UX / Product Experience Blueprint  
**Standard:** Catalogs all identified UX, architectural, and operational failure modes with severity ratings, root cause analysis, and mitigation plans.

---

## 1. Risk Evaluation Matrix

| Severity Level | Definition | Protocol Requirement |
| :---: | :--- | :--- |
| **P1 — Critical** | Blocks primary lifecycle path, causes data loss, or compromises security boundary | Must be mitigated prior to production launch |
| **P2 — Major** | Degrades user trust, creates orphan assets, or impairs multi-device ergonomics | Must be visibly registered with containment plan |
| **P3 — Moderate** | Edge case usability friction, minor visual layout degradation under stress | Addressed in subsequent sprint |

---

## 2. Master UX Risk Register

| Risk ID | Risk Title & Description | Severity | Probability | Impact Area | Root Cause Analysis | Architecture Mitigation Plan |
| :--- | :--- | :---: | :---: | :--- | :--- | :--- |
| **`RISK-001`** | **Temporary Attachment Orphan Accumulation** | **P2** | High | Storage Storage Bucket | User uploads files via presigned URL but abandons form prior to submission. | Known operational risk (Section 6). No frontend workaround allowed. Mitigated via cloud lifecycle cleanup rules purging unreferenced files after 24 hours. |
| **`RISK-002`** | **Frontend API Gaps in Dynamic Lookups** | **P2** | High | Form Intake (`STU-002`) | No dedicated `GET /categories` or `GET /departments` endpoints exist in MVP routes. | Documented in `20-frontend-api-gaps.md`. Resolved in Phase 08-B by implementing cached lookup endpoints or generating client-safe static enums. |
| **`RISK-003`** | **Accidental Verification Closure** | **P2** | Medium | Resolution Lifecycle | Student taps "Verify" thinking it opens a preview, immediately triggering permanent `CLOSED` status. | High-friction confirmation modal (`STU-004`) requiring explicit confirmation: "This will permanently close your complaint." |
| **`RISK-004`** | **Adversarial Dispute Reopen Loop** | **P3** | Low | Resolution Lifecycle | Student repeatedly disputes valid repairs out of personal dissatisfaction. | Reopen policy limits disputes to 5 business days (`BR-016`); subsequent disputes trigger mandatory HOD supervisory review. |
| **`RISK-005`** | **Mobile Offline Data Loss During Submission**| **P2** | Medium | Mobile Submission | Student loses cellular connection while drafting 500-character description. | Transient form text cached in local component state; offline indicator banner warns user; submit button disabled while offline. |
| **`RISK-006`** | **Lack of Real-Time WebSocket Notifications** | **P3** | High | In-App Alerts (`SHR-001`) | Users must navigate or click bell icon to discover newly assigned complaints. | Acceptable for MVP; notification drawer polls on window focus or 60-second intervals; WebSockets slated for Post-MVP. |
| **`RISK-007`** | **Circular Departmental Forwarding Deadlock** | **P2** | Medium | Forwarding Flow | Departments pass ticket laterally back and forth to avoid budget expenditure. | Anti-Deadlock rule (`INV-010`) permanently blocks forwarding after 3 transfers and elevates directly to Central Management. |
| **`RISK-008`** | **Stale Concurrency Overwrites in Busy Queues**| **P2** | Medium | Worklist Triage | Two technicians open ticket simultaneously; one resolves while other reassigns. | Optimistic Concurrency Control (`OCC`) rejects second transaction with HTTP 409 and prompts conflict resolution modal. |
