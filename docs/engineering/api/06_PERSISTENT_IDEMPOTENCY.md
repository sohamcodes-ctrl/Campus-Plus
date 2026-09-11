# Persistent Idempotency Design (BR-004)

## 1. Objective & Scope

Under unstable mobile networks or client retries, clients may inadvertently submit duplicate complaint creation requests.
To guarantee strict institutional record integrity without duplicate tickets, Campus Plus implements persistent idempotency on `POST /api/v1/complaints`.

## 2. Persistence Model

Idempotency tokens are stored in the `idempotency_keys` table:

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

## 3. Cryptographic Request Fingerprinting

To prevent payload tampering or key hijacking, the application computes a canonical **SHA-256 hash** of the request parameters:

```typescript
const rawPayload = JSON.stringify({
  title: command.title,
  complainantId: command.complainantId,
  departmentId: command.departmentId,
  categoryId: command.categoryId,
  description: command.description,
  locationDetails: command.locationDetails,
});
const requestHash = createHash("sha256").update(rawPayload).digest("hex");
```

## 4. Execution State Machine

```
              Client Request with Idempotency-Key
                                │
                                ▼
                   Does key exist in database?
                  /                           \
               [NO]                          [YES]
                │                              │
     Insert key with NULL response             ▼
      (Atomic DB Lock Reservation)    Hashes match & response completed?
                │                            /                  \
                ▼                         [YES]                 [NO]
        Execute Use Case                   │                      │
                │                Replay cached response    Throw 409 Conflict
                ▼                (No aggregate mutation)   (Payload mismatch
     Update idempotency_keys                               or concurrent race)
     with 201 & response JSON
```

## 5. Security & Isolation Guarantees

1. **Replay Integrity**: Subsequent submissions with the identical key return the original `complaintId` and `trackingCode` instantly.
2. **Tamper Rejection**: Submitting an identical key with an altered payload (e.g. modified title or category) triggers `IdempotencyConflictError` (409 Conflict).
3. **In-Flight Protection**: If two requests with the same key arrive concurrently, the second encounters `response_code IS NULL` and is rejected with 409 Conflict until the first completes.
