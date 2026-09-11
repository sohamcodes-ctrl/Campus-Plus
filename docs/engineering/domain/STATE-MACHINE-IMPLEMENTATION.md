# Canonical 13-State Domain State Machine Implementation

## 1. Canonical State Space

The grievance lifecycle conforms strictly to the canonical 13-state FSM defined in `src/domain/complaint/ComplaintStatus.ts`:

```typescript
export const ComplaintStatus = {
  DRAFT: "DRAFT",
  SUBMITTED: "SUBMITTED",
  REVIEWED: "REVIEWED",
  ASSIGNED: "ASSIGNED",
  IN_PROGRESS: "IN_PROGRESS",
  FORWARDED: "FORWARDED",
  ESCALATED: "ESCALATED",
  RESOLVED: "RESOLVED",
  CLOSED: "CLOSED",
  REOPENED: "REOPENED",
  REJECTED: "REJECTED",
  DUPLICATE: "DUPLICATE",
  CANCELLED: "CANCELLED",
} as const;
```

---

## 2. Transition Matrix (`ALLOWED_STATUS_TRANSITIONS`)

```
                                  +------------+
                                  |   DRAFT    |
                                  +------------+
                                        |
                                        v
                                 +---------------+
              +----------------->|   SUBMITTED   |------------------+
              |                  +---------------+                  |
              |                   /      |      \                   |
              |                  /       |       \                  |
              |                 v        v        v                 v
              |          +----------+ +--------+ +-----------+ +-----------+
              |          | REVIEWED | |ASSIGNED| | REJECTED* | |CANCELLED* |
              |          +----------+ +--------+ +-----------+ +-----------+
              |           /   |   \        |
              |          /    |    \       v
              |         /     |     +->+-------------+
              |        /      |        | IN_PROGRESS |
              |       /       |        +-------------+
              |      v        v               |
              |  +-------+ +---------+        v
              |  |FORWARD| |ESCALATED|  +------------+
              |  +-------+ +---------+  |  RESOLVED  |
              |      |          |       +------------+
              |      v          v           /     \
              |   [Triage/Assignment]      v       v
              |                        +------+ +--------+
              +------------------------|REOPEN| | CLOSED*|
                                       +------+ +--------+
```
*\* Denotes terminal status.*

### Transition Table

| Source Status | Allowed Target Statuses | Business Context |
| :--- | :--- | :--- |
| `DRAFT` | `SUBMITTED`, `CANCELLED` | Student drafting ticket or abandoning before submission |
| `SUBMITTED` | `REVIEWED`, `ASSIGNED`, `REJECTED`, `CANCELLED` | Initial triage; dept head reviews, assigns directly, rejects, or student cancels |
| `REVIEWED` | `ASSIGNED`, `FORWARDED`, `ESCALATED`, `REJECTED`, `DUPLICATE` | Post-triage options: assign handler, forward to correct department, escalate, reject, or mark duplicate |
| `ASSIGNED` | `IN_PROGRESS`, `FORWARDED`, `ESCALATED`, `ASSIGNED` | Handler starts work, department forwards misassigned ticket, escalates, or reassigns handler |
| `IN_PROGRESS` | `RESOLVED`, `FORWARDED`, `ESCALATED` | Handler completes resolution, discovers wrong department, or escalates roadblock |
| `FORWARDED` | `REVIEWED`, `ASSIGNED`, `ESCALATED` | Receiving department reviews transferred complaint or directly assigns handler |
| `ESCALATED` | `ASSIGNED`, `IN_PROGRESS`, `RESOLVED`, `FORWARDED` | Elevated authority adjudicates, reassigns, orders continuation, or marks resolved |
| `RESOLVED` | `CLOSED`, `REOPENED` | Complainant verifies satisfaction (`CLOSED`) or disputes resolution (`REOPENED`) |
| `REOPENED` | `ASSIGNED`, `IN_PROGRESS`, `ESCALATED` | Disputed ticket returns to department for reassignment, re-work, or executive escalation |
| `CLOSED` | *None* | **Terminal Status** (`INV-003`); permanent institutional record |
| `REJECTED` | *None* | **Terminal Status**; ticket denied with formal rationale |
| `DUPLICATE` | *None* | **Terminal Status**; ticket linked to primary master complaint |
| `CANCELLED` | *None* | **Terminal Status**; withdrawn by complainant prior to handling |

---

## 3. Terminality Rules

Terminal status enforcement is centralized in `isTerminalStatus()`:
```typescript
export function isTerminalStatus(status: ComplaintStatusType): boolean {
  return (
    status === ComplaintStatus.CLOSED ||
    status === ComplaintStatus.REJECTED ||
    status === ComplaintStatus.DUPLICATE ||
    status === ComplaintStatus.CANCELLED
  );
}
```
If any aggregate operation is invoked while in a terminal state, it is rejected immediately with `ComplaintClosedError(complaintId, operation)` before any business logic evaluates.

---

## 4. Verification & Testing

The state machine is verified in `tests/unit/domain-fsm.test.ts`:
1. **Valid Forward Transitions**: All defined edges in `ALLOWED_STATUS_TRANSITIONS` are tested and pass.
2. **Forbidden Transitions**: Negative tests assert illegal jumps (e.g., `SUBMITTED -> RESOLVED`, `DRAFT -> CLOSED`, `REJECTED -> IN_PROGRESS`) throw `InvalidStateTransitionError`.
3. **Terminality Guards**: Terminal states reject any forward transitions.
4. **Integration with Aggregate**: State machine enforcement verified in `Complaint.ts` on every public operation.
