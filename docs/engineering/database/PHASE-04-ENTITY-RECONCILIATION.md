# Phase 04 — Entity Reconciliation Gate

**Project**: Campus Plus — Campus Complaint & Grievance Resolution System  
**Phase**: Phase 04 — Database Engineering & Migration Design  
**Date**: 2026-09-10  
**Status**: Formal Reconciliation Approved  

---

## 1. Purpose of the Reconciliation Gate

In Phase 02 (`DATA-ARCHITECTURE.md`, Section 2 & 7), the architecture report declared:
> *"All 9 core relational entities defined with attributes, ownership, and retention rules."*

Per Phase 04 Rule 6 ("Nine Core Relational Entities — Revalidation Gate"):
> *"Do NOT force the final schema to exactly nine tables. The number nine is not a design constraint. If normalized design requires 14 tables, use 14. If a concept should not be a standalone table, document why."*

This document provides a thorough audit of the 9 conceptual entities from Phase 02 and expands them into a fully normalized, auditable, enterprise-grade relational schema of **16 tables**, justifying every addition.

---

## 2. Revalidation of Phase 02 Conceptual Entities

In Phase 02, the 9 conceptual entities were:
1. `departments`: Academic & administrative service wings.
2. `categories`: Complaint classifications with proof flags.
3. `users`: System user identities.
4. `complaints`: Primary complaint aggregate root.
5. `attachments`: Object storage file metadata.
6. `action_history`: Append-only audit journal.
7. `resolutions`: Formal resolution records & dispute rationales.
8. `sla_policies`: Priority and category SLA hour thresholds.
9. `notifications`: In-app inbox alert records.

### Critical Deficiencies Identified in the 9-Entity Model
While structurally sound for an initial architectural overview, the 9-entity model exhibited several relational and operational shortcomings when evaluated against institutional requirements:
1. **User Role & Department Conflation**:
   - In Phase 02, `users` had single columns `role` and `department_id`. This prevented users from having multiple roles (e.g. staff member who is also a department handler), prevented role assignment auditing, and failed to model historical department reassignment.
2. **Assignment Overwriting**:
   - `complaints.assigned_handler_id` stored only the current handler. When a complaint was reassigned, previous handler tenure was lost from the relational structure and had to be inferred from free-text audit logs.
3. **Cross-Department Forwarding Loop Inability**:
   - Forwarding was represented only as an entry in `action_history`. There was no explicit entity tracking source department, destination department, forward sequence, acceptance state, or preventing circular forwarding ping-pong (`EDGE-004`).
4. **Escalation Event Untracked Relational State**:
   - `complaints.is_escalated` and `escalation_tier` were simple flags on the complaint table without recording who triggered the escalation, whether it was SLA-driven or manual, and the operational rationale.
5. **Lack of Normalized Location Reference**:
   - `location_details` was a free-text string (`VARCHAR(255)`), making rolling 30-day recurring hotspot aggregation (`FR-025`) vulnerable to trivial typos (e.g., "Lab 201" vs "Lab-201").
6. **Working Calendar Omission**:
   - Phase 01 (`ASM-004`) established working calendars as an institutional dependency. Hardcoding calendar calculations in application code without database holiday tables prevents deterministic SLA calculations.
7. **Internal Notes Information Leakage Risk**:
   - Combining internal staff remarks with complainant-visible timeline notes in a single table with a `visibility_level` column creates high risk of accidental IDOR/BOLA leakage. A dedicated `internal_notes` table with isolated RLS provides defense-in-depth.
8. **Transactional Outbox & Idempotency Absence**:
   - In-app notifications and external domain events (ADR-006) require a transactional outbox (`outbox_events`) to prevent dual-write loss, while duplicate complaint prevention requires an `idempotency_keys` table.

---

## 3. Entity Reconciliation & Mapping Matrix

