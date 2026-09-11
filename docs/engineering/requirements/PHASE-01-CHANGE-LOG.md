# Campus Plus — Requirements Baseline Change Log

**Project**: Campus Plus — Campus Complaint and Grievance Resolution System  
**Phase**: Phase 02 — Architecture & Technical Design (Phase 01 Closure Gate)  
**Document**: PHASE-01-CHANGE-LOG.md  
**Version**: 1.0  
**Status**: Formal Audit Record  

---

## 1. Purpose & Policy

In accordance with Section 14 (*Requirement Baseline Update Rule*) of the engineering protocol, requirements baselines must never be silently rewritten. Every refinement, clarification, reclassification, or scope boundary formalization resulting from architectural reconciliation is documented here with its original formulation, revised formulation, rationale, supporting evidence, architectural impact, and formal approval status.

---

## 2. Change Log Entries

### Entry `CR-001`: Numbering Reconciliation & Status of `OD-009` and `OD-010`
- **Original State**: In the high-level summary response of Phase 01, open decisions were listed jumping from `OD-008` directly to `OD-011`, giving the impression that `OD-009` and `OD-010` were omitted or retired.
- **Revised Formulation**: Formally confirmed that `OD-009` (*Closed Complaint Reopening Policy*) and `OD-010` (*Attachment Size & Quota Constraints*) were continuously present in `OPEN-DECISIONS.md` (lines 29–30), `COMPLAINT-LIFECYCLE.md` (line 182), and `BUSINESS-RULES.md` (line 86). Both items are now formally declared `CLOSED`.
- **Reason**: Dispel ambiguity regarding missing identifiers.
- **Evidence**: Ripgrep search results across Phase 01 markdown artifacts.
- **Architectural Impact**: `OD-009` locks terminal state immutability in the state machine (ADR-005); `OD-010` locks 5MB / 3-file quota in storage security rules (ADR-008).
- **Approval Status**: **APPROVED & CLOSED**.

---

### Entry `CR-002`: Departmental Ownership Model Clarification (`OD-001` / `BR-008`)
- **Original State**: `OD-001` left open whether a complaint could have joint ownership across multiple departments simultaneously.
- **Revised Formulation**: Formally baselined as **Single Primary Owning Department** with explicit inter-departmental `FORWARD` handoffs. A complaint has exactly one responsible department at any given moment in its lifecycle.
- **Reason**: Joint ownership introduces race conditions, fragmented SLA tracking, and ambiguous RBAC boundaries.
- **Evidence**: Level 1 Source Synopsis workflow: *"The concerned authorities can then review, assign, forward, track, update, escalate, and resolve complaints through a structured workflow."* Forwarding transfers responsibility sequentially.
- **Architectural Impact**: Simplifies relational foreign key to `department_id` NOT NULL on complaints table, avoiding complex many-to-many ownership join tables.
- **Approval Status**: **APPROVED (RESOLVED_BY_ARCHITECTURE via ADR-004)**.

---

### Entry `CR-003`: Distinction Between Example SLA Values and Configurable Architecture (`OD-006` / `FR-014`)
- **Original State**: Phase 01 listed specific SLA durations (Urgent: 24h, High: 48h, Medium: 5d, Low: 10d) which could be misinterpreted as verified institutional requirements.
- **Revised Formulation**: Explicitly reclassified numeric durations as `EXAMPLE VALUES`. System architecture implements a dynamic, configurable `sla_policies` schema driven by institutional parameters.
- **Reason**: Prevent unverified example durations from becoming frozen production commitments without institutional administrative review.
- **Evidence**: Phase 00 Reconnaissance found no existing SLA policy documents in the workspace.
- **Architectural Impact**: The escalation engine queries dynamic policy configuration rather than hardcoding constant hours into cron triggers.
- **Approval Status**: **APPROVED (REQUIRES-INSTITUTIONAL-INPUT for seed constants via ADR-006)**.

---

