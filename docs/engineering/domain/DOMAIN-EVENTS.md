# Campus Plus — Domain Events Architecture

## 1. Role in Hexagonal Architecture

In Campus Plus, Domain Events (`src/domain/complaint/DomainEvents.ts`) represent immutable historical facts produced whenever the state of a `Complaint` aggregate changes. They fulfill three essential architectural roles:

1. **Audit Compliance (`INV-011` / `BR-019` / `ADR-008`)**: Providing an append-only audit trail capturing actor ID, timestamp, operation type, and before/after states.
2. **Side-Effect Decoupling**: Allowing notifications, telemetry, search indexing, and real-time dashboard updates to be processed asynchronously without coupling the Domain Core to notification transports.
3. **Transactional Outbox Readiness**: Events generated within the aggregate's transaction boundary are designed to be persisted into the `audit_events` table within the same ACID database transaction.

---

## 2. Event Envelope Structure

All events conform to the standard `DomainEvent<TPayload>` envelope:

```typescript
export interface DomainEvent<TPayload = Record<string, unknown>> {
  readonly eventId: string;       // Unique UUID v4 identifying the event
  readonly aggregateId: string;   // Complaint ID
  readonly eventType: string;     // Canonical event identifier
  readonly occurredAt: string;    // ISO 8601 UTC timestamp
  readonly payload: TPayload;      // Strongly typed event details
}
```

---

## 3. Canonical Event Catalog

| Event Name | Trigger Operation | Payload Attributes | Primary Invariant / Requirement |
| :--- | :--- | :--- | :--- |
| `COMPLAINT_SUBMITTED` | `Complaint.create()` | `complaintId`, `trackingCode`, `complainantId`, `departmentId`, `categoryId`, `priority`, `title` | FR-004, INV-011 |
| `COMPLAINT_REVIEWED` | `Complaint.review()` | `complaintId`, `actorId`, `previousStatus`, `newStatus` | FR-007, INV-011 |
| `COMPLAINT_ASSIGNED` | `Complaint.assignHandler()` | `complaintId`, `handlerId`, `assignedById`, `departmentId` | FR-008, INV-007 |
| `COMPLAINT_PROGRESS_STARTED` | `Complaint.startProgress()` | `complaintId`, `actorId`, `previousStatus`, `newStatus` | FR-009, INV-011 |
| `COMPLAINT_FORWARDED` | `Complaint.forwardDepartment()` | `complaintId`, `fromDepartmentId`, `toDepartmentId`, `forwardedById`, `forwardSequence`, `rationale` | FR-010, INV-002, INV-010 |
| `COMPLAINT_ESCALATED` | `Complaint.manualEscalate()`, `Complaint.systemEscalate()` | `complaintId`, `fromTier`, `toTier`, `isAutomated`, `escalatedById`, `reason` | FR-013, BR-013 |
| `COMPLAINT_ESCALATED_ANTI_DEADLOCK` | `Complaint.forwardDepartment()` (3rd transfer) | `complaintId`, `fromDepartmentId`, `toDepartmentId`, `forwardSequence`, `toTier` | EDGE-004, INV-010 |
| `COMPLAINT_RESOLVED` | `Complaint.resolve()` | `complaintId`, `resolvedById`, `summary`, `resolvedAt` | FR-016, INV-005, INV-006 |
| `COMPLAINT_CLOSED` | `Complaint.verifyResolution()`, `Complaint.close()` | `complaintId`, `closedAt`, `reason`, `verifiedByComplainant` | FR-017, BR-016, INV-003 |
| `COMPLAINT_REOPENED` | `Complaint.disputeAndReopen()` | `complaintId`, `complainantId`, `disputeReason`, `reopenedAt` | FR-018, BR-018 |
| `COMPLAINT_REJECTED` | `Complaint.reject()` | `complaintId`, `actorId`, `previousStatus`, `newStatus`, `remarks` | FR-007, INV-004 |
| `COMPLAINT_MARKED_DUPLICATE` | `Complaint.markDuplicate()` | `complaintId`, `actorId`, `previousStatus`, `newStatus`, `remarks` | FR-007, INV-004 |
| `COMPLAINT_CANCELLED` | `Complaint.cancel()` | `complaintId`, `actorId`, `previousStatus`, `newStatus`, `remarks` | FR-006, INV-004 |

---

## 4. Aggregate Event Collection Protocol

```typescript
// Appending events inside Complaint aggregate methods
this._uncommittedEvents.push(
  createComplaintDomainEvent(this._id.toString(), "COMPLAINT_FORWARDED", {
    complaintId: this._id.toString(),
    fromDepartmentId: fromDeptId.toString(),
    toDepartmentId: toDepartmentId.toString(),
    forwardedById: actor.userId,
    forwardSequence: nextSequence,
    rationale: rationale.toString(),
  })
);

// Application layer lifecycle
const events = complaint.getUncommittedEvents();
await outboxRepository.saveAll(events);
complaint.clearEvents();
```
