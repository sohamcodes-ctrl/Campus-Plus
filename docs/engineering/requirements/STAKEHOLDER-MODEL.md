# Campus Plus — Stakeholder & Organizational Model

**Phase**: Phase 01 — Requirements Engineering & Problem Intelligence  
**Document**: STAKEHOLDER-MODEL.md  
**Version**: 0.1  
**Status**: Draft / Conditional  
**Classification Standards**: SOURCE | DECISION | INFERENCE | PROPOSED | ASSUMPTION | UNKNOWN  

---

## 1. Executive Summary

This document establishes the stakeholder architecture, user role profiles, organizational boundaries, and role-based permissions matrix for **Campus Plus (Campus Complaint and Grievance Resolution System)**. All stakeholder definitions are rooted in Level 1 Project Source Material (Academic Synopsis, R. C. Patel Institute of Technology, 2025-26) with explicit labeling for engineering inferences and open decisions.

---

## 2. Source Material Analysis: Roles & Authority Concepts

The source synopsis identifies the following distinct actor concepts:
1. **"students"**: Individuals who submit complaints with required details, category, priority, and attachments, and track current status.
2. **"authorized users"**: Campus community members or representatives permitted to submit complaints or interact with the system.
3. **"concerned authorities"**: Officials who review, assign, forward, track, update, escalate, and resolve complaints through a structured workflow.
4. **"administrators"**: Oversight actors who monitor campus-level operations, track recurring campus issues, and utilize institutional dashboards to improve campus services.

From these source concepts, the operational stakeholder taxonomy is modeled below.

---

## 3. Stakeholder Profiles & Responsibility Matrix

| Stakeholder Role | Classification | Primary Goal | Core Responsibilities | Information Needed | Permissions Needed | Identified Risks |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Student / Complainant** (`ROLE_STUDENT`) | **SOURCE** | Submit grievances easily; obtain transparent tracking, accountability, and prompt resolution. | - Submit complaints with accurate details, category, suggested priority, and supporting evidence.<br>- Monitor complaint status changes.<br>- Acknowledge or verify resolution (proposed).<br>- Provide clarifications if requested. | - Complaint reference identifier.<br>- Real-time lifecycle status.<br>- Responsible department/handler identity (or designated office).<br>- Action history updates.<br>- Resolution notes and evidence. | - Create complaint.<br>- View own submitted complaints.<br>- Upload initial/additional attachments to own complaint.<br>- Add comment/clarification to own complaint.<br>- Verify resolution / Request reopening (proposed). | - Frustration from repeated complaints.<br>- Reluctance to report sensitive grievances without privacy guarantees.<br>- Submitting incomplete or miscategorized reports. |
| **Complaint Handler / Assigned Authority** (`ROLE_HANDLER`) | **SOURCE** (as "concerned authorities") | Manage assigned complaints; execute investigations; resolve grievances within service expectations. | - Review assigned complaints.<br>- Update operational progress (In Progress).<br>- Request additional information if necessary.<br>- Forward complaint if misrouted or requires co-handling.<br>- Submit resolution notes and verification evidence.<br>- Escalate if beyond authority or blocked. | - Full complaint details, complainant context, and attachments.<br>- Prior action history and forwarding notes.<br>- Escalation policies and timelines.<br>- Complainant communication thread. | - View assigned complaints.<br>- Accept/acknowledge assignment.<br>- Update progress status.<br>- Add internal notes / public progress remarks.<br>- Forward complaint.<br>- Escalate complaint.<br>- Mark complaint resolved with evidence. | - Misassignment leading to resolution bottlenecks.<br>- High unmonitored ticket backlog.<br>- Resolving complaints administratively without actual physical resolution. |
| **Department-Level Authority / Head of Department** (`ROLE_DEPT_HEAD`) | **INFERENCE** (Derived from department-level oversight and forwarding/escalation workflow) | Maintain departmental accountability; oversee timely resolution of departmental complaints; balance workload. | - Review newly incoming department complaints.<br>- Assign complaints to appropriate handlers/staff within department.<br>- Reassign or re-route misdirected complaints.<br>- Handle escalated complaints within the department.<br>- Oversee departmental resolution performance and backlog. | - Departmental complaint backlog and age.<br>- Handler workload distribution.<br>- Departmental escalated complaints.<br>- Category breakdown for department. | - View all complaints assigned to their department.<br>- Assign/reassign complaints to handlers within department.<br>- Forward cross-departmental complaints.<br>- Intervene in or resolve escalated departmental complaints.<br>- View department analytics and audit history. | - Departmental siloing where cross-functional grievances bounce between departments.<br>- Delayed initial triage and assignment. |
| **System Administrator** (`ROLE_ADMIN`) | **SOURCE** (as "administrators") | Maintain system integrity, organizational taxonomy, user access control, and operational configuration. | - Manage user accounts and role assignments.<br>- Maintain institutional organizational hierarchy (departments, offices, categories).<br>- Configure system routing rules and priority/escalation policies.<br>- Monitor technical system health and audit logs. | - System audit trails and security logs.<br>- Complete user registry and role mappings.<br>- Master category and departmental directory.<br>- Error logs and delivery failures. | - Full administrative privileges over users, categories, departments, and configuration.<br>- Read-only or supervised access to grievance content (privacy safeguard).<br>- Manage system audit history. | - Excessive privilege leakage (viewing confidential grievances without operational need).<br>- Misconfiguration of routing rules leading to orphaned complaints. |
| **Institutional Management / Executive Leadership** (`ROLE_MANAGEMENT`) | **SOURCE** (Derived from "administrators ... monitor pending, resolved, escalated, and recurring complaints ... improve campus services") | Gain strategic institutional visibility; identify chronic infrastructure and service deficits; enforce institutional standards. | - Review institutional analytics and cross-departmental dashboards.<br>- Monitor recurring complaint clusters and hotspots.<br>- Track institutional resolution times and escalation rates.<br>- Utilize data to allocate institutional budget and operational improvements. | - Aggregated institutional KPIs (volume, resolution rate, average turnaround time).<br>- Chronic/recurring complaint trends by category, location, and department.<br>- Escalation frequency reports. | - View institutional-level dashboards.<br>- View aggregated and anonymized trend reports.<br>- Drill down into escalated/unresolved institutional grievances (policy-governed). | - Reliance on manipulated resolution metrics if handlers prematurely mark complaints "Resolved".<br>- Inaction on recurring systemic issues. |

