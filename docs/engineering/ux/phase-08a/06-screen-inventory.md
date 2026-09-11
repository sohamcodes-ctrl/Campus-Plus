# Phase 08-A: Master Screen Inventory

**Document Identifier:** `06-screen-inventory.md`  
**Classification:** Enterprise UX / Product Experience Blueprint  
**Standard:** Every screen receives a stable unique identifier, role mapping, data dependencies, API endpoints, error states, and responsive specifications.

---

## 1. Screen Inventory Index

| Screen ID | Screen Name | Target Persona | Route / URL | Primary User Goal | Boundary |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **`AUTH-001`** | **Login & Institutional Sign-In** | All Users | `/login` | Secure authentication via credentials / institutional SSO | MVP |
| **`AUTH-002`** | **Account Onboarding / Signup** | New Users | `/register` | Initial account provisioning (where self-signup enabled) | Post-MVP |
| **`STU-001`** | **Student Complainant Dashboard** | Student | `/dashboard` | Personal grievance portfolio, active counts, recent updates | MVP |
| **`STU-002`** | **Complaint Intake Submission Form**| Student | `/complaints/new` | Structured grievance submission with evidence upload | MVP |
| **`STU-003`** | **Complaint Detail & Public Timeline**| Student | `/complaints/[id]` | Transparent status monitoring, public timeline, verification | MVP |
| **`STU-004`** | **Verification & Dispute Modal** | Student | Dialog in `STU-003` | Verify satisfactory resolution or lodge formal dispute | MVP |
| **`FAC-001`** | **Handler Operational Dashboard** | Handler | `/dashboard` | Worklist of assigned complaints, SLA urgency countdowns | MVP |
| **`FAC-002`** | **Complaint Remediation Workspace** | Handler | `/complaints/[id]` | Full technical details, evidence, private notes, actions | MVP |
| **`FAC-003`** | **Forwarding Transfer Dialog** | Handler, HOD | Dialog in `FAC-002` | Inter-department transfer with mandatory rationale | MVP |
| **`FAC-004`** | **Escalation Request Dialog** | Handler, HOD | Dialog in `FAC-002` | Tier 2/3 escalation with justification categories | MVP |
| **`FAC-005`** | **Resolution Submission Dialog** | Handler, HOD | Dialog in `FAC-002` | Remediation summary narrative and photo proof upload | MVP |
| **`HOD-001`** | **Department Triage & Oversight** | Dept Head | `/dashboard` | Untriaged queue, handler workloads, overdue alerts | MVP |
| **`HOD-002`** | **Handler Assignment Dialog** | Dept Head | Dialog in `HOD-001` | Delegate primary responsibility to technician | MVP |
| **`HOD-003`** | **Rejection Justification Dialog** | Dept Head | Dialog in `HOD-001` | Reject out-of-scope or abusive complaint with reason | MVP |
| **`HOD-004`** | **Duplicate Link Dialog** | Dept Head | Dialog in `HOD-001` | Link duplicate ticket to master tracking code | MVP |
| **`MGT-001`** | **Executive Intelligence Dashboard**| Management | `/dashboard` | Institutional volume KPIs, turnaround trends, Tier 3 queue | MVP |
| **`MGT-002`** | **Recurrence Hotspots Explorer** | Management, HOD| `/analytics/hotspots`| Cluster analysis of repetitive failures (>=3 in 30 days) | MVP |
| **`MGT-003`** | **Department Turnaround Matrix** | Management | `/analytics/depts` | Comparative SLA compliance and overdue rates | MVP |
| **`ADM-001`** | **System Health & Observability** | System Admin | `/dashboard` | Runtime probes, database latency, outbox lag, security | MVP |
| **`ADM-002`** | **Taxonomy & Role Administration** | System Admin | `/admin/taxonomy` | Department directory, category proof rules, role mapping | MVP / Gap |
| **`SHR-001`** | **In-App Notification Center** | All Users | Global Header | Real-time event notifications with deep-links | MVP |
| **`SHR-002`** | **Multi-Criteria Search Modal** | All Users | Global Header | Code search, category, priority, status filters | MVP |
| **`SHR-003`** | **Complaint Status Badge System** | All Users | Shared Component | Visual & semantic status indicator | MVP |
| **`SHR-004`** | **Audit Timeline Component** | All Users | Shared Component | Chronological event list (Public vs Internal view) | MVP |

