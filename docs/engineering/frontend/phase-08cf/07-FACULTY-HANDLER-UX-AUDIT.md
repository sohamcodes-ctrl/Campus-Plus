# Phase 08-C-F: Faculty & Handler Experience Audit

## 1. Scope & Objective
Audit the operational dashboard for assigned complaint handlers (`HandlerDashboard.tsx`).

## 2. Operational Worklist Experience
- **Role Accent**: Mint/Sage (`#7FC4B2`).
- **Worklist Layout**:
  - Filtered by assigned handler ID and department scope.
  - Clear SLA urgency indicators (Normal, Warning, Overdue).
  - Elapsed time counters for active tasks.
  - Responsive desktop table and mobile card views.
- **Action Triggers**:
  - "Start Progress": Available when status is `ASSIGNED`. Transitions to `IN_PROGRESS`.
  - "Resolve": Opens modal requiring resolution summary (minimum 20 characters) and optional proof attachment.
  - "Forward": Opens routing modal requiring target department selection (cannot be same department) and rationale (minimum 10 characters).
  - "Escalate": Opens escalation modal with reason selection.

## 3. Acceptance Status
- **Handler UX**: PASS.
- **State Transition Guardrails**: PASS.
