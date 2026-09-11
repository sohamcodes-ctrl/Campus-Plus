# PHASE 07-B: Live Database Reality & Object Verification

**System:** Campus Plus — Campus Complaint & Grievance Resolution System  
**Phase:** 07-B — Live Supabase Integration & Infrastructure Verification  
**Evaluation Date:** September 11, 2026  
**Status:** **AUTHORITATIVE SCHEMA REALITY VERIFIED (10 Migrations)**  

---

## 1. Verified Object Count Summary

| Object Category | Total Expected | Total Verified | Verification Mechanism | Status |
| :--- | :---: | :---: | :--- | :--- |
| **Database Tables** | 22 | 22 | `information_schema.tables` query | **VERIFIED** |
| **Custom Enums** | 5 | 5 | `pg_type` catalog query | **VERIFIED** |
| **Database Functions** | 4 | 4 | `pg_proc` catalog query | **VERIFIED** |
| **Database Triggers** | 1 | 1 | `information_schema.triggers` query | **VERIFIED** |
| **Analytical Views** | 2 | 2 | `information_schema.views` query | **VERIFIED** |
| **Explicit Indexes** | 11 | 11 | `pg_indexes` catalog query | **VERIFIED** |
| **Row Level Security Policies**| 13 | 13 | `pg_policies` catalog query | **VERIFIED** |
| **Database Sequences** | 1 | 1 | `pg_sequences` (`tracking_code_seq`) | **VERIFIED** |
| **Schema Migrations Applied** | 10 | 10 | `_schema_migrations` query | **VERIFIED** |

---

## 2. Table-by-Table Inventory & Verification Evidence

| # | Table Name | Migration | Primary Key | Critical Invariants / Constraints | Forced RLS |
| :--- | :--- | :--- | :--- | :--- | :---: |
| 1 | `_schema_migrations` | `00001` | `version` (VARCHAR) | Checksum integrity verification | NO (System) |
| 2 | `departments` | `00002` | `id` (UUID) | `code UNIQUE`, format regex `^[A-Z0-9_-]+$` | NO |
| 3 | `categories` | `00002` | `id` (UUID) | `name UNIQUE`, `requires_resolution_proof` | NO |
| 4 | `locations` | `00002` | `id` (UUID) | Composite UNIQUE `(campus, building, block, floor, room)` | NO |
| 5 | `working_calendars` | `00002` | `id` (UUID) | `name UNIQUE`, `work_days_bitmask` | NO |
| 6 | `calendar_holidays` | `00002` | `id` (UUID) | Composite UNIQUE `(calendar_id, holiday_date)` | NO |
| 7 | `roles` | `00003` | `id` (VARCHAR) | Canonical roles (`ROLE_STUDENT`, `ROLE_HANDLER`, etc.) | NO |
| 8 | `users` | `00003` | `id` (UUID) | `email UNIQUE`, RFC 5322 regex check | NO |
| 9 | `user_roles` | `00003` | `(user_id, role_id)` | Junction table supporting multi-role assignment | **YES** |
| 10 | `department_memberships`| `00003` | `id` (UUID) | Composite UNIQUE `(user_id, department_id, is_active)` | NO |
| 11 | `complaints` | `00004` | `id` (UUID) | `ref_id UNIQUE`, `title >= 10`, `desc >= 30`, `version >= 1` | **YES** (6 policies) |
| 12 | `complaint_assignments` | `00004` | `id` (UUID) | FKs to `complaints(id)` and `users(id)` | NO |
| 13 | `complaint_forwards` | `00004` | `id` (UUID) | `from_dept <> to_dept`, `rationale >= 10 chars` | NO |
| 14 | `complaint_escalations` | `00004` | `id` (UUID) | Tier transition check | NO |
| 15 | `resolutions` | `00004` | `id` (UUID) | 1-to-1 with complaint, `summary >= 20 chars` | NO |
| 16 | `attachments` | `00005` | `id` (UUID) | `size <= 5MB`, MIME whitelist (JPEG, PNG, PDF) | **YES** (2 policies) |
| 17 | `internal_notes` | `00005` | `id` (UUID) | Strictly staff-only, `length(note) >= 5 chars` | **YES** (2 policies) |
| 18 | `sla_policies` | `00005` | `id` (UUID) | Composite UNIQUE `(category_id, priority)`, `hours > 0` | NO |
| 19 | `notifications` | `00005` | `id` (UUID) | FKs to `recipient_id`, read tracking | **YES** (2 policies) |
| 20 | `action_history` | `00006` | `id` (UUID) | Protected by immutability trigger | **YES** (1 policy) |
| 21 | `outbox_events` | `00006` | `id` (UUID) | Status enum (`PENDING`, etc.), payload JSONB | NO |
| 22 | `idempotency_keys` | `00006` | `key` (VARCHAR) | `request_hash VARCHAR(64)`, `expires_at` | NO |

---

## 3. Database Functions, Triggers, Views & Sequences

### 3.1 Custom Enumerations (5 Types)
- `complaint_status_enum`: `DRAFT`, `SUBMITTED`, `REVIEWED`, `ASSIGNED`, `IN_PROGRESS`, `FORWARDED`, `ESCALATED`, `RESOLVED`, `CLOSED`, `REOPENED`, `REJECTED`, `DUPLICATE`, `CANCELLED`
- `complaint_priority_enum`: `LOW`, `MEDIUM`, `HIGH`, `URGENT`
- `escalation_tier_enum`: `TIER_1_HANDLER`, `TIER_2_DEPARTMENT_HEAD`, `TIER_3_MANAGEMENT`
- `attachment_type_enum`: `INITIAL_EVIDENCE`, `RESOLUTION_PROOF`
- `outbox_status_enum`: `PENDING`, `PROCESSING`, `PUBLISHED`, `FAILED`

### 3.2 Stored Functions (4 Functions)
1. `trg_enforce_action_history_immutable()`: Throws SQLSTATE `55000` on any attempt to `UPDATE` or `DELETE` rows in `action_history`.
2. `auth.uid()`: Extracts caller UUID from `request.jwt.claim.sub` (Supabase JWT claim) with fallback to `app.current_user_id` setting.
3. `auth_has_role(required_role VARCHAR)`: Returns boolean indicating whether current `auth.uid()` possesses the specified role in `user_roles`.
4. `auth_user_department_id()`: Returns primary active `department_id` for current `auth.uid()` from `department_memberships`.

### 3.3 Database Triggers (1 Trigger)
- `trg_action_history_no_mutation`: Attached `BEFORE UPDATE OR DELETE ON action_history FOR EACH ROW EXECUTE FUNCTION trg_enforce_action_history_immutable()`.

### 3.4 Analytical Views (2 Views)
1. `recurring_complaint_clusters`: Aggregates active incidents by department, category, and normalized location where incident count $\ge 3$ within the past 30 days.
2. `department_sla_performance`: Summarizes complaint counts, resolved counts, overdue complaints, and escalation counts per department.

### 3.5 Database Sequences (1 Sequence)
- `tracking_code_seq`: Created formally via `migrations/00010_tracking_code_sequence.sql`. Generates monotonic sequence numbers for `CP-YYYY-NNNNN` reference IDs. Zero runtime DDL required.
