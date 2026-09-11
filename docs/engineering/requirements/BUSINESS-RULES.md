# Campus Plus — Formal Business Rules Catalog

**Phase**: Phase 01 — Requirements Engineering & Problem Intelligence  
**Document**: BUSINESS-RULES.md  
**Version**: 0.1  
**Status**: Draft / Conditional  
**Classification Standards**: SOURCE | DECISION | INFERENCE | PROPOSED | ASSUMPTION | UNKNOWN  

---

## 1. Executive Summary

This catalog articulates the formal business rules, domain invariants, validation boundaries, and operational constraints governing **Campus Plus**. Each rule is assigned a stable identifier (`BR-001`, `BR-002`, etc.), classified by its source of authority, and defined with unambiguous operational semantics.

---

## 2. Business Rules Catalog

### 2.1 Complaint Submission & Integrity Rules

| Rule ID | Rule Title | Classification | Formal Rule Statement | Enforcement Context |
| :--- | :--- | :--- | :--- | :--- |
| **`BR-001`** | **Mandatory Complainant Identification** | **SOURCE** | Every complaint submitted to the system must be linked to a single, verified, authenticated user account (`ROLE_STUDENT` or authorized submitter). Anonymous complaints are disallowed unless an explicit anonymous grievance policy is formally enacted. | Submission boundary |
| **`BR-002`** | **Minimum Complaint Specification** | **SOURCE** | A valid complaint submission must include a non-empty Title (10–120 characters), a detailed Description (minimum 30 characters), a valid Category selection, a suggested Priority, and a designated physical/departmental Location. | Validation boundary |
| **`BR-003`** | **Unique Complaint Tracking Reference** | **SOURCE** | Upon submission, the system must immediately issue a globally unique, human-readable complaint tracking identifier (e.g., `CP-2026-XXXXX`). This identifier must remain permanently immutable and searchable. | State entry (`SUBMITTED`) |
| **`BR-004`** | **Submission Immutability** | **INFERENCE** | Once a complaint has been triaged, reviewed, or assigned, its core description and initial category cannot be edited by the complainant. Complainants may only append supplementary comments or attachments. | Update boundary |

---

### 2.2 Categorization & Priority Rules

| Rule ID | Rule Title | Classification | Formal Rule Statement | Enforcement Context |
| :--- | :--- | :--- | :--- | :--- |
| **`BR-005`** | **Valid Category Binding** | **SOURCE** | Every complaint must belong to exactly one active institutional category (e.g., Academic, Infrastructure, Hostel, Transport, Sanitation, Administration). | Creation / Triage |
| **`BR-006`** | **Authority Priority Override** | **INFERENCE** | A student submits a *suggested* priority (`LOW`, `MEDIUM`, `HIGH`, `URGENT`). Department Authorities and Assigned Handlers hold exclusive authority to re-evaluate and adjust the official priority based on objective institutional criteria. Any adjustment must record an audit entry. | Triage / Progress |
| **`BR-007`** | **Deprecation of Categories** | **PROPOSED** | Categories cannot be deleted if complaints reference them. Categories may only be marked `INACTIVE` to prevent future submissions while preserving historical integrity. | Category Management |

---

### 2.3 Assignment & Routing Rules

| Rule ID | Rule Title | Classification | Formal Rule Statement | Enforcement Context |
| :--- | :--- | :--- | :--- | :--- |
| **`BR-008`** | **Single Responsible Handler** | **SOURCE** | At any given moment in `ASSIGNED` or `IN PROGRESS` state, a complaint must have exactly ONE primary assigned authority/handler who holds operational responsibility for resolution. | State invariant |
| **`BR-009`** | **Jurisdictional Assignment Authority** | **INFERENCE** | Only a Department Authority (`ROLE_DEPT_HEAD`) or System Administrator has permission to assign or reassign complaints to handlers within their designated department. | Assignment boundary |
| **`BR-010`** | **Mandatory Forwarding Rationale** | **SOURCE** | Any transfer of a complaint from one department to another (Forwarding) requires the initiating authority to provide a documented business justification for misdirection or cross-boundary handling. | Forward transition |
| **`BR-011`** | **Assignment Traceability** | **SOURCE** | Every change of assignment (initial assignment, reassignment, or forwarding) must generate an immutable audit log entry detailing who made the change, to whom it was assigned, the timestamp, and the reason. | Assignment transition |

---

### 2.4 Escalation Rules

