# Phase 04 — Audit Log Architecture & Immutability Enforcement

**Project**: Campus Plus — Campus Complaint & Grievance Resolution System  
**Phase**: Phase 04 — Database Engineering & Migration Design  
**Date**: 2026-09-10  
**Status**: Formal Audit Design Approved  

---

## 1. Audit Principles & Legal Accountability

Per [ADR-008](file:///d:/Deparment%20Project/department%20project/docs/engineering/architecture/decisions/ADR-008-AUDIT-LOGGING-ARCHITECTURE.md) and institutional grievance regulations, every lifecycle transition, assignment change, department transfer, escalation, resolution, and administrative override must be recorded in an **immutable, append-only chronological journal**.

---

## 2. Audit Record Structure (`action_history`)

```sql
CREATE TABLE action_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES users(id) ON DELETE SET NULL, -- NULL indicates automated background daemon or system action
    actor_role VARCHAR(50) NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    from_status VARCHAR(50),
    to_status VARCHAR(50),
    remarks TEXT,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### Action Types Taxonomy
- `SUBMIT`: Initial complaint creation.
- `TRIAGE`: Priority assessment or category reassignment.
- `ASSIGN`: Assignment to a specific staff handler.
- `REASSIGN`: Change of assigned handler.
- `FORWARD`: Inter-departmental transfer.
- `ESCALATE`: Elevation to higher administrative tier (SLA timeout or manual).
- `RESOLVE`: Provision of official resolution summary.
- `DISPUTE`: Complainant rejection of proposed resolution.
- `VERIFY`: Complainant confirmation and satisfaction.
- `CLOSE`: Final permanent closure.
- `REJECT`: Rejection of invalid/out-of-scope submission.

---

## 3. Immutability Enforcement: Three Layers of Defense

To ensure that neither malicious actors nor compromised administrator accounts can alter historical audit records:

### Layer 1: PostgreSQL Trigger Defense
A PL/pgSQL trigger intercepts any attempt to execute `UPDATE` or `DELETE` on `action_history` and throws a critical SQL error:
```sql
CREATE OR REPLACE FUNCTION trg_enforce_action_history_immutable()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'SECURITY VIOLATION: action_history is an immutable append-only journal. UPDATE and DELETE are prohibited.'
        USING ERRCODE = '55000'; -- Object not modifiable
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_action_history_no_mutation
BEFORE UPDATE OR DELETE ON action_history
FOR EACH ROW EXECUTE FUNCTION trg_enforce_action_history_immutable();
```

### Layer 2: PostgreSQL Privilege Grants
At the database kernel level, `UPDATE`, `DELETE`, and `TRUNCATE` permissions are explicitly revoked from all application users and roles:
```sql
REVOKE UPDATE, DELETE, TRUNCATE ON action_history FROM PUBLIC, authenticated, anon;
GRANT SELECT, INSERT ON action_history TO authenticated;
```

### Layer 3: Append-Only RLS Policy
Even under Row-Level Security, only `SELECT` and `INSERT` policies exist for `action_history`. No `UPDATE` or `DELETE` policy is defined, ensuring that Supabase client libraries fail closed if mutation is attempted.

---

## 4. Automated Verification Test Specification
The audit test suite (`tests/database/audit-immutability.test.ts`) verifies:
1. `INSERT INTO action_history` succeeds and assigns a non-null `id` and `created_at`.
2. `UPDATE action_history SET remarks = 'tampered' WHERE id = ...` fails with SQL state `55000` (`SECURITY VIOLATION`).
3. `DELETE FROM action_history WHERE id = ...` fails with SQL state `55000`.
4. `TRUNCATE TABLE action_history` fails with permission error.
