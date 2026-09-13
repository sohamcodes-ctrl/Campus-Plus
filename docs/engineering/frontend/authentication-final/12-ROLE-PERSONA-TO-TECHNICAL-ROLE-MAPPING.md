# 12 — Role Persona to Technical Role Mapping Specification
**Campus Plus Final Five-Role Authentication Experience**
**Status:** MANDATORY SPECIFICATION (LOCKED)  
**Date:** 2026-09-13  
**Classification:** SYSTEM ROLE ARCHITECTURE

---

## 1. Architectural Role Mapping Matrix

| Public Persona | Technical Database Role(s) | Domain Permission Level | Data Scope Boundary | Registration Model | Institutional Provisioning Authority |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Student** | `ROLE_STUDENT` | Complainant (`SUBMIT`, `VIEW_OWN`, `VERIFY`, `DISPUTE`, `CANCEL_OWN`) | Own complaints only (enforced by RLS & AuthorizationPolicy) | Self-Service Intake (`IAM-REG-PENDING`) | Academic Registrar / Student Roster |
| **Faculty / Complaint Handler** | `ROLE_FACULTY` (Complainant) & `ROLE_HANDLER` (Operational Handler) | Complainant when filing; Operational handler (`VIEW_DEPT`, `START_PROGRESS`, `RESOLVE`, `FORWARD`, `ESCALATE`) when assigned | Department complaints only (`department_memberships`) | Institutional Verification (`IAM-STAFF-PENDING`) | Departmental Chair & Academic Registrar |
| **HOD (Department Head)** | `ROLE_DEPT_HEAD` | Department Oversight (`REVIEW`, `ASSIGN`, `FORWARD`, `ESCALATE`, `RESOLVE`, `CLOSE`, `REJECT`, `DUPLICATE`) | Entire department scope (`is_head = TRUE`) | Appointment Verification (`IAM-HOD-PENDING`) | Dean of Academic Affairs & College Directorate |
| **Director / Senior Authority** | `ROLE_ADMIN` | Executive Governance & Audit Purview | Cross-departmental institutional scope | Pre-provisioned Credential (`IAM-DIR-PENDING`) | Directorate IT Security & Governing Council |
| **Institutional Management** | `ROLE_MANAGEMENT` | Board Governance, KPI Analytics, Tier 3 Deadlock Resolution | Cross-departmental longitudinal trends & escalated deadlocks | Pre-provisioned Credential (`IAM-MGT-PENDING`) | College Board of Trustees & Secretariat |

---

## 2. Invariants & Guarantees
1. **One Unified Platform, Five Distinct Personas:** The user experience adapts seamlessly based on the authenticated persona.
2. **Server Authority Invariant:** Client state or URL parameters cannot alter technical permissions.
3. **No Decorative Placeholders:** All 5 personas are fully supported with accessible onboarding experiences, locked palettes, and honest institutional verification flows.
