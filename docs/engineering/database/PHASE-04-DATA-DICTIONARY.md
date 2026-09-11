# Phase 04 — Authoritative Data Dictionary

**Project**: Campus Plus — Campus Complaint & Grievance Resolution System  
**Phase**: Phase 04 — Database Engineering & Migration Design  
**Date**: 2026-09-10  
**Status**: Formal Data Dictionary Approved  

---

## 1. Sensitivity Classification Standard
- **Tier 1 (Public)**: Non-sensitive institutional master metadata (departments, categories, locations).
- **Tier 2 (Internal)**: Operational workflow data (SLA thresholds, notifications, system queues).
- **Tier 3 (Confidential)**: Student grievance submissions, assignment logs, resolution notes, audit records.
- **Tier 4 (Restricted)**: User credentials, student identifiers (Roll/PRN), phone numbers, private evidence attachments.

---

## 2. Table Specifications

### 2.1 `departments`
| Column | Type | Nullable | Default | Constraint | Meaning | Sensitivity |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | NO | `gen_random_uuid()` | PK | Internal unique identifier | Tier 1 |
| `code` | `VARCHAR(32)` | NO | - | UNIQUE, CHECK format | Canonical code (e.g. `DEPT-IT`) | Tier 1 |
| `name` | `VARCHAR(120)`| NO | - | - | Full department title | Tier 1 |
| `description` | `TEXT` | YES | NULL | - | Functional scope of department | Tier 1 |
| `contact_email`| `VARCHAR(255)`| YES | NULL | - | Official departmental contact | Tier 1 |
| `is_active` | `BOOLEAN` | NO | `TRUE` | - | Soft-delete status flag | Tier 1 |
| `created_at` | `TIMESTAMPTZ` | NO | `CURRENT_TIMESTAMP` | - | Creation timestamp | Tier 1 |
| `updated_at` | `TIMESTAMPTZ` | NO | `CURRENT_TIMESTAMP` | - | Last modification timestamp | Tier 1 |

*Retention*: Permanent institutional master data. Soft deletion only (`is_active = FALSE`).

---

### 2.2 `categories`
| Column | Type | Nullable | Default | Constraint | Meaning | Sensitivity |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | NO | `gen_random_uuid()` | PK | Internal category ID | Tier 1 |
| `name` | `VARCHAR(100)`| NO | - | UNIQUE | Category name (e.g. Academic) | Tier 1 |
| `description` | `TEXT` | YES | NULL | - | Category definition | Tier 1 |
| `default_department_id` | `UUID` | NO | - | FK -> `departments(id)` | Default routing destination | Tier 1 |
| `requires_resolution_proof`| `BOOLEAN`| NO | `FALSE` | - | Flag mandating photo proof | Tier 1 |
| `is_active` | `BOOLEAN` | NO | `TRUE` | - | Soft-delete status | Tier 1 |
| `created_at` | `TIMESTAMPTZ` | NO | `CURRENT_TIMESTAMP` | - | Creation timestamp | Tier 1 |
| `updated_at` | `TIMESTAMPTZ` | NO | `CURRENT_TIMESTAMP` | - | Modification timestamp | Tier 1 |

*Retention*: Permanent reference data.

---

### 2.3 `users`
| Column | Type | Nullable | Default | Constraint | Meaning | Sensitivity |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | NO | `gen_random_uuid()` | PK | Internal user identifier | Tier 3 |
| `email` | `VARCHAR(255)`| NO | - | UNIQUE, CHECK email | Institutional email address | Tier 3 |
| `full_name` | `VARCHAR(150)`| NO | - | - | User display name | Tier 3 |
| `phone_number` | `VARCHAR(30)` | YES | NULL | - | Contact phone | Tier 4 |
| `roll_or_prn` | `VARCHAR(50)` | YES | NULL | - | Student registration number | Tier 4 |
| `is_active` | `BOOLEAN` | NO | `TRUE` | - | Account active status | Tier 2 |
| `created_at` | `TIMESTAMPTZ` | NO | `CURRENT_TIMESTAMP` | - | Registration timestamp | Tier 2 |
| `updated_at` | `TIMESTAMPTZ` | NO | `CURRENT_TIMESTAMP` | - | Modification timestamp | Tier 2 |

*Retention*: Retained during active affiliation; soft-deactivated on graduation/departure (`is_active = FALSE`).

---