---

## 2. Detailed Screen Specifications

### `AUTH-001`: Institutional Login Page
- **Purpose:** Primary identity boundary verifying user institutional credentials (`SEC-001`).
- **Role:** Unauthenticated visitors.
- **Entry Points:** Direct navigation or automatic redirect from protected routes.
- **Exit Points:** On success -> Role-specific `/dashboard`.
- **Primary Action:** `[Sign In]` button.
- **Information Hierarchy:**
  1. Campus Plus brand logo & Institutional identity header.
  2. Email input (validated institutional domain).
  3. Password input (secure masking with toggle).
  4. Submit button with loading spinner.
  5. Help text / contact institutional IT administrator.
- **API Dependencies:** Supabase Auth `signInWithPassword`.
- **States:** Default, Submitting, Error (Invalid credentials / account deactivated), Session Expired.
- **Accessibility:** Autocomplete attributes (`username`, `current-password`), explicit focus rings.

---

### `STU-001`: Student Complainant Dashboard
- **Purpose:** Central grievance management hub for students (`FR-021`).
- **Role:** Authenticated Student (`ROLE_STUDENT`).
- **Entry Points:** Successful login or clicking navigation home.
- **Primary Action:** `[Submit New Complaint]` button (prominent primary styling `#7FA8D9`).
- **Information Hierarchy:**
  1. **Summary Metric Cards:**
     - *Active Complaints* (Count badge)
     - *Pending My Verification* (Urgent amber badge if count > 0)
     - *Resolved & Closed* (Historical count)
  2. **Pending Verification Banner:** High-visibility banner prompting student to verify resolutions awaiting action (`UJ-STU-005`).
  3. **Recent Complaints List / Cards:**
     - Reference ID (`CP-YYYY-XXXXX`), Title, Category, Status Badge (`SHR-003`), Suggested Priority, Created Date.
  4. **Filter Tabs:** All, Active, Pending Verification, Closed.
- **API Dependencies:** `GET /api/v1/complaints` (implicitly filtered to complainant ID).
- **Empty State:** "You have no active complaints. If you observe an issue on campus, click Submit New Complaint."
- **Responsive Behavior:** 3-column metric grid on desktop stacks vertically on mobile; cards span full width.

---

### `STU-002`: Complaint Intake Submission Form
- **Purpose:** Intake structured grievance data, validate constraints, and bind evidence (`FR-001`).
- **Role:** Authenticated Student or Faculty (`ROLE_STUDENT`, `ROLE_FACULTY`).
- **Entry Points:** `[Submit New Complaint]` button from `STU-001`.
- **Exit Points:** On submit -> Success modal with tracking reference; On cancel -> `STU-001`.
- **Primary Action:** `[Confirm & Submit Complaint]`.
- **Information Hierarchy:**
  1. Header with explanatory text: "Submit an official grievance for departmental resolution."
  2. **Core Information Section:**
     - *Title:* Text input (10–120 characters) with live character counter (`chk_complaint_title_len`).
     - *Category:* Select dropdown from active categories.
     - *Owning Department:* Auto-suggested from category default, user-modifiable.
     - *Description:* Textarea (minimum 30 characters) with counter (`chk_complaint_desc_len`).
  3. **Location Details Section:**
     - Campus, Building, Block, Floor, Room/Area structured selectors + detailed physical notes.
  4. **Urgency & Evidence Section:**
     - *Suggested Priority:* Radio cards (`LOW`, `MEDIUM`, `HIGH`, `URGENT`).
     - *Attachments Dropzone:* File upload supporting up to 3 files (max 5MB each, JPEG/PNG/PDF).
  5. Submission Summary & confirmation checkbox.
