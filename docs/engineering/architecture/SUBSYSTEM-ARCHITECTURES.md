# Campus Plus — Core Subsystem Architectures & Operational Engines

**Project**: Campus Plus — Campus Complaint and Grievance Resolution System  
**Phase**: Phase 02 — Architecture Definition & Technical Blueprint  
**Document**: SUBSYSTEM-ARCHITECTURES.md  
**Version**: 1.0  
**Status**: Formal Architectural Blueprint  
**Authors**: Systems Architect, Security Engineer, Lead Software Architect  

---

## 1. Executive Summary

This document specifies the internal architectures, operational workflows, and software contracts for the specialized subsystems of Campus Plus:
1. **Attachment Security & Private Object Storage Pipeline** (`ADR-008`, `SEC-005`)
2. **Immutable Audit Logging Subsystem** (`ADR-009`, `SEC-006`)
3. **SLA Calculation & Tiered Escalation Engine** (`ADR-006`, `OD-006`)
4. **Cross-Department Forwarding Subsystem** (`ADR-004`, `OD-003`)
5. **Event-Driven Notification Subsystem** (`ADR-007`, `OD-011`)
6. **Deterministic Recurring Issue Intelligence Engine** (`ADR-010`, `OD-013`)
7. **Search, Filter & Role Dashboard Information Models** (`FR-021` - `FR-026`)

---

## 2. Attachment Security & Private Object Storage Pipeline

The attachment subsystem protects against malicious file execution, data leakage, and storage exhaustion (`NFR-007`, `SEC-005`).

```text
  [Client Browser]                                [Application API]                          [Object Storage Bucket]
         │                                                │                                             │
         │ (1) POST /attachments/presign-upload          │                                             │
         │     { filename, mime, size_bytes }             │                                             │
         ├───────────────────────────────────────────────>│                                             │
         │                                                │ Validates: size <= 5MB,                    │
         │                                                │ MIME in ['image/jpeg','png','pdf']         │
         │ (2) Returns { upload_url, storage_key, token } │                                             │
         │<───────────────────────────────────────────────┤                                             │
         │                                                │                                             │
         │ (3) Direct HTTP PUT file content to Storage ────────────────────────────────────────────────>│
         │                                                │                                             │
         │ (4) POST /complaints (attaches storage_key)    │                                             │
         ├───────────────────────────────────────────────>│                                             │
         │                                                │ Verifies file exists in bucket              │
         │                                                │ Creates `attachments` DB row                │
         │                                                │                                             │
         │ (5) GET /complaints/{ref}/attachments/{id}/url │                                             │
         ├───────────────────────────────────────────────>│                                             │
         │                                                │ Checks RBAC/RLS Read Permission             │
         │                                                │ Generates 15-Minute Signed Download URL     │
         │ (6) Returns { download_url (15-min TTL) }      │                                             │
         │<───────────────────────────────────────────────┤                                             │
```

### Key Subsystem Invariants:
1. **Zero Direct Public Access**: Storage buckets are 100% private. Raw bucket URLs return 403 Forbidden.
2. **Strict Quotas**: Maximum 5 MB per file; maximum 3 files per complaint submission; maximum 2 files for resolution proof.
3. **MIME Whitelist**: Strictly `image/jpeg`, `image/png`, `application/pdf`. All scriptable types (`.svg`, `.html`, `.exe`) rejected.
4. **Permanent Association**: Deletion is prohibited once a ticket advances past `SUBMITTED` (`BR-021`).

---

## 3. Immutable Audit Logging Subsystem

The audit subsystem guarantees that every state transition, assignment change, forwarding event, and administrative action is preserved in a tamper-evident, append-only transaction journal (`FR-019`, `BR-019`, `SEC-006`).

### 3.1 Physical Immutability Invariants
1. **Kernel Privilege Revocation**:
   ```sql
   REVOKE UPDATE, DELETE, TRUNCATE ON action_history FROM authenticated, anon, service_role;
   GRANT INSERT, SELECT ON action_history TO authenticated, service_role;
   ```
2. **Database Trigger Defense**: A `BEFORE UPDATE OR DELETE` SQL trigger throws an unhandled exception if any client attempts to mutate an existing row.
3. **Atomic Transaction Coupling**: Every state transition in the Core Domain must write to `action_history` within the same database transaction. If the audit insert fails, the transition aborts completely.