---

## 4. Organizational Hierarchy & Boundary Analysis

### 4.1 Boundary Modeling
The Phase 00 reconnaissance established that specific institutional organizational structures for R. C. Patel Institute of Technology (or target deployment institution) have not yet been instantiated in code. To remain implementation-independent while satisfying the synopsis workflow, the organizational model is specified through abstract entities:

```text
[INSTITUTION]
   │
   ├── [MANAGEMENT / CENTRAL GRIEVANCE CELL]
   │
   ├── [ADMINISTRATION] (System / Registry)
   │
   └── [DEPARTMENTS / FUNCTIONAL UNITS]
         ├── Academic Departments (e.g., Information Technology, Computer Eng., etc.)
         ├── Infrastructure & Maintenance (Civil, Electrical, Plumbing, HVAC)
         ├── Campus Services (Hostel, Mess, Transport, Library, Sports)
         └── Student Welfare & Discipline
               │
               └── [ASSIGNED AUTHORITIES / HANDLERS] (Staff, Technicians, Wardens, Faculty)
```

### 4.2 Structural Open Decisions (Hierarchy)
- **`OD-001` (Departmental Ownership)**: Can a single complaint belong to multiple departments concurrently, or must it have a single primary owning department with optional secondary stakeholders? (*Status: OPEN DECISION — See OPEN-DECISIONS.md*).
- **`OD-002` (Escalation Authority Path)**: Is escalation strictly hierarchical (Handler → Department Head → Central Grievance Cell / Principal) or functional based on complaint category severity? (*Status: OPEN DECISION*).
- **`OD-003` (Cross-Department Forwarding Policy)**: When a complaint is forwarded across departments, does the receiving department head have to formally accept the transfer, or is transfer immediate upon forwarding? (*Status: OPEN DECISION*).

---

## 5. Role-Based Access Control (RBAC) Permissions Matrix

The following matrix specifies business-level permissions across all candidate operations:

