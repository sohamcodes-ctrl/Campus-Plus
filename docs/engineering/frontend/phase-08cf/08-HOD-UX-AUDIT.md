# Phase 08-C-F: Department Head (HOD) Experience Audit

## 1. Scope & Objective
Audit the department oversight portal (`HodDashboard.tsx`).

## 2. Department Management Experience
- **Role Accent**: Lavender/Purple (`#B39DDB`).
- **Triage Queue**: Displays incoming unassigned complaints in `SUBMITTED` and `REVIEWED` states.
- **Workload Distribution**: Visual cards showing active assigned cases per departmental handler.
- **Escalation Queue**: Immediate visibility of Tier 2 escalated cases requiring intervention.
- **Actions**:
  - "Review": Marks complaint reviewed.
  - "Assign Handler": Enforces department boundaries (`INV-007`); handlers outside the department cannot be assigned.
  - "Reject": Requires rejection rationale.
  - "Mark Duplicate": Links to existing master complaint reference.

## 3. Acceptance Status
- **HOD UX**: PASS.
- **Department Boundary Enforcement**: PASS.
