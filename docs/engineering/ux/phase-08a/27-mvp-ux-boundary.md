# Phase 08-A: MVP vs. Post-MVP UX Boundary Specification

**Document Identifier:** `27-mvp-ux-boundary.md`  
**Classification:** Enterprise UX / Product Experience Blueprint  
**Standard:** Enforces strict boundary isolation between production MVP deliverables and deferred candidate enhancements.

---

## 1. Scope Demarcation Overview

To guarantee production delivery without scope creep, Campus Plus enforces a rigid boundary between **MVP Core** capabilities and **Post-MVP** candidate features.

```mermaid
graph TD
    subgraph MVP Core (100% Production Bound)
        M1[Authenticated Submission STU-002]
        M2[13-State Canonical FSM Engine]
        M3[Role-Themed Design System]
        M4[In-App Notification Center SHR-001]
        M5[Multi-Criteria Search & Filter SHR-002]
        M6[Presigned Direct Uploads 5MB/3 Files]
        M7[Public Timeline vs Internal Notes INV-012]
        M8[Relational Recurrence Clusters >=3 in 30d]
        M9[OCC Version Conflict Protection]
        M10[Terminal Closed State Immutability]
    end

    subgraph Post-MVP (Formally Deferred)
        P1[Anonymous Complaints OD-012]
        P2[Transactional Email / SMS Alerts OD-011]
        P3[AI Vector Recurrence Clustering ADR-010]
        P4[Star Rating Resolution Feedback PROP-001]
        P5[Pre-Submission Duplicate Warning PROP-002]
        P6[Field Handler Offline PWA PROP-004]
        P7[Multi-Lingual Localization Hindi/Marathi PROP-005]
        P8[Public Transparency Noticeboard PROP-006]
    end
```

---

## 2. Scope Matrix & Justification

| Feature / Capability | Boundary Classification | Authoritative Justification | Architectural Impact |
| :--- | :---: | :--- | :--- |
| **Authenticated Intake** | **MVP** | `BR-001`, `FR-001` mandate submitter accountability. | Active session identity binding |
| **13-State Lifecycle Engine** | **MVP** | `COMPLAINT-LIFECYCLE.md` formal FSM specification. | Strict deterministic transition matrix |
| **Locked Role Palettes** | **MVP** | Section 14 locked color governance. | 5 distinct institutional themes |
| **In-App Notification Center** | **MVP** | `FR-020` in-app alerts on state change. | Backed by PostgreSQL `notifications` table |
| **5MB / 3-File Uploads** | **MVP** | `OD-010`, `BR-022` file constraints. | S3 presigned direct upload |
| **Deterministic Recurrence** | **MVP** | `BR-023`, `ADR-010` relational view. | `recurring_complaint_clusters` view |
| **Anonymous Grievances** | **POST-MVP** | `OD-012` requires formal statutory review for sensitive categories. | Disallowed in MVP intake form |
| **Transactional Email** | **POST-MVP** | `OD-011` deferred to eliminate external SMTP deliverability dependencies. | Background email port stubbed |
| **AI Recurrence Clustering** | **POST-MVP** | `ADR-010` explicitly rejected premature AI vector models. | Replaced with deterministic relational SQL |
| **Satisfaction Star Rating** | **POST-MVP** | `PROP-001` deferred to focus on core resolution lifecycle. | Verification is boolean (Verify / Dispute) |
| **Pre-Submission Duplicate Warning**| **POST-MVP** | `PROP-002` requires dedicated search indexing worker. | Triaged manually by HOD in MVP |
| **Offline PWA Support** | **POST-MVP** | `PROP-004` secondary to core responsive web interface. | Web-first responsive UI (`NFR-008`) |
| **Multi-Lingual Localization** | **POST-MVP** | `PROP-005`, `ASM-001` standardizes English for Phase 01/MVP. | English UI strings standardized |
| **Public Transparency Board**| **POST-MVP** | `PROP-006` requires complex automated PII sanitization. | Internal role dashboards in MVP |

---

## 3. Analytics Honesty Governance (`Section 86`)

The MVP dashboard architecture strictly forbids unanchored, hallucinated, or speculative analytics widgets:
- **No AI Confidence Indicators:** Features like "94% AI Resolution Confidence" are completely banned.
- **No Speculative Satisfaction Metrics:** No "Campus Happiness Score" or "Student Satisfaction %" unless backed by formal post-resolution survey tables.
- **Unverified Metrics Policy:** Any metric displayed on an executive or departmental dashboard that lacks an implemented database query or view must be flagged as **`METRIC DEFINITION REQUIRED`**.
