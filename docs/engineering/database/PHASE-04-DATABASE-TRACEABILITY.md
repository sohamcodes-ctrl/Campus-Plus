# Phase 04 — Database Requirements & Architecture Traceability

**Project**: Campus Plus — Campus Complaint & Grievance Resolution System  
**Phase**: Phase 04 — Database Engineering & Migration Design  
**Date**: 2026-09-10  
**Status**: Formal Traceability Approved  

---

## 1. End-to-End Traceability Matrix

| Requirement | Business Rule | ADR | Domain Concept | Database Table(s) | Constraint / Policy / Index | Verification Test |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`FR-001`** (Auth) | `BR-001` | ADR-009 | User Identity & RBAC | `users`, `roles`, `user_roles` | `chk_user_email_format`, RLS on `user_roles` | `tests/database/rls-authorization.test.ts` |
| **`FR-003`** (Complaint) | `BR-002` | ADR-005 | Complaint Aggregate Root | `complaints` | `uk_complaints_ref_id`, `chk_complaint_title_len`, OCC `version` | `tests/database/constraints.test.ts` |
| **`FR-004`** (Category) | `BR-007` | ADR-004 | Category Classification | `categories` | `UNIQUE(name)`, FK `default_department_id` | `tests/database/constraints.test.ts` |
| **`FR-005`** (Evidence) | `BR-006` | ADR-010 | Evidence Attachments | `attachments` | `chk_attachment_size_limit` (5MB), `chk_attachment_mime_whitelist` | `tests/database/constraints.test.ts` |
| **`FR-008`** (Assignment)| `BR-008` | ADR-004 | Handler Assignment | `complaint_assignments`, `complaints` | `FK handler_id`, `idx_complaints_handler_queue` | `tests/database/fsm-transitions.test.ts` |
| **`FR-010`** (Forwarding)| `BR-010`, `EDGE-004`| ADR-004 | Department Transfer | `complaint_forwards` | `chk_forward_diff_dept`, `chk_forward_rationale` | `tests/database/fsm-transitions.test.ts` |
| **`FR-011`** (Notes) | `BR-011` | ADR-009 | Internal Staff Remarks | `internal_notes` | RLS: Complete exclusion of `ROLE_STUDENT` | `tests/database/rls-authorization.test.ts` |
| **`FR-012`** (SLA) | `BR-013` | ADR-006 | SLA Policy Matrix | `sla_policies`, `working_calendars` | `chk_sla_positive_hours`, `idx_complaints_sla_overdue` | `tests/database/constraints.test.ts` |
| **`FR-013`** (Escalate) | `BR-012` | ADR-006 | Hierarchical Escalation | `complaint_escalations` | Tier enum, `idx_complaints_escalation_queue` | `tests/database/fsm-transitions.test.ts` |
| **`FR-016`** (Resolution)| `BR-016` | ADR-005 | Formal Resolution | `resolutions` | `chk_res_summary_len` (>=20 chars), `UNIQUE(complaint_id)` | `tests/database/constraints.test.ts` |
| **`FR-017`** (Reopen) | `BR-017` | ADR-005 | Reopening & Verification | `resolutions`, `complaints` | Dispute rationale fields, transition rules | `tests/database/fsm-transitions.test.ts` |
| **`FR-018`** (Close) | `BR-019` | ADR-005 | Terminal Closure | `complaints` | Status `CLOSED`, zero outgoing transitions | `tests/database/fsm-transitions.test.ts` |
| **`FR-019`** (Audit) | `BR-020` | ADR-008 | Append-Only Audit Trail | `action_history` | Trigger `trg_action_history_no_mutation`, `REVOKE UPDATE, DELETE` | `tests/database/audit-immutability.test.ts` |
| **`FR-020`** (Alerts) | `BR-014` | ADR-006 | In-App Notifications | `notifications`, `outbox_events` | `idx_notifications_inbox`, `idx_outbox_pending` | `tests/database/migration.test.ts` |
| **`FR-025`** (Hotspots) | `INFERENCE`| ADR-010 | Recurring Clustering | `locations`, `recurring_complaint_clusters` | `uk_locations_unique_spot`, 30-day view | `tests/database/performance-explain.test.ts` |
| **`NFR-001`** (Speed) | `NFR-001` | ADR-004 | Sub-800ms Target | All Tables | B-tree composite and partial indexes | `tests/database/performance-explain.test.ts` |
| **`NFR-003`** (Reliable)| `NFR-003` | ADR-006 | Event Delivery & OCC | `outbox_events`, `idempotency_keys` | `version INTEGER NOT NULL DEFAULT 1`, unique idempotency token | `tests/database/concurrency-occ.test.ts` |
| **`NFR-005`** (Security)| `NFR-005` | ADR-009 | Access Control & PII | All Tables | RLS policies (`p_*`), PII isolation | `tests/database/rls-authorization.test.ts` |
