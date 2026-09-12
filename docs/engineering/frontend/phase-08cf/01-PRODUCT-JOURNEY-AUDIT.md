# Phase 08-C-F: Canonical Product Journey Audit

## 1. Master Journey Architecture
Campus Plus enforces a coherent, single-path canonical product journey:
`PUBLIC LANDING (/) → CREATE ACCOUNT (/register) OR SIGN IN (/login) → AUTHENTICATION → AUTHORITATIVE SERVER ROLE RESOLUTION (/api/v1/auth/me) → ROLE-SPECIFIC PORTAL (/dashboard) → USE SYSTEM (/complaints/*) → SIGN OUT → PUBLIC LANDING (/)`

## 2. Journey-by-Journey Forensic Walkthrough

### Journey A: Public Discovery to Registration
- **Entry**: Unauthenticated visitor lands on `/`.
- **Action**: Clicks "Create Account" in header or hero section.
- **Experience**: Direct transition to `/register`. Switcher presents Student self-service intake and Staff/Faculty institutional directory guidance. Submitting student intake triggers honest `IAM-REG-PENDING` confirmation explaining registrar validation.
- **Integrity**: Zero mock endpoints, zero false positive account creations.

### Journey B: Student Lifecycle Experience
- **Entry**: Student navigates from `/` to `/login`.
- **Auth**: Enters credentials. Supabase Auth validates session.
- **Resolution**: `/api/v1/auth/me` returns `ROLE_STUDENT`. Theme colors dynamically shift to Student Blue (`#7FA8D9`).
- **Dashboard**: Routed to `/dashboard`. Student views personal metrics, active complaint cards, and quick submit action.
- **Creation**: Navigates to `/complaints/new`. Enforces domain invariants (Title 10-120 chars, Description >=30 chars). Submits and receives tracking code `CP-YYYY-XXXXX`.
- **Detail**: Navigates to `/complaints/[id]`. Inspects public milestone timeline. Internal notes are completely hidden.
- **Verification / Dispute**: If `RESOLVED`, student can confirm resolution (transitions to `CLOSED`) or dispute (reopens).
- **Exit**: Clicks "Sign Out" in TopBar. Session terminated, theme reset, hard redirect to `/`.

### Journey C: Handler Operational Experience
- **Auth**: Authenticated as `ROLE_HANDLER`. Theme shifts to Mint/Sage (`#7FC4B2`).
- **Dashboard**: Operational worklist displays assigned tasks prioritized by SLA urgency.
- **Transitions**: Can invoke "Start Progress" (`IN_PROGRESS`), "Resolve" (requires resolution summary >=20 chars), "Forward" (requires rationale >=10 chars and target department != current), or "Escalate".
- **Exit**: Clean sign-out returns to `/`.

### Journey D: HOD Department Oversight Experience
- **Auth**: Authenticated as `ROLE_DEPT_HEAD`. Theme shifts to Purple/Lavender (`#B39DDB`).
- **Dashboard**: Triage queue displays unassigned `SUBMITTED` and `REVIEWED` cases. Workload distribution cards display assigned load across department handlers.
- **Actions**: Assigns complaint to verified department handler (`INV-007`), reviews complaints, marks duplicates, or rejects invalid submissions.
- **Exit**: Clean sign-out returns to `/`.

### Journey E: Director Administrative Experience
- **Auth**: Authenticated as `ROLE_ADMIN`. Theme shifts to Steel Blue (`#9FB4C7`).
- **Purview**: Cross-departmental complaint monitoring, system health indicators, administrative categories, and immutable audit logs.
- **Exit**: Clean sign-out returns to `/`.

### Journey F: Institutional Management Executive Experience
- **Auth**: Authenticated as `ROLE_MANAGEMENT`. Theme shifts to Rose/Coral (`#E3A6AE`).
- **Purview**: Campus-wide aggregate metrics, departmental turnaround comparisons, and recurring hotspot alerts.
- **Exit**: Clean sign-out returns to `/`.

## 3. Back-Button and State Cleansing Verification
In all journeys, clicking "Sign Out" executes `window.location.replace("/")`. The browser history entry is replaced, preventing unauthorized backward navigation into cached privileged application shells.
