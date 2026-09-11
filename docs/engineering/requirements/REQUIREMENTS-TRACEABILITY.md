# Campus Plus — Requirements Traceability & Acceptance Criteria

**Phase**: Phase 01 — Requirements Engineering & Problem Intelligence  
**Document**: REQUIREMENTS-TRACEABILITY.md  
**Version**: 0.1  
**Status**: Draft / Conditional  
**Classification Standards**: SOURCE | DECISION | INFERENCE | PROPOSED | ASSUMPTION | UNKNOWN  

---

## 1. Executive Summary

This document establishes bidirectional traceability between the Level 1 Source Material (Academic Synopsis, R. C. Patel Institute of Technology, 2025-26), the formal functional and non-functional requirements catalog, business rules, and testable acceptance criteria (Given/When/Then).

---

## 2. Source Material Extraction & Traceability Mapping

| # | Exact Source Statement (Academic Synopsis) | Requirements / System Implications | Classification | Requirement ID(s) |
| :- | :--- | :--- | :--- | :--- |
| **S-01** | *"Educational institutions often handle student complaints through informal and disconnected communication channels such as verbal communication, emails, messaging applications, and manual submissions."* | System must provide a single, unified, web-accessible digital entry point for all campus complaints, replacing fragmented ad-hoc channels. | **SOURCE** | `FR-001`, `UR-001` |
| **S-02** | *"Because of this, it becomes difficult to properly record, track, and monitor complaints."* | System must persistently store all complaints upon submission, assign a unique tracking ID, and support real-time status monitoring. | **SOURCE** | `FR-001`, `FR-005`, `FR-006`, `BR-003` |
| **S-03** | *"Students may not know the current status of their complaint..."* | Students must have a dedicated tracking view and dashboard reflecting real-time lifecycle status and public progress notes. | **SOURCE** | `FR-006`, `FR-021` |
| **S-04** | *"...authorities may find it difficult to identify the responsible person, monitor pending complaints, and ensure timely resolution."* | System must support clear assignment to an identified responsible handler, pending queue dashboards, and resolution tracking. | **SOURCE** | `FR-008`, `FR-022`, `FR-023`, `BR-008` |
| **S-05** | *"This can result in delays, poor accountability, repeated complaints, and lack of transparency."* | System must incorporate assignment transparency, escalation workflows, recurring issue detection, and audit histories. | **SOURCE** | `FR-013`, `FR-019`, `FR-025`, `BR-019` |
| **S-06** | *"The main gap is the lack of a single centralized system that manages a complaint from submission to final resolution."* | Centralized platform covering end-to-end lifecycle from creation to verified closure. | **SOURCE** | `FR-001` to `FR-018` |
| **S-07** | *"Existing methods generally do not provide a proper workflow for categorization, priority setting, assignment, status tracking, escalation, resolution, and maintaining complaint history."* | Core workflow engine supporting categorization, priority management, handler assignment, status progression, escalation, resolution, and full history. | **SOURCE** | `FR-002`, `FR-003`, `FR-008`, `FR-011`, `FR-013`, `FR-015`, `FR-019` |
| **S-08** | *"There is also limited visibility for authorities to monitor pending, resolved, escalated, and recurring complaints..."* | Specialized operational and executive monitoring dashboards with status filters and recurring trend indicators. | **SOURCE** | `FR-021`, `FR-022`, `FR-023`, `FR-024`, `FR-025` |
| **S-09** | *"Campus Plus provides a centralized and role-based complaint management system that allows students and authorized users to submit complaints with the required details, category, priority, and supporting attachments."* | Authenticated submission form capturing description, category selection, suggested priority, and file attachments; secured via RBAC. | **SOURCE** | `FR-001`, `FR-002`, `FR-003`, `FR-004`, `SEC-002` |
| **S-10** | *"The concerned authorities can then review, assign, forward, track, update, escalate, and resolve complaints through a structured workflow."* | Workflow actions: Triage Review, Assignment, Inter-department Forwarding, Tracking, Status Updates, Escalation, Resolution. | **SOURCE** | `FR-007`, `FR-008`, `FR-009`, `FR-010`, `FR-011`, `FR-013`, `FR-015` |
| **S-11** | *"The system also maintains a complete history of actions..."* | Append-only, tamper-evident audit log capturing every state change, assignment, escalation, and note. | **SOURCE** | `FR-019`, `BR-019`, `SEC-006` |
| **S-12** | *"...provides notifications and dashboards for better monitoring..."* | Automated event notifications (status changes, assignments, escalations) and role-specific monitoring dashboards. | **SOURCE** | `FR-020`, `FR-021`, `FR-022`, `FR-023`, `FR-024` |
| **S-13** | *"...uses role-based access control so that each user can access features according to their responsibilities."* | Strict RBAC dividing student complainants, handlers, department heads, system administrators, and management. | **SOURCE** | `FR-001` through `FR-026`, `SEC-002`, `NFR-005` |
| **S-14** | *"...create a transparent, accountable, and organized complaint resolution process while enabling administrators to identify recurring campus issues and improve campus services."* | Recurring grievance detection heuristics, administrative trend reporting, and service improvement metrics. | **SOURCE** | `FR-024`, `FR-025`, `BR-023` |