### 2.4 `complaints`
| Column | Type | Nullable | Default | Constraint | Meaning | Sensitivity |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | NO | `gen_random_uuid()` | PK | Internal primary key | Tier 3 |
| `ref_id` | `VARCHAR(32)` | NO | - | UNIQUE | Public tracking code (`CP-YYYY-XXXXX`) | Tier 2 |
| `title` | `VARCHAR(120)`| NO | - | CHECK len [10, 120] | Concise grievance summary | Tier 3 |
| `description` | `TEXT` | NO | - | CHECK len >= 30 | Detailed grievance body | Tier 3 |
| `complainant_id`| `UUID` | NO | - | FK -> `users(id)` | Author student identity | Tier 3 |
| `department_id` | `UUID` | NO | - | FK -> `departments(id)`| Currently owning department | Tier 2 |
| `category_id` | `UUID` | NO | - | FK -> `categories(id)` | Assigned classification | Tier 2 |
| `location_id` | `UUID` | YES | NULL | FK -> `locations(id)` | Structured campus location | Tier 2 |
| `location_details`| `VARCHAR(255)`| NO | - | - | Specific room / benchmark details| Tier 3 |
| `status` | `ENUM` | NO | `'SUBMITTED'`| `complaint_status_enum` | Current lifecycle state | Tier 2 |
| `suggested_priority`| `ENUM` | NO | `'MEDIUM'` | `complaint_priority_enum`| Student-selected urgency | Tier 2 |
| `official_priority` | `ENUM` | NO | `'MEDIUM'` | `complaint_priority_enum`| Triage-confirmed priority | Tier 2 |
| `assigned_handler_id`| `UUID`| YES | NULL | FK -> `users(id)` | Current active handler pointer | Tier 2 |
| `escalation_tier` | `ENUM` | NO | `'TIER_1_HANDLER'`| `escalation_tier_enum`| Active escalation level | Tier 2 |
| `is_escalated` | `BOOLEAN` | NO | `FALSE` | - | Active escalation flag | Tier 2 |
| `version` | `INTEGER` | NO | `1` | CHECK >= 1 | Optimistic concurrency version | Tier 2 |
| `sla_due_at` | `TIMESTAMPTZ` | YES | NULL | - | SLA resolution deadline | Tier 2 |
| `resolved_at` | `TIMESTAMPTZ` | YES | NULL | - | Timestamp of resolution | Tier 2 |
| `closed_at` | `TIMESTAMPTZ` | YES | NULL | - | Timestamp of final closure | Tier 2 |
| `created_at` | `TIMESTAMPTZ` | NO | `CURRENT_TIMESTAMP` | - | Submission timestamp | Tier 2 |
| `updated_at` | `TIMESTAMPTZ` | NO | `CURRENT_TIMESTAMP` | - | Modification timestamp | Tier 2 |

*Retention*: Minimum 4 academic years (`NFR-010`). Permanent institutional archive.

---

### 2.5 `complaint_assignments`
| Column | Type | Nullable | Default | Constraint | Meaning | Sensitivity |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | NO | `gen_random_uuid()` | PK | Assignment event ID | Tier 3 |
| `complaint_id` | `UUID` | NO | - | FK -> `complaints(id)` | Target grievance | Tier 3 |
| `handler_id` | `UUID` | NO | - | FK -> `users(id)` | Assigned staff handler | Tier 3 |
| `assigned_by_id`| `UUID` | NO | - | FK -> `users(id)` | Department head / delegator | Tier 3 |
| `assigned_at` | `TIMESTAMPTZ` | NO | `CURRENT_TIMESTAMP` | - | Start of assignment | Tier 2 |
| `unassigned_at` | `TIMESTAMPTZ` | YES | NULL | - | End of assignment (if reassigned)| Tier 2 |
| `is_current` | `BOOLEAN` | NO | `TRUE` | - | Active handler flag | Tier 2 |
| `reason` | `TEXT` | YES | NULL | - | Reassignment justification | Tier 3 |

*Retention*: Permanent historical audit trail.

---

### 2.6 `complaint_forwards`
| Column | Type | Nullable | Default | Constraint | Meaning | Sensitivity |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | NO | `gen_random_uuid()` | PK | Forwarding event ID | Tier 3 |
| `complaint_id` | `UUID` | NO | - | FK -> `complaints(id)` | Target grievance | Tier 3 |
| `from_department_id` | `UUID` | NO | - | FK -> `departments(id)` | Origin department | Tier 2 |
| `to_department_id` | `UUID` | NO | - | FK -> `departments(id)` | Destination department | Tier 2 |
| `forwarded_by_id` | `UUID` | NO | - | FK -> `users(id)` | Transferring actor | Tier 3 |
| `forward_sequence` | `INTEGER` | NO | `1` | - | Transfer hop count (anti-deadlock) | Tier 2 |
| `rationale` | `TEXT` | NO | - | CHECK len >= 10 | Reason for department transfer | Tier 3 |
| `forwarded_at` | `TIMESTAMPTZ` | NO | `CURRENT_TIMESTAMP` | - | Transfer timestamp | Tier 2 |

*Constraints*: `CHECK (from_department_id <> to_department_id)`.  
*Anti-Deadlock Invariant*: If `forward_sequence >= 3`, trigger automatic escalation (`EDGE-004`).

---