### 3.2 Dual-Level Visibility Isolation (`BR-020`, `PRIV-002`)
- **`visibility_level = 'PUBLIC'`**: Rendered on the student's tracking view (submission, public comments, assignment to department, resolution).
- **`visibility_level = 'INTERNAL'`**: Accessible strictly to staff, handlers, department heads, and management (internal staff triage notes, contractor disputes, disciplinary deliberations).

---

## 4. SLA Calculation & Tiered Escalation Engine

The SLA and Escalation subsystem maintains institutional accountability by monitoring complaint progress against configurable policies (`OD-002`, `OD-006`, `ADR-006`).

```text
  [Active Complaints Queue]
            │
            │ Monitored by Background SLA Watchdog (Runs every 15 mins)
            ▼
  [SLA Policy Evaluator] <─── Queries `sla_policies` (response/resolution threshold hours)
            │
            ├── (1) Is Complaint within SLA? ──> No action; normal processing continues.
            │
            └── (2) Is Threshold Breached?
                     │
                     ▼
          [Atomic Escalation Transition]
          • Increment `escalation_tier` (Tier 1 Handler -> Tier 2 Dept Head -> Tier 3 Management)
          • Set `complaints.is_escalated = TRUE`
          • Set `complaints.status = 'ESCALATED'`
          • Insert `action_history` entry (Actor: SYSTEM_SLA_WATCHDOG, Reason: SLA_BREACH)
          • Dispatch High-Priority In-App Alert to Tier Authorities
```

### 4.1 Working-Day Calendar Engine (`ASM-004`)
- Elapsed SLA time is calculated using institutional working hours:
  - Excludes Sundays and declared institutional public holidays.
  - Standard operational window: Monday–Saturday, 09:00 to 17:00 (configurable via `CalendarProvider` interface).

### 4.2 Dynamic Policy Schema (`sla_policies`)
- Standard configurable defaults (`OD-006`):
  - **Urgent Priority**: 24 working hours (Resolution).
  - **High Priority**: 48 working hours (Resolution).
  - **Medium Priority**: 120 working hours / 5 working days (Resolution).
  - **Low Priority**: 240 working hours / 10 working days (Resolution).

---

## 5. Cross-Department Forwarding Subsystem

When a student files a complaint under the wrong department or an issue requires inter-departmental remediation, the forwarding subsystem transfers operational jurisdiction sequentially (`ADR-004`, `OD-003`).

```text
  [Current Department Authority / Handler]
                   │
                   │ (1) Initiates Forward (Target Department ID, Mandatory Reason >= 15 chars)
                   ▼
  [Forwarding Service (Atomic Transaction)]
  ├── Validate Target Department is Active and != Current Department
  ├── Set `complaints.department_id = target_department_id`
  ├── Set `complaints.assigned_handler_id = NULL` (Unassigned in new department)
  ├── Set `complaints.status = 'FORWARDED'`
  ├── Insert `action_history` (from_dept, to_dept, actor_id, forwarding_reason)
  └── Enqueue Notifications:
        ├── To Receiving Department Head (Urgent new triage item)
        └── To Student Complainant (Notification of department transfer)
```

### Anti-Deadlock Guard:
If a complaint is forwarded $\ge 3$ times across departments, the system detects a circular transfer deadlock (`EDGE-004`), automatically transitions status to `ESCALATED`, and assigns it to Institutional Management for executive adjudication.

---

## 6. Event-Driven Notification Subsystem

The notification subsystem delivers timely alerts to users without blocking core state transactions (`ADR-007`, `OD-011`).

### 6.1 Domain Event Pub/Sub Topology
- State transitions emit domain events: `ComplaintSubmitted`, `ComplaintAssigned`, `ComplaintForwarded`, `ComplaintEscalated`, `ComplaintResolved`, `ComplaintReopened`.
- The `NotificationDispatcher` routes events asynchronously:
  1. **MVP Channel (Native In-App Inbox)**: Inserts an unread notification record into the `notifications` table (`recipient_id`, `complaint_id`, `title`, `message`, `is_read=false`).
  2. **Post-MVP Channel (Transactional Email)**: Pluggable `EmailNotificationAdapter` sends SMTP alerts using standard HTML templates.