### Entry `CR-004`: Resolution Evidence Policy Refinement (`OD-007` / `FR-016`)
- **Original State**: Ambiguity regarding whether photo/document evidence is mandatory for all complaints or optional.
- **Revised Formulation**: Textual resolution summary is globally mandatory (`BR-015`). Resolution file proof is enforced conditionally based on a category flag `requires_resolution_proof` (mandatory for physical infrastructure/hostel; optional for administrative/academic).
- **Reason**: Enforcing photo uploads for academic scheduling complaints causes artificial friction, while omitting proof for plumbing/electrical repairs permits fraudulent closures.
- **Evidence**: Operational reality of diverse campus grievance categories.
- **Architectural Impact**: Category entity includes boolean `requires_resolution_proof` validated at the state machine transition boundary to `RESOLVED`.
- **Approval Status**: **APPROVED (RESOLVED_BY_ARCHITECTURE via ADR-005 & ADR-008)**.

---

### Entry `CR-005`: Scope Boundary for Notification Channels (`OD-011` / `FR-020`)
- **Original State**: Uncertainty whether transactional email and SMS were required for MVP baseline.
- **Revised Formulation**: In-app notification inbox is locked as the core MVP channel (`FR-020`). An asynchronous event-driven dispatcher interface is established, allowing email adapters (SMTP/Resend) to be enabled without domain logic modifications. SMS/WhatsApp are deferred.
- **Reason**: Keep MVP free of external third-party transactional gateway billing and DNS verification dependencies.
- **Evidence**: Level 1 Source Synopsis specifies: *"provides notifications and dashboards for better monitoring"*, satisfied natively via in-app inbox alerts.
- **Architectural Impact**: Decouples notification dispatching from core state transitions via domain event pub/sub.
- **Approval Status**: **APPROVED (RESOLVED_BY_ARCHITECTURE via ADR-007)**.

---

### Entry `CR-006`: Formal Deferral of Anonymous Complaints (`OD-012` / `BR-001`)
- **Original State**: `OD-012` identified anonymous grievance submission as an open decision with privacy tradeoffs.
- **Revised Formulation**: Formally deferred to post-MVP (`PROP-007`). MVP strictly enforces authenticated student identity (`BR-001`) with field-level PII protection (`PRIV-001`).
- **Reason**: Anonymous reporting introduces severe spam, defamation, and abuse vectors that require complex cryptographic masking and institutional legal policies.
- **Evidence**: Level 1 Source Synopsis explicitly anchors complaints to *"students and authorized users"* with accountability and tracking.
- **Architectural Impact**: Simplifies MVP database foreign key constraints (`complainant_id NOT NULL`); preserves future extension path.
- **Approval Status**: **APPROVED (DEFERRED-BY-DESIGN via ADR-002)**.

---

### Entry `CR-007`: Recurring Complaint Intelligence Specification (`OD-013` / `FR-025` / `BR-023`)
- **Original State**: Open decision on whether recurring issue detection required statistical regression, AI embeddings, or rule-based matching.
- **Revised Formulation**: Baselined as deterministic rule-based SQL aggregation matching $\ge 3$ complaints sharing category, department, and location within a rolling 30-day window. Advanced vector clustering is cataloged as post-MVP (`PROP-003`).
- **Reason**: Adheres strictly to the protocol principle against premature AI implementation while fully satisfying the synopsis requirement.
- **Evidence**: Level 1 Source Synopsis: *"enabling administrators to identify recurring campus issues and improve campus services"*.
- **Architectural Impact**: Implemented via indexed database views and aggregation queries without external machine learning dependencies.
- **Approval Status**: **APPROVED (RESOLVED_BY_ARCHITECTURE via ADR-010)**.

---

## 3. Summary of Baseline Stability

- **Total Baseline Requirements**: 51 formal requirements (`UR`: 4, `FR`: 26, `NFR`: 12, `SEC`: 6, `PRIV`: 3).
- **Requirements Modified / Refined**: 0 requirements deleted; 6 requirements clarified with explicit architectural mechanisms.
- **Requirements Unchanged**: 45 requirements remain completely intact as originally specified in `PHASE-01-REQUIREMENTS-BASELINE.md`.
- **Baseline Integrity**: Preserved with 100% backward traceability.
