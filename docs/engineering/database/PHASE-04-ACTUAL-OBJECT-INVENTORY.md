# Phase 04 — Authoritative PostgreSQL Database Object Inventory

**Project**: Campus Plus — Campus Complaint & Grievance Resolution System  
**Phase**: Phase 04 Post-Gate Forensic Reconciliation  
**Engine**: PostgreSQL 18.3 (via `@electric-sql/pglite` v0.5.8)  
**Migration Scope**: `migrations/00001_initial_types_and_extensions.sql` through `migrations/00009_analytical_views.sql`  
**Date of Audit**: 2026-09-10  
**Verification Method**: Automated information schema & system catalog reflection query (`information_schema.tables`, `pg_class`, `pg_type`, `pg_proc`, `pg_trigger`, `pg_policy`, `pg_indexes`, `pg_constraint`)

---

## 1. Executive Catalog Summary

| Object Type | Catalog Count | Verification Details |
| :--- | :---: | :--- |
| **Physical Base Tables (`BASE TABLE`)** | **22** | 21 domain/system tables in `public` + 1 migration ledger `_schema_migrations` |
| **Analytical Views (`VIEW`)** | **2** | `recurring_complaint_clusters`, `department_sla_performance` in `public` |
| **Total Relations (Tables + Views)** | **24** | Authoritative relational surfaces in PostgreSQL engine |
| **Enumerated Data Types (`ENUM`)** | **5** | All defined in `public` schema with explicit valid literals |
| **Custom Database Functions (`FUNCTION`)** | **4** | 1 shim in `auth`, 2 security helpers in `public`, 1 trigger function in `public` |
| **Database Triggers (`TRIGGER`)** | **2** | `BEFORE UPDATE` and `BEFORE DELETE` immutability triggers on `action_history` |
| **Row-Level Security Policies (`POLICY`)** | **13** | Defined across 5 core sensitive domain tables in `public` |
| **Physical Indexes (`pg_indexes`)** | **45** | 22 Primary Key B-trees + 11 Unique constraint B-trees + 12 explicit non-PK performance B-trees |
| **Database Constraints (`pg_constraint`)** | **216** | Foreign keys, checks, primary keys, and unique invariants across all 22 base tables |
| **Database Schemas (`NAMESPACE`)** | **2** | `public` (domain and system entities) and `auth` (identity shim namespace) |

---

## 2. Enumerated Data Types (`ENUM`)

All 5 ENUM types are defined in migration `00001_initial_types_and_extensions.sql`:

```sql
1. complaint_status_enum (13 values):
   'DRAFT', 'SUBMITTED', 'REVIEWED', 'ASSIGNED', 'IN_PROGRESS', 
   'FORWARDED', 'ESCALATED', 'RESOLVED', 'CLOSED', 'REOPENED', 
   'REJECTED', 'DUPLICATE', 'CANCELLED'

2. complaint_priority_enum (4 values):
   'LOW', 'MEDIUM', 'HIGH', 'URGENT'

3. escalation_tier_enum (3 values):
   'TIER_1_HANDLER', 'TIER_2_DEPARTMENT_HEAD', 'TIER_3_MANAGEMENT'

4. attachment_type_enum (2 values):
   'INITIAL_EVIDENCE', 'RESOLUTION_PROOF'

5. outbox_status_enum (4 values):
   'PENDING', 'PROCESSING', 'PUBLISHED', 'FAILED'
```

---

## 3. Physical Base Tables (22 Total)

The schema contains exactly **22 physical base tables**: **21 domain and institutional tables** plus **1 migration tracking ledger table** (`_schema_migrations`).

### 3.1 Migration Tracking Table (1)
1. **`_schema_migrations`**:
   - Primary Key: `version INTEGER PRIMARY KEY`
   - Columns: `name VARCHAR(255) NOT NULL`, `applied_at TIMESTAMPTZ NOT NULL`, `checksum VARCHAR(64) NOT NULL`
   - Purpose: Deterministic schema version tracking and SHA-256 drift detection.

