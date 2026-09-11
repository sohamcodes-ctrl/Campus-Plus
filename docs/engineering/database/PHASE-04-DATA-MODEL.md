# Phase 04 — Relational Data Model & Normalization Specification

**Project**: Campus Plus — Campus Complaint & Grievance Resolution System  
**Phase**: Phase 04 — Database Engineering & Migration Design  
**Date**: 2026-09-10  
**Status**: Formal Relational Data Model Approved  

---

## 1. Relational Normalization Analysis (1NF, 2NF, 3NF)

The Campus Plus database schema has been engineered to achieve **Third Normal Form (3NF)** across all core transactional entities:

1. **First Normal Form (1NF)**:
   - All attributes are atomic (no repeating groups, no comma-separated arrays for categories, handlers, or roles).
   - Each table has a unique primary key (`id UUID PRIMARY KEY`).
2. **Second Normal Form (2NF)**:
   - Every non-key attribute is fully functionally dependent on the entire primary key. There are no partial key dependencies.
3. **Third Normal Form (3NF)**:
   - There are zero transitive functional dependencies ($X \to Y \to Z$). 
   - User roles are decoupled from `users` into `user_roles`.
   - Department memberships are isolated in `department_memberships`.
   - Category SLA defaults and owning departments reside in their respective normalized tables (`categories`, `sla_policies`).
   - Resolution summaries, dispute rationales, assignments, and escalations are stored in dedicated dependent entities rather than overloaded into the `complaints` table.

### Justified Denormalization Audit
- **`complaints.assigned_handler_id`**: Cached pointer to the currently active handler for ultra-fast query filtering on handler worklists (`FR-022`). The authoritative historical assignment record resides in `complaint_assignments`. Synchronized via transactional application service or database trigger.
- **`complaints.escalation_tier`**: Cached current tier (1, 2, or 3) on the aggregate root for fast dashboard indexing. Detailed event context resides in `complaint_escalations`.

---

## 2. Identifier Architecture & Public Tracking Isolation

### 2.1 Internal Primary Keys (`id UUID`)
- All relational tables utilize a 128-bit `UUID` as their internal primary key, generated via `gen_random_uuid()` (or UUIDv7 where timestamp ordering is preferred).
- **Security Rationale**: Eliminates auto-incrementing integer enumeration attacks (IDOR/BOLA). An attacker cannot determine system complaint volume or guess neighboring record IDs.
- **Index Performance**: B-tree indexes on UUID columns are compact and performant.

### 2.2 Public Tracking Reference (`ref_id VARCHAR(32)`)
- **Format**: `CP-YYYY-XXXXX` (e.g. `CP-2026-00042`).
- **Separation from PK**: The public reference number is strictly an external human-friendly identifier. It is NOT the relational primary key. Foreign keys between tables use the immutable internal `id UUID`.
- **Generation & Concurrency Safety**: Generated via an atomic PostgreSQL sequence scoped per calendar year (`complaint_ref_seq_2026`). Prevents race conditions or sequence collisions during high-concurrency complaint submissions.
- **Immutability**: Once assigned upon complaint submission, `ref_id` cannot be modified or re-used.

---

## 3. Relational Aggregate Hierarchy

```
[Institutional Reference Layer]
├── departments
├── categories (FK -> departments)
├── locations
└── working_calendars
    └── calendar_holidays (FK -> working_calendars)

[Identity & RBAC Layer]
├── users
├── roles
├── user_roles (FK -> users, FK -> roles)
└── department_memberships (FK -> users, FK -> departments)

[Core Complaint Aggregate]
├── complaints (FK -> users [complainant], FK -> departments, FK -> categories, FK -> locations)
│   ├── complaint_assignments (FK -> complaints, FK -> users [handler], FK -> users [assigner])
│   ├── complaint_forwards (FK -> complaints, FK -> departments [from], FK -> departments [to], FK -> users)
│   ├── complaint_escalations (FK -> complaints, FK -> users)
│   ├── resolutions (FK -> complaints, FK -> users [resolver])
│   ├── attachments (FK -> complaints, FK -> users [uploader])
│   └── internal_notes (FK -> complaints, FK -> users [author])

[Audit, Event & Reliability Layer]
├── action_history (FK -> complaints, FK -> users [actor])
├── notifications (FK -> users [recipient], FK -> complaints)
├── outbox_events (Aggregate ID, Payload, Status)
└── idempotency_keys (Token, Request Hash, Locked At)
```

---

## 4. State Machine Persistence Strategy

The complaint lifecycle state is persisted using a native PostgreSQL `ENUM` type:

```sql
CREATE TYPE complaint_status_enum AS ENUM (
    'DRAFT',
    'SUBMITTED',
    'REVIEWED',
    'ASSIGNED',
    'IN_PROGRESS',
    'FORWARDED',
    'ESCALATED',
    'RESOLVED',
    'CLOSED',
    'REOPENED',
    'REJECTED',
    'DUPLICATE',
    'CANCELLED'
);
```

### Rationale: PostgreSQL ENUM vs Lookup Table
- **Type Safety**: Invalid state strings are rejected at the database parser level.
- **Storage Efficiency**: Stored internally as a 4-byte OID, saving significant disk and buffer pool cache compared to strings.
- **Index Density**: B-tree indexes on ENUM columns are extremely compact.
- **FSM Invariants**: Transitions are validated through the domain service layer and audited in `action_history`.

---

## 5. Optimistic Concurrency Control (OCC)

To prevent lost updates when multiple handlers or department heads triage the same complaint simultaneously:
- The `complaints` table includes:
  ```sql
  version INTEGER NOT NULL DEFAULT 1
  ```
- All mutation queries must evaluate the version predicate:
  ```sql
  UPDATE complaints
  SET status = :new_status,
      version = version + 1,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = :complaint_id AND version = :expected_version;
  ```
- If the affected row count is 0, a concurrent update occurred. The application layer aborts the transaction and returns HTTP `409 Conflict` with a standardized `ConflictError`.
