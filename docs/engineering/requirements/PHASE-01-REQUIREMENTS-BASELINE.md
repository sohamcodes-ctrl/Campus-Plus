# Campus Plus — Phase 01 Requirements Baseline

**Project**: Campus Plus — Campus Complaint and Grievance Resolution System  
**Phase**: Phase 01 — Requirements Engineering & Problem Intelligence  
**Document**: PHASE-01-REQUIREMENTS-BASELINE.md  
**Version**: 0.1  
**Status**: Draft / Conditional  
**Classification Standards**: SOURCE | DECISION | INFERENCE | PROPOSED | ASSUMPTION | UNKNOWN  

---

## 1. Executive Summary

This document establishes the official engineering requirements baseline for **Campus Plus (Campus Complaint and Grievance Resolution System)**. Developed through rigorous requirements engineering, this baseline transforms the project synopsis (R. C. Patel Institute of Technology, 2025-26) into an implementation-independent, verifiable specification that directly drives subsequent architecture, data modeling, API contracts, security controls, and quality assurance phases.

Campus Plus replaces fragmented, informal complaint handling channels (verbal complaints, individual emails, messaging apps, and manual paper submissions) with a centralized, role-based platform providing end-to-end complaint lifecycle tracking, deterministic assignment, departmental forwarding, structured escalation, resolution verification, tamper-evident audit history, and institutional intelligence.

---

## 2. Source Material & Problem Intelligence

