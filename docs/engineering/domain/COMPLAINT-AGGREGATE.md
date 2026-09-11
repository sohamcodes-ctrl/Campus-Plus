# Complaint Aggregate Root Specification

## 1. Scope & Responsibility

The `Complaint` class (`src/domain/complaint/Complaint.ts`) is the primary Aggregate Root for the Campus Plus grievance resolution platform. It is the sole gateway through which complaints are created, reviewed, assigned, progressed, transferred, escalated, resolved, verified, reopened, or closed.

---

## 2. Encapsulated State & Invariant Enforcement

All internal properties are marked `private` with readonly public getters, ensuring state cannot be mutated externally without validating invariants:

```typescript
export class Complaint {
  private readonly _id: ComplaintId;
  private readonly _refId: TrackingCode;
  private _title: ComplaintTitle;
  private _description: ComplaintDescription;
  private readonly _complainantId: UserId;
  private _departmentId: DepartmentId;
  private readonly _categoryId: CategoryId;
  private readonly _locationDetails: string;
  private readonly _locationId?: LocationId;
  private _status: ComplaintStatusType;
  private _suggestedPriority: Priority;
  private _officialPriority: Priority;
  private _assignedHandlerId?: UserId;
  private _escalationTier: EscalationTierType;
  private _isEscalated: boolean;
  private _version: ComplaintVersion;
  private _slaDueAt?: string;
  private _resolvedAt?: string;
  private _closedAt?: string;
  private readonly _createdAt: string;
  private _updatedAt: string;

  private readonly _assignments: ComplaintAssignment[] = [];
  private readonly _forwards: ComplaintForward[] = [];
  private readonly _escalations: ComplaintEscalation[] = [];
  private _resolution?: Resolution;

  private _uncommittedEvents: DomainEvent[] = [];
  ...
}
```

---

## 3. Aggregate Lifecycle Methods

| Method | Authorized Actors | Pre-conditions | State Transition | Emitted Event |
| :--- | :--- | :--- | :--- | :--- |
| `Complaint.create()` | Student / Faculty / Admin | Valid VOs (title, description, dept, category) | Instantiated with `SUBMITTED` | `COMPLAINT_SUBMITTED` |
| `review()` | Dept Head / Admin | Status must be `SUBMITTED` or `FORWARDED` | `-> REVIEWED` | `COMPLAINT_REVIEWED` |
| `assignHandler()` | Dept Head / Admin | Status must allow assignment (`REVIEWED`, `ASSIGNED`, `REOPENED`, etc.) | `-> ASSIGNED` | `COMPLAINT_ASSIGNED` |
| `startProgress()` | Assigned Handler | Must be assigned handler in owning dept | `-> IN_PROGRESS` | `COMPLAINT_PROGRESS_STARTED` |
| `forwardDepartment()` | Dept Staff / Head / Admin | Target dept != current dept (`INV-002`); status allows forward | `-> FORWARDED` (or `-> ESCALATED` on 3rd transfer) | `COMPLAINT_FORWARDED` or `COMPLAINT_ESCALATED_ANTI_DEADLOCK` |
| `manualEscalate()` | Dept Staff / Head / Admin | Valid rationale; status allows escalation | `-> ESCALATED` | `COMPLAINT_ESCALATED` |
| `systemEscalate()` | Automated SLA / System | Status allows escalation | `-> ESCALATED` | `COMPLAINT_ESCALATED` |
| `resolve()` | Assigned Handler / Head / Admin | Valid summary (>= 20 chars, `INV-005`); evidence verified if mandated | `-> RESOLVED` | `COMPLAINT_RESOLVED` |
| `verifyResolution()` | Original Complainant | Status == `RESOLVED` | `-> CLOSED` | `COMPLAINT_CLOSED` |
| `disputeAndReopen()` | Original Complainant | Status == `RESOLVED`; within dispute calendar window (`IReopenPolicy`) | `-> REOPENED` | `COMPLAINT_REOPENED` |
| `close()` | Staff / Admin / Student | Status allows close; not terminal | `-> CLOSED` | `COMPLAINT_CLOSED` |
| `reject()` | Dept Head / Admin | Status allows rejection; mandatory rationale | `-> REJECTED` | `COMPLAINT_REJECTED` |
| `markDuplicate()` | Dept Head / Admin | Must provide master complaint tracking code | `-> DUPLICATE` | `COMPLAINT_MARKED_DUPLICATE` |
| `cancel()` | Complainant (pre-triage) | Status is `SUBMITTED` or `DRAFT` only | `-> CANCELLED` | `COMPLAINT_CANCELLED` |

---

## 4. Child Entity Management

### 4.1 Assignment Tenure Preservation
When `assignHandler(handlerId, assignedBy)` is invoked:
1. The aggregate searches existing `_assignments` for an active entry (`isCurrent === true`).
2. If found, it calls `endAssignment(now)` on that entry, setting `isCurrent = false` and `endedAt = timestamp`.
3. It appends a new `ComplaintAssignment` entity with `isCurrent = true`.
4. It sets `_assignedHandlerId = handlerId`.

### 4.2 Forwarding & Anti-Deadlock Rule (`EDGE-004`)
When `forwardDepartment(targetDept, actor, rationale)` is called:
1. Validates that `targetDept.toString() !== currentDept.toString()` (`INV-002`).
2. Calculates `nextSequence = this._forwards.length + 1`.
3. If `nextSequence >= 3`, detects circular departmental forwarding deadlock:
   - Sets `_status = ComplaintStatus.ESCALATED`.
   - Sets `_escalationTier = EscalationTier.TIER_3_MANAGEMENT`.
   - Clears `_assignedHandlerId = undefined`.
   - Appends an automated `ComplaintEscalation` entity with reason referencing `EDGE-004 / INV-010`.
   - Emits `COMPLAINT_ESCALATED_ANTI_DEADLOCK`.
4. Otherwise, executes standard departmental transfer:
   - Appends `ComplaintForward` with `forwardSequence = nextSequence`.
   - Sets `_departmentId = targetDept`.
   - Clears `_assignedHandlerId = undefined` (target department must reassign).
   - Sets `_status = ComplaintStatus.FORWARDED`.
   - Emits `COMPLAINT_FORWARDED`.

---

## 5. Domain Event Lifecycle & Optimistic Concurrency Control

### 5.1 Event Tracking
The aggregate maintains an in-memory queue `_uncommittedEvents: DomainEvent[]`.
- Every state change appends a typed domain event via `createComplaintDomainEvent(...)`.
- The application layer retrieves these via `complaint.getUncommittedEvents()`.
- After transactional persistence and outbox enqueueing, the repository calls `complaint.clearEvents()`.

### 5.2 OCC Version Advancement
Every successful lifecycle mutation calls `this.advanceVersion()`:
```typescript
private advanceVersion(): void {
  this._version = this._version.next();
  this._updatedAt = new Date().toISOString();
}
```
If an application use-case supplies an `expectedVersion` that does not match the database version, the update is rejected with `StaleVersionConflictError` prior to modifying persistent storage (`INV-009`).
