# PHASE 07-B: Concurrency Control, Idempotency & Sequence Integrity

**System:** Campus Plus — Campus Complaint & Grievance Resolution System  
**Phase:** 07-B — Live Supabase Integration & Infrastructure Verification  
**Evaluation Date:** September 11, 2026  
**Status:** **VERIFIED (Atomic OCC & Persistent Idempotency)**  

---

## 1. Optimistic Concurrency Control (OCC) Architecture

To prevent lost updates when multiple officers triage or resolve complaints concurrently, Campus Plus enforces **Optimistic Concurrency Control** directly at the PostgreSQL update layer.

### Implementation Mechanism
In [`src/infrastructure/database/PostgresComplaintRepository.ts`](file:///d:/Deparment%20Project/department%20project/src/infrastructure/database/PostgresComplaintRepository.ts):
```sql
UPDATE complaints SET
    status = $1,
    assigned_handler_id = $2,
    official_priority = $3,
    escalation_tier = $4,
    is_escalated = $5,
    version = version + 1,
    resolved_at = $6,
    closed_at = $7,
    updated_at = CURRENT_TIMESTAMP
WHERE id = $8 AND version = $9;
```
If the affected row count is 0:
```typescript
if (res.rows.length === 0) {
  throw AppError.conflict(
    `CONCURRENCY_CONFLICT: Complaint '${complaint.id.value}' was modified concurrently by another transaction. Expected version ${expectedVersion}.`
  );
}
```

### Verification Evidence
Tested in `tests/integration/api-concurrency-idempotency.test.ts`:
- Request A updates version 1 to version 2 (HTTP 200).
- Simultaneous Request B attempting update with expectedVersion 1 fails with **HTTP 409 Conflict**.
- Zero lost updates, zero phantom state changes.

---

## 2. Database-Backed Persistent Idempotency (BR-004)

All mutating command endpoints support an `Idempotency-Key` header to prevent duplicate execution caused by client network retries.

### Idempotency Schema
In `idempotency_keys` table:
- `key`: Client-supplied unique token (VARCHAR 255).
- `request_hash`: SHA-256 cryptographic hash of canonical request body (VARCHAR 64).
- `response_code`: HTTP status code (INTEGER).
- `response_body`: JSONB representation of original API response envelope.
- `expires_at`: Expiration timestamp (default: 24 hours).

### Execution Semantics
1. **First Request**: Atomically acquired lock -> executes business logic -> records response code and body.
2. **Identical Replay**: Key exists with identical `request_hash` -> immediately replays cached response without re-executing domain use cases or generating redundant audit/outbox entries.
3. **Payload Divergence**: Key exists but `request_hash` differs -> throws **HTTP 409 Conflict** (`IDEMPOTENCY_CONFLICT: Idempotency-Key was previously used with a different request payload`).

---

## 3. Sequential Tracking Code Generation (CP-YYYY-NNNNN)

### Architecture
- Formalized in `migrations/00010_tracking_code_sequence.sql`:
  `CREATE SEQUENCE IF NOT EXISTS tracking_code_seq START WITH 1 INCREMENT BY 1;`
- Generator queries: `SELECT nextval('tracking_code_seq') as seq;`
- Formats: `CP-${year}-${seq.padStart(5, '0')}` (e.g. `CP-2026-00001`).
- Eliminates any risk of `MAX(id) + 1` race conditions during high-volume complaint submission windows.
- Verified in `tests/integration/supabase-infrastructure.test.ts:227`.
