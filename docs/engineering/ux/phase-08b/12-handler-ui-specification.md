# Phase 08-B: Handler Persona UI Specification (ROLE_HANDLER)

**Document Identifier:** `12-handler-ui-specification.md`  
**Classification:** Implementation-Grade UI / Wireframe / High-Fidelity Product Design Specification  
**Target Role:** `ROLE_HANDLER` (Operations Staff / Field Technician)  
**Locked Palette:** Primary `#7FC4B2` | Secondary `#B7E0D3` | Accent `#E9F6F1` | Surface `#FAFDFC` | Text `#2E4A42` (Contrast 8.9:1)

---

## 1. Persona Mental Model & Core Objectives

Handlers are operational campus staff (e.g. electricians, network technicians, maintenance personnel).
- **Primary Need:** Rapid prioritization of active work orders, clear operational context, minimal bureaucratic friction.
- **Key Question:** "What task must I execute right now, what is the location, and how much time remains before SLA breach?"
- **UX Tenet:** Action-oriented worklists, SLA countdown badges, single-click status progression, and structured modal dialogs for forwarding/resolving.

---

## 2. Screen Specifications

### 2.1 FAC-001: Handler Operational Dashboard (`/dashboard`)
- **Header Bar:** Master TopBar with `#7FC4B2` 3px accent bar, handler name, role badge `[Handler: IT]`.
- **Top Metric Cards (3 Columns):**
  1. *Assigned to Me:* Active complaints where `assigned_handler_id = current_user.id`.
  2. *In Progress:* Complaints actively being serviced by the handler.
  3. *SLA at Risk (< 4h):* Urgent items approaching institutional deadline.
- **Worklist Tabs:**
  - `[ My Active Tasks ]`: Default view. Sorted by priority (URGENT -> HIGH -> MED -> LOW) then ascending SLA deadline.
  - `[ Department Pool ]`: Unassigned or co-worker complaints in the same department (view only).
  - `[ Resolved by Me ]`: Historical completed complaints.
- **Worklist Row Anatomy:**
  - SLA Status Pill (Green: `> 12h`, Amber: `< 4h`, Red: `Breached`).
  - `TrackingCodeBadge`, Title, Complainant Name, Location details.
  - Action Shortcut Button: If status is `ASSIGNED` -> `[ Start Progress ]`. If `IN_PROGRESS` -> `[ Resolve ]`.

### 2.2 FAC-002: Complaint Detail View (`/complaints/[id]`)
- **Operational Header:**
  - Tracking code, current status pill, SLA deadline indicator with live countdown.
  - Action Command Bar:
    - `[ Start Progress ]` (Transitions `ASSIGNED` -> `IN_PROGRESS`).
    - `[ Resolve ]` (Opens `FAC-005` Resolve Modal).
    - `[ Forward ]` (Opens `FAC-003` Forward Modal).
    - `[ Escalate ]` (Opens `FAC-004` Escalate Modal).
- **Two-Column Work Interface:**
  - **Left Column (Complaint Context):** Complainant details, category, structured location, complete description, initial evidence attachments.
  - **Right Column (Tabbed Collaboration):**
    - Tab 1: *Public Timeline* (Viewable by student).
    - Tab 2: *Internal Staff Notes* (Visible only to Handler, HOD, Admin, Mgt per `INV-012`). Allows posting internal notes.

### 2.3 FAC-003: Forward Dialog Modal (`CMP-FEED-07`)
- **Purpose:** Route misdirected complaints to the correct department (`POST /api/v1/complaints/[id]/forward`).
- **Fields:**
  - *Target Department:* Dropdown. Must exclude current department (`INV-002`).
  - *Forwarding Rationale:* Textarea. Minimum 10 characters (`BR-010`).
  - *Anti-Deadlock Banner:* If `forward_count >= 2`, alert warns: "This complaint has been forwarded 2 times. A 3rd forward will automatically escalate to Management."

### 2.4 FAC-004: Escalate Dialog Modal
- **Purpose:** Escalate blocked or high-severity issues (`POST /api/v1/complaints/[id]/escalate`).
- **Fields:**
  - *Escalation Reason:* Dropdown (`UNAVAILABLE_RESOURCES`, `CROSS_DEPARTMENTAL_BLOCKER`, `HAZARD_RISK`, `POLICY_EXCEEDANCE`).
  - *Detailed Remarks:* Textarea explaining why escalation is necessary.

### 2.5 FAC-005: Resolve Dialog Modal
- **Purpose:** Document completed service and initiate verification (`POST /api/v1/complaints/[id]/resolve`).
- **Fields:**
  - *Resolution Summary:* Mandatory textarea. Minimum 20 characters (`BR-015`).
  - *Resolution Proof Attachments:* Optional upload for photos or work order signed slips.