### 3.2 Master Institutional & Identity Tables (9)
2. **`departments`**:
   - Master institutional departments, academic wings, and administrative service units.
   - Primary Key: `id UUID`
   - Natural Key: `code VARCHAR(32) UNIQUE` (Regex: `^[A-Z0-9_-]+$`)
3. **`categories`**:
   - Complaint classification taxonomy linked to default owning department.
   - Primary Key: `id UUID`
   - Unique: `name VARCHAR(100) UNIQUE`
   - Attributes: `default_department_id UUID FK`, `requires_resolution_proof BOOLEAN`
4. **`locations`**:
   - Controlled physical campus locations for recurring cluster aggregation.
   - Primary Key: `id UUID`
   - Unique: `(campus, building, block, floor, room_or_area)`
5. **`working_calendars`**:
   - Institutional operating calendars defining working hours and operational day bitmasks.
   - Primary Key: `id UUID`
   - Unique: `name VARCHAR(100) UNIQUE`
6. **`calendar_holidays`**:
   - Academic and institutional holidays excluded from SLA calculation.
   - Primary Key: `id UUID`
   - Unique: `(calendar_id, holiday_date)`
7. **`roles`**:
   - System RBAC role definitions (`ROLE_STUDENT`, `ROLE_FACULTY`, `ROLE_HANDLER`, `ROLE_DEPT_HEAD`, `ROLE_MANAGEMENT`, `ROLE_ADMIN`).
   - Primary Key: `id VARCHAR(50)`
8. **`users`**:
   - Institutional user identities (students, faculty, staff, administrators).
   - Primary Key: `id UUID`
   - Unique: `email VARCHAR(255) UNIQUE` (RFC 5322 regex validation)
9. **`user_roles`**:
   - Association table decoupling user identity from role assignments (supports multi-role).
   - Primary Key: `(user_id, role_id)`
10. **`department_memberships`**:
    - Staff and handler departmental affiliation tracking active tenure and department head status.
    - Primary Key: `id UUID`
    - Invariant: `uk_active_department_membership UNIQUE (user_id, department_id, is_active)`

### 3.3 Complaint Aggregate & Workflow Tables (5)
11. **`complaints`**:
    - Primary complaint aggregate root.
    - Primary Key: `id UUID`
    - Natural Key: `ref_id VARCHAR(32) UNIQUE` (`CP-YYYY-XXXXX`)
    - Invariants: `title` length [10, 120], `description` length $\ge 30$, `version >= 1` (OCC).
12. **`complaint_assignments`**:
    - Historical handler assignment ledger preserving assignment tenure and assigning actor.
    - Primary Key: `id UUID`
    - Foreign Keys: `complaint_id FK`, `handler_id FK`, `assigned_by_id FK`
13. **`complaint_forwards`**:
    - Sequential inter-departmental transfer history.
    - Primary Key: `id UUID`
    - Invariants: `from_department_id <> to_department_id`, rationale length $\ge 10$, `forward_sequence >= 1`.
14. **`complaint_escalations`**:
    - Operational escalation progression (Tier 1 $\to$ 2 $\to$ 3).
    - Primary Key: `id UUID`
    - Attributes: `from_tier`, `to_tier`, `escalated_by_id` (NULL for automated SLA triggers), `is_automated`.
15. **`resolutions`**:
    - Formal complaint resolution records (1-to-1 with complaints).
    - Primary Key: `id UUID`
    - Unique: `complaint_id UUID UNIQUE`
    - Invariants: `resolution_summary` length $\ge 20$.

### 3.4 Evidence, Security & Audit Tables (4)
16. **`attachments`**:
    - Object storage metadata and integrity boundaries.
    - Primary Key: `id UUID`
    - Unique: `storage_key VARCHAR(500) UNIQUE`
    - Invariants: `file_size_bytes` $\le 5,242,880$ (5 MB limit), `mime_type IN ('image/jpeg', 'image/png', 'application/pdf')`.
