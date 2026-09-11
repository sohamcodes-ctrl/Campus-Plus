# Campus Plus — RBAC, Data Scope & Privacy Architecture

**Project**: Campus Plus — Campus Complaint and Grievance Resolution System  
**Phase**: Phase 02 — Architecture Definition & Technical Blueprint  
**Document**: RBAC-AUTHORIZATION-MODEL.md  
**Version**: 1.0  
**Status**: Formal Security & Access Architecture  
**Authors**: Security Architect, Lead Software Architect  

---

## 1. Executive Summary

This document specifies the complete **Multi-Tier Authorization Model** for Campus Plus, combining **Role-Based Access Control (RBAC)**, an explicit **Data Scope Model**, database **Row-Level Security (RLS)** policy specifications, and a comprehensive **Privacy Architecture**. 

Authorization is enforced server-side with defense-in-depth: client UI controls serve exclusively as UX guidance and are never trusted as security boundaries (`SEC-002`, `NFR-005`, `ADR-003`).

---

## 2. Role Taxonomy & Operational Authority

The system defines 5 authenticated roles with strict operational responsibilities:

1. **`ROLE_STUDENT` (Complainant)**: Authenticated student. Submits personal grievances, tracks their status, interacts via public comments, uploads initial evidence, and verifies or disputes completed resolutions.
2. **`ROLE_HANDLER` (Complaint Handler / Assigned Authority)**: Staff technician or operational officer. Investigates assigned tickets, updates progress, adds internal notes or public remarks, forwards miscategorized issues, escalates blockers, and submits resolution notes with proof.
3. **`ROLE_DEPT_HEAD` (Department-Level Authority / Triage Desk)**: Head of an academic or operational department. Triages unassigned complaints within their department, assigns/reassigns staff handlers, reviews cross-department forwarding, handles departmental escalations, and monitors department backlogs.
4. **`ROLE_ADMIN` (System Administrator)**: Technical system custodian. Manages master categories, departments, user account activation/roles, and monitors technical system health and audit logs. Has zero authority to silently delete complaint records.
5. **`ROLE_MANAGEMENT` (Institutional Management / Executive Leadership)**: Principal, Deans, and Campus Grievance Redressal Committee. Accesses institution-wide analytical dashboards, monitors recurring chronic complaint hotspots, audits SLA compliance, and oversees critical escalated grievances.

---

## 3. Comprehensive RBAC Permissions Matrix

