# Campus Plus — Complaint Lifecycle & State Machine Specification

**Phase**: Phase 01 — Requirements Engineering & Problem Intelligence  
**Document**: COMPLAINT-LIFECYCLE.md  
**Version**: 0.1  
**Status**: Draft / Conditional  
**Classification Standards**: SOURCE | DECISION | INFERENCE | PROPOSED | ASSUMPTION | UNKNOWN  

---

## 1. Executive Summary

This document specifies the formal state machine, state transition rules, lifecycle invariants, escalation semantics, and resolution criteria for complaints within **Campus Plus**. 

The lifecycle is designed to eliminate the primary gaps identified in the academic synopsis:
- Lack of a structured workflow
- Unclear complaint status
- Missing action history
- Inability to monitor pending and escalated complaints
- Inability to track complaints from submission to final resolution

---

## 2. Core Lifecycle State Machine

A complaint progresses through deterministic states. Transitions are strictly validated against caller permissions, required metadata, and transition invariants.

```text
                        ┌──────────────────────────────────────────────┐
                        │                 SUBMITTED                    │
                        └──────┬───────────────────────────────────────┘
                               │
                               │ [Triage / Review]
                               ▼
                        ┌──────────────────────────────────────────────┐
       ┌───────────────>│                  REVIEWED                    │<───────────────┐
       │                └──────┬──────────────────┬────────────────────┘                │
       │                       │                  │                                     │
       │                       │ [Assign]         │ [Reject / Flag]                     │
       │                       ▼                  ▼                                     │
       │ [Forward]      ┌──────────────┐   ┌──────────────┐                             │
       └────────────────┤   ASSIGNED   │   │   REJECTED   │                             │
                        └──────┬───────┘   └──────────────┘                             │
                               │                                                        │
                               │ [Acknowledge / Begin Work]                             │
                               ▼                                                        │
                        ┌──────────────┐                                                │
                        │ IN PROGRESS  │                                                │
                        └──────┬───────┘                                                │
                               │                                                        │
                               │ [Resolve with Notes & Evidence]                        │
                               ▼                                                        │
                        ┌──────────────┐                                                │
                        │   RESOLVED   │                                                │
                        └──────┬───────┘                                                │
                               │                                                        │
                ┌──────────────┴──────────────┐                                         │
                │ [Verify / Timeout]          │ [Dispute / Reopen]                      │
                ▼                             ▼                                         │
         ┌──────────────┐              ┌──────────────┐                                 │
         │    CLOSED    │              │   REOPENED   │─────────────────────────────────┘
         └──────────────┘              └──────────────┘
```

*Note on Parallel States / Modifiers*: `ESCALATED` and `FORWARDED` operate either as primary lifecycle states or as operational status modifiers. In this specification, we model them with explicit state transitions to guarantee complete auditability.

---

## 3. Formal State Definitions & Transition Matrix

