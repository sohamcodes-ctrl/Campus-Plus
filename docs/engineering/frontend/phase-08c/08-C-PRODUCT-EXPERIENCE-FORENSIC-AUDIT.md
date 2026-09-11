# Campus Plus — Phase 08-C: Product Experience Forensic Audit

**Document Classification:** Product Engineering & Architecture Audit  
**Authority:** Principal Frontend Architect, Senior React / Next.js Engineer, Application Security Engineer  
**Stage:** Transition from 08-C-D into 08-C-E → 08-C-J  
**Date:** 2026-09-11  
**Status:** COMPLETED & VERIFIED  

---

## 1. Executive Summary

A comprehensive architectural and experiential audit of the Campus Plus frontend repository was performed across `src/app/`, `src/presentation/`, `src/domain/`, `src/infrastructure/`, and the live Supabase/PostgreSQL database.

While Phase 08-C-D established a robust routing foundation, design token architecture, and 9-state authentication state machine, the current application surfaces are largely architectural stubs:
1. **Authentication Access Barrier:** While the login form initializes empty with zero hardcoded credentials, zero test users were provisioned in Supabase Auth (`auth.users`), preventing evaluators and developers from signing in to inspect the role experiences.
2. **Dashboard Uniformity:** `src/app/dashboard/page.tsx` renders a single generic table for all roles rather than five distinct, role-tailored operational workflows.
3. **Incomplete Intake & Detail Surfaces:** `/complaints/new` is a static placeholder card; `/complaints/[id]` lacks contextual lifecycle action modals (Review, Assign, Progress, Forward, Escalate, Resolve, Verify, Dispute) and OCC concurrency handling.

This document establishes the baseline facts and architectural contracts necessary to reconstruct the complete product experience.

---

## 2. Forensic Codebase & Subsystem Inventory

### 2.1 Route Map (`src/app/`)
| Route | Type | Current State | Target State |
|---|---|---|---|
| `/` | Static | State-aware root entry (redirects authenticated to `/dashboard`, unauthenticated to `/login`) | Preserved |
| `/login` | Client/Static | Two-column institutional portal; lacks staging account discovery/fill helper | Add staging demonstration selector for isolated dev/staging environments |
| `/dashboard` | Protected | Single generic 10-item table for all roles | Dynamically render 5 distinct role experiences: Student, Handler, HOD, Management, Admin |
| `/complaints` | Protected | Redirects to `/dashboard` | Dedicated filterable, searchable complaint management table |
| `/complaints/new` | Protected | Static placeholder card | Progressive 8-step intake workflow with validation, character counts, location picker, and file uploader |
| `/complaints/[id]` | Protected | Read-only details + timeline feed; lacks action triggers | Interactive lifecycle hub with state-aware mutation modals, role-scoping (hiding internal notes for students), and OCC conflict handling |

### 2.2 Reusable Component Inventory (`src/presentation/components/`)
| Category | Components Available | Readiness & Gaps |
|---|---|---|
| **Primitives** | `Button`, `Card`, `Badge`, `Skeleton`, `Divider` | 100% complete; supports variants, sizes, loading states |
| **Forms** | `TextInput`, `TextArea`, `Select`, `RadioGroup`, `SearchInput` | 100% complete; accessible IDs, helper text, error styling |
| **Feedback** | `AlertBanner`, `Toast`, `EmptyState` | Complete; requires deployment across empty search & error states |
| **Overlays** | `Modal`, `Drawer`, `ConfirmDialog`, `ConflictModal` | Complete; `ConflictModal` ready for 409 OCC conflicts |
| **Domain** | `StatusPill`, `PriorityBadge`, `TrackingCodeBadge`, `TimelineFeed`, `FileUploader` | Complete; ready for integration into complaint surfaces |
| **Shell** | `AppShell`, `TopBar`, `Sidebar`, `MobileNav`, `Breadcrumbs`, `ForbiddenState`, `ShellError`, `ShellLoading` | Complete; role-aware navigation active |

---

## 3. Database Reality & Account Provisioning Audit

