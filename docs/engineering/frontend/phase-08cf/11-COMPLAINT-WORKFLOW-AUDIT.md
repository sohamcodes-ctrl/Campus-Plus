# Phase 08-C-F: Complaint Workflow & State Machine Audit

## 1. Scope & Objective
Audit the complaint state machine, transitions, timeline, and optimistic concurrency control.

## 2. Lifecycle States Audited
The system implements a 13-state deterministic finite state machine:
- `DRAFT`: Local draft state.
- `SUBMITTED`: Formal intake completed.
- `REVIEWED`: Department head triaged.
- `ASSIGNED`: Handler allocated.
- `IN_PROGRESS`: Operational work initiated.
- `FORWARDED`: Transferred to another department (anti-deadlock triggers Tier 3 escalation after 3 hops).
- `ESCALATED`: Escalated to Tier 2 (HOD) or Tier 3 (Management).
- `RESOLVED`: Handler submitted resolution summary.
- `CLOSED`: Terminal state; complainant verified or auto-closed.
- `REOPENED`: Complainant disputed resolution.
- `REJECTED`: Out of scope or invalid.
- `DUPLICATE`: Linked to master case.
- `CANCELLED`: Withdrawn by student prior to triage.

## 3. Optimistic Concurrency Control (OCC)
All mutation requests submit `expectedVersion`. Concurrent modifications result in HTTP 409 Conflict, prompting the user to refresh their view and preventing lost updates.

## 4. Acceptance Status
- **FSM Transitions**: PASS.
- **OCC Integrity**: PASS.
