# Phase 04 — Data Retention, Archival & Privacy Policies

**Project**: Campus Plus — Campus Complaint & Grievance Resolution System  
**Phase**: Phase 04 — Database Engineering & Migration Design  
**Date**: 2026-09-10  
**Status**: Formal Data Retention & Privacy Specification Approved  

---

## 1. Retention Strategy by Entity Category

| Data Entity | Approved Minimum Retention | Archival Mechanism | Deletion Policy | Policy Classification |
| :--- | :--- | :--- | :--- | :--- |
| **`complaints`** | 4 Academic Years (`NFR-010`) | Permanent relational archive | Hard deletion strictly prohibited | Approved Requirement (`NFR-010`) |
| **`action_history`** | 7 Academic Years | Append-only journal; read-only cold storage | Immutable; deletion blocked at DB kernel | Approved Architecture (`ADR-008`) |
| **`resolutions`** | 4 Academic Years | Linked 1-to-1 with complaint | Parallels complaint retention | Approved Requirement |
| **`attachments`** | 4 Academic Years | Object storage lifecycle policy | Linked deletion upon approved legal purge | Approved Architecture (`ADR-010`) |
| **`notifications`** | 90 Days | Inactive alert purge | Automated background cleanup after 90 days | Approved Architecture (`ADR-006`) |
| **`outbox_events`** | 30 Days after publish | Published state retention | Periodic purge of `PUBLISHED` events | Operational Reliability |
| **`idempotency_keys`**| 24 Hours | Transient cache table | Expired tokens purged daily | Operational Reliability |
| **`users`** | Duration of enrollment/tenure + 7 years | Soft-deactivation (`is_active = FALSE`) | Hard deletion blocked via FK `RESTRICT` | **INSTITUTIONAL DECISION REQUIRED** |

---

## 2. Student & Staff Departure Handling (Preserving Accountability)

When a student graduates or a staff member departs:
1. **No Cascade Deletion**: `users` records are NEVER hard-deleted via `ON DELETE CASCADE`. Doing so would corrupt the historical grievance record, destroy resolution attributions, and break audit chains.
2. **Account Deactivation**: The user's account is marked `is_active = FALSE`.
3. **Membership Termination**: In `department_memberships`, the departure timestamp `left_at` is populated and `is_active` set to `FALSE`.
4. **Historical Attribution**: Past complaints, assignments, forwards, and audit entries continue to cleanly reference the immutable `users.id UUID`.

---

## 3. Explicit Open Decisions & Dependencies
- **Institutional Archival Window**: Whether complaints must be permanently archived indefinitely or purged after exactly 7 academic years requires official institutional governance approval (`RETENTION POLICY — INSTITUTIONAL DECISION REQUIRED`). The schema is designed to support both policies without breaking relational integrity.