| Phase 02 Entity | Final DB Representation | Relational Table(s) | Normalization & Design Rationale | Requirement Mapping |
| :--- | :--- | :--- | :--- | :--- |
| **`departments`** | Retained as Core Table | `departments` | Master institutional departments & service wings. Soft-deletable via `is_active`. | `FR-008`, `FR-009` |
| **`categories`** | Retained as Core Table | `categories` | Complaint classifications, default owning department, and mandatory proof flag. | `FR-004`, `BR-007` |
| **`users`** | Normalized into 3 Tables | `users`<br>`roles`<br>`user_roles`<br>`department_memberships` | Separates core user identity (`users`) from RBAC definitions (`roles`), explicit assignments (`user_roles`), and department staffing (`department_memberships`). Preserves historical staffing and multi-role capabilities. | `FR-001`, `FR-002`, `ADR-009` |
| *(New / Normalized)* | New Reference Table | `locations` | Controlled institutional locations (Campus, Building, Block, Floor, Room) guaranteeing clean clustering for recurring hotspot detection. | `FR-025`, `ADR-010` |
| *(New / Normalized)* | New Reference Tables | `working_calendars`<br>`calendar_holidays` | Configurable institutional working hours, weekend definitions, and academic holidays for SLA calculations. | `OD-008`, `ASM-004` |
| **`complaints`** | Core Aggregate Table | `complaints` | Primary complaint aggregate root with public tracking code (`ref_id`), current status, current owning department, SLA due date, and version for OCC. | `FR-003`, `FR-006`, `BR-001`–`BR-020` |
| *(New / Normalized)* | New Lifecycle Table | `complaint_assignments` | Dedicated assignment history tracking active and prior handlers, assignment duration, and assigning actor. | `FR-008`, `FR-009` |
| *(New / Normalized)* | New Workflow Table | `complaint_forwards` | Explicit sequential inter-department transfer history with anti-deadlock tracking (`EDGE-004`), source/destination validation, and rationale. | `FR-010`, `BR-010`, `EDGE-004` |
| *(New / Normalized)* | New Workflow Table | `complaint_escalations` | Dedicated escalation event log tracking tier progression (Tier 1 $\to$ 2 $\to$ 3), trigger source (SLA timeout vs manual), and justification. | `FR-013`, `FR-014`, `BR-012` |
| **`resolutions`** | Retained as Core Table | `resolutions` | Mandatory textual resolution summary, resolver identity, completion timestamp, student verification, and dispute rationale. | `FR-016`, `FR-017`, `BR-016` |
| **`attachments`** | Retained as Core Table | `attachments` | Object storage metadata, MIME validation, 5MB boundary check, and classification (`INITIAL_EVIDENCE` vs `RESOLUTION_PROOF`). | `FR-005`, `FR-016`, `BR-006` |
| *(New / Security)* | New Private Table | `internal_notes` | Private internal staff remarks completely segregated from student-visible timeline, governed by isolated RLS. | `FR-011`, `ADR-009` |
| **`action_history`** | Retained as Audit Table | `action_history` | Comprehensive, append-only audit journal enforced via PostgreSQL triggers and privileges (`REVOKE UPDATE, DELETE`). | `FR-019`, `NFR-005`, `ADR-008` |
| **`sla_policies`** | Retained as Config Table | `sla_policies` | Configurable response and resolution hour thresholds per category and priority with effective dates. | `FR-012`, `OD-006` |
| **`notifications`** | Retained as Core Table | `notifications` | In-app user inbox alerts with read status, timestamps, and deep-links to complaints. | `FR-020`, `OD-011` |
| *(New / Reliability)* | New Reliability Tables | `outbox_events`<br>`idempotency_keys` | Transactional outbox for reliable event dispatch (ADR-006) and idempotency token registry preventing duplicate complaint creation on network retries. | `NFR-003`, `NFR-004`, `ADR-006` |

---

## 4. Reconciliation Conclusion

The final relational database architecture expands from 9 conceptual entities into **16 normalized relational tables**. 

Every additional table directly eliminates a data redundancy, closes a potential security vulnerability (e.g. internal notes leakage), or provides deterministic constraint enforcement for an approved business rule (e.g. anti-deadlock transfer tracking, historical handler accountability).