### 2.1 Primary Source Authority
The baseline product authority is the *Semester Project-II Synopsis, Semester IV: "Campus Complaint and Grievance Resolution System"* (Department of Information Technology, The Shirpur Education Society's R. C. Patel Institute of Technology, Shirpur; Academic Year 2025-26; Guide: Prof. Kalpesh Wani; Student Authors: Satyam Rajnikant Sonar, Krushna Kiran Patil, Vaishnav Ganesh Patil, Soham Kiran Khairnar).

### 2.2 Problem Intelligence & Current State Analysis
- **Current Operational Baseline (As-Is)**:
  1. *Fragmented Channels*: Complaints are submitted informally across verbal requests, personal staff emails, messaging groups (e.g., WhatsApp), and manual paper notes.
  2. *Lack of Centralized Record*: No unified repository exists; complaints get lost, forgotten, or untracked.
  3. *Unclear Status & Transparency Deficit*: Students have no mechanism to check current status, assigned owner, or estimated resolution progress.
  4. *Diffused Accountability*: Department authorities cannot identify who is actively working on an issue or determine why complaints linger unaddressed.
  5. *Delayed Resolution*: Without time-tracked assignments or escalation paths, grievances stall indefinitely without administrative awareness.
  6. *Repeated / Chronic Issues*: Lack of analytics prevents administrators from recognizing that the same physical or administrative failure recurs repeatedly across campus.
  7. *Absence of Action History*: No audit trail exists to determine who touched a complaint, when decisions were made, or why tickets were reassigned or closed.

- **Desired Future State (To-Be)**:
  Campus Plus introduces a single, authoritative digital portal with a governed lifecycle:
  $$\text{Submission} \longrightarrow \text{Categorization} \longrightarrow \text{Priority} \longrightarrow \text{Assignment} \longrightarrow \text{Tracking} \longrightarrow \text{Escalation} \longrightarrow \text{Resolution} \longrightarrow \text{Action History} \longrightarrow \text{Dashboards} \longrightarrow \text{Institutional Insight}$$

---

## 3. Scope & MVP Boundary Definition

To prevent scope creep and ensure rigorous phase isolation, the system boundaries are partitioned into three explicit tiers:

### 3.1 Minimum Viable Product (MVP) Boundary
The MVP contains ONLY capabilities required to solve the core problem described in the synopsis:
1. **User Authentication & Role Identification**: Secure login for Students, Handlers, Department Heads, System Administrators, and Institutional Management.
2. **Standardized Complaint Submission**: Form capturing Title, Description, Category, Department, Suggested Priority, Location, and Supporting File Attachments.
3. **Unique Tracking Identification**: System-generated immutable reference code (e.g., `CP-2026-XXXXX`).
4. **Structured Complaint Lifecycle**: Deterministic states: `SUBMITTED` $\rightarrow$ `REVIEWED` $\rightarrow$ `ASSIGNED` $\rightarrow$ `IN PROGRESS` $\rightarrow$ `RESOLVED` $\rightarrow$ `CLOSED` (with `FORWARDED` and `ESCALATED` states).
5. **Intra-Department Assignment & Inter-Department Forwarding**: Explicit delegation to handlers and cross-boundary transfer with mandatory rationale.
6. **Resolution Workflow**: Mandatory resolution action notes and timestamped completion.
7. **Append-Only Action History**: Immutable audit log recording every state transition, assignment, comment, and resolution event.
8. **Role-Specific Dashboards**:
   - Complainant: My Complaints, Status Tracker, Resolution Acknowledgement.
   - Handler: Assigned Tasks, In-Progress Worklist, Resolution Submission.
   - Department Head: Department Triage Queue, Handler Workload, Department Escalations.
   - Institutional Management: Campus-wide Overview, Status Distribution, Escalated Complaints Queue.
9. **Basic Recurring Issue Detection**: Rule-based aggregation identifying frequent complaints matching identical category, department, and location within a rolling 30-day window.
10. **In-App Notifications**: Immediate alerts on assignment, forwarding, escalation, and resolution.

### 3.2 Post-MVP Capabilities (Candidate Phase)
1. Complainant Satisfaction Rating & Feedback (1–5 stars) (`PROP-001`).
2. Pre-submission Duplicate Warning search (`PROP-002`).
3. External transactional email integration (SMTP/Resend) (`OD-011`).
4. Offline PWA caching for field technicians (`PROP-004`).
5. Multi-lingual UI localization (Marathi/Hindi/English) (`PROP-005`).
6. Public sanitized campus transparency noticeboard (`PROP-006`).

### 3.3 Out of Scope (Strictly Prohibited for Initial System)
1. Generative AI / Large Language Model automatic grievance resolution.
2. WhatsApp Bot / SMS automated telephony integrations.
3. Automated facial recognition / biometric verification.
4. Direct integration with physical campus hardware (e.g., smart IoT water sensors or electrical meters).
5. Financial refund processing or student fee grievance monetary settlements.

---

## 4. Comprehensive Functional Requirements Catalog

### 4.1 Grievance Submission & Intake (`FR-001` - `FR-006`)
- **`FR-001` (Authenticated Submission)**: The system MUST allow authenticated students to submit complaints containing mandatory title, description, category, department, location, and suggested priority. (*Priority: MUST | Source: S-01, S-09*).
- **`FR-002` (Categorization Binding)**: The system MUST bind each complaint to an active institutional category during submission. (*Priority: MUST | Source: S-07, S-09*).
- **`FR-003` (Suggested Priority)**: The system MUST allow complainants to indicate a suggested priority level (`LOW`, `MEDIUM`, `HIGH`, `URGENT`). (*Priority: MUST | Source: S-07, S-09*).
- **`FR-004` (Supporting Attachments)**: The system MUST support uploading image/document evidence (max 5MB, PDF/PNG/JPG) during initial submission. (*Priority: MUST | Source: S-09*).
- **`FR-005` (Tracking ID Generation)**: The system MUST automatically generate and return a unique, human-readable complaint reference ID upon successful creation. (*Priority: MUST | Source: S-02, BR-003*).
- **`FR-006` (Complainant Personal Tracking)**: The system MUST provide the complainant with a personal tracking view displaying real-time status, assigned department/authority, and public timeline. (*Priority: MUST | Source: S-03*).

### 4.2 Triage, Assignment & Routing (`FR-007` - `FR-012`)
- **`FR-007` (Departmental Triage)**: Department Authorities MUST be able to review newly submitted departmental complaints to verify validity and completeness. (*Priority: MUST | Source: S-10*).
- **`FR-008` (Handler Assignment)**: Department Authorities MUST be able to assign a complaint to an identified handler within their department, establishing single primary responsibility. (*Priority: MUST | Source: S-04, S-10, BR-008*).
- **`FR-009` (Intra-Department Reassignment)**: Department Authorities MUST be able to reassign active complaints among handlers in their department with recorded justification. (*Priority: SHOULD | Source: S-10*).
- **`FR-010` (Cross-Department Forwarding)**: Handlers and Department Authorities MUST be able to forward misdirected complaints to another department, requiring mandatory transfer rationale. (*Priority: MUST | Source: S-10, BR-010*).
- **`FR-011` (Operational Progress Tracking)**: Handlers MUST be able to transition assigned complaints to `IN PROGRESS` and log interim progress remarks. (*Priority: MUST | Source: S-10*).
- **`FR-012` (Authority Priority Adjustment)**: Department Authorities MUST be permitted to modify the official complaint priority based on institutional triage criteria. (*Priority: SHOULD | Source: S-07, BR-006*).

### 4.3 Escalation Management (`FR-013` - `FR-014`)
- **`FR-013` (Manual Escalation)**: Handlers and Department Heads MUST be able to escalate complaints to higher administrative tiers with mandatory escalation reason and remarks. (*Priority: MUST | Source: S-07, S-10, BR-013*).
- **`FR-014` (Automated SLA Escalation)**: The system SHOULD automatically flag and elevate complaints that exceed configured resolution thresholds without status updates. (*Priority: SHOULD | Source: S-07, OD-006*).

### 4.4 Resolution, Verification & Closure (`FR-015` - `FR-018`)
- **`FR-015` (Resolution Submission)**: Handlers MUST provide a detailed resolution summary when marking a complaint `RESOLVED`. (*Priority: MUST | Source: S-07, S-10, BR-015*).
- **`FR-016` (Resolution Proof Upload)**: Handlers SHOULD be able to upload photographic or documentary proof verifying completed remediation. (*Priority: SHOULD | Source: S-09, OD-007*).
- **`FR-017` (Complainant Verification & Closure)**: The system SHOULD allow complainants to verify resolution satisfaction and close the ticket, or auto-close after 5 business days without dispute. (*Priority: SHOULD | Source: S-06, BR-016, BR-017*).
- **`FR-018` (Resolution Dispute & Reopen)**: Complainants SHOULD be able to dispute a resolution within the verification window, reopening the complaint with documented justification. (*Priority: SHOULD | Source: S-05, BR-018*).

### 4.5 Action History & Auditability (`FR-019`)
- **`FR-019` (Immutable Action History)**: The system MUST capture an append-only, tamper-evident audit trail recording every state transition, assignment, escalation, comment, and attachment reference. (*Priority: MUST | Source: S-11, BR-019, SEC-006*).

### 4.6 Communications & Notifications (`FR-020`)
- **`FR-020` (Event-Driven Notifications)**: The system MUST dispatch real-time in-app notifications to relevant stakeholders on submission, assignment, forwarding, escalation, and resolution. (*Priority: MUST | Source: S-12*).

### 4.7 Monitoring, Dashboards & Analytics (`FR-021` - `FR-025`)
- **`FR-021` (Student Dashboard)**: Students MUST have a unified dashboard summarizing active, pending, resolved, and historical complaints. (*Priority: MUST | Source: S-12*).
- **`FR-022` (Handler Operational Dashboard)**: Handlers MUST have a worklist interface showing assigned complaints, priority levels, and pending action items. (*Priority: MUST | Source: S-12*).
- **`FR-023` (Department Authority Dashboard)**: Department Heads MUST have a dashboard displaying departmental backlog, unassigned queue, handler workloads, and escalated tickets. (*Priority: MUST | Source: S-08, S-12*).
- **`FR-024` (Executive Management Dashboard)**: Institutional Management MUST have a high-level overview of campus grievance volumes, turnaround times, and department performance. (*Priority: MUST | Source: S-08, S-14*).
- **`FR-025` (Recurring Issue Detection)**: The system MUST identify and visually flag clusters of complaints sharing identical category, location, and department within a 30-day window. (*Priority: MUST | Source: S-08, S-14, BR-023*).

### 4.8 Search & Filtering (`FR-026`)
- **`FR-026` (Multi-Criteria Search)**: Users MUST be able to search and filter complaints based on Reference ID, Status, Category, Priority, Department, and Date Range according to their role permissions. (*Priority: MUST | Source: INFERENCE*).

---

## 5. Non-Functional Requirements (NFR) Catalog

| ID | Category | Requirement Specification | Verification Target |
| :--- | :--- | :--- | :--- |
| **`NFR-001`** | **Performance** | API responses for core CRUD and state transition operations MUST complete in under 800ms for the 95th percentile under normal load. | Automated load test simulation. |
| **`NFR-002`** | **Availability** | The system MUST target 99.5% operational availability during academic semesters, excluding scheduled maintenance windows. | Uptime monitoring metrics. |
| **`NFR-003`** | **Audit Immutability**| Action history and audit records MUST be physically protected against updates, deletions, and truncation at the data storage layer. | Database constraint & permission audit. |
| **`NFR-004`** | **Scalability** | The system architecture MUST support at least 1,000 active daily users and 10,000 complaints annually without degradation. | Capacity stress testing. |
| **`NFR-005`** | **Authorization** | Every protected operational endpoint MUST enforce server-side Role-Based Access Control before reading or mutating data. | Automated security regression suite. |
| **`NFR-006`** | **Confidentiality** | Student personal contact information MUST be visible only to authorized handlers and administrators; hidden from public views. | Static data access review. |
| **`NFR-007`** | **File Security** | All uploaded attachments MUST undergo file type validation (MIME-type check) and file size boundary enforcement. | Security boundary penetration test. |
| **`NFR-008`** | **Responsiveness**| The web user interface MUST be fully responsive and operable on desktop, tablet, and mobile screens (viewport $\ge$ 360px). | Cross-device viewport inspection. |
| **`NFR-009`** | **Observability** | All unhandled system errors, authorization rejections, and state transition failures MUST be logged with trace context. | Structured logging review. |
| **`NFR-010`** | **Data Retention** | Complaint data, action histories, and attachments MUST be retained for a minimum of 4 academic years for institutional auditing. | Retention policy audit. |
| **`NFR-011`** | **Browser Support**| The client application MUST support modern evergreen web browsers (Chrome, Edge, Firefox, Safari) within their last 2 major versions. | Compatibility test suite. |
| **`NFR-012`** | **Modularity** | Domain logic, data access, and presentation layers MUST remain decoupled to ensure maintainability without vendor lock-in. | Architecture review. |

---

## 6. Security & Privacy Requirements

### 6.1 Security Requirements (`SEC-*`)
- **`SEC-001` (Authentication Enforcement)**: All operational capabilities (except viewing public institutional policies) require valid authenticated session tokens.
- **`SEC-002` (Server-Side Authorization Invariant)**: Client-side UI hiding is strictly treated as UX guidance; all authorization boundaries MUST be enforced on the server.
- **`SEC-003` (Session Integrity & Token Expiry)**: Authentication tokens must expire after inactivity (configurable: 24h) and support immediate revocation upon logout.
- **`SEC-004` (Input Sanitization & Injection Defense)**: All free-text inputs (titles, descriptions, comments, resolution notes) must be strictly validated and sanitized to prevent SQL/NoSQL injection and Cross-Site Scripting (XSS).
- **`SEC-005` (Secure Storage & Signed URLs)**: User attachments must not be stored in publicly indexable directories. Direct file access must require authenticated, time-limited signed URLs.
- **`SEC-006` (Tamper-Evident Audit Trails)**: Audit log entries must include actor ID, actor role, machine timestamp, IP/User-Agent context, and state deltas, with zero administrative edit permissions.

### 6.2 Privacy Requirements (`PRIV-*`)
- **`PRIV-001` (PII Minimization)**: Complaints must display only the complainant's name, roll/PRN, and official department to assigned authorities. External viewers cannot access complainant PII.
- **`PRIV-002` (Internal Remark Confidentiality)**: Staff internal administrative remarks must be partitioned from public complainant views.
- **`PRIV-003` (Sensitive Grievance Protection)**: If sensitive grievance categories (e.g., Sexual Harassment / Anti-Ragging) are logged, access must be restricted exclusively to designated statutory committee members (`OD-012`).

---

## 7. Edge Cases & Boundary Conditions Analysis

| Edge Scenario ID | Edge Scenario Description | Expected System Behavior & Invariant Handling |
| :--- | :--- | :--- |
| **`EDGE-001`** | **Duplicate Complaint Submission** | Multiple students submit identical issues (e.g., "Water filter broken on 2nd floor"). System permits individual submissions to preserve student tracking; Authority can link duplicate complaints to a master ticket, updating status in unison without deleting individual records. |
| **`EDGE-002`** | **Miscategorized Complaint** | Student files a hostel plumbing issue under Academic IT. The IT Authority executes a Forwarding action to the Hostel Department with mandatory rationale. Status transitions to `FORWARDED` without requiring ticket recreation. |
| **`EDGE-003`** | **Assigned Handler Unavailable** | A staff handler is on extended leave or leaves the institution. The Department Head or Admin reassigns the ticket to an active handler. Prior history remains intact; new handler receives assignment notification. |
| **`EDGE-004`** | **Cross-Department Deadlock** | Department A forwards to Department B, and Department B forwards back to Department A. System detects circular forwarding ($>2$ transfers); automatically elevates ticket to `ESCALATED` for Department Heads / Management intervention. |
| **`EDGE-005`** | **Resolution Rejected by Student** | Handler marks complaint resolved, but physical repair failed. Student rejects resolution within 5-day window providing photographic proof. System transitions ticket to `REOPENED` with high priority. |
| **`EDGE-006`** | **Attachment Fetch Failure** | Storage network failure prevents loading attached photo. Core complaint data and action history remain fully accessible; UI displays non-blocking placeholder and retries asset fetch. |
| **`EDGE-007`** | **Complainant Account Deactivated** | Student graduates while complaint is active. System preserves complaint, audit trail, and assignment; handler proceeds with remediation; notifications to deactivated student are gracefully silenced. |
| **`EDGE-008`** | **Malicious File Upload Attempt** | User attempts to upload `.exe` or `.sh` script disguised as an image. System inspects magic bytes / MIME type; rejects upload with 422 Unprocessable Entity; halts ticket creation until clean file is provided. |

---

## 8. Data Requirements & Attribute Classification

| Attribute Group | Attribute Name | Classification | Mandatory / Optional | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Complaint Header** | `reference_id` | System-Generated | **Mandatory** | Unique human-readable code (`CP-YYYY-XXXXX`). |
| | `title` | User-Provided | **Mandatory** | Concise summary of grievance (10–120 chars). |
| | `description` | User-Provided | **Mandatory** | Comprehensive narrative of issue ($\ge$ 30 chars). |
| | `category_id` | User-Provided | **Mandatory** | Reference to active institutional category. |
| | `department_id` | User-Provided | **Mandatory** | Owning academic or operational department. |
| | `location_details` | User-Provided | **Mandatory** | Physical campus location (Building, Floor, Room). |
| | `suggested_priority` | User-Provided | **Mandatory** | Complainant urgency indicator (`LOW` to `URGENT`). |
| | `official_priority` | Authority-Set | **Derived / Default** | Official priority (defaults to suggested priority). |
| **Ownership** | `complainant_id` | System-Generated | **Mandatory** | Authenticated user ID of the submitter. |
| | `assigned_handler_id` | Authority-Set | **Optional** | Active user ID of assigned staff member. |
| | `assigned_department_id`| System/Authority | **Mandatory** | Currently responsible department. |
| **Lifecycle State** | `status` | System-Governed | **Mandatory** | Current lifecycle state enum. |
| | `created_at` | System-Generated | **Mandatory** | UTC timestamp of initial creation. |
| | `updated_at` | System-Generated | **Mandatory** | UTC timestamp of last modification. |
| | `resolved_at` | System-Generated | **Optional** | UTC timestamp when marked resolved. |
| | `closed_at` | System-Generated | **Optional** | UTC timestamp when verified or auto-closed. |
| **Resolution** | `resolution_notes` | Authority-Set | **Conditional** | Mandatory when transitioning to `RESOLVED`. |
| | `resolution_evidence_urls`| Authority-Set | **Optional** | Array of file references documenting proof. |
| | `reopen_reason` | User-Provided | **Conditional** | Mandatory when transitioning to `REOPENED`. |
| **Audit & History** | `action_history` | System-Generated | **Mandatory** | Immutable sequence of lifecycle action records. |

---

## 9. Baseline Verification & Sign-Off Checklist

- [x] Phase 00 reconnaissance findings incorporated; zero implementation assumptions leaked.
- [x] Level 1 Source Material (Academic Synopsis) fully mapped and preserved in terminology.
- [x] Complete stakeholder taxonomy defined with clear role-based access matrix.
- [x] Deterministic finite state machine defined with pre-conditions, post-conditions, and transition invariants.
- [x] All business rules assigned stable identifiers (`BR-001` through `BR-024`).
- [x] Open organizational and technical ambiguities formalized in `OPEN-DECISIONS.md`.
- [x] Testable Given/When/Then acceptance criteria established for major operational scenarios.
- [x] Scope rigorously bounded: MVP vs. Post-MVP vs. Out of Scope.