17. **`internal_notes`**:
    - Private internal staff remarks completely isolated from student-visible timeline.
    - Primary Key: `id UUID`
    - Invariant: `char_length(note) >= 5`
18. **`action_history`**:
    - Append-only audit journal protected by kernel triggers blocking UPDATE/DELETE.
    - Primary Key: `id UUID`
    - Attributes: `actor_id`, `actor_role`, `action_type`, `from_status`, `to_status`, `metadata JSONB`.
19. **`sla_policies`**:
    - Priority- and category-specific SLA thresholds with provisional default hours.
    - Primary Key: `id UUID`
    - Unique: `(category_id, priority)`
    - Invariants: `response_threshold_hours > 0`, `resolution_threshold_hours >= response_threshold_hours`.

### 3.5 Infrastructure & Communications Tables (3)
20. **`notifications`**:
    - In-app user inbox alerts with read receipts and deep links.
    - Primary Key: `id UUID`
    - Attributes: `recipient_id FK`, `complaint_id FK`, `is_read`, `read_at`.
21. **`outbox_events`**:
    - Transactional outbox table ensuring at-least-once domain event dispatch.
    - Primary Key: `id UUID`
    - Attributes: `event_type`, `aggregate_type`, `aggregate_id`, `payload JSONB`, `status outbox_status_enum`, `retry_count`.
22. **`idempotency_keys`**:
    - API idempotency token registry preventing duplicate complaint submissions on network retry.
    - Primary Key: `key VARCHAR(255)`
    - Attributes: `request_hash`, `response_code`, `response_body JSONB`, `expires_at`.

---

## 4. Analytical Views (2 Total)

Both views are defined in migration `00009_analytical_views.sql`:

1. **`recurring_complaint_clusters`**:
   - Computes rolling 30-day complaint clusters grouped by `department_id`, `category_id`, and `location_id`.
   - Filters only clusters with $\ge 3$ complaints (`HAVING COUNT(c.id) >= 3`) to power hotspot detection.
2. **`department_sla_performance`**:
   - Computes departmental resolution metrics: total resolved, on-time resolutions, SLA breaches, and percentage compliance.

---

## 5. Stored Functions (4 Total)

| Schema | Function Name | Arguments | Return Type | Security Context |
| :--- | :--- | :--- | :--- | :--- |
| `auth` | `uid()` | *(none)* | `UUID` | STABLE (reads JWT claim `request.jwt.claim.sub` or session variable `app.current_user_id`) |
| `public` | `auth_has_role(required_role)` | `required_role VARCHAR` | `BOOLEAN` | `SECURITY DEFINER` (checks `user_roles` for `auth.uid()`) |
| `public` | `auth_user_department_id()` | *(none)* | `UUID` | `SECURITY DEFINER` (checks active `department_memberships` for `auth.uid()`) |
| `public` | `trg_enforce_action_history_immutable()` | *(none)* | `trigger` | `VOLATILE` (raises SQLSTATE `55000` on any UPDATE or DELETE) |

---

## 6. Database Triggers (2 Total)

Defined on `action_history` in migration `00006_audit_and_outbox_tables.sql`:

| Table | Trigger Name | Timing | Event | Function Called |
| :--- | :--- | :--- | :--- | :--- |
| `action_history` | `trg_action_history_no_mutation` | `BEFORE` | `UPDATE` | `trg_enforce_action_history_immutable()` |
| `action_history` | `trg_action_history_no_mutation` | `BEFORE` | `DELETE` | `trg_enforce_action_history_immutable()` |

*Note*: PostgreSQL catalog groups these as 2 event manipulations under the single trigger definition `trg_action_history_no_mutation`.

---

## 7. Row-Level Security Policies (13 Total)

Defined in migration `00008_row_level_security_policies.sql`:

| Table Name | Policy Name | Command | Target Role | Enforcement / Using / With Check |
| :--- | :--- | :---: | :---: | :--- |
| `complaints` | `p_complaints_student_select` | `SELECT` | `PUBLIC` | `complainant_id = auth.uid()` |
| `complaints` | `p_complaints_dept_staff_select` | `SELECT` | `PUBLIC` | `department_id = auth_user_department_id() AND (auth_has_role('ROLE_HANDLER') OR auth_has_role('ROLE_DEPT_HEAD'))` |
| `complaints` | `p_complaints_management_select` | `SELECT` | `PUBLIC` | `auth_has_role('ROLE_MANAGEMENT') OR auth_has_role('ROLE_ADMIN')` |
| `complaints` | `p_complaints_student_insert` | `INSERT` | `PUBLIC` | `complainant_id = auth.uid() AND status = 'SUBMITTED'` |
| `complaints` | `p_complaints_handler_update` | `UPDATE` | `PUBLIC` | `department_id = auth_user_department_id() AND assigned_handler_id = auth.uid() AND auth_has_role('ROLE_HANDLER')` |
| `complaints` | `p_complaints_dept_head_update` | `UPDATE` | `PUBLIC` | `department_id = auth_user_department_id() AND auth_has_role('ROLE_DEPT_HEAD')` |
| `internal_notes` | `p_internal_notes_staff_select` | `SELECT` | `PUBLIC` | Department staff match OR Management/Admin (Students have ZERO read access) |
| `internal_notes` | `p_internal_notes_staff_insert` | `INSERT` | `PUBLIC` | `author_id = auth.uid() AND (Handler/DeptHead/Management/Admin)` |
| `attachments` | `p_attachments_select` | `SELECT` | `PUBLIC` | Complainant OR Dept Staff OR Management/Admin |
| `attachments` | `p_attachments_insert` | `INSERT` | `PUBLIC` | `uploaded_by_id = auth.uid()` |
| `notifications` | `p_notifications_select` | `SELECT` | `PUBLIC` | `recipient_id = auth.uid()` |
| `notifications` | `p_notifications_update` | `UPDATE` | `PUBLIC` | `recipient_id = auth.uid()` |
| `action_history` | `p_action_history_select` | `SELECT` | `PUBLIC` | Read-only for Complainant, Dept Staff, and Management |

---

## 8. Physical Indexes (45 Total)

In PostgreSQL, every PRIMARY KEY and UNIQUE constraint automatically constructs an underlying B-tree index. The 45 total indexes in `pg_indexes` comprise:
- **22 Primary Key Indexes** (one per base table).
- **11 Unique Constraint Indexes** (e.g. `users_email_key`, `departments_code_key`, `locations_unique_spot`, `resolutions_complaint_id_key`, `attachments_storage_key_key`, etc.).
- **12 Explicit Non-PK Performance Indexes** created in `00007_indexes_and_performance.sql`:
  1. `idx_complaints_complainant` (`complaints (complainant_id, created_at DESC)`)
  2. `idx_complaints_dept_status` (`complaints (department_id, status, created_at DESC)`)
  3. `idx_complaints_handler_status` (`complaints (assigned_handler_id, status)`)
  4. `idx_complaints_sla_active` (`complaints (sla_due_at) WHERE status NOT IN ('RESOLVED', 'CLOSED', 'REJECTED', 'DUPLICATE', 'CANCELLED')`)
  5. `idx_complaints_hotspot` (`complaints (department_id, category_id, location_id, created_at)`)
  6. `idx_assignments_complaint` (`complaint_assignments (complaint_id, is_current)`)
  7. `idx_forwards_complaint` (`complaint_forwards (complaint_id, forward_sequence)`)
  8. `idx_escalations_complaint` (`complaint_escalations (complaint_id, escalated_at DESC)`)
  9. `idx_attachments_complaint` (`attachments (complaint_id)`)
  10. `idx_internal_notes_complaint` (`internal_notes (complaint_id, created_at ASC)`)
  11. `idx_action_history_complaint` (`action_history (complaint_id, created_at ASC)`)
  12. `idx_outbox_pending` (`outbox_events (created_at ASC) WHERE status = 'PENDING'`)

Total Indexes: $22 + 11 + 12 = \mathbf{45}$.
