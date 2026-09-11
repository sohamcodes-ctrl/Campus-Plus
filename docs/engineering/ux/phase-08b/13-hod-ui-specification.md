# Phase 08-B: Department Head Persona UI Specification (ROLE_DEPT_HEAD)

**Document Identifier:** `13-hod-ui-specification.md`  
**Classification:** Implementation-Grade UI / Wireframe / High-Fidelity Product Design Specification  
**Target Role:** `ROLE_DEPT_HEAD` (HOD / Department Supervisor)  
**Locked Palette:** Primary `#B39DDB` | Secondary `#D6C6EC` | Accent `#F3EDFA` | Surface `#FCFAFE` | Text `#43395A` (Contrast 10.2:1)

---

## 1. Persona Mental Model & Core Objectives

Department Heads oversee the entire grievance throughput of their academic or operational unit.
- **Primary Need:** Complete departmental queue visibility, efficient triage, balanced staff assignment, and SLA risk mitigation.
- **Key Question:** "What unassigned complaints need routing, are any handlers overloaded, and what tickets are at risk of breaching SLA?"
- **UX Tenet:** High information density, quick-action assignment triggers, live workload balancing graphs, and rapid rejection/duplicate workflows.

---

## 2. Screen Specifications

### 2.1 HOD-001: Department Head Oversight Dashboard (`/dashboard`)
- **Header Bar:** TopBar with `#B39DDB` 3px accent bar, HOD title, department name tag.
- **Executive Metric Row (4 Cards):**
  1. *Unassigned Triage:* Complaints in `SUBMITTED` or `REVIEWED` awaiting assignment.
  2. *Active In-Progress:* Current operational workload across all departmental handlers.
  3. *Escalations / Blockers:* Complaints escalated to Tier 2 (HOD level).
  4. *SLA Performance:* Department compliance rate (e.g. 96.4%).
- **Primary Triage Table:**
  - Columns: Checkbox, `TrackingCodeBadge`, Title, Complainant, Priority, Age/SLA, Suggested Handler, Quick Actions.
  - Row Actions: `[ Assign ]` `[ Forward ]` `[ Mark Duplicate ]` `[ Reject ]`.
- **Handler Workload Distribution Panel:**
  - Visual stacked bar chart indicating active assigned cases per departmental staff member.
  - Helps HOD avoid overloading specific technicians.

### 2.2 HOD-002: Assign Handler Dialog Modal (`CMP-FEED-07`)
- **Trigger:** Click `[ Assign ]` from triage queue or detail page (`POST /api/v1/complaints/[id]/assign`).
- **Anatomy:**
  ```text
  +-------------------------------------------------------------+
  | Assign Handler: CP-2026-00924                               |
  +-------------------------------------------------------------+
  | Complaint: Switch Failure in Server Room 2                  |
  | Priority: URGENT | Category: NETWORK_WIFI                   |
  |                                                             |
  | Select Handler (IT Infrastructure Department Only): *       |
  | [ R. Verma (Active Tasks: 2)                              v]|
  |   - R. Verma (Active: 2) - Available                        |
  |   - A. Kulkarni (Active: 6) - Heavy Load                    |
  |   - T. Sengupta (Active: 1) - Available                     |
  |                                                             |
  | Assignment Instructions / Internal Note (Optional):        |
  | [ Textarea for specific guidance to handler               ] |
  |                                                             |
  | [ Cancel ]                                [ Confirm Assign ]|
  +-------------------------------------------------------------+
  ```
- **Constraint Rule:** Handler select list is strictly constrained to handlers belonging to the same department (`INV-007`).

### 2.3 HOD-003: Reject Complaint Modal
- **Trigger:** Click `[ Reject ]` for non-actionable, invalid, or policy-violating complaints (`POST /api/v1/complaints/[id]/reject`).
- **Fields:**
  - *Rejection Reason:* Dropdown (`OUT_OF_SCOPE`, `INSUFFICIENT_INFORMATION`, `POLICY_VIOLATION`, `UNAUTHORIZED_REQUEST`).
  - *Formal Justification:* Mandatory textarea (minimum 20 characters). This text is sent to the student.

### 2.4 HOD-004: Mark Duplicate Modal
- **Trigger:** Click `[ Mark Duplicate ]` (`POST /api/v1/complaints/[id]/duplicate`).
- **Fields:**
  - *Master Complaint Search:* Search box allowing HOD to search by tracking code or keywords to find the primary complaint.
  - *Master Complaint Selection:* Confirms linking this ticket to the master ticket.
