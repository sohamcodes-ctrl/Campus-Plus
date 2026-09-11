# Concurrency Control & Optimistic Locking (OCC)

## 1. Concurrency Model

Campus Plus uses **Optimistic Concurrency Control (OCC)** to prevent lost updates, double assignments, and race conditions during simultaneous triage operations.

Each complaint aggregate has an integer `version` field starting at `1`:
- Schema constraint: `CONSTRAINT chk_complaint_version CHECK (version >= 1)`
- Every valid state mutation in the domain core invokes `advanceVersion()`:
  ```typescript
  protected advanceVersion(): void {
    this._version = this._version.next();
    this._updatedAt = new Date().toISOString();
  }
  ```

## 2. Double-Layer OCC Verification

### Layer 1: Application Domain Invariant Check
Before mutating the aggregate, use cases compare `complaint.version.toNumber()` against the optional `command.expectedVersion`:

```typescript
const occCheck = BusinessInvariants.validateConcurrency(
  complaint.version.toNumber(),
  command.expectedVersion
);
if (occCheck.isFailure) {
  return err(occCheck.error); // Returns OptimisticLockError (409 Conflict)
}
```

### Layer 2: Atomic Repository Verification
At the persistence boundary (`PostgresComplaintRepository.save`):

```typescript
const existingRes = await this.db.query<{ version: number }>(
  "SELECT version FROM complaints WHERE id = $1;",
  [complaintId]
);

if (!isNew && expectedVersion !== undefined) {
  const currentDbVersion = existingRes.rows[0].version;
  if (currentDbVersion !== expectedVersion) {
    throw new StaleVersionConflictError(currentDbVersion, expectedVersion);
  }
}
```

If another process committed a mutation in the microsecond between domain loading and saving, the database version check triggers `StaleVersionConflictError` which aborts the transaction and returns a deterministic `409 Conflict` HTTP response.