| State Identifier | Semantic Meaning | Entry Pre-Conditions | Exit Conditions | Authorized Actors | Permitted Next States | Classification |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`SUBMITTED`** | Initial state upon creation. Complaint recorded in system with reference ID; awaiting initial triage. | User authenticated; required fields validated (title, description, category, suggested priority, location/department). | Complaint reviewed by department triage authority or auto-assigned by rule. | System (on submission by Complainant) | `REVIEWED`, `ASSIGNED`, `REJECTED`, `CANCELLED` | **SOURCE** |
| **`REVIEWED`** | Complaint has been inspected by department authority for validity, completeness, and jurisdictional routing. | Prior state `SUBMITTED` or `FORWARDED` or `REOPENED`. | Authority selects assigned handler or determines misdirection. | Dept Authority, Admin | `ASSIGNED`, `FORWARDED`, `REJECTED`, `DUPLICATE` | **INFERENCE** |
| **`ASSIGNED`** | Responsibility explicitly delegated to an identified handler/authority. | Prior state `REVIEWED` or `SUBMITTED`; valid Handler ID provided. | Handler acknowledges assignment and logs progress or initiates work. | Dept Authority, Admin | `IN PROGRESS`, `FORWARDED`, `REASSIGNED`, `ESCALATED` | **SOURCE** |
| **`IN PROGRESS`** | Assigned handler has formally acknowledged the grievance and is actively conducting investigation or remediation. | Prior state `ASSIGNED`; handler logged acknowledgement or operational note. | Handler completes remediation work or encounters operational blocker. | Assigned Handler, Dept Authority | `RESOLVED`, `FORWARDED`, `ESCALATED` | **SOURCE** |
| **`ESCALATED`** | Grievance escalated to higher administrative tier due to SLA breach, lack of progress, or operational blockage. | Triggered manually by handler/authority or automatically via SLA expiration rule (`OD-006`). | Escalation recipient reviews, intervenes, reassigns, or enforces resolution. | System (automated SLA), Handler, Dept Authority, Management | `IN PROGRESS`, `ASSIGNED`, `RESOLVED` | **SOURCE** |
| **`FORWARDED`** | Complaint transferred across departmental boundaries because initial categorization/routing was misdirected. | Forwarding authority provides mandatory transfer rationale and specifies receiving department. | Receiving department authority acknowledges receipt and accepts into triage. | Assigned Handler, Dept Authority, Admin | `REVIEWED`, `ASSIGNED` | **SOURCE** |
| **`RESOLVED`** | Remediative action completed. Mandatory resolution summary and verification evidence recorded. | Prior state `IN PROGRESS` or `ESCALATED`; mandatory resolution notes provided; optional resolution attachments logged. | Complainant verifies resolution, or dispute window closes (`OD-008`). | Assigned Handler, Dept Authority | `CLOSED`, `REOPENED` | **SOURCE** |
| **`REOPENED`** | Complainant disputes resolution validity within permitted dispute window; requires renewed triage. | Prior state `RESOLVED`; within dispute timeframe; mandatory complainant dispute reason provided. | Department authority re-reviews dispute justification and reassigns for action. | Complainant (`ROLE_STUDENT`), Dept Authority | `REVIEWED`, `ASSIGNED`, `CLOSED` | **PROPOSED** |
| **`CLOSED`** | Final terminal state. Grievance verified satisfactory by complainant or automatically closed upon expiration of dispute window. | Prior state `RESOLVED` with verification confirmation or auto-close timeout. | Terminal state. No further edits permitted. | Complainant, Dept Authority, System Auto-close | None (Terminal) | **PROPOSED** |
| **`REJECTED`** | Complaint determined invalid, abusive, non-actionable, or out of institutional purview. | Mandatory rejection rationale provided by reviewing authority. | Terminal state (complainant notified with explicit reason). | Dept Authority, Admin | None (Terminal) or `REOPENED` via appeal | **INFERENCE** |
| **`DUPLICATE`** | Grievance represents identical issue already filed and active. | Master complaint reference ID linked to duplicate record. | Terminal state (linked to master ticket). | Dept Authority, Admin | None (Terminal) | **INFERENCE** |
| **`CANCELLED`** | Grievance withdrawn by original complainant prior to handler triage. | Prior state `SUBMITTED` or `REVIEWED`; initiator is original complainant. | Terminal state. | Complainant (`ROLE_STUDENT`) | None (Terminal) | **PROPOSED** |

---

## 4. Assignment, Reassignment & Forwarding Semantics

### 4.1 Initial Assignment
1. **Target**: Must specify a valid, active user possessing `ROLE_HANDLER` or a specific sub-unit within the department.
2. **Pre-condition**: Complaint must belong to the department of the assigning authority.
3. **Audit Invariant**: An immutable audit entry must record: `assignor_id`, `handler_id`, `timestamp`, and optional `instruction_note`.

### 4.2 Reassignment vs. Forwarding
- **Reassignment (Intra-Department)**:
  - Definition: Delegating the complaint to a different handler *within the same department*.
  - Trigger: Workload balancing, handler absence, or specialized domain expertise.
  - Permitted Actor: Department Authority (`ROLE_DEPT_HEAD`), System Admin.
- **Forwarding (Inter-Department)**:
  - Definition: Transferring jurisdictional ownership *across department boundaries*.
  - Trigger: Miscategorization by complainant, multi-departmental dependency.
  - Requirement: Forwarder MUST provide a formal `forwarding_reason`. The complaint transitions to `FORWARDED` / `REVIEWED` in the receiving department.

---

## 5. Escalation Semantics & Workflow

### 5.1 Escalation Triggers
1. **Manual Escalation**:
   - Authorized Handler or Department Head initiates escalation when resolution requires executive intervention, procurement approval, or disciplinary committee review.
   - Requirement: Explicit escalation reason and target escalation tier.