| Rule ID | Rule Title | Classification | Formal Rule Statement | Enforcement Context |
| :--- | :--- | :--- | :--- | :--- |
| **`BR-012`** | **Escalation Invariance** | **SOURCE** | Escalating a complaint does NOT relieve the assigned handler of their existing context, nor does it wipe out historical notes. Escalation introduces higher administrative oversight (`ROLE_DEPT_HEAD` or `ROLE_MANAGEMENT`). | Escalation transition |
| **`BR-013`** | **Mandatory Escalation Justification** | **INFERENCE** | Manual escalation requires the initiating actor to select an escalation reason (e.g., Lack of Resources, Cross-Department Deadlock, Technical Complexity, Policy Violation, Unresponsive Party) and provide explanatory remarks. | Escalation transition |
| **`BR-014`** | **Priority-Driven Escalation Alerts** | **INFERENCE** | Complaints flagged as `URGENT` or `HIGH` priority trigger expedited notifications to Department Heads if unassigned or unresolved beyond configured thresholds. | Notification engine |

---

### 2.5 Resolution & Closure Rules

| Rule ID | Rule Title | Classification | Formal Rule Statement | Enforcement Context |
| :--- | :--- | :--- | :--- | :--- |
| **`BR-015`** | **Mandatory Resolution Summary** | **SOURCE** | A complaint cannot transition to `RESOLVED` without a non-empty resolution summary explaining the exact corrective action executed by the authority. | Resolution transition |
| **`BR-016`** | **Complainant Verification Window** | **PROPOSED** | Upon reaching `RESOLVED`, the complainant is granted an active verification window of $N$ business days (default: 5 days, subject to `OD-008`). During this window, the complainant may either accept the resolution or dispute it with a reason. | Resolution lifecycle |
| **`BR-017`** | **Auto-Closure Invariant** | **PROPOSED** | If the complainant does not dispute or verify the resolution within the active verification window, the complaint automatically transitions to `CLOSED` by the system with reason `AUTO_CLOSED_NO_DISPUTE`. | Scheduled job / timer |
| **`BR-018`** | **Reopen Conditionality** | **PROPOSED** | A complaint may only be transitioned to `REOPENED` from `RESOLVED` by the original complainant within the verification window, accompanied by mandatory explanation of why the resolution was unsatisfactory. | Reopen transition |

---

### 2.6 Audit, History & Traceability Rules

| Rule ID | Rule Title | Classification | Formal Rule Statement | Enforcement Context |
| :--- | :--- | :--- | :--- | :--- |
| **`BR-019`** | **Append-Only Action History** | **SOURCE** | All actions (creation, assignment, status change, forwarding, escalation, comments, resolution, attachments) must be recorded in an append-only audit trail. Historical records can never be updated, overwritten, or deleted by any user or administrator. | System-wide data integrity |
| **`BR-020`** | **Dual-Level Remark Visibility** | **INFERENCE** | Notes/remarks added by authorities may be tagged as either `PUBLIC` (visible to the student) or `INTERNAL` (visible only to authorized staff and management) to facilitate confidential internal coordination. | Comment creation |

---

### 2.7 Attachment & Evidence Rules

| Rule ID | Rule Title | Classification | Formal Rule Statement | Enforcement Context |
| :--- | :--- | :--- | :--- | :--- |
| **`BR-021`** | **Attachment Integrity** | **SOURCE** | Attachments uploaded during submission or resolution are permanently bound to the complaint record and cannot be deleted once the complaint has progressed beyond `SUBMITTED`. | Storage / Lifecycle |
| **`BR-022`** | **Attachment Restrictions** | **INFERENCE** | Attachments must be restricted to approved file types (e.g., PDF, PNG, JPG, JPEG) and enforced with strict per-file size limits (e.g., maximum 5MB, subject to `OD-010`). | Upload boundary |

---

### 2.8 Recurring Complaint Intelligence Rules

| Rule ID | Rule Title | Classification | Formal Rule Statement | Enforcement Context |
| :--- | :--- | :--- | :--- | :--- |
| **`BR-023`** | **Recurring Issue Flagging** | **SOURCE** | The system must calculate and surface recurring grievance trends when multiple distinct complaints share matching attributes (such as category, department, physical location, or root cause) within a designated observation timeframe. | Analytics / Dashboard |
| **`BR-024`** | **Non-Destructive Clustering** | **INFERENCE** | Flagging a complaint as part of a recurring pattern must not merge or destroy individual complaint records or suppress individual accountability. Each complaint retains its own tracking, assignment, and resolution chain. | Analytics engine |

---

## 3. Verification Checklist

- [x] Every business rule directly supports Level 1 Source or clearly classified as INFERENCE / PROPOSED.
- [x] Invariants specified for state transitions, assignments, escalations, and resolution.
- [x] Immutability of tracking references and audit histories strictly codified.
- [x] Dual-level visibility (public vs. internal) formalized.
