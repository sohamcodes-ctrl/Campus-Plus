# Phase 04 — Transaction Boundaries, Concurrency & Idempotency

**Project**: Campus Plus — Campus Complaint & Grievance Resolution System  
**Phase**: Phase 04 — Database Engineering & Migration Design  
**Date**: 2026-09-10  
**Status**: Formal Concurrency Design Approved  

---

## 1. Concurrency Model: Optimistic Concurrency Control (OCC)

Campus Plus adopts **Optimistic Concurrency Control** for all complaint lifecycle mutations.

### 1.1 Invariant Protection Mechanism
- The `complaints` table maintains an integer column: `version INTEGER NOT NULL DEFAULT 1`.
- Every transition query executes an atomic conditional update:
  ```sql
  UPDATE complaints
  SET status = 'IN_PROGRESS',
      assigned_handler_id = 'handler-uuid',
      version = version + 1,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = 'complaint-uuid' AND version = 3;
  ```
- **Conflict Resolution**:
  - If another user updated the ticket concurrently, the row version in the database is already $\ge 4$.
  - The query updates 0 rows (`rowCount === 0`).
  - The application aborts the transaction, rolls back, and returns HTTP `409 Conflict` with error code `CONFLICT`.

---

## 2. Definitive Transaction Boundaries

Each state-changing operation must execute within a strict, atomic database transaction (`BEGIN ... COMMIT`):

### 2.1 Complaint Submission Transaction
```
BEGIN;
  1. INSERT INTO complaints (id, ref_id, title, description, complainant_id, ...)
  2. INSERT INTO action_history (complaint_id, actor_id, action_type, to_status, remarks, ...)
  3. INSERT INTO outbox_events (event_type, aggregate_id, payload, status)
COMMIT;
```
*Guarantee*: A complaint cannot exist without its initial submission audit entry and outbox notification event.

### 2.2 Department Forwarding Transaction
```
BEGIN;
  1. Verify: from_department_id <> to_department_id
  2. Query: current forward count (Anti-deadlock check)
  3. INSERT INTO complaint_forwards (complaint_id, from_department_id, to_department_id, forward_sequence, rationale)
  4. UPDATE complaints SET department_id = to_department_id, assigned_handler_id = NULL, version = version + 1
  5. INSERT INTO action_history (complaint_id, action_type, from_status, to_status, remarks)
  6. INSERT INTO outbox_events (event_type, aggregate_id, payload)
COMMIT;
```
*Guarantee*: Ownership handoff is atomic. A ticket cannot be transferred without updating the aggregate, resetting the assigned handler, and recording the transfer sequence.

### 2.3 Escalation Transaction
```
BEGIN;
  1. INSERT INTO complaint_escalations (complaint_id, from_tier, to_tier, escalated_by_id, is_automated, reason)
  2. UPDATE complaints SET escalation_tier = to_tier, is_escalated = TRUE, version = version + 1
  3. INSERT INTO action_history (complaint_id, action_type, remarks)
  4. INSERT INTO outbox_events (event_type, aggregate_id, payload)
COMMIT;
```

---

## 3. Idempotency Registry Architecture

Network drops and user double-clicks must never result in duplicate complaints or redundant state transitions.

```sql
CREATE TABLE idempotency_keys (
    key VARCHAR(255) PRIMARY KEY,
    request_hash VARCHAR(64) NOT NULL,
    response_code INTEGER,
    response_body JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMPTZ NOT NULL
);
```

### Idempotency Workflow
1. Client generates `Idempotency-Key: <uuid>` in the HTTP header.
2. Server queries `idempotency_keys` inside a transaction.
3. If the key exists:
   - If response is cached: return cached response immediately without re-executing business logic.
   - If key is in-flight: return `409 Conflict` (request currently processing).
4. If key is new:
   - Insert key with 24-hour expiration (`expires_at = CURRENT_TIMESTAMP + INTERVAL '24 hours'`).
   - Execute domain transaction.
   - Cache resulting response code and body in `idempotency_keys`.