| Operation / Capability | Target Resource | `ROLE_STUDENT` | `ROLE_HANDLER` | `ROLE_DEPT_HEAD` | `ROLE_ADMIN` | `ROLE_MANAGEMENT` | Enforcement Boundary |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :--- |
| **Submit Complaint** | `complaints` | **ALLOW** | ALLOW (Personal) | ALLOW (Personal) | DENY | DENY | App Guard (`FR-001`) |
| **View Complaint Details** | `complaints` | SCOPED (Own) | SCOPED (Assigned/Dept) | SCOPED (Dept) | **ALLOW** (All) | **ALLOW** (All) | App Guard + DB RLS |
| **Edit Pre-Triage Complaint**| `complaints` | SCOPED (Own draft)| DENY | DENY | DENY | DENY | App Guard |
| **Assign Handler** | `complaints` | DENY | DENY | SCOPED (Dept) | **ALLOW** | DENY | App Guard (`FR-008`) |
| **Reassign Handler** | `complaints` | DENY | DENY | SCOPED (Dept) | **ALLOW** | DENY | App Guard (`FR-009`) |
| **Forward Department** | `complaints` | DENY | SCOPED (Assigned)| SCOPED (Dept) | **ALLOW** | DENY | App Guard (`FR-010`) |
| **Acknowledge / Progress** | `complaints` | DENY | SCOPED (Assigned)| SCOPED (Dept) | DENY | DENY | App Guard (`FR-011`) |
| **Manual Escalate** | `complaints` | DENY | SCOPED (Assigned)| SCOPED (Dept) | DENY | DENY | App Guard (`FR-013`) |
| **Resolve Complaint** | `complaints` | DENY | SCOPED (Assigned)| SCOPED (Dept) | DENY | DENY | App Guard (`FR-015`) |
| **Verify Resolution / Close**| `complaints` | SCOPED (Own) | DENY | SCOPED (Dept auto)| **ALLOW** | DENY | App Guard (`FR-017`) |
| **Dispute / Reopen** | `complaints` | SCOPED (Own) | DENY | DENY | DENY | DENY | App Guard (`FR-018`) |
| **Reject / Duplicate Flag** | `complaints` | DENY | DENY | SCOPED (Dept) | **ALLOW** | DENY | App Guard |
| **Add Public Comment** | `comments` | SCOPED (Own) | SCOPED (Assigned)| SCOPED (Dept) | **ALLOW** | DENY | App Guard |
| **Add Internal Staff Note** | `comments` | DENY | SCOPED (Assigned)| SCOPED (Dept) | **ALLOW** | SCOPED (Escalated) | App Guard + DB RLS |
| **Upload Initial Evidence** | `attachments` | SCOPED (Own) | DENY | DENY | DENY | DENY | Storage Presigned Policy |
| **Upload Resolution Proof** | `attachments` | DENY | SCOPED (Assigned)| SCOPED (Dept) | DENY | DENY | Storage Presigned Policy |
| **View Attachments** | `attachments` | SCOPED (Own) | SCOPED (Assigned/Dept) | SCOPED (Dept) | **ALLOW** | **ALLOW** | Signed URL Auth Guard |
| **Manage Users & Roles** | `users` | DENY | DENY | DENY | **ALLOW** | DENY | App Guard |
| **Manage Categories/Depts** | `categories` | DENY | DENY | DENY | **ALLOW** | DENY | App Guard |
| **Configure SLA Policies** | `sla_policies`| DENY | DENY | DENY | **ALLOW** | DENY | App Guard |
| **View Personal Dashboard** | Dashboards | **ALLOW** | DENY | DENY | DENY | DENY | View Guard (`FR-021`) |
| **View Handler Dashboard** | Dashboards | DENY | **ALLOW** | **ALLOW** | DENY | DENY | View Guard (`FR-022`) |
| **View Department Dashboard**| Dashboards | DENY | DENY | **ALLOW** | **ALLOW** | **ALLOW** | View Guard (`FR-023`) |
| **View Executive Dashboard** | Dashboards | DENY | DENY | DENY | DENY | **ALLOW** | View Guard (`FR-024`) |
| **View Recurring Hotspots** | Analytics | DENY | DENY | SCOPED (Dept) | **ALLOW** | **ALLOW** | Analytics Query Guard |
| **View Audit Trail** | `action_history`| SCOPED (Public) | SCOPED (Dept) | SCOPED (Dept) | **ALLOW** | **ALLOW** | App Guard + DB RLS |

---

## 4. Formal RBAC $\times$ Data Scope Model

To avoid blanket role authorizations, every sensitive access rule is codified as:
$$\textbf{Role} + \textbf{Action} + \textbf{Resource} + \textbf{Data Scope} + \textbf{Condition}$$

### Detailed Scope Rules:
1. `ROLE_STUDENT` + `read` + `Complaint` + `OWN_RECORDS` + `WHERE complainant_id == auth.user_id`
2. `ROLE_HANDLER` + `read` + `Complaint` + `ASSIGNED_OR_DEPARTMENT` + `WHERE assigned_handler_id == auth.user_id OR department_id == auth.user_department_id`
3. `ROLE_HANDLER` + `update` + `Complaint` + `ASSIGNED_RECORDS` + `WHERE assigned_handler_id == auth.user_id AND status IN ('ASSIGNED', 'IN_PROGRESS', 'ESCALATED')`
4. `ROLE_DEPT_HEAD` + `read` + `Complaint` + `DEPARTMENT_RECORDS` + `WHERE department_id == auth.user_department_id`
5. `ROLE_DEPT_HEAD` + `update` + `Complaint` + `DEPARTMENT_RECORDS` + `WHERE department_id == auth.user_department_id AND status NOT IN ('CLOSED', 'REJECTED', 'CANCELLED')`
6. `ROLE_MANAGEMENT` + `read` + `Complaint` + `INSTITUTION_WIDE` + `WHERE true`
7. `ROLE_MANAGEMENT` + `update` + `Complaint` + `NONE` + `DENY ALL MUTATIONS (Management is read-only oversight)`
8. `ROLE_ADMIN` + `read` + `Complaint` + `INSTITUTION_WIDE` + `WHERE true`
9. `ROLE_ADMIN` + `update` + `Complaint` + `TRIAGE_AND_OVERRIDE` + `WHERE status IN ('SUBMITTED', 'FORWARDED', 'REOPENED')`