---

## 3. Comprehensive Requirements Traceability Matrix (RTM)

| Req ID | Requirement Title | Source / Basis | Stakeholder | Business Goal | Priority | Verification Method |
| :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| **`UR-001`** | Single Digital Grievance Portal | `S-01`, `S-06` | Student, Authority | Eliminate fragmented communication channels | **MUST** | Inspection & Demonstration |
| **`UR-002`** | Transparent Complaint Tracking | `S-02`, `S-03` | Student | Real-time visibility into complaint status | **MUST** | System Test |
| **`UR-003`** | Accountable Handler Assignment | `S-04`, `S-10` | Dept Head, Handler | Clear ownership for grievance remediation | **MUST** | System Test |
| **`UR-004`** | Institutional Service Intelligence | `S-08`, `S-14` | Management, Admin | Identify recurring campus issues & bottlenecks | **MUST** | Analytics Test |
| **`FR-001`** | Authenticated Complaint Submission | `S-01`, `S-09` | Student | Secure, structured grievance intake | **MUST** | Functional Integration Test |
| **`FR-002`** | Complaint Categorization | `S-07`, `S-09` | Student, Authority | Route issues to relevant domains | **MUST** | Unit & Integration Test |
| **`FR-003`** | Suggested Priority Setting | `S-07`, `S-09` | Student | Capture complainant urgency indicator | **MUST** | Functional Test |
| **`FR-004`** | Supporting Evidence Upload | `S-09` | Student, Handler | Provide factual verification for complaints | **MUST** | Storage & Security Test |
| **`FR-005`** | Unique Reference ID Generation | `S-02`, `BR-003` | Student, System | Persistent, unambiguous grievance tracking | **MUST** | Unit & Invariant Test |
| **`FR-006`** | Student Personal Tracking View | `S-03`, `S-09` | Student | Transparent tracking of submitted complaints | **MUST** | E2E Scenario Test |
| **`FR-007`** | Departmental Triage & Review | `S-07`, `S-10` | Dept Head | Validate & prepare ticket for assignment | **MUST** | Functional Test |
| **`FR-008`** | Handler Assignment | `S-04`, `S-10` | Dept Head, Handler | Establish responsible individual for ticket | **MUST** | Integration & State Test |
| **`FR-009`** | Intra-Department Reassignment | `S-10` | Dept Head | Workload rebalancing & staff absence handling | **SHOULD** | Integration Test |
| **`FR-010`** | Cross-Department Forwarding | `S-10` | Dept Head, Handler | Handle misdirected or cross-domain issues | **MUST** | State Machine Test |
| **`FR-011`** | Operational Progress Updating | `S-07`, `S-10` | Handler | Signal active investigation & remediation | **MUST** | State Machine Test |
| **`FR-012`** | Authority Priority Override | `S-07`, `BR-006`| Dept Head, Handler | Ensure institutional prioritization accuracy | **SHOULD** | Audit & Integration Test |
| **`FR-013`** | Manual Escalation | `S-07`, `S-10` | Handler, Dept Head | Elevate blocked or critical grievances | **MUST** | State Machine Test |
| **`FR-014`** | Policy / SLA Escalation | `S-07`, `OD-006`| System | Automate oversight on stalled grievances | **SHOULD** | Scheduled Trigger Test |
| **`FR-015`** | Resolution with Action Notes | `S-07`, `S-10` | Handler | Document corrective measures executed | **MUST** | State Machine Test |
| **`FR-016`** | Resolution Proof Upload | `S-09`, `OD-007`| Handler | Provide objective verification of resolution | **SHOULD** | Storage & Validation Test |
| **`FR-017`** | Complainant Verification & Close| `PROPOSED` (`S-06`)| Student, System | Validate student satisfaction before closure | **SHOULD** | E2E Scenario Test |
| **`FR-018`** | Complainant Dispute / Reopen | `PROPOSED` (`S-05`)| Student | Safeguard against premature/fake resolutions | **SHOULD** | State Machine Test |
| **`FR-019`** | Immutable Action History Log | `S-11`, `BR-019`| All Roles | Uncompromised auditability & accountability | **MUST** | Immutability Security Test |
| **`FR-020`** | Event-Driven Notifications | `S-12` | Student, Authority | Timely awareness of status/assignment changes | **MUST** | Notification Test |
| **`FR-021`** | Student Complainant Dashboard | `S-12` | Student | Unified personal overview of grievances | **MUST** | UI & Integration Test |
| **`FR-022`** | Handler Operational Dashboard | `S-12` | Handler | Worklist management for assigned tasks | **MUST** | UI & Integration Test |
| **`FR-023`** | Department Authority Dashboard | `S-08`, `S-12` | Dept Head | Departmental backlog, SLAs, & triage queue | **MUST** | UI & Integration Test |
| **`FR-024`** | Executive Insight Dashboard | `S-08`, `S-14` | Management | Strategic visibility into campus trends | **MUST** | Data Aggregation Test |
| **`FR-025`** | Recurring Complaint Detection | `S-08`, `S-14` | Management, Admin | Surface repetitive systemic breakdowns | **MUST** | Query & Rule Test |
| **`FR-026`** | Multi-Criteria Search & Filter | `INFERENCE` | All Roles | Locate complaints by status, category, date | **MUST** | Query & Index Test |
| **`NFR-001`** | Sub-Second UI API Response | `INFERENCE` | All Users | Fluid user experience (<800ms 95th %ile) | **MUST** | Load & Performance Test |
| **`NFR-002`** | 99.5% Service Availability | `INFERENCE` | All Users | Reliable operational uptime | **MUST** | Uptime Monitoring Test |
| **`NFR-003`** | Append-Only Data Immutability | `S-11` | Security, Audit | Audit history cannot be altered/deleted | **MUST** | Database Constraint Test |
| **`NFR-004`** | Horizontal Scalability | `INFERENCE` | Institution | Handle campus-wide user surges | **SHOULD** | Load Test |
| **`NFR-005`** | Role-Based Access Enforcement | `S-13` | Security | Strict authorization on every resource | **MUST** | Security Penetration Test |
| **`NFR-006`** | Complainant Data Privacy | `INFERENCE` | Complainant | Protect personal identity & sensitive notes | **MUST** | Privacy Audit |
| **`NFR-007`** | Secure File Handling & Scanning | `INFERENCE` | Security | Prevent malicious uploads | **MUST** | File Validation Test |
| **`NFR-008`** | Mobile Responsive Web UI | `ASM-003` | Complainant, Staff | Usable on smartphones and desktops | **MUST** | Responsive Testing |
| **`SEC-001`** | Authenticated Access Boundary | `S-09`, `S-13` | Security | No unauthenticated access to internal data | **MUST** | Auth Integration Test |
| **`SEC-002`** | Server-Side RBAC Enforcement | `S-13` | Security | Enforce permissions server-side, not client | **MUST** | Security Unit Test |
| **`SEC-003`** | Secure Session & Token Handling | `INFERENCE` | Security | Mitigate session hijacking / CSRF | **MUST** | Security Test |
| **`PRIV-001`** | PII Minimization & Protection | `INFERENCE` | Complainant | Display student identity only to handlers | **MUST** | Data Access Test |
| **`PRIV-002`** | Dual-Level Comment Isolation | `BR-020` | Handler, Admin | Hide internal staff notes from student view | **MUST** | API Authorization Test |