### 3.1 Live Supabase Auth vs Public Schema
- **`public.users`:** Contains 7 seed records with active roles and department memberships:
  - `student.a@synthetic.campusplus.internal` (ROLE_STUDENT)
  - `student.b@synthetic.campusplus.internal` (ROLE_STUDENT)
  - `handler.it1@synthetic.campusplus.internal` (ROLE_HANDLER, IT Dept)
  - `handler.hostel1@synthetic.campusplus.internal` (ROLE_HANDLER, Hostel Dept)
  - `hod.it@synthetic.campusplus.internal` (ROLE_DEPT_HEAD, IT Dept)
  - `management@synthetic.campusplus.internal` (ROLE_MANAGEMENT)
  - `sysadmin@synthetic.campusplus.internal` (ROLE_ADMIN)
- **`auth.users` (Supabase Auth Service):** **0 records**.
- **Root Cause of Access Inability:** Supabase Auth has never had these users created. Attempting to sign in with any email results in Supabase rejecting with "Invalid login credentials".
- **Resolution Strategy:** Author a secure server-side provisioning script using `supabase.auth.admin.createUser()` with `SUPABASE_SERVICE_ROLE_KEY` to provision the five staging accounts, ensuring their `auth.users.id` matches `public.users.id`.

---

## 4. Five Role Experience Gaps & Architectural Specifications

### 4.1 Role 1: Student / Complainant
- **Objective:** Submit, track, view progress, verify resolution, dispute.
- **Current State:** Sees generic table; no "Submit Grievance" prominent banner; no active count breakdown.
- **Target Specification:**
  - Greeting with personal identifier.
  - Prominent "Submit a Complaint" primary CTA.
  - Metrics cards (Total, Active, Pending Verification, Resolved, Closed) computed from real API data.
  - "My Active Complaints" table with tracking code, category, status, priority, and date.
  - Action-required banner if a complaint is `RESOLVED` (prompts for verification).

### 4.2 Role 2: Complaint Handler / Assigned Authority
- **Objective:** Work queue, review assigned items, start progress, forward, escalate, resolve.
- **Target Specification:**
  - Action-oriented dashboard: "My Assigned Worklist" vs "Department Queue".
  - Quick filters: Priority, Status, SLA risk.
  - Direct actions on complaints in `ASSIGNED` (Start Progress) and `IN_PROGRESS` (Resolve, Forward, Escalate).

### 4.3 Role 3: HOD / Department Authority
- **Objective:** Department oversight, triage unassigned complaints, assign handlers, review escalations.
- **Target Specification:**
  - Triage queue: Complaints in `SUBMITTED` or `REVIEWED` awaiting handler assignment.
  - Escalations panel: Tier 2 escalations requiring department head intervention.
  - Honest analytics state: "Department aggregate analytics will be displayed once the analytics aggregation service is enabled."

### 4.4 Role 4: Institutional Management / Senior Authority
- **Objective:** Campus-wide governance, critical escalations, chronic issue monitoring.
- **Target Specification:**
  - Executive calm dashboard.
  - Cross-department escalation queue (Tier 3 escalations).
  - High-priority / urgent complaint monitor.
  - Honest analytics state: "Campus-wide statistical aggregates require the analytics aggregation engine."

### 4.5 Role 5: System Administrator
- **Objective:** Operational health, system liveness, configuration visibility, audit governance.
- **Target Specification:**
  - Live system health widget connected to `GET /api/health`.
  - System role registry and department directory visibility.
  - Audit log immutability status.
  - Does NOT gain arbitrary complaint lifecycle mutation powers.

---

## 5. Security & Architectural Invariants

1. **Server Authorization Finality:** The client-side UI uses role information solely for the purpose of navigation, theming, and layout. All mutation operations execute on the server under strict `AuthorizationPolicy` checks.
2. **OCC Concurrency (409 Conflict):** Every state transition payload must submit `expectedVersion`. On 409, `ConflictModal` is displayed.
3. **Idempotency Boundary:** Only `POST /api/v1/complaints` includes `Idempotency-Key`.
4. **Privacy / BOLA:** Students never see internal notes or other students' complaints.

---

## 6. Audit Conclusion
The architectural foundation is complete and rock-solid. Reconstructing the product experience requires:
1. Server-side provisioning of staging accounts.
2. Development-only staging account discovery helper on `/login`.
3. Modular, role-specific dashboard views in `/dashboard`.
4. Production-grade `/complaints/new` submission wizard.
5. Interactive `/complaints/[id]` detail hub with lifecycle action modals.