### 2.7 `resolutions`
| Column | Type | Nullable | Default | Constraint | Meaning | Sensitivity |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | NO | `gen_random_uuid()` | PK | Resolution record ID | Tier 3 |
| `complaint_id` | `UUID` | NO | - | UNIQUE FK -> `complaints` | 1-to-1 grievance reference | Tier 3 |
| `resolved_by_id` | `UUID` | NO | - | FK -> `users(id)` | Resolving handler identity | Tier 3 |
| `resolution_summary` | `TEXT` | NO | - | CHECK len >= 20 | Mandatory resolution details | Tier 3 |
| `resolved_at` | `TIMESTAMPTZ` | NO | `CURRENT_TIMESTAMP` | - | Resolution timestamp | Tier 2 |
| `student_verified` | `BOOLEAN` | YES | NULL | - | Student confirmation status | Tier 2 |
| `verification_feedback` | `TEXT` | YES | NULL | - | Optional student review | Tier 3 |
| `dispute_reason` | `TEXT` | YES | NULL | - | Reopening justification if disputed | Tier 3 |
| `disputed_at` | `TIMESTAMPTZ` | YES | NULL | - | Dispute timestamp | Tier 2 |

---

### 2.8 `attachments`
| Column | Type | Nullable | Default | Constraint | Meaning | Sensitivity |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | NO | `gen_random_uuid()` | PK | Attachment metadata ID | Tier 4 |
| `complaint_id` | `UUID` | NO | - | FK -> `complaints(id)` | Associated grievance | Tier 3 |
| `storage_key` | `VARCHAR(500)`| NO | - | UNIQUE | Private object storage key | Tier 4 |
| `original_filename` | `VARCHAR(255)`| NO | - | - | Cleaned file display name | Tier 3 |
| `mime_type` | `VARCHAR(100)`| NO | - | CHECK MIME whitelist | Whitelisted file format | Tier 3 |
| `file_size_bytes` | `INTEGER` | NO | - | CHECK <= 5,242,880 | File size in bytes (max 5 MB) | Tier 3 |
| `attachment_type` | `ENUM` | NO | `'INITIAL_EVIDENCE'`| `attachment_type_enum` | Evidence vs Proof | Tier 3 |
| `uploaded_by_id` | `UUID` | NO | - | FK -> `users(id)` | Uploader identity | Tier 3 |
| `created_at` | `TIMESTAMPTZ` | NO | `CURRENT_TIMESTAMP` | - | Upload timestamp | Tier 2 |

*MIME Whitelist*: `'image/jpeg'`, `'image/png'`, `'application/pdf'`.

---

### 2.9 `internal_notes`
| Column | Type | Nullable | Default | Constraint | Meaning | Sensitivity |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | NO | `gen_random_uuid()` | PK | Internal note ID | Tier 3 |
| `complaint_id` | `UUID` | NO | - | FK -> `complaints(id)` | Grievance context | Tier 3 |
| `author_id` | `UUID` | NO | - | FK -> `users(id)` | Staff member author | Tier 3 |
| `author_role` | `VARCHAR(50)` | NO | - | - | Staff role snapshot | Tier 2 |
| `note` | `TEXT` | NO | - | CHECK len >= 5 | Private staff remarks | Tier 3 |
| `created_at` | `TIMESTAMPTZ` | NO | `CURRENT_TIMESTAMP` | - | Creation timestamp | Tier 2 |

*Security Boundary*: Completely excluded from student visibility via RLS.

---

### 2.10 `action_history` (Append-Only Audit Journal)
| Column | Type | Nullable | Default | Constraint | Meaning | Sensitivity |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `UUID` | NO | `gen_random_uuid()` | PK | Audit record ID | Tier 3 |
| `complaint_id` | `UUID` | NO | - | FK -> `complaints(id)` | Grievance aggregate | Tier 3 |
| `actor_id` | `UUID` | YES | NULL | FK -> `users(id)` | Acting identity (NULL for system)| Tier 3 |
| `actor_role` | `VARCHAR(50)` | NO | - | - | Role context of actor | Tier 2 |
| `action_type` | `VARCHAR(50)` | NO | - | - | Action (e.g. ASSIGN, FORWARD) | Tier 2 |
| `from_status` | `VARCHAR(50)` | YES | NULL | - | Prior status state | Tier 2 |
| `to_status` | `VARCHAR(50)` | YES | NULL | - | Resulting status state | Tier 2 |
| `remarks` | `TEXT` | YES | NULL | - | Public timeline explanation | Tier 3 |
| `metadata` | `JSONB` | YES | NULL | - | Structured diff / context payload| Tier 3 |
| `created_at` | `TIMESTAMPTZ` | NO | `CURRENT_TIMESTAMP` | - | Tamper-proof audit timestamp | Tier 2 |

*Immutability*: Database trigger strictly blocks all `UPDATE` and `DELETE` operations.