| Capability / Action | Student (`ROLE_STUDENT`) | Handler (`ROLE_HANDLER`) | Dept Authority (`ROLE_DEPT_HEAD`) | System Admin (`ROLE_ADMIN`) | Management (`ROLE_MANAGEMENT`) | Classification |
| :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **Submit Complaint** | **YES** | YES (personal) | YES (personal) | NO | NO | **SOURCE** |
| **View Own Submitted Complaints** | **YES** | YES (own) | YES (own) | YES (own) | YES (own) | **SOURCE** |
| **View Assigned Complaints** | NO | **YES** | **YES** | NO | NO | **SOURCE** |
| **View All Department Complaints** | NO | NO | **YES** | CONDITIONAL | CONDITIONAL | **INFERENCE** |
| **View All Institutional Complaints**| NO | NO | NO | CONDITIONAL | **YES** | **SOURCE** |
| **Edit Complaint (Draft / Pre-review)**| **YES** | NO | NO | NO | NO | **PROPOSED** |
| **Add Public Comment / Clarification**| **YES** | **YES** | **YES** | NO | NO | **INFERENCE** |
| **Add Internal Administrative Note** | NO | **YES** | **YES** | **YES** | NO | **PROPOSED** |
| **Upload Initial Attachment** | **YES** | NO | NO | NO | NO | **SOURCE** |
| **Upload Resolution Proof Attachment**| NO | **YES** | **YES** | NO | NO | **SOURCE** |
| **Assign Complaint to Handler** | NO | NO | **YES** | **YES** (fallback) | NO | **SOURCE** |
| **Reassign Complaint within Dept** | NO | NO | **YES** | **YES** | NO | **SOURCE** |
| **Forward Complaint Cross-Dept** | NO | **YES** | **YES** | **YES** | NO | **SOURCE** |
| **Escalate Complaint** | NO (source) / PROP | **YES** | **YES** | NO | NO | **SOURCE** |
| **Update Lifecycle Status (In Progress)**| NO | **YES** | **YES** | NO | NO | **SOURCE** |
| **Resolve Complaint (Mark Resolved)**| NO | **YES** | **YES** | NO | NO | **SOURCE** |
| **Verify Resolution / Close Ticket** | **YES** (proposed) | NO | **YES** (auto/manual) | **YES** | NO | **PROPOSED** |
| **Reopen Resolved Complaint** | **YES** (conditional) | NO | **YES** | **YES** | NO | **PROPOSED** |
| **Reject / Flag Invalid Complaint** | NO | **YES** (with reason)| **YES** | **YES** | NO | **INFERENCE** |
| **Manage Departments & Categories** | NO | NO | NO | **YES** | NO | **INFERENCE** |
| **Manage User Roles & Accounts** | NO | NO | NO | **YES** | NO | **INFERENCE** |
| **Access Personal Tracking Dashboard**| **YES** | NO | NO | NO | NO | **SOURCE** |
| **Access Operational Handler Dashboard**| NO | **YES** | **YES** | NO | NO | **SOURCE** |
| **Access Departmental Overview** | NO | NO | **YES** | **YES** | **YES** | **SOURCE** |
| **Access Executive / Insight Dashboard**| NO | NO | NO | NO | **YES** | **SOURCE** |
| **View Full Immutable Audit Trail** | NO (view timeline only)| YES (assigned) | YES (department) | **YES** (system) | YES (audit) | **SOURCE** |

---

## 6. Stakeholder Interaction Model

```text
  [Student / Complainant]
       │
       │ (1) Submits Complaint with Category, Priority & Attachments
       ▼
  [Department Authority / Triage Desk]
       │
       ├── (2a) Forward (Wrong Department) ──> [Other Department Authority]
       │
       └── (2b) Assign Complaint ──> [Assigned Handler]
                                            │
                                            ├── (3a) Update Progress & Action Notes
                                            ├── (3b) Escalate (Overdue / Blocked) ──> [Dept Head / Management]
                                            │
                                            └── (3c) Resolve with Notes & Evidence
                                                        │
       ┌────────────────────────────────────────────────┘
       ▼
  [Student / Complainant]
       │
       ├── (4a) Satisfied ──> Verified & Closed
       └── (4b) Unsatisfied ──> Reopen Request (with Reason)
```

---

## 7. Verification Checklist

- [x] Every stakeholder role traceable to Level 1 Source or clearly marked as INFERENCE/PROPOSED.
- [x] Clear division between operational authorities and system administrative roles.
- [x] Detailed permissions matrix avoiding vague "full access" definitions.
- [x] All organizational boundary ambiguities formally declared as Open Decisions (`OD-001`, `OD-002`, `OD-003`).
