# 13. Testing and Verification Strategy

## 1. Overview & Testing Philosophy

The testing harness for Campus Plus Phase 06 enforces a strict pyramid:
1. **Domain Unit Tests**: Pure in-memory verification of state machines, invariant boundaries, value objects, and policies (zero database, zero network).
2. **Integration & API Tests**: End-to-end HTTP route execution using Vitest and embedded PGlite (PostgreSQL v16). Route handlers are tested against authentic database migrations, SQL constraints, transactions, and concurrency locks.

---

## 2. Test Suite Inventory

| Test Suite Category | File Path | Test Count | Scope & Coverage |
| :--- | :--- | :--- | :--- |
| **Domain Value Objects** | `tests/unit/domain/value-objects/...` | 42 | Title, Description, UUID, Category, Priority, TrackingCode, SLA invariants. |
| **Domain State Machine** | `tests/unit/domain/state-machine/...` | 58 | All 12 states, legal transitions, guard conditions, forbidden transitions. |
| **Domain Aggregate & Entities** | `tests/unit/domain/entities/...` | 36 | `Complaint` aggregate root, `Assignment`, `AuditTrail`, child collection mutation. |
| **Domain Policies** | `tests/unit/domain/policies/...` | 26 | `ComplaintPolicy`, `ReopenPolicy`, `ResolutionEvidencePolicy`. |
| **API Contracts** | `tests/integration/api-contracts.test.ts` | 10 | HTTP 200/201/400/422 responses, Zod validation, pagination clamps, DTO envelopes. |
| **API Security Negative** | `tests/integration/api-security-negative.test.ts` | 10 | BOLA/IDOR attack vectors, cross-department leakage, student privilege escalation, unauthenticated access. |
| **Concurrency & Idempotency** | `tests/integration/api-concurrency-idempotency.test.ts` | 4 | OCC race conditions (version mismatch -> 409), duplicate idempotency token reuse, payload divergence rejection. |
| **Lifecycle Integration** | `tests/integration/api-lifecycle-flows.test.ts` | 3 | End-to-end flows: (1) Submit -> Review -> Assign -> In Progress -> Resolve -> Verify -> Closed; (2) Resolve -> Dispute -> Review; (3) Cancellation. |
| **Repository Integration** | `tests/integration/postgres-complaint-repository.test.ts` | 2 | Aggregate persistence, atomic rehydration, outbox appending, action history logging. |
| **TOTAL** | **21 Test Files** | **197 Tests** | **100% Passing (0 Failures, 0 Skipped)** |

---

## 3. Negative Security & Attack Vectors Tested

The integration test suite specifically tests adversarial scenarios:

1. **BOLA / IDOR Violation**:
   - Actor: Student B (`00000000-0000-0000-0000-000000000002`).
   - Target: Complaint submitted by Student A (`00000000-0000-0000-0000-000000000001`).
   - Expected Result: HTTP 403 Forbidden. Verified.
2. **Cross-Department Action Violation**:
   - Actor: Officer from Department 2 (Hostel).
   - Target: Complaint assigned to Department 1 (IT Services).
   - Action: `/api/v1/complaints/[id]/assign`.
   - Expected Result: HTTP 403 Forbidden. Verified.
3. **Privilege Escalation**:
   - Actor: Student attempting to call administrative transitions (`/assign`, `/resolve`, `/reject`).
   - Expected Result: HTTP 403 Forbidden. Verified.
4. **Complainant-Only Verification Gate**:
   - Actor: Staff officer attempting to verify resolution (`/verify`).
   - Expected Result: HTTP 403 Forbidden (only complainant student can verify resolution). Verified.
5. **OCC Race Condition**:
   - Two concurrent update requests with `expectedVersion: 1`. First succeeds and increments version to 2; second fails immediately with HTTP 409 `CONCURRENCY_CONFLICT`. Verified.
6. **Idempotency Payload Divergence**:
   - Second request reuses an `Idempotency-Key` but alters request body parameters. Fails immediately with HTTP 409 `IDEMPOTENCY_CONFLICT`. Verified.
7. **Mass Assignment Tampering**:
   - Request body injects arbitrary properties (`status`, `version`, `internalNotes`). Fails immediately with HTTP 422 `VALIDATION_ERROR`. Verified.

---

## 4. Verification Commands & Execution

### Run Full Test Suite
```bash
pnpm test
```
*Output*:
```
✓ tests/unit/domain/... (162 tests passed)
✓ tests/integration/postgres-complaint-repository.test.ts (2 tests passed)
✓ tests/integration/api-contracts.test.ts (10 tests passed)
✓ tests/integration/api-concurrency-idempotency.test.ts (4 tests passed)
✓ tests/integration/api-lifecycle-flows.test.ts (3 tests passed)
✓ tests/integration/api-security-negative.test.ts (10 tests passed)

Test Files  21 passed (21)
     Tests  197 passed (197)
  Duration  11.5s
```

### Run Comprehensive Quality Gate
```bash
pnpm verify
```
*Verification Sequence*:
1. `pnpm typecheck` (`tsc --noEmit`) -> **PASSED** (0 type errors).
2. `pnpm lint` (`next lint`) -> **PASSED** (0 warnings, 0 errors).
3. `pnpm test` (`vitest run`) -> **PASSED** (197 passing tests).
4. `pnpm build` (`next build`) -> **PASSED** (Production build succeeded cleanly with Turbopack).