- **API Dependencies:** `POST /api/v1/attachments/presign-upload`, `POST /api/v1/complaints`.
- **Validation:** Live client validation matching domain value objects; error states highlight offending inputs with aria-describedby links.
- **Security Considerations:** Direct binary upload to private storage bucket via time-limited presigned URL (`SEC-005`); files never pass through application memory.

---

### `STU-003`: Complaint Detail & Public Timeline
- **Purpose:** Complainant-facing tracking view providing complete visibility into lifecycle progress (`FR-006`).
- **Role:** Authenticated Student (complainant owner).
- **Entry Points:** Click card from `STU-001`, search modal, or notification deep-link.
- **Primary Action:** Conditional on status:
  - If `RESOLVED`: Prominent `[Verify & Close Complaint]` button.
  - If `SUBMITTED`: `[Cancel Complaint]` button.
- **Secondary Actions:** `[Dispute Resolution]` (when `RESOLVED`), `[Back to Dashboard]`.
- **Information Hierarchy:**
  1. **Header Bar:** Tracking Code (`CP-YYYY-XXXXX`), Status Badge (`SHR-003`), Priority, Created At.
  2. **Status Banner:** Explains current operational phase in clear language (e.g. "Your complaint is assigned to IT Maintenance and remediation is currently in progress").
  3. **Grievance Narrative:** Title, Category, Location, Full Description, Submitted Evidence Attachments.
  4. **Resolution Box (Visible only when RESOLVED or CLOSED):** Corrective action summary, resolution timestamp, and proof photo.
  5. **Public Timeline (`SHR-004`):** Chronological milestone nodes showing date, action, and public notes. **Internal notes strictly omitted (`INV-012`).**
- **API Dependencies:** `GET /api/v1/complaints/[id]`, `GET /api/v1/complaints/[id]/timeline`.
- **Security / RLS:** Returns 403/404 if accessed by unauthorized student (BOLA defense).

---

### `FAC-001`: Handler Operational Dashboard
- **Purpose:** Worklist management for assigned departmental staff (`FR-022`).
- **Role:** Authenticated Handler (`ROLE_HANDLER`).
- **Primary Action:** Open selected complaint to begin work.
- **Information Hierarchy:**
  1. **Urgency KPI Counters:**
     - *Assigned to Me* (Total active tasks)
     - *SLA Near Breach* (Amber indicator: <24h remaining)
     - *SLA Overdue* (Red pulse indicator)
     - *In Progress* (Active remediation)
  2. **My Worklist Table / Cards:**
     - Priority Pill (`URGENT`, `HIGH`), Reference ID, Title, Category, Status, SLA Countdown, Quick Action button.
  3. **Department Overview Queue:** Collapsible tab showing unassigned tickets in the handler's department.
- **API Dependencies:** `GET /api/v1/complaints` (filtered by `assigned_handler_id` and `department_id`).
- **Empty State:** "You have no complaints currently assigned. Check the department queue for unassigned tickets."

---

### `FAC-002`: Complaint Remediation Workspace
- **Purpose:** Full-featured operational management console for handlers (`FR-011`, `FR-015`).
- **Role:** Assigned Handler or Department Head.
- **Entry Points:** `FAC-001` worklist row click.
- **Primary Actions (Context-Sensitive):**
  - If `ASSIGNED`: `[Start Progress]`
  - If `IN_PROGRESS` or `ESCALATED`: `[Resolve Complaint]`
- **Secondary Actions:** `[Forward Cross-Dept]` (`FAC-003`), `[Escalate Ticket]` (`FAC-004`).
- **Information Hierarchy:**
  1. **Header:** Reference ID, Status Badge, Official Priority selector (`FR-012`), SLA Due Date, Assigned Handler Tag.
  2. **Complainant Information Card (`PRIV-001`):** Student name, PRN/Roll, Department. Contact phone/email displayed only to assigned technician.
  3. **Complaint Narrative & Evidence:** Student description, location, and download links for initial attachments.
  4. **Action Command Bar:** Primary transition buttons with OCC `expectedVersion` tracking.
  5. **Tabbed Workspace:**
     - *Tab 1: Action History & Timeline:* Full append-only audit trail including assignment changes and forwarding rationale.
     - *Tab 2: Internal Staff Notes:* Secure collaborative message thread visible only to department staff (`INV-012`, `PRIV-002`).
