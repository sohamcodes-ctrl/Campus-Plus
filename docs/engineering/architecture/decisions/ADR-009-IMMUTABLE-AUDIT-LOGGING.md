# ADR-009: Immutable Audit Logging & Action History Architecture

**Status**: Accepted  
**Date**: 2026-09-10  
**Context Phase**: Phase 02 — Architecture & Technical Design  
**Deciders**: Security Engineer, Lead Software Architect  
**Traceability**: Satisfies `FR-019`, `BR-019`, `BR-020`, `NFR-003`, `SEC-006`, `PRIV-002`  

---

## 1. Context & Problem Statement

Level 1 Source Synopsis mandates: *"The system also maintains a complete history of actions ... Audit/Action History"*.
Furthermore:
- `BR-019` dictates an append-only action history where records can never be updated, overwritten, or deleted by any user or administrator.
- `NFR-003` requires data immutability enforced at the storage engine level.
- `SEC-006` requires tamper-evident audit records capturing actor ID, timestamp, and state deltas.
- `BR-020` and `PRIV-002` require dual-level visibility partitioning (`PUBLIC` vs. `INTERNAL` remarks).

We must design an audit journal architecture that guarantees absolute immutability and transparent traceability.

---

## 2. Decision: Database-Enforced Append-Only Transaction Journal

We architect a dedicated **Audit Journal Table (`action_history`)** governed by database-level write-once rules and dual-level projection.

### 2.1 Action History Data Structure
```sql
-- Conceptual schema (Not deployed in Phase 02)
CREATE TABLE action_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID NOT NULL REFERENCES complaints(id),
    actor_id UUID NOT NULL REFERENCES users(id),
    actor_role VARCHAR(50) NOT NULL,
    action_type VARCHAR(50) NOT NULL, 
    -- 'SUBMITTED', 'ASSIGNED', 'REASSIGNED', 'FORWARDED', 'PROGRESS_UPDATE', 
    -- 'ESCALATED', 'RESOLVED', 'REOPENED', 'CLOSED', 'REJECTED', 'COMMENT_ADDED'
    from_status VARCHAR(50),
    to_status VARCHAR(50),
    from_department_id UUID REFERENCES departments(id),
    to_department_id UUID REFERENCES departments(id),
    from_handler_id UUID REFERENCES users(id),
    to_handler_id UUID REFERENCES users(id),
    remarks TEXT,
    visibility_level VARCHAR(20) NOT NULL DEFAULT 'PUBLIC', -- 'PUBLIC' | 'INTERNAL'
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);
```

### 2.2 Physical Immutability Invariant (`NFR-003`, `SEC-006`)
1. **REVOKE Permissions**:
   ```sql
   -- Conceptual permissions policy
   REVOKE UPDATE, DELETE, TRUNCATE ON action_history FROM authenticated, anon, service_role;
   GRANT INSERT, SELECT ON action_history TO authenticated, service_role;
   ```
2. **Database Trigger Guard**: A `BEFORE UPDATE OR DELETE` trigger on `action_history` raises an unhandled SQL exception if any client or process attempts to mutate an existing row.

### 2.3 Dual-Level Visibility Isolation (`BR-020`, `PRIV-002`)
- When a handler or department head logs a remark, they set `visibility_level`:
  - `PUBLIC`: Included in the complainant's tracking timeline.
  - `INTERNAL`: Operational deliberations, staff notes, and administrative instructions.
- The student API view query explicitly filters:
  `WHERE visibility_level = 'PUBLIC'`.
  PostgreSQL RLS policies reinforce this constraint at the database engine level.

---

## 3. Consequences

### Positive
- Guarantees forensic integrity: Even a compromised administrator account cannot erase disciplinary or complaint evidence from the database.
- Complete compliance with Level 1 Source requirements.
- Simplifies debugging and historical compliance reporting.

### Negative / Tradeoffs
- Audit table grows monotonically; requires standard partitioning (e.g. by academic year) at large institutional volumes (>100,000 complaints).

---

## 4. Phase Isolation
No SQL triggers, tables, or grant statements are executed in Phase 02.
