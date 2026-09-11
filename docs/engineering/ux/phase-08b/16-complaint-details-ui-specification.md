# Phase 08-B: Complaint Details UI Specification & Architecture

**Document Identifier:** `16-complaint-details-ui-specification.md`  
**Classification:** Implementation-Grade UI / Wireframe / High-Fidelity Product Design Specification  
**Scope:** Universal complaint inspection interface (`/complaints/[id]`) across all 5 roles.

---

## 1. Information Architecture & Spatial Layout

The Complaint Details surface operates as the primary operational nexus for all stakeholders. Its spatial organization adapts dynamically to the authenticated user's role while maintaining a consistent visual grammar.

```text
+----------------------------------------------------------------------------------------------------+
| Master Brand Bar [3px Role Accent]                                                                 |
| Global TopBar (Breadcrumbs: Dashboard > Complaints > CP-2026-00842)        [Role Badge] [User Menu]|
+----------------------------------------------------------------------------------------------------+
| COMPLAINT HEADER & STATUS BANNER                                                                   |
| [CP-2026-00842] (Copy)  Broken Study Desk in Hostel B-204       [StatusPill] [PriorityBadge]       |
| Submitted: Feb 18, 2026, 11:30 AM | Dept: Hostel Maintenance | Category: HOSTEL_MAINTENANCE        |
+----------------------------------------------------------------------------------------------------+
| CONTEXTUAL ACTION BANNER (Rendered conditionally based on Role x Status)                            |
| [!] Student Verification Banner OR Handler Resolution Callout OR SLA Breach Warning Banner         |
| Primary Action Buttons: [ Verify & Close ] [ Dispute ] / [ Start Progress ] / [ Assign ] etc.      |
+------------------------------------------------------------------+---------------------------------+
| PRIMARY CONTENT COLUMN (65% Width)                               | METADATA & SIDECAR (35% Width)  |
|                                                                  |                                 |
| 1. Grievance Description                                         | Tracking Code: CP-2026-00842    |
|    "Study desk in room B-204 has sheared support leg..."        | Version: 3 (OCC Protected)      |
|                                                                  | Department: Hostel Maintenance  |
| 2. Structured Campus Location                                    | Location: Hostel B, Room 204    |
|    - Building: Hostel B                                          | Assigned Handler: R. Verma      |
|    - Floor/Unit: Room 204                                        | Forward Count: 0 / 3            |
|    - Details: Near window desk bay                               | Escalation Tier: Tier 1         |
|                                                                  | SLA Deadline: Feb 22, 11:30 AM  |
| 3. Evidence Attachments                                          | Remaining: 18h 45m [ON-TRACK]   |
|    [desk_damage.jpg (2.1 MB)] [leg_shear.png (1.4 MB)]           |                                 |
|                                                                  | Complainant Info:               |
| 4. Activity & Collaboration History                              | - Name: S. Sharma               |
|    [ Public Resolution Timeline ]  [ Internal Staff Notes (3) ]  | - Roll: CS-2024-88              |
|    (Internal Notes tab strictly hidden from students per INV-012)| - Contact: Protected by RLS     |
+------------------------------------------------------------------+---------------------------------+
```

---

## 2. Public vs Internal Segregation Architecture (`INV-012`)

Campus Plus strictly enforces information privacy between institutional staff and complainants:
1. **Public Resolution Timeline:**
   - Visible to **ALL** authenticated parties (Student complainant, Handler, HOD, Management, Admin).
   - Contains major institutional lifecycle events: `SUBMISSION`, `ASSIGNMENT`, `PROGRESS_UPDATES`, `FORWARDING`, `RESOLUTION`, `VERIFICATION`, `CLOSURE`.
   - Remarks in this tab are verified for public consumption.
2. **Internal Staff Notes Tab:**
   - **STRICTLY PROHIBITED** from rendering in the DOM when `role === 'ROLE_STUDENT'`.
   - Accessible only to `ROLE_HANDLER`, `ROLE_DEPT_HEAD`, `ROLE_MANAGEMENT`, `ROLE_ADMIN`.
   - Contains operational comments, diagnostic discussions, technician handoffs, and sensitive staff notes.
   - Includes input box for staff to append internal notes without notifying the student.

---

## 3. Dynamic Action Matrix by Role & State

The top action bar renders buttons strictly matching `AuthorizationPolicy.ts`:

| Current State | Student Complainant | Assigned Handler | Department Head | Management / Admin |
| :--- | :--- | :--- | :--- | :--- |
| **SUBMITTED** | `[ Cancel ]` | None | `[ Review ]` `[ Assign ]` `[ Reject ]` `[ Duplicate ]` | `[ Re-assign ]` `[ Escalate ]` |
| **REVIEWED** | None | None | `[ Assign ]` `[ Reject ]` `[ Duplicate ]` | `[ Re-assign ]` |
| **ASSIGNED** | None | `[ Start Progress ]` | `[ Re-assign ]` `[ Forward ]` | `[ Escalate ]` |
| **IN_PROGRESS** | None | `[ Resolve ]` `[ Forward ]` `[ Escalate ]` | `[ Forward ]` `[ Escalate ]` | `[ Escalate ]` |
| **FORWARDED** | None | None | `[ Review ]` `[ Assign ]` | `[ Monitor ]` |
| **ESCALATED** | None | `[ Resolve ]` `[ Forward ]` | `[ Assign ]` `[ Resolve ]` | `[ Intervene ]` `[ Re-route ]` |
| **RESOLVED** | `[ Verify & Close ]` `[ Dispute ]` | None | None | None |
| **CLOSED** | Read-only | Read-only | Read-only | Read-only |
| **REJECTED** | Read-only | Read-only | Read-only | Read-only |
