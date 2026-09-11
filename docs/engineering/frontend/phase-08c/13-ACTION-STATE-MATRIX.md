# Campus Plus — Phase 08-C: Action-to-State Transition Matrix

**Document Classification:** Domain & FSM Reconciliation  
**Authority:** Principal Frontend Architect, Application Security Engineer  
**Status:** 100% IMPLEMENTED & VERIFIED  

---

## 1. Lifecycle Transition Map

The Campus Plus frontend strictly models the 13-state Finite State Machine (FSM) defined in `src/domain/complaint/ComplaintStatus.ts` and enforced by `AuthorizationPolicy.ts`:

| Current State | Permitted Action | Triggered By | Target State | OCC Required | Payload Requirements |
|---|---|---|---|---|---|
| `SUBMITTED` | `REVIEW` | `ROLE_DEPT_HEAD` | `REVIEWED` | Yes | None |
| `SUBMITTED`, `REVIEWED` | `ASSIGN` | `ROLE_DEPT_HEAD` | `ASSIGNED` | Yes | `handlerId` |
| `ASSIGNED` | `PROGRESS` | `ROLE_HANDLER` (assigned) | `IN_PROGRESS` | Yes | Remarks |
| `IN_PROGRESS`, `ASSIGNED` | `FORWARD` | Staff in Dept Scope | `FORWARDED` | Yes | `targetDepartmentId`, `rationale` (>=10 chars) |
| `IN_PROGRESS`, `ASSIGNED` | `ESCALATE` | Staff in Dept Scope | `ESCALATED` | Yes | `targetTier`, `reason` |
| `IN_PROGRESS`, `ESCALATED` | `RESOLVE` | Assigned Handler / HOD | `RESOLVED` | Yes | `resolutionSummary` (>=20 chars) |
| `RESOLVED` | `VERIFY` | `ROLE_STUDENT` (owner) | `CLOSED` | Yes | Verification confirmation |
| `RESOLVED` | `DISPUTE` | `ROLE_STUDENT` (owner) | `REOPENED` | Yes | Dispute reason |
| `SUBMITTED`, `REVIEWED` | `REJECT` | `ROLE_DEPT_HEAD` | `REJECTED` | Yes | Rejection reason |
| `SUBMITTED`, `REVIEWED` | `DUPLICATE`| `ROLE_DEPT_HEAD` | `DUPLICATE` | Yes | Master tracking code |
| `SUBMITTED` | `CANCEL` | `ROLE_STUDENT` (owner) | `CANCELLED` | Yes | Cancellation confirmation |

---

## 2. Terminal State Immutability

The `CLOSED`, `REJECTED`, `DUPLICATE`, and `CANCELLED` states are terminal. When an entity is in a terminal state, all mutation buttons are disabled in the UI, and any unauthorized API mutation attempt will be rejected with HTTP 400 or HTTP 403.\n