- **API Dependencies:** `GET /api/v1/complaints/[id]`, `GET /api/v1/complaints/[id]/timeline`, state mutation endpoints.

---

### `HOD-001`: Department Triage & Oversight Dashboard
- **Purpose:** Departmental grievance governance, triage queue, workload monitoring, and SLA enforcement (`FR-023`).
- **Role:** Department Head (`ROLE_DEPT_HEAD`).
- **Information Hierarchy:**
  1. **Triage Queue Widget (Top Priority):**
     - Count badge of unassigned `SUBMITTED` / `REVIEWED` tickets.
     - Quick-action buttons: `[Review]`, `[Assign Handler]`, `[Forward]`.
  2. **Staff Workload Distribution:**
     - Grid of departmental technicians showing active tickets, in-progress tasks, and overdue counts.
     - Direct button to reassign complaints to balance capacity (`FR-009`).
  3. **SLA Overdue & Critical Warning List:**
     - High-visibility table of complaints violating or near SLA breach.
  4. **Department Recurring Hotspots:**
     - Surface recurring issue clusters within the department (`FR-025`).
- **API Dependencies:** `GET /api/v1/complaints` (department-scoped).

---

### `MGT-001`: Executive Intelligence Dashboard
- **Purpose:** Strategic campus-wide monitoring for executive leadership (`FR-024`).
- **Role:** Institutional Management (`ROLE_MANAGEMENT`), Principal, Deans.
- **Information Hierarchy:**
  1. **Campus Operational KPIs:**
     - *Total Complaints Inflow* (Rolling 30 days)
     - *Campus Resolution Rate %*
     - *Average Turnaround Days*
     - *Active Tier 3 Critical Escalations*
  2. **Department Performance Breakdown:** Bar chart / table comparing resolution times and overdue percentages across departments.
  3. **Critical Escalations Queue:** Table of Tier 3 escalated complaints requiring executive intervention.
  4. **Recurring Hotspot Alerts:** Highlighted summary cards of active campus infrastructure clusters.
- **API Dependencies:** Analytical endpoints, `recurring_complaint_clusters` view.

---

### `MGT-002`: Recurring Issues Hotspots Explorer
- **Purpose:** Deep-dive analysis into chronic physical and systemic breakdowns (`FR-025`, `BR-023`, `ADR-010`).
- **Role:** Institutional Management, Campus Infrastructure Head.
- **Information Hierarchy:**
  1. **Filter Header:** Category filter, Building/Location selector, Timeframe toggle (30, 60, 90 days).
  2. **Cluster Cards:**
     - Grouping: Department + Category + Normalized Location (e.g. "Civil Maintenance — Plumbing — Boys Hostel 2").
     - Metrics: Incident count (minimum 3), active unresolved count, first reported date, last reported date.
  3. **Constituent Complaints Table:**
     - Expanding a cluster card reveals the individual ticket references (`CP-YYYY-XXXXX`), statuses, and assigned handlers.
     - Does not merge tickets (`BR-024`); each retains independent tracking.
- **API Dependencies:** Database view `recurring_complaint_clusters`.

---

### `ADM-001`: System Health & Observability Console
- **Purpose:** Technical monitoring, outbox health, and immutable audit verification for system administrators.
- **Role:** System Administrator (`ROLE_ADMIN`).
- **Information Hierarchy:**
  1. **Runtime Probes:** API liveness, database connection pool metrics, storage bucket health.
  2. **Transactional Outbox Monitor:** Count of pending outbox events, failed retries, published queue velocity.
  3. **Security Audit Log Explorer:** Searchable, filterable table of raw `action_history` records.
  4. **Data Immutability Verification:** Displays database trigger status ensuring zero audit deletion capability.
- **API Dependencies:** `/api/health`, internal administrative metrics.