---

## 4. Testable Acceptance Criteria (Given / When / Then)

### 4.1 `FR-001`: Authenticated Complaint Submission
```gherkin
Scenario: Successfully submitting a complete complaint
  Given a student is authenticated with an active session
  And the student navigates to the complaint submission interface
  When the student inputs:
    | Title       | "Water leakage in IT Lab 3"                          |
    | Description | "Continuous tap leakage causing water accumulation."  |
    | Category    | "Infrastructure"                                     |
    | Department  | "Information Technology"                             |
    | Priority    | "High"                                               |
    | Location    | "Building A, 2nd Floor, Room 204"                    |
  And the student submits the form
  Then the system creates a new complaint in "SUBMITTED" state
  And generates a unique tracking reference (e.g. "CP-2026-00104")
  And records an append-only action history entry for "SUBMISSION"
  And displays a success confirmation containing the tracking reference.

Scenario: Attempting submission with incomplete mandatory fields
  Given a student is authenticated
  When the student attempts to submit a complaint with an empty Description
  Then the system rejects the submission with a validation error
  And no complaint record or tracking reference is created.
```

### 4.2 `FR-008`: Handler Assignment
```gherkin
Scenario: Department head assigns a complaint to a staff handler
  Given a complaint exists in "SUBMITTED" or "REVIEWED" state for department "Hostel"
  And a user authenticated as "ROLE_DEPT_HEAD" for "Hostel" views the complaint
  When the department head selects handler "Staff John" and confirms assignment
  Then the complaint status transitions to "ASSIGNED"
  And the assigned authority is set to "Staff John"
  And an action history record is appended with action "ASSIGNMENT" referencing assignor and assignee
  And an in-app notification is dispatched to "Staff John".
```

