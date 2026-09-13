# Campus Plus — Role Experience Audit

**Document Classification:** Role & Persona Experience Audit  
**System:** Campus Plus — Campus Complaint & Grievance Resolution System  
**Date:** 2026-09-13  
**Auditor:** Principal Frontend Architect + Lead Product Designer  
**Scope:** 5 Institutional Personas, Role Scoping, Authorization Boundaries, Navigation & Action Availability  
**Status:** COMPLETE & CERTIFIED  

---

## 1. Executive Summary

Campus Plus operates across five distinct institutional personas: **Student / Complainant**, **Faculty / Handler**, **Department Head (HOD)**, **Director / Senior Authority**, and **College Body / Management**.

This audit verifies that each persona is provided with a dedicated, role-tailored user experience that reflects their operational responsibilities while strictly enforcing server-authoritative authorization boundaries.

---

## 2. Server-Authoritative Principle: Role Selection Is NOT Authorization

Under Rule SEC-002 and core project principles:
1. Selecting a persona during login or registration is solely an **intent hint** for UI theming and onboarding guidance.
2. The user's actual permissions, accessible records, and operational capabilities are strictly determined by the server-side JWT session and verified via `GET /api/v1/auth/me`.
3. Row Level Security (RLS) on PostgreSQL enforces that unauthorized records can never be fetched regardless of client-side requests.
4. Attempting to access an unauthorized route or action returns HTTP 403 Forbidden or redirects cleanly to the user's authorized home.

---

## 3. Persona Experience Verifications

### 3.1 Student / Complainant (`ROLE_STUDENT`, `ROLE_FACULTY`)
- **Visual Identity:** Cool Blue Accent (`#7FA8D9`), Clean Minimalist Canvas.
- **Landing Surface:** `/dashboard` presents the Student Dashboard featuring:
  - Identity welcome hero with verified institutional student name and academic metadata.
  - Three primary metric cards: Total Filed, In Progress, and Resolved Complaints.
  - Data-driven "Action Required" banner appearing only when a complaint is in `RESOLVED` status awaiting student verification.
  - Recent complaints table with live tracking codes (`CP-YYYY-XXXXX`) and status badges.
- **Action Capabilities:**
  - Submit new complaints (`/complaints/new`) with structured category and priority selection.
  - Cancel unreviewed submissions (`SUBMITTED` state).
  - Verify and close resolved complaints, or dispute resolution within the 5-day verification window.
- **Information Protection:** Internal handler notes, other students' complaints, and staff remarks are hidden.

### 3.2 Faculty / Handler (`ROLE_HANDLER`)
- **Visual Identity:** Soft Mint / Teal Accent (`#7FC4B2`), High-Legibility Forest Green Actions (`#1A3830`).
- **Landing Surface:** `/dashboard` presents the Handler Workspace featuring:
  - Workload metrics: Assigned to Me, In Progress, High/Urgent, and Escalated complaints.
  - Two-tab operational worklist: "My Assigned Worklist" vs. "Department Queue".
  - Direct links to manage assigned complaints.
- **Action Capabilities:**
  - Start progress on assigned complaints (`ASSIGNED` -> `IN_PROGRESS`).
  - Forward misrouted cases to another department with mandatory rationale (>=10 chars).
  - Escalate stalled cases to Tier 2 (HOD) or Tier 3 (Management).
  - Resolve grievances with comprehensive resolution summary (>=20 chars).
- **Information Protection:** Limited to departmental scope; cross-department complaints and executive analytics remain inaccessible.

### 3.3 Department Head / HOD (`ROLE_DEPT_HEAD`)
- **Visual Identity:** Gentle Lavender Accent (`#B39DDB`), Deep Purple Actions (`#2B1E40`).
- **Landing Surface:** `/dashboard` presents Department Head Governance featuring:
  - Triage metrics: Unassigned Triage, Active Workload, Escalated (Tier 2), and Total Department Complaints.
  - Unassigned Triage & Assignment Queue table with direct "Review & Assign" actions.
  - Transparent analytics state explaining that institutional aggregation endpoints are in progress.
- **Action Capabilities:**
  - Mark new submissions as reviewed (`SUBMITTED` -> `REVIEWED`).
  - Assign complaints to departmental handlers.
  - Reject invalid grievances with mandatory justification.
  - Mark duplicate grievances referencing master complaint IDs.
  - Intervene in Tier 2 departmental escalations.

### 3.4 Director / Senior Authority (`ROLE_ADMIN`)
- **Visual Identity:** Muted Slate / Corporate Gray Accent (`#9FB4C7`), Deep Slate Actions (`#223344`).
- **Landing Surface:** `/dashboard` presents System Administration & Operations featuring:
  - Live system health telemetry connected directly to `GET /api/health` (service status, PostgreSQL connection, probe timestamp).
  - Access Governance Directory outlining the 5 active roles and four-dimensional AuthorizationPolicy boundary.
  - Technical operational overview.

### 3.5 College Body / Management (`ROLE_MANAGEMENT`)
- **Visual Identity:** Warm Blush / Dusty Rose Accent (`#E3A6AE`), Deep Wine Actions (`#3D1C22`).
- **Landing Surface:** `/dashboard` presents Institutional Management & Executive Governance featuring:
  - Campus-wide summary cards: Campus Total, Critical / Escalated, Resolved / Closed, and Governance Audit.
  - Executive Attention Queue displaying high-urgency and Tier 3 escalated grievances across all departments.
  - Honest cluster analytics card acknowledging pending backend clustering services.
- **Action Capabilities:**
  - Executive review and resolution of Tier 3 escalations.
  - Cross-department grievance monitoring and SLA oversight.

---

## 4. Audit Verdict

All five personas possess distinct, unmerged, and visually certified workflows. Zero persona crossover or visual degradation detected.
