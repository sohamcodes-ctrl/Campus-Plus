# Phase 04 — Database Constraint Strategy & Invariant Defense

**Project**: Campus Plus — Campus Complaint & Grievance Resolution System  
**Phase**: Phase 04 — Database Engineering & Migration Design  
**Date**: 2026-09-10  
**Status**: Formal Constraint Strategy Approved  

---

## 1. Principles of Relational Invariant Enforcement

Campus Plus enforces critical institutional rules directly in the PostgreSQL relational schema rather than relying exclusively on application code. If a software bug or direct database access occurs, the database kernel rejects invalid state transitions and malformed records.

---

## 2. Definitive Database Constraint Catalog

| Target Table | Constraint Name | Constraint Type | SQL Definition | Institutional Invariant Enforced |
| :--- | :--- | :--- | :--- | :--- |
| `complaints` | `uk_complaints_ref_id` | `UNIQUE` | `UNIQUE (ref_id)` | Public tracking code uniqueness. |
| `complaints` | `chk_complaint_title_len` | `CHECK` | `char_length(title) >= 10 AND char_length(title) <= 120` | Prevents blank or overly long titles. |
| `complaints` | `chk_complaint_desc_len` | `CHECK` | `char_length(description) >= 30` | Mandates substantial grievance explanation. |
| `complaints` | `chk_complaint_version` | `CHECK` | `version >= 1` | Optimistic Concurrency Control integer boundary. |
| `complaints` | `fk_complaint_dept` | `FOREIGN KEY` | `REFERENCES departments(id) ON DELETE RESTRICT` | Prevents deletion of active department owning complaints. |
| `complaint_forwards`| `chk_forward_diff_dept` | `CHECK` | `from_department_id <> to_department_id` | Prevents transfer loops to the same department. |
| `complaint_forwards`| `chk_forward_rationale` | `CHECK` | `char_length(rationale) >= 10` | Requires written justification for departmental transfer. |
| `resolutions` | `chk_res_summary_len` | `CHECK` | `char_length(resolution_summary) >= 20` | Prohibits trivial or empty resolution summaries. |
| `resolutions` | `uk_resolution_complaint`| `UNIQUE` | `UNIQUE (complaint_id)` | Exactly one formal resolution record per complaint. |
| `attachments` | `chk_att_size_limit` | `CHECK` | `file_size_bytes > 0 AND file_size_bytes <= 5242880` | Maximum 5 MB per file constraint. |
| `attachments` | `chk_att_mime_whitelist`| `CHECK` | `mime_type IN ('image/jpeg', 'image/png', 'application/pdf')` | File format whitelist. |
| `attachments` | `uk_attachment_storage_key`| `UNIQUE` | `UNIQUE (storage_key)` | Prevents duplicate or clobbered storage keys. |
| `internal_notes` | `chk_note_len` | `CHECK` | `char_length(note) >= 5` | Prevents empty staff notes. |
| `sla_policies` | `uk_sla_cat_priority` | `UNIQUE` | `UNIQUE (category_id, priority)` | Unambiguous SLA policy lookup. |
| `sla_policies` | `chk_sla_positive_hours`| `CHECK` | `response_threshold_hours > 0 AND resolution_threshold_hours >= response_threshold_hours` | Valid SLA hour progression. |
| `users` | `chk_user_email_format`| `CHECK` | `email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'` | Valid RFC 5322 email syntax. |
| `locations` | `uk_locations_unique_spot`| `UNIQUE` | `UNIQUE (campus, building, block, floor, room_or_area)` | Normalizes campus locations for clustering. |
| `department_memberships`| `uk_active_membership`| `UNIQUE` | `UNIQUE (user_id, department_id, is_active)` | Prevents duplicate active memberships. |

---

## 3. Foreign Key Deletion Policy (No Destructive Cascades)

To guarantee that institutional grievance history is never accidentally erased when a user account or department is modified:
- `complaints.complainant_id`: `ON DELETE RESTRICT`. A student record cannot be deleted while they own active or archived complaints.
- `complaints.department_id`: `ON DELETE RESTRICT`. A department cannot be deleted if complaints belong to it.
- `complaint_assignments.handler_id`: `ON DELETE RESTRICT`. Historical handler assignments remain intact.
- `attachments`: `ON DELETE CASCADE` from `complaints` (if a draft complaint is purged, its metadata purges).
- `internal_notes`: `ON DELETE CASCADE` from `complaints`.
