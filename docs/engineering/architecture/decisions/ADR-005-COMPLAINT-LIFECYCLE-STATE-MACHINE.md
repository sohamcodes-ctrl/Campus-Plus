# ADR-005: Complaint Lifecycle State Machine & Transition Engine

**Status**: Accepted  
**Date**: 2026-09-10  
**Context Phase**: Phase 02 — Architecture & Technical Design  
**Deciders**: Lead Software Architect, QA/Test Analyst  
**Traceability**: Resolves `OD-007`, `OD-008`, `OD-009`, satisfies `FR-007`, `FR-008`, `FR-011`, `FR-015`, `FR-017`, `FR-018`  

---

## 1. Context & Problem Statement

The Level 1 Source Synopsis identifies the absence of a structured complaint lifecycle as a primary operational gap. Without formal state controls, complaints suffer from:
- Status ambiguity (students do not know where their complaint stands).
- Invalid state transitions (e.g., resolving a ticket before assignment, or editing closed tickets).
- Premature or unauthorized closures.
- Lost traceability during reassignment and reopening.

We must define a deterministic, mathematically verifiable finite state machine (FSM) with explicit pre-conditions, post-conditions, and invariant guards.

---

## 2. Decision: Deterministic Finite State Machine Pattern

We adopt a **Formal Transition Table FSM Engine** implemented within the Core Domain Layer. State transitions cannot occur via arbitrary database field updates; they must invoke explicit transition methods on the `Complaint` domain aggregate.

### 2.1 State Transition Matrix

```text
                                 [START]
                                    │
                                    ▼
                             ┌─────────────┐
                    ┌───────>│  SUBMITTED  │
                    │        └──────┬──────┘
                    │               │ review / auto-triage
                    │               ▼
                    │        ┌─────────────┐
  reopen (dispute)  │        │  REVIEWED   │────────┐ reject / invalid
                    │        └──────┬──────┘        │
                    │               │ assign        ▼
                    │               ▼        ┌─────────────┐
                    │        ┌─────────────┐ │  REJECTED   │ [TERMINAL]
                    │        │  ASSIGNED   │ └─────────────┘
                    │        └──────┬──────┘
                    │               │ begin work
                    │               ▼
                    │        ┌─────────────┐
                    │        │ IN PROGRESS │
                    │        └──────┬──────┘
                    │               │
                    │       ┌───────┴───────┐
                    │       │               │ resolve
                    │       │ forward       ▼
                    │       │        ┌─────────────┐
                    │       └───────>│  RESOLVED   │
                    │                └──────┬──────┘
                    │                       │
                    │       ┌───────────────┴───────────────┐
                    │       │ verify / 5-day auto-close     │ dispute
                    │       ▼                               ▼
             ┌─────────────┐                         ┌─────────────┐
             │   CLOSED    │ [TERMINAL]              │  REOPENED   │
             └─────────────┘                         └─────────────┘
```

### 2.2 Operational Modifier States: `FORWARDED` & `ESCALATED`
- When a complaint is forwarded to another department, status becomes `FORWARDED` (awaiting triage in receiving department).
- When a complaint is escalated, it enters status `ESCALATED` (or active state with `is_escalated = true` and `escalation_tier` incremented).

### 2.3 Strict Transition Rules & Pre-Conditions

| Source State | Target State | Triggering Action | Authorized Actor | Mandatory Pre-Conditions & Invariants |
| :--- | :--- | :--- | :--- | :--- |
| `[NONE]` | `SUBMITTED` | `SubmitComplaint` | `ROLE_STUDENT` | Valid title, description ($\ge 30$ chars), category, suggested priority, location. Complainant authenticated. |
| `SUBMITTED` | `REVIEWED` | `ReviewComplaint` | `ROLE_DEPT_HEAD`, `ADMIN` | Owning department verified. |
| `REVIEWED` | `ASSIGNED` | `AssignHandler` | `ROLE_DEPT_HEAD`, `ADMIN` | `handler_id` must belong to an active user in the owning department. |
| `ASSIGNED` | `IN PROGRESS`| `AcknowledgeWork` | Assigned `ROLE_HANDLER` | Handler acknowledges task; optional initial diagnostic notes. |
| `IN PROGRESS`| `FORWARDED` | `ForwardComplaint`| Assigned Handler, Dept Head | Mandatory non-empty `forwarding_reason`. Sets new `department_id`, resets `handler_id = NULL`. |
| `IN PROGRESS`| `ESCALATED` | `EscalateComplaint`| Assigned Handler, Dept Head | Mandatory non-empty `escalation_reason`. Increments `escalation_tier`. |
| `IN PROGRESS`| `RESOLVED` | `ResolveComplaint` | Assigned `ROLE_HANDLER`, Dept Head | Mandatory resolution summary ($\ge 20$ chars). If category requires proof (`OD-007`), resolution attachment must be present. |
| `RESOLVED` | `CLOSED` | `VerifyResolution`| Complainant, Auto-close Timer | Triggered manually by complainant or by scheduled system job after verification window (`OD-008`, default 5 business days). |
| `RESOLVED` | `REOPENED` | `DisputeResolution`| Complainant (`ROLE_STUDENT`)| Permitted only within active verification window. Mandatory dispute justification required. |
| `CLOSED` | `[NONE]` | — | — | **TERMINAL STATE**. Strictly immutable (`OD-009`). No further transitions permitted. |
| `SUBMITTED` | `REJECTED` | `RejectComplaint` | `ROLE_DEPT_HEAD`, `ADMIN` | Mandatory rejection reason provided. Complainant notified. Terminal state. |

---

## 3. Atomic State Transition Pattern (Software Contract)

Every transition must execute within an atomic transaction obeying the following sequence:
1. **Validate Pre-conditions**: Verify caller permissions, valid state transition path, and required fields.
2. **Mutate Aggregate State**: Update `complaints.status`, `complaints.updated_at`, and relevant operational fields (`resolved_at`, `closed_at`, etc.).
3. **Append to Audit Journal**: Insert a new immutable record in `action_history` with full event payload.
4. **Publish Domain Event**: Emit asynchronous event (e.g., `ComplaintAssignedEvent`, `ComplaintResolvedEvent`) to notify the notification engine.

If any step fails, the entire transaction rolls back cleanly.

---

## 4. Consequences
- Impossible to execute invalid transitions (e.g. going directly from `SUBMITTED` to `CLOSED`).
- Complete state auditability.
- Code-level unit testability: State transitions can be tested 100% in pure domain unit tests without database mocks.

---

## 5. Phase Isolation
No code or database triggers implemented in Phase 02.