---

## 5. PostgreSQL Row-Level Security (RLS) Policy Specifications

In compliance with `ADR-003` and `ADR-012`, PostgreSQL Row-Level Security serves as the impermeable database kernel backstop.

```text
       ┌─────────────────────────────────────────────────────────────┐
       │                HTTP API Application Gateway                 │
       │     (Enforces Declarative TypeScript RBAC Guards)           │
       └──────────────────────────────┬──────────────────────────────┘
                                      │ Client Context: auth.uid(), role, dept_id
                                      ▼
       ┌─────────────────────────────────────────────────────────────┐
       │             PostgreSQL Kernel Engine (RLS)                  │
       │    (Evaluates SQL Row Policies Prior to Query Execution)    │
       ├─────────────────────────────────────────────────────────────┤
       │ • complaints: Restricts rows strictly by user/dept claims   │
       │ • action_history: Automatically hides INTERNAL remarks      │
       │ • attachments: Restricts download tokens to authorized rows │
       └─────────────────────────────────────────────────────────────┘
```

### Conceptual Policy Specifications (DDL Blueprint):

#### 5.1 `complaints` Table RLS Policies
- **Enable RLS**: `ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;`
- **SELECT Policy (`complaints_select_policy`)**:
  ```sql
  CREATE POLICY complaints_select_policy ON complaints
  FOR SELECT TO authenticated
  USING (
      -- Students see only their own complaints
      (auth.jwt()->>'role' = 'ROLE_STUDENT' AND complainant_id = auth.uid())
      OR
      -- Handlers see assigned complaints or complaints within their department
      (auth.jwt()->>'role' = 'ROLE_HANDLER' AND (assigned_handler_id = auth.uid() OR department_id = (auth.jwt()->>'department_id')::uuid))
      OR
      -- Department heads see all complaints in their department
      (auth.jwt()->>'role' = 'ROLE_DEPT_HEAD' AND department_id = (auth.jwt()->>'department_id')::uuid)
      OR
      -- Admins and Management see all institutional complaints
      (auth.jwt()->>'role' IN ('ROLE_ADMIN', 'ROLE_MANAGEMENT'))
  );
  ```
- **INSERT Policy (`complaints_insert_policy`)**:
  ```sql
  CREATE POLICY complaints_insert_policy ON complaints
  FOR INSERT TO authenticated
  WITH CHECK (
      -- Only students (or personal complaints by staff) can insert, binding complainant_id to auth.uid()
      auth.uid() = complainant_id
  );
  ```
- **UPDATE Policy (`complaints_update_policy`)**:
  ```sql
  CREATE POLICY complaints_update_policy ON complaints
  FOR UPDATE TO authenticated
  USING (
      (auth.jwt()->>'role' = 'ROLE_HANDLER' AND assigned_handler_id = auth.uid())
      OR
      (auth.jwt()->>'role' = 'ROLE_DEPT_HEAD' AND department_id = (auth.jwt()->>'department_id')::uuid)
      OR
      (auth.jwt()->>'role' = 'ROLE_ADMIN')
  );
  ```
- **DELETE Policy**: Zero delete policies created. `REVOKE DELETE ON complaints FROM authenticated;` permanently prevents row deletion.

