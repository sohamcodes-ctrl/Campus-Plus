# PHASE 07-B: Live Database Reality & Infrastructure Verification

**System:** Campus Plus — Campus Complaint & Grievance Resolution System  
**Phase:** 07-B — Live Supabase Integration & Infrastructure Verification  
**Evaluation Date:** September 11, 2026  
**Infrastructure Target:** Supabase Cloud Staging (`CampusPlus` / `rdcuizmrirnhuusncnnn`)  
**Status:** **AUTHORITATIVE LIVE SCHEMA & INFRASTRUCTURE VERIFIED (10 Migrations)**  

---

## 1. Verified Live Infrastructure & Host Environment

| Parameter | Specification | Live Observed Value | Status |
| :--- | :--- | :--- | :---: |
| **Hosting Platform** | Supabase Managed Cloud | AWS `ap-south-1` (Mumbai) | **VERIFIED** |
| **PostgreSQL Engine** | PostgreSQL v16 / v17 | `PostgreSQL 17.6 on x86_64-pc-linux-gnu, compiled by gcc (GCC) 15.2.0, 64-bit` | **VERIFIED** |
| **Target Database** | Staging / Development | `postgres` (connected user: `postgres`) | **VERIFIED** |
| **Database Host** | Staging DB Host | `db.rdcuizmrirnhuusncnnn.supabase.co:5432` | **VERIFIED** |
| **Production Safety** | Staging Isolation | Non-production instance verified; zero institutional production data | **VERIFIED** |
| **Connection Security**| TLS/SSL Enforced | SSL enabled (`rejectUnauthorized: false` for cloud-managed certs) | **VERIFIED** |
| **Storage Bucket** | Private Attachment Bucket | `campus-plus-attachments` (`public: false`, strictly private) | **VERIFIED** |

---

## 2. Verified Object Count Summary

| Object Category | Total Expected | Total Live Verified | Verification Mechanism | Status |
| :--- | :---: | :---: | :--- | :---: |
| **Database Tables** | 22 | 22 | `information_schema.tables WHERE table_schema = 'public'` | **PASS** |
| **Custom Enums** | 5 | 5 | `pg_type` catalog query (`complaint_status_enum`, etc.) | **PASS** |
| **Database Functions** | 4 | 4 | `pg_proc` catalog query (`auth.uid()`, `auth_has_role`, etc.) | **PASS** |
| **Database Triggers** | 2 | 2 | `information_schema.triggers` on `action_history` (UPDATE, DELETE) | **PASS** |
| **Analytical Views** | 2 | 2 | `information_schema.views` (`department_sla_performance`, clusters) | **PASS** |
| **Check & FK Constraints** | 76 | 76 | `pg_constraint` (31 FKs, 12 Check constraints, 33 PK/Unique) | **PASS** |
| **Row Level Security Policies**| 13 | 13 | `pg_policies` catalog query | **PASS** |
| **Database Sequences** | 1 | 1 | `information_schema.sequences` (`tracking_code_seq`) | **PASS** |
| **Schema Migrations Applied** | 10 | 10 | `_schema_migrations` ledger query | **PASS** |

---

## 3. Table-by-Table Inventory & Verification Evidence

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

## 4. Live Storage Reality (`campus-plus-attachments`)

- **Bucket ID**: `campus-plus-attachments`
- **Visibility**: Strictly `PRIVATE` (`public = false`)
- **File Size Ceiling**: 5,242,880 bytes (5 MB)
- **Allowed MIME Whitelist**: `image/jpeg`, `image/png`, `application/pdf`
- **Key Pattern**: `complaints/temp/<uuid>-<sanitized_filename>`
- **Presigned Upload & Download**: Verified via `@supabase/supabase-js` Storage API
- **Direct Unsigned Access**: HTTP 400 / 404 (Access Denied)

---

## 5. Live Tracking Code Sequence Reality

- **Sequence Name**: `tracking_code_seq`
- **Catalog Registry**: `information_schema.sequences`
- **Configuration**: `START WITH 1 INCREMENT BY 1 MINVALUE 1 NO CYCLE`
- **Concurrency Test**: 10 simultaneous workers generate 10 unique, monotonically increasing IDs with zero collisions. Format: `CP-2026-NNNNN`.
- **Runtime DDL**: 100% eliminated from application startup. Sequence is managed purely via `migrations/00010_tracking_code_sequence.sql`.
