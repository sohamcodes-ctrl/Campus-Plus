# Phase 04 — Index Engineering & Query Optimization Strategy

**Project**: Campus Plus — Campus Complaint & Grievance Resolution System  
**Phase**: Phase 04 — Database Engineering & Migration Design  
**Date**: 2026-09-10  
**Status**: Formal Index Strategy Approved  

---

## 1. Principles of Index Engineering

Every index in the Campus Plus schema is explicitly derived from an approved query pattern (dashboard worklist, search lookup, SLA monitor, or aggregation view). Over-indexing is strictly avoided to protect write throughput during high-concurrency complaint submissions.

---

## 2. Definitive Index Catalog & Query Pattern Mapping

| Index Name | Table | Columns (Order Conscious) | Query Pattern Supported | Cardinality & Ordering Rationale |
| :--- | :--- | :--- | :--- | :--- |
| **`idx_complaints_ref_id`** | `complaints` | `ref_id` | Public tracking lookup (`GET /api/v1/complaints/CP-2026-00042`) | Unique B-Tree. Point lookup in $O(\log N)$. |
| **`idx_complaints_student_list`** | `complaints` | `(complainant_id, created_at DESC)` | Student personal dashboard (`FR-006`, `FR-021`) | Equality on student ID, range sort on submission date. Avoids in-memory sort. |
| **`idx_complaints_dept_queue`** | `complaints` | `(department_id, status, official_priority, created_at DESC)` | Department head triage queue & backlog (`FR-023`) | Equality on department, filtered by active statuses (`SUBMITTED`, `IN_PROGRESS`), sorted by priority. |
| **`idx_complaints_handler_queue`** | `complaints` | `(assigned_handler_id, status, created_at DESC)` | Handler active worklist query (`FR-022`) | Equality on handler ID, filters out resolved/closed items. |
| **`idx_complaints_sla_overdue`** | `complaints` | `(status, sla_due_at)` WHERE `status NOT IN ('RESOLVED', 'CLOSED', 'REJECTED')` | Background SLA monitor daemon detecting overdue grievances (`FR-012`, `FR-014`) | **Partial Index**: Excludes terminal states (80%+ of historical records). Instant scan of active deadlines. |
| **`idx_complaints_escalation_queue`**| `complaints` | `(escalation_tier, department_id, created_at DESC)` WHERE `is_escalated = TRUE` | Institutional Management escalation dashboard (`FR-024`) | **Partial Index**: Indexes only actively escalated grievances. Tiny index footprint. |
| **`idx_complaints_recurring_hotspots`**| `complaints` | `(department_id, category_id, location_id, created_at)` | Rolling 30-day recurring incident clustering view (`FR-025`, `ADR-010`) | Covers grouping columns for index-only scans on hotspot clusters. |
| **`idx_action_history_timeline`** | `action_history` | `(complaint_id, created_at ASC)` | Complaint audit history rendering (`FR-019`) | Equality on complaint ID, natural chronological sort for timeline UI. |
| **`idx_notifications_inbox`** | `notifications` | `(recipient_id, is_read, created_at DESC)` | In-app user inbox notification list (`FR-020`) | Equality on recipient, filters unread alerts, sorts latest first. |
| **`idx_outbox_pending`** | `outbox_events` | `(status, created_at ASC)` WHERE `status = 'PENDING'` | Background outbox event dispatcher (`ADR-006`) | **Partial Index**: Zero overhead from published events. Instant FIFO fetch. |

---

## 3. Partial Index Design Rationale

1. **`idx_complaints_sla_overdue`**:
   - In a production institution, over 90% of complaints will be `RESOLVED` or `CLOSED`. Indexing all historical rows for SLA tracking would waste memory and CPU on every write.
   - The partial predicate `WHERE status NOT IN ('RESOLVED', 'CLOSED', 'REJECTED')` limits the index to active tickets only.
2. **`idx_outbox_pending`**:
   - Once an event is published, it is never queried again by the worker. The partial index `WHERE status = 'PENDING'` guarantees that the worker's polling query remains instantaneous regardless of table size.