2. **Time-Based / Automated Escalation (SLA Breach)**:
   - Evaluated periodically by system if an SLA policy is defined (`OD-006`).
   - Trigger: Complaint remains in `ASSIGNED` or `IN PROGRESS` without status update beyond configured threshold.

### 5.2 Escalation Tiers
- **Tier 1 (Base Handling)**: Assigned Handler / Staff.
- **Tier 2 (Departmental Escalation)**: Head of Department / Department Grievance Officer.
- **Tier 3 (Institutional Escalation)**: Central Campus Grievance Redressal Committee / Principal / Dean.

### 5.3 Escalation Invariants
- An escalated complaint NEVER loses its prior action history or assigned ownership context.
- High-priority notifications MUST be dispatched to both current handler and target escalation tier immediately upon escalation event.

---

## 6. Resolution & Verification Semantics

### 6.1 Requirements to Mark "RESOLVED"
To transition a complaint from `IN PROGRESS` or `ESCALATED` to `RESOLVED`, the system MUST enforce the following pre-conditions:
1. **Resolution Summary**: Plain text description (minimum character constraint, e.g., 20 chars) detailing what corrective action was executed.
2. **Action Timestamp**: Recorded automatically at the point of transition.
3. **Resolution Actor**: Authenticated user ID of the resolving handler or authority.
4. **Resolution Evidence (Attachments)**: Optional or mandatory based on complaint category (e.g., photo proof for physical infrastructure repairs) (`OD-007`).

### 6.2 Verification & Closure Workflow
1. When marked `RESOLVED`, complainant is notified immediately.
2. Complainant is granted a verification window (e.g., 5 business days, configurable via `OD-008`).
3. If Complainant confirms satisfaction: Status transitions to `CLOSED`.
4. If Complainant disputes resolution: Must provide dispute justification; status transitions to `REOPENED`.
5. If Complainant takes no action before window expires: System automatically transitions status to `CLOSED`.

---

## 7. Action History & Audit Invariants

The source synopsis explicitly mandates: *"The system also maintains a complete history of actions ... Audit/Action History"*.

Every event in the complaint lifecycle must produce an immutable record structured as follows:

```text
Action History Entry:
├── history_id (UUID / Unique identifier)
├── complaint_id (Foreign reference)
├── timestamp (UTC, system-generated)
├── actor_id (Authenticated user ID or "SYSTEM")
├── actor_role (Role at time of action)
├── action_type (SUBMISSION | ASSIGNMENT | STATUS_CHANGE | FORWARD | ESCALATE | COMMENT | RESOLVE | REOPEN | CLOSE)
├── previous_state (Null on submission)
├── new_state (Current state)
├── metadata / payload:
│     ├── assigned_to_id
│     ├── assigned_from_id
│     ├── forwarding_reason
│     ├── escalation_reason
│     ├── resolution_notes
│     └── attachment_refs
└── visibility_level (PUBLIC_TO_COMPLAINANT | INTERNAL_AUTHORITY_ONLY)
```

**Audit Invariant Rules**:
- Historical entries are **strictly append-only**.
- No user, including `ROLE_ADMIN`, has permission to modify, overwrite, or delete action history entries.
- Complainants have full visibility into lifecycle transitions and public notes; internal operational remarks are marked `INTERNAL_AUTHORITY_ONLY`.

---

## 8. State Transition Invariants (Sanity Checks)

1. **No Orphan Complaints**: A complaint in `ASSIGNED`, `IN PROGRESS`, or `RESOLVED` state MUST reference an active handler.
2. **No Terminal Mutation**: Once a complaint reaches `CLOSED`, its state cannot be transitioned without an explicit administrative appeal/reopen override (`OD-009`).
3. **Sequential Escalation**: A complaint cannot be escalated if it is already in `RESOLVED` or `CLOSED` status.
4. **Complainant Identity Immutability**: The original complainant identity cannot be modified after initial submission.

---

## 9. Verification Checklist

- [x] All states mapped to source requirements (`SUBMITTED`, `ASSIGNED`, `IN PROGRESS`, `FORWARDED`, `ESCALATED`, `RESOLVED`).
- [x] Complete transition pre-conditions and post-conditions defined.
- [x] Clear demarcation between intra-department reassignment and inter-department forwarding.
- [x] Resolution criteria mandate actionable notes and timestamping.
- [x] Strict append-only audit trail invariants established.