### 4.3 `FR-010`: Cross-Department Forwarding
```gherkin
Scenario: Forwarding a miscategorized complaint to another department
  Given a complaint is currently in department "Information Technology"
  And the IT Department Head identifies that the issue belongs to "Civil Maintenance"
  When the IT Department Head forwards the complaint to "Civil Maintenance"
    With mandatory forwarding reason: "Requires plumbing pipe replacement in floor duct."
  Then the complaint status transitions to "FORWARDED"
  And the complaint's active department is updated to "Civil Maintenance"
  And an action history entry is recorded capturing the forwarding reason and actor
  And the Civil Maintenance triage desk receives a new assignment notification.
```

### 4.4 `FR-013`: Manual Escalation
```gherkin
Scenario: Handler escalates a blocked complaint
  Given an assigned handler is reviewing an "IN PROGRESS" complaint
  And the required spare parts require central executive financial sanction
  When the handler initiates escalation
    With reason: "Awaiting administrative procurement sanction exceeding departmental limit."
  Then the complaint status transitions to "ESCALATED"
  And the escalation level is incremented to Tier 2 / Management
  And an append-only action history record is appended with action "ESCALATION"
  And high-priority notifications are dispatched to Department Head and Institutional Management.
```

### 4.5 `FR-015` & `FR-017`: Resolution and Complainant Verification
```gherkin
Scenario: Handler resolves complaint and student verifies
  Given a complaint is in "IN PROGRESS" assigned to "Staff John"
  When "Staff John" marks the complaint "RESOLVED"
    With resolution note: "Replaced faulty water valve and tested pressure."
  Then the complaint status transitions to "RESOLVED"
  And the complainant receives a resolution notification with verification prompt
  When the complainant reviews the resolution and clicks "Verify & Close"
  Then the complaint status transitions to "CLOSED"
  And an action history entry is recorded capturing the complainant closure confirmation.
```

### 4.6 `FR-018`: Complainant Disputes Resolution
```gherkin
Scenario: Student disputes resolution within verification window
  Given a complaint is in "RESOLVED" state
  And the current time is within 5 business days of resolution
  When the complainant submits a dispute:
    With reason: "Valve is still dripping when main line opens in afternoon."
  Then the complaint status transitions to "REOPENED"
  And an action history entry is appended with action "REOPEN" and the dispute reason
  And the Department Head and Assigned Handler receive urgent reopening alerts.
```

### 4.7 `FR-025`: Recurring Complaint Detection
```gherkin
Scenario: System identifies recurring grievances in identical location
  Given 3 complaints have been submitted within 14 days
    Sharing Category: "Infrastructure", Department: "Electrical", Location: "Boys Hostel 2, Wing B"
  When an administrator or department head views the dashboard
  Then the system flags "Boys Hostel 2, Wing B — Electrical" as a "Recurring Issue Cluster"
  And displays all associated active and resolved complaint references in the cluster view.
```

---

## 5. Requirements Quality Review & Consistency Assessment

1. **Ambiguity Check**: All states, transitions, roles, and constraints are explicitly defined with pre-conditions and post-conditions.
2. **Duplication Check**: Redundant operational states merged (e.g., intra-department reassignment separated from cross-department forwarding).
3. **Traceability Check**: Every MUST requirement links directly to Level 1 Source or Level 2 Reconnaissance findings.
4. **Implementation Independence**: Requirements specify *what* the system must achieve without locking framework, ORM, database engine, or cloud vendor.