### 6.2 Deduplication & Delivery Semantics
- At-least-once delivery semantics.
- Deduplication key: `hash(recipient_id + complaint_id + action_type + date_hour)` prevents alert flooding if rapid reassignments occur.

---

## 7. Deterministic Recurring Issue Intelligence Engine

The intelligence subsystem satisfies `FR-025`, `BR-023`, and [ADR-010](file:///d:/Deparment%20Project/department%20project/docs/engineering/architecture/decisions/ADR-010-RECURRING-ISSUE-DETECTION.md) without premature AI models.

### Heuristic Clustering Criteria:
A recurring issue cluster is surfaced when:
1. At least **3 distinct complaints** are filed within a **rolling 30-day window**.
2. All complaints in the cluster share identical:
   - `department_id`, AND
   - `category_id`, AND
   - Normalized `location_details` (trimmed, lowercase string match).

### Architectural Implementation:
- Calculated directly via the PostgreSQL analytical view `recurring_complaint_clusters`.
- High-performance indexed query execution (<150ms).
- Surfaced prominently on Department Head and Management dashboards with direct clickable links to all constituent tickets.

---

## 8. Search, Filter & Role Dashboard Information Architecture

### 8.1 Multi-Criteria Search Architecture (`FR-026`)
- **Search Dimensions**: Reference ID (prefix match), Category, Priority, Department, Status, Date Range, Location.
- **Role Scoping Boundary**:
  - `ROLE_STUDENT`: Filtered strictly to complaints where `complainant_id == auth.uid()`.
  - `ROLE_HANDLER`: Filtered to assigned complaints or departmental complaints.
  - `ROLE_DEPT_HEAD`: Filtered to departmental complaints.
  - `ROLE_MANAGEMENT` & `ROLE_ADMIN`: Unrestricted cross-campus search.

### 8.2 Role-Based Dashboard Information Models

| Dashboard Profile | Primary Information Widgets | Action Triggers |
| :--- | :--- | :--- |
| **Student Dashboard** (`FR-021`) | - Active Complaints Summary (Count)<br>- Pending Verification Queue (Count)<br>- Resolved / Closed History<br>- Recent Status Timeline Feed | `[Submit New Complaint]`, `[Verify Resolution]`, `[Dispute / Reopen]` |
| **Handler Dashboard** (`FR-022`) | - Assigned Tasks Worklist (Sorted by Priority & Due Date)<br>- In-Progress Remediation Cards<br>- SLA Risk Warnings (Complaints nearing threshold) | `[Acknowledge]`, `[Update Progress]`, `[Forward]`, `[Escalate]`, `[Resolve]` |
| **Department Dashboard** (`FR-023`) | - Department Triage Queue (Unassigned complaints count)<br>- Handler Workload Distribution (Active tickets per technician)<br>- Overdue / SLA Breached Complaints<br>- Department Recurring Hotspot Alerts | `[Assign Handler]`, `[Reassign]`, `[Forward Cross-Dept]`, `[Escalate to Mgmt]` |
| **Management Dashboard** (`FR-024`) | - Campus-Wide Grievance Inflow vs. Resolution Trends<br>- Average Turnaround Time by Department<br>- Campus Recurring Issue Hotspots Map<br>- Critical Escalations Queue (Tier 3 tickets) | `[Filter by Department]`, `[Export Institutional Report]`, `[Intervene in Escalation]` |
| **Admin Dashboard** | - Master Category Registry & Status<br>- Master Department Registry & Admins<br>- User Account Directory & Role Mappings<br>- System Health & Audit Event Stream | `[Add Category]`, `[Provision Role]`, `[Configure SLA Policies]` |

---

## 9. Architecture Verification Summary

- [x] Attachment security pipeline isolates private storage with 5MB boundaries and 15-minute signed access.
- [x] Audit subsystem physically enforces append-only immutability with dual-level remark visibility.
- [x] SLA engine models configurable policies, working calendar calculations, and tiered escalation.
- [x] Forwarding subsystem ensures atomic transfer with mandatory rationale and anti-deadlock guards.
- [x] Notification dispatcher delivers in-app inbox natively with decoupled email extension interfaces.
- [x] Recurring issue intelligence operates deterministically via relational views with zero premature AI.
- [x] Complete search and dashboard information models specified for all 5 roles.
