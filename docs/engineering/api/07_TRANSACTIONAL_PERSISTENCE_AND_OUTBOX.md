# Transactional Persistence & Outbox Pattern

## 1. Aggregate Persistence Architecture

The `Complaint` aggregate root encapsulates the complete state and history of a grievance.
When `PostgresComplaintRepository.save(complaint, expectedVersion)` is executed, it executes an atomic multi-table synchronization:

```
┌─────────────────────────────────────────────────────────────┐
│                 Single Atomic Transaction                   │
├─────────────────────────────────────────────────────────────┤
│ 1. complaints (Root row: status, version, timestamps)       │
│ 2. complaint_assignments (Handler assignment log)           │
│ 3. complaint_forwards (Department transfer journal)         │
│ 4. complaint_escalations (Tier elevation log)               │
│ 5. resolutions (Resolution proof and dispute details)       │
│ 6. action_history (Append-only institutional audit trail)   │
│ 7. outbox_events (Transactional outbox for event publishing)│
└─────────────────────────────────────────────────────────────┘
```

## 2. Transactional Audit Log Appending (BR-013)

Audit records are never created manually or retroactively.
Whenever the domain core executes an action, it emits domain events (`COMPLAINT_SUBMITTED`, `COMPLAINT_REVIEWED`, `HANDLER_ASSIGNED`, `COMPLAINT_RESOLVED`, etc.).
During repository `save()`, these events are mapped directly into immutable audit rows:

```sql
INSERT INTO action_history (
  complaint_id, actor_id, actor_role, action_type, from_status, to_status, remarks, metadata, created_at
) VALUES ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9);
```

Database triggers configured in Phase 04 (`trg_prevent_action_history_mutation`) prevent any update or delete on `action_history`.

## 3. Transactional Outbox Pattern (BR-017)

To guarantee reliable asynchronous processing (e.g. notifications, search index updates, audit analytics) without distributed transaction overhead (2PC):

```sql
INSERT INTO outbox_events (
  id, event_type, aggregate_type, aggregate_id, payload, status, retry_count, created_at
) VALUES ($1, $2, 'Complaint', $3, $4::jsonb, 'PENDING', 0, $5);
```

Because `outbox_events` and `complaints` are saved in the same local transaction, a failure to commit the complaint also prevents phantom outbox events from being emitted.