#### 5.2 `action_history` Table RLS Policies
- **SELECT Policy (`action_history_select_policy`)**:
  ```sql
  CREATE POLICY action_history_select_policy ON action_history
  FOR SELECT TO authenticated
  USING (
      -- Complainants see only PUBLIC records on their own complaints
      (auth.jwt()->>'role' = 'ROLE_STUDENT' AND visibility_level = 'PUBLIC' AND complaint_id IN (SELECT id FROM complaints WHERE complainant_id = auth.uid()))
      OR
      -- Staff, Admins, and Management see PUBLIC and INTERNAL records for complaints they are authorized to view
      (auth.jwt()->>'role' IN ('ROLE_HANDLER', 'ROLE_DEPT_HEAD', 'ROLE_ADMIN', 'ROLE_MANAGEMENT') AND complaint_id IN (SELECT id FROM complaints))
  );
  ```

---

## 6. Privacy Architecture & Data Classification

All data managed by Campus Plus is formally classified into 4 sensitivity tiers:

| Data Classification Tier | Attributes & Objects Included | Storage & Encryption Boundary | Access & Visibility Restrictions | Retention & Purge Rules |
| :--- | :--- | :--- | :--- | :--- |
| **Tier 1: Public** | Institutional category names, department codes, public policy guidelines, aggregated recurring issue charts. | Standard relational storage; unencrypted database columns. | Accessible to all authenticated users. | Retained indefinitely for historical reporting. |
| **Tier 2: Internal** | Handler assignments, SLA status indicators, departmental backlog statistics, intra-staff routing notes. | Database encrypted at rest (AES-256). | Accessible strictly to staff, handlers, department heads, and management. Hidden from student portal. | Retained for 4 academic years (`NFR-010`). |
| **Tier 3: Confidential (PII)** | Student full name, roll number / PRN, student email, phone number, physical grievance location. | Database encrypted at rest; query projection masks phone/email. | Exposed strictly to assigned handler and department head; never displayed on public or cross-department queries (`PRIV-001`). | Retained for student tenure + 1 year after graduation. |
| **Tier 4: Highly Sensitive** | Supporting evidence images/PDFs, resolution proof files, disciplinary remarks, whistleblower allegations (`OD-012`). | Private object storage; time-limited presigned URLs (15-min TTL); server-side encrypted. | Inaccessible without active authenticated session meeting explicit RBAC and RLS row binding. Direct bucket URLs strictly blocked. | Archived upon ticket closure; permanent audit log reference retained. |

---

## 7. Separation of Student-Visible Timeline vs. Internal Remarks

To prevent sensitive staff deliberations, technical disputes, or contractor negotiations from leaking to students (`PRIV-002`, `BR-020`):

```text
                                [Action / Remark Logged]
                                           │
                                           ▼
                           Is caller ROLE_STUDENT or Staff?
                                           │
             ┌─────────────────────────────┴─────────────────────────────┐
             ▼                                                           ▼
     [Complainant Action]                                        [Authority Action]
     • Complaint Submitted                                       • Evaluates Remark Sensitivity
     • Complainant Comment                                       • Explicitly toggles:
     • Resolution Verified                                         [x] PUBLIC TO STUDENT
     • Dispute Reopened                                            [ ] INTERNAL STAFF ONLY
             │                                                           │
             ▼                                                           ▼
    visibility = 'PUBLIC'                                       visibility = 'INTERNAL'
             │                                                           │
             ▼                                                           ▼
  Visible on Student Timeline                                 Filtered OUT of Student Timeline
  (Rendered on Tracking View)                                 (Visible strictly to Staff / Admin)
```

---

## 8. Architecture Verification Summary

- [x] All 5 roles mapped to fine-grained operational capabilities.
- [x] Formal Data Scope Model eliminates blanket permissions (`Role + Action + Resource + Scope + Condition`).
- [x] Concrete PostgreSQL RLS DDL blueprints establish defense-in-depth row isolation.
- [x] 4-tier Data Classification model enforces PII protection and signed attachment access.
- [x] Explicit separation between student-visible timeline and internal staff remarks.
