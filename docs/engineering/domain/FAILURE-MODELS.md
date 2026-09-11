# Campus Plus — Domain Failure Models & Error Taxonomy

## 1. Overview

Domain errors in Campus Plus (`src/domain/complaint/DomainErrors.ts`) inherit from the centralized `AppError` framework established in Phase 03. Every domain failure is strictly typed, contains structured telemetry attributes in `details`, maps directly to an institutional `ErrorCodes` identifier, and translates predictably into standard HTTP status codes.

---

## 2. Error Taxonomy Matrix

| Error Class | ErrorCodes | HTTP Status | Trigger Scenarios |
| :--- | :--- | :--- | :--- |
| `InvalidStateTransitionError` | `STATE_TRANSITION_INVALID` | 422 Unprocessable | Attempted state transition is not allowed by the canonical 13-state FSM transition matrix (`INV-004`). |
| `UnauthorizedOperationError` | `FORBIDDEN` | 403 Forbidden | Actor role lacks permission for the operation, or student attempts BOLA/IDOR access to another student's complaint (`INV-008`). |
| `DepartmentScopeViolationError` | `FORBIDDEN` | 403 Forbidden | Department staff (Handler or Head) attempts an action on a complaint owned by another department (`INV-007`, `INV-008`). |
| `ComplaintClosedError` | `STATE_TRANSITION_INVALID` | 409 Conflict | Any mutating operation attempted on a complaint in terminal `CLOSED`, `REJECTED`, `DUPLICATE`, or `CANCELLED` status (`INV-003`). |
| `MissingResolutionSummaryError`| `VALIDATION_FAILED` | 400 Bad Request | Resolution summary length is strictly less than 20 trimmed characters (`INV-005`, `BR-015`). |
| `MissingRequiredProofError` | `PRECONDITION_FAILED` | 422 Unprocessable | Category mandates objective resolution evidence (`BR-007`), but zero attachments of type `RESOLUTION_PROOF` were supplied (`INV-006`). |
| `SelfForwardingError` | `VALIDATION_FAILED` | 400 Bad Request | Attempt to forward a complaint to its current owning department (`INV-002`, `BR-010`). |
| `AntiDeadlockLimitReachedError` | `CONFLICT` | 409 Conflict | Ticket reaches 3 departmental transfers, triggering automatic elevation to Management rather than standard forwarding (`EDGE-004`, `INV-010`). |
| `StaleVersionConflictError` | `CONFLICT` | 409 Conflict | Concurrency conflict detected: supplied `expectedVersion` does not match the active entity version in the database (`INV-009`, `NFR-004`). |
| `IdempotencyConflictError` | `CONFLICT` | 409 Conflict | Replayed request with mismatched payload hash, or duplicate request received while earlier request is still `IN_PROGRESS` (`INV-013`, `NFR-003`). |
| `ReopenWindowExpiredError` | `PRECONDITION_FAILED` | 422 Unprocessable | Complainant attempts to dispute resolution after the calendar verification dispute window (default 5 working days) has expired (`BR-016`, `OD-008`). |
| `ComplaintNotFoundError` | `NOT_FOUND` | 404 Not Found | Specified complaint identifier or tracking code does not exist in the persistence store. |
| `InvalidValueObjectError` | `VALIDATION_FAILED` | 400 Bad Request | Value object instantiation failed (e.g., invalid tracking code regex, title length < 10 or > 120, description < 30). |

---

## 3. Structural Design of Domain Errors

```typescript
export class MissingResolutionSummaryError extends AppError {
  constructor(length: number, requiredLength: number) {
    super({
      message: `Resolution summary length of ${length} is insufficient. Minimum required length is ${requiredLength} characters (BR-015, chk_resolution_summary_len).`,
      code: ErrorCodes.VALIDATION_FAILED,
      statusCode: 400,
      details: { currentLength: length, requiredLength },
    });
  }
}
```

Every domain error:
1. Is an instance of `AppError` and JavaScript's `Error`.
2. Preserves full stack trace via `Error.captureStackTrace`.
3. Encapsulates diagnostic context in the `details` object for audit logging and telemetry without leaking PII.
