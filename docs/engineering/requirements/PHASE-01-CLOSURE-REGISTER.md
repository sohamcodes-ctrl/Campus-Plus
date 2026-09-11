# Campus Plus — Phase 01 Closure & Reconciliation Register

**Project**: Campus Plus — Campus Complaint and Grievance Resolution System  
**Phase**: Phase 02 — Architecture & Technical Design (Phase 01 Closure Gate)  
**Document**: PHASE-01-CLOSURE-REGISTER.md  
**Version**: 1.0  
**Status**: Formal Baseline Reconciliation  
**Classification Rules**: Exactly one of `CLOSED` | `RESOLVED_BY_ARCHITECTURE` | `DEFERRED-BY-DESIGN` | `BLOCKING` | `REQUIRES-INSTITUTIONAL-INPUT`  

---

## 1. Executive Summary & Purpose

The Phase 01 Requirements Engineering phase concluded with a **Conditional Pass** due to open institutional decisions, unverified SLA thresholds, and architecture-dependent constraints. This document serves as the formal **Closure & Reconciliation Register** required before finalizing system architecture.

Every open decision (`OD-001` through `OD-013`), assumption (`ASM-001` through `ASM-005`), and proposed capability (`PROP-001` through `PROP-006`) is rigorously audited, reconciled, and assigned a definitive status supported by explicit architectural evidence. Furthermore, all 38 `MUST` requirements are mapped to architectural subsystems to guarantee zero orphaned requirements.

---

## 2. Forensic Reconciliation: Decision Numbering (OD-009 & OD-010)

### 2.1 Problem Statement
The Phase 01 text summary listed open decisions jumping from `OD-008` to `OD-011`, raising the question of whether `OD-009` and `OD-010` were omitted, retired, or fabricated.

### 2.2 Forensic Inspection Results
A forensic ripgrep inspection of all Phase 01 repository artifacts was executed:
1. **`docs/engineering/requirements/OPEN-DECISIONS.md`**:
   - Line 29 explicitly defines **`OD-009`**:
     - *Title*: `Closed Complaint Reopening Policy`
     - *Scope*: Lifecycle / State Machine
     - *Options*: Option A (Closed tickets strictly immutable; new ticket with reference) vs Option B (Admin reopen override).
     - *Default*: Option A.
   - Line 30 explicitly defines **`OD-010`**:
     - *Title*: `Attachment Size & Quota Constraints`
     - *Scope*: Storage / Security
     - *Options*: Option A (Max 5MB, 3 files) vs Option B (Max 10MB, 5 files) vs Option C (Max 2MB, single file).
     - *Default*: Option A.
2. **`docs/engineering/requirements/COMPLAINT-LIFECYCLE.md`**:
   - Line 182 references **`OD-009`**: *"Once a complaint reaches `CLOSED`, its state cannot be transitioned without an explicit administrative appeal/reopen override (`OD-009`)."*
3. **`docs/engineering/requirements/BUSINESS-RULES.md`**:
   - Line 86 references **`OD-010`**: *"Attachments must be restricted to approved file types (e.g., PDF, PNG, JPG, JPEG) and enforced with strict per-file size limits (e.g., maximum 5MB, subject to `OD-010`)."*

### 2.3 Forensic Finding & Conclusion
`OD-009` and `OD-010` were **never missing or retired from the artifact baseline**. They existed in full detail within `OPEN-DECISIONS.md`, `COMPLAINT-LIFECYCLE.md`, and `BUSINESS-RULES.md`. Their absence in the prior chat conversational summary was merely a textual omission in that specific response. Both decisions are authentic, active, and included in this reconciliation.

---

## 3. Comprehensive Open Decisions Resolution Register (`OD-*`)

| Decision ID | Title | Summary of Evaluated Options | Architectural Resolution & Evidence | Assigned Status | Rationale & Architectural Impact |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`OD-001`** | **Departmental Ownership Model** | **Option A**: Single primary owning department.<br>**Option B**: Multi-department joint ownership. | **Resolved as Option A** (ADR-004). Architecture models a single primary owning department (`department_id`) on the complaint entity. Cross-department handling is executed via formal `FORWARD` handoff transitions. | `RESOLVED_BY_ARCHITECTURE` | Multi-ownership creates severe race conditions in state transitions, ambiguous SLA accountability, and fractured RBAC. Single primary ownership with forwarding audit trails preserves clean state machine determinism. Specific institutional department master records remain configurable (`REQUIRES-INSTITUTIONAL-INPUT` for actual seed values). |
| **`OD-002`** | **Escalation Hierarchy Path** | **Option A**: Strict vertical hierarchy (Handler $\rightarrow$ Dept Head $\rightarrow$ Central Cell).<br>**Option B**: Dynamic category routing directly to specialized statutory cells (Anti-Ragging, ICC). | **Resolved as Hybrid Configurable Path** (ADR-006). The escalation engine routes standard complaints along vertical tiers (Tier 1 Handler $\rightarrow$ Tier 2 Dept Head $\rightarrow$ Tier 3 Management), while statutory category flags allow routing to institutional committees. | `RESOLVED_BY_ARCHITECTURE` | Standardizes escalation data structure with an integer `escalation_tier` (1 to 3) and `escalated_to_role`, avoiding hardcoded workflows while supporting regulatory compliance. |
| **`OD-003`** | **Cross-Department Forwarding Acceptance** | **Option A**: Instant transfer upon forward.<br>**Option B**: Receiving department head must formally accept or dispute transfer. | **Resolved as Option A with Immediate Notification & Dispute Audit** (ADR-004, ADR-005). Forwarding immediately transfers operational ownership to the receiving department's triage queue while logging an immutable audit record and dispatching an immediate alert. | `RESOLVED_BY_ARCHITECTURE` | Option B introduces "transfer limbo" where an urgent complaint is owned by nobody while awaiting acceptance. Immediate transfer ensures continuous accountability; if misdirected, the receiving department can forward onwards or escalate. |
| **`OD-004`** | **Authentication Strategy** | **Option A**: Institutional SAML/Google SSO.<br>**Option B**: Domain-restricted email/password + OTP.<br>**Option C**: Open registration. | **Resolved as Option B with SSO-Ready Identity Layer** (ADR-002). Architecture specifies token-based authentication (JWT/session) restricted to verified institutional email domains (`@rcpit.ac.in` or configured domain), with external identity provider hook abstraction. | `RESOLVED_BY_ARCHITECTURE` | Eliminates external SSO vendor configuration dependency during development and staging, while maintaining strict domain restriction and zero schema rework when plugging in Google/Azure SSO. |
| **`OD-005`** | **Deployment / Hosting Target** | **Option A**: Serverless PaaS (Vercel/Cloudflare).<br>**Option B**: Containerized Cloud VPS (Docker on Linux).<br>**Option C**: On-premise institutional server. | **Resolved as 12-Factor Environment-Agnostic Core** (ADR-011). Application core is designed as standard Node.js containerizable services interfacing standard PostgreSQL and S3-compatible storage. | `RESOLVED_BY_ARCHITECTURE` | Host reconnaissance verified Vercel CLI present, but Docker absent on Windows dev host. Designing a 12-factor portable application allows seamless deployment to Vercel/Supabase PaaS or Dockerized Linux VPS without code changes. |
| **`OD-006`** | **Numeric SLA & Auto-Escalation Thresholds** | **Option A**: Fixed hardcoded hours.<br>**Option B**: Configurable institutional SLA policy table. | **Resolved as Configurable System Parameters** (ADR-006). Example values (Urgent: 24h, High: 48h, Med: 5d, Low: 10d) are tagged as `EXAMPLE VALUES`. The architecture implements a configurable `sla_policies` schema. | `REQUIRES-INSTITUTIONAL-INPUT` | The engine is architecturally complete, but actual numeric SLA targets must be formally confirmed by institutional management before production go-live. |
| **`OD-007`** | **Mandatory Resolution Proof** | **Option A**: Photo/document proof mandatory for all categories.<br>**Option B**: Mandatory text note; proof mandatory only for flagged physical categories (Infrastructure). | **Resolved as Category-Flagged Policy** (ADR-005, ADR-008). Text resolution notes are globally mandatory (`BR-015`). Categories have a boolean flag `requires_resolution_proof` enforced at the state validation boundary. | `RESOLVED_BY_ARCHITECTURE` | Forcing photo proof for academic scheduling complaints creates friction; omitting it for broken physical infrastructure allows fake resolutions. Category-driven validation satisfies both. |
| **`OD-008`** | **Complainant Verification & Reopen Window** | **Option A**: 3 days.<br>**Option B**: 5 business days.<br>**Option C**: 7 days. | **Resolved as Configurable System Parameter with 5-Day Default** (ADR-005). The state machine implements a timer-based auto-close transition driven by an environment/configuration parameter `COMPLAINT_VERIFICATION_WINDOW_DAYS` (default: 5). | `REQUIRES-INSTITUTIONAL-INPUT` | Architecture provides the auto-close engine and dispute transition; the final calendar duration will be ratified by institutional administration. |
| **`OD-009`** | **Closed Complaint Reopening Policy** | **Option A**: Closed complaints are terminal and immutable; new issue requires new ticket with reference.<br>**Option B**: Admin can reopen closed tickets. | **Resolved as Option A** (ADR-005, `BR-003`, `BR-019`). Terminal state `CLOSED` is strictly immutable. If a problem recurs after final closure, the user creates a new complaint linking `prior_complaint_id`. | `CLOSED` | Preserves data warehouse integrity, resolution metrics, and audit finality. Avoids reopening 6-month-old closed cases and corrupting historical SLA statistics. |
| **`OD-010`** | **Attachment Size & Quota Constraints** | **Option A**: 5 MB per file, max 3 files.<br>**Option B**: 10 MB per file, max 5 files. | **Resolved as 5 MB per file, max 3 files for MVP** (ADR-008, `BR-022`). Enforced at API validation layer and storage bucket security rules. Allowed MIME types: `image/jpeg`, `image/png`, `application/pdf`. | `CLOSED` | Balances sufficient photographic/documentary evidence quality against storage cost, mobile bandwidth, and upload latency. |
| **`OD-011`** | **Notification Channel Scope** | **Option A**: In-app notifications only (MVP).<br>**Option B**: In-app + Transactional Email.<br>**Option C**: In-app + Email + SMS/WhatsApp. | **Resolved as In-App Native MVP with Decoupled Email Provider Interface** (ADR-007). In-app notification inbox is in-scope for MVP (`FR-020`). An asynchronous event dispatcher interface is established so email adapters (SMTP/Resend) plug in without domain logic changes. | `RESOLVED_BY_ARCHITECTURE` | Prevents blocking MVP on external email domain verification / SMS gateway procurement, while guaranteeing full notification architectural readiness. |
| **`OD-012`** | **Anonymous Complaint Support** | **Option A**: Disallow anonymity (all complaints tied to authenticated student).<br>**Option B**: Support anonymous grievances.<br>**Option C**: Whistleblower masked identity mode. | **Resolved as Option A for MVP Baseline** (ADR-002, ADR-003, `BR-001`). All MVP complaints require verified student identity. Anonymous/masked identity is classified as Post-MVP `PROP-007` requiring specialized legal/statutory policy input. | `DEFERRED-BY-DESIGN` | Anonymous submissions in campus systems create severe denial-of-service risks (spam, defamatory allegations without accountability). Disallowing for MVP satisfies Level 1 source requirements without security compromise. |
| **`OD-013`** | **Recurring Complaint Identification Formula** | **Option A**: Deterministic metadata aggregation (category + location + department within rolling 30-day window).<br>**Option B**: Statistical regression.<br>**Option C**: AI vector embedding clustering. | **Resolved as Option A for MVP; Option C for Post-MVP** (ADR-010). MVP utilizes a deterministic SQL aggregation query/view matching $\ge 3$ active/recent complaints sharing `category_id`, `department_id`, and exact or normalized `location_details` within 30 days. | `RESOLVED_BY_ARCHITECTURE` | Satisfies source synopsis requirement without introducing unpredictable AI hallucination, high inference costs, or external API dependencies during core workflow establishment. |

---

## 4. Audit & Reconciliation of Assumptions (`ASM-*`)

| Assumption ID | Title | Original Formulation | Audit Evaluation & Risk Analysis | Reclassified Status | Architecture Action |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`ASM-001`** | **English as Primary Operational Language** | System UI, notifications, and logs standardized in English. | Validated against source synopsis. Academic instructions and technical records at RCPIT are in English. | `VALIDATED` | UI text and domain models use English. i18n bundle architecture isolated for future localization (`PROP-005`). |
| **`ASM-002`** | **RCPIT Shirpur as Representative Institutional Baseline** | Baseline organizational taxonomy derived from autonomous engineering institute structure. | Validated against Page 1 of Level 1 Source PDF. The structure fits standard engineering colleges (Academic Depts, Hostels, Maintenance, Admin). | `ARCHITECTURALLY SAFE ASSUMPTION` | Department and Category entities are fully dynamic and relational, not hardcoded enums. System adapts to any institution via configuration. |
| **`ASM-003`** | **Web-First Responsive Accessibility** | System accessed via responsive web browser on desktop and mobile. | Validated against modern student/faculty device usage. No native mobile compilation required. | `ARCHITECTURALLY SAFE ASSUMPTION` | Mobile-first responsive UI architecture (viewport $\ge$ 360px), accessible WCAG 2.1 AA design. |
| **`ASM-004`** | **SLA Based on Institutional Working Days** | Turnaround times calculate only on official working days (excluding Sundays/holidays). | Architecturally necessary to prevent bogus weekend SLA breaches. Exact calendar definition requires institutional calendar integration. | `REQUIRES-INSTITUTIONAL-INPUT` | The SLA calculation engine abstracts a working-calendar provider interface. Standard 5-day week default configured. |
| **`ASM-005`** | **Institution-Maintained User Directory** | Institution has an authorized list of students/faculty with verifiable email addresses. | Validated. Academic institutions maintain registrar databases and student roll/PRN registries. | `VALIDATED` | User onboarding enforces institutional email pattern matching and role assignment controls. |

---

## 5. Audit & Reconciliation of Proposed Capabilities (`PROP-*`)

| Capability ID | Title | Current Status | MVP Impact | Architecture Destination |
| :--- | :--- | :--- | :--- | :--- |
| **`PROP-001`** | Complainant Satisfaction Rating (1-5 stars) | `DEFERRED-BY-DESIGN` | Post-MVP | Schema includes nullable `satisfaction_rating` and `feedback_text` columns on complaint closure, avoiding breaking migrations later. |
| **`PROP-002`** | Pre-Submission Duplicate Search Warning | `DEFERRED-BY-DESIGN` | Post-MVP | Search indexing architecture planned in ADR-010 supports instant client query integration post-MVP. |
| **`PROP-003`** | AI-Assisted Auto-Categorization & Priority | `DEFERRED-BY-DESIGN` | Out of MVP Scope | Domain service boundary isolates triage logic, enabling pluggable AI classification workers post-MVP without altering core state machine. |
| **`PROP-004`** | Field Technician Offline PWA | `DEFERRED-BY-DESIGN` | Post-MVP | API design follows strict RESTful stateless semantics, enabling service worker caching in later releases. |
| **`PROP-005`** | Multi-Lingual UI Localization (Marathi/Hindi) | `DEFERRED-BY-DESIGN` | Post-MVP | UI architecture isolates string dictionary bundles. |
| **`PROP-006`** | Public Sanitized Campus Noticeboard | `DEFERRED-BY-DESIGN` | Post-MVP | Requires public privacy sanitization view; deferred to post-MVP to protect sensitive personal records. |

---

## 6. MUST Requirement Architectural Coverage Matrix (38 Requirements)

Every single `MUST` requirement from the Phase 01 Requirements Baseline is mapped below to its corresponding architectural subsystem, decision record, and operational status:

| Requirement ID | Requirement Title | Architectural Subsystem / Component | Governing ADR / Design Element | Verification Status | Architectural Evidence |
| :--- | :--- | :--- | :--- | :---: | :--- |
| **`UR-001`** | Single Digital Grievance Portal | Web Client Application (Responsive SPA/SSR) | ADR-001 (Modular Monolith) | `COVERED` | Unified portal replacing fragmented manual channels. |
| **`UR-002`** | Transparent Complaint Tracking | Complainant Tracking Module & Status Timeline | ADR-005 (Lifecycle State Machine) | `COVERED` | Real-time status inspection with public milestone history. |
| **`UR-003`** | Accountable Handler Assignment | Assignment & Triage Service | ADR-004 (Data Ownership Model) | `COVERED` | Strict 1-to-1 operational handler delegation. |
| **`UR-004`** | Institutional Service Intelligence | Executive Analytics & Aggregation Engine | ADR-010 (Recurring Issue Detection) | `COVERED` | Cross-departmental trend reporting and backlog visibility. |
| **`FR-001`** | Authenticated Complaint Intake | Complaint Intake Service | ADR-002 (Auth), ADR-005 (State Machine) | `COVERED` | Server-validated intake form enforcing mandatory fields. |
| **`FR-002`** | Complaint Categorization Binding | Category Registry & Complaint Domain Entity | ADR-004 (Ownership Model) | `COVERED` | Relational binding to active category records. |
| **`FR-003`** | Suggested Priority Setting | Intake Service & Domain Entity | ADR-005 (Lifecycle Engine) | `COVERED` | Captures student urgency indicator (`LOW` to `URGENT`). |
| **`FR-004`** | Supporting Evidence Upload | Secure Attachment Storage Service | ADR-008 (Attachment Architecture) | `COVERED` | Presigned URL upload with strict MIME & 5MB validation. |
| **`FR-005`** | Unique Reference ID Generation | ID Generation Service (Sequence/Format Engine) | ADR-004 (Data Model) | `COVERED` | Format `CP-YYYY-XXXXX` guaranteed unique and immutable. |
| **`FR-006`** | Student Personal Tracking View | Complainant Portal View Component | ADR-003 (RBAC & RLS) | `COVERED` | Filtered query restricting view strictly to submitter ID. |
| **`FR-007`** | Departmental Triage & Review | Department Authority Triage Desk | ADR-003 (RBAC), ADR-005 (State Machine) | `COVERED` | Triage queue for unassigned department complaints. |
| **`FR-008`** | Handler Assignment | Assignment Domain Service | ADR-004 (Ownership), ADR-005 (State Machine) | `COVERED` | Formal transition to `ASSIGNED` with assignor logging. |
| **`FR-010`** | Cross-Department Forwarding | Inter-Department Routing Service | ADR-004 (Ownership), ADR-005 (State Machine) | `COVERED` | Atomic transfer of owning department with mandatory rationale. |
| **`FR-011`** | Operational Progress Updating | Handler Worklist Execution Service | ADR-005 (State Machine) | `COVERED` | Status update to `IN PROGRESS` with progress commentary. |
| **`FR-013`** | Manual Escalation | Escalation Management Service | ADR-006 (Escalation Architecture) | `COVERED` | Elevation to Tier 2/3 with mandatory rationale. |
| **`FR-015`** | Resolution with Action Notes | Resolution Domain Service | ADR-005 (State Machine) | `COVERED` | Mandatory resolution summary required before `RESOLVED`. |
| **`FR-019`** | Immutable Action History Log | Audit Journal Service | ADR-009 (Audit Architecture) | `COVERED` | Append-only database journal table with write-only triggers. |
| **`FR-020`** | Event-Driven Notifications | Asynchronous Event Notification Dispatcher | ADR-007 (Notification Architecture) | `COVERED` | In-app notification inbox with async event pub/sub. |
| **`FR-021`** | Student Complainant Dashboard | Complainant Dashboard Subsystem | ADR-001 (Modular Presentation) | `COVERED` | Summary cards: Active, Pending, Resolved, Reopened. |
| **`FR-022`** | Handler Operational Dashboard | Handler Workspace Subsystem | ADR-001 (Modular Presentation) | `COVERED` | Assigned task worklist, priority badges, action triggers. |
| **`FR-023`** | Department Authority Dashboard | Department Management Subsystem | ADR-001 (Modular Presentation) | `COVERED` | Department workload, unassigned queue, SLA breach alerts. |
| **`FR-024`** | Executive Insight Dashboard | Institutional Analytics Subsystem | ADR-001 (Modular Presentation) | `COVERED` | Aggregated resolution rates, department turnaround times. |
| **`FR-025`** | Recurring Complaint Detection | Recurring Issue Aggregation Service | ADR-010 (Recurring Issue Detection) | `COVERED` | Deterministic rolling 30-day clustering view. |
| **`FR-026`** | Multi-Criteria Search & Filter | Complaint Query & Indexing Service | ADR-004 (Data Architecture) | `COVERED` | Composite indexed queries on status, dept, category, date. |
| **`NFR-001`** | Sub-Second UI API Response | Database Indexing & Query Architecture | ADR-004 (Data Architecture) | `COVERED` | B-Tree indexing on foreign keys and compound status filters. |
| **`NFR-002`** | 99.5% Service Availability | Stateless Application Tier & Managed DB | ADR-011 (Deployment Architecture) | `COVERED` | Redundant container/serverless deployment topology. |
| **`NFR-003`** | Append-Only Data Immutability | Audit Storage Engine | ADR-009 (Audit Architecture) | `COVERED` | PostgreSQL REVOKE UPDATE/DELETE on `action_history`. |
| **`NFR-005`** | Role-Based Access Enforcement | Centralized Authorization Middleware | ADR-003 (RBAC & Security) | `COVERED` | Server-side role validation guard on every route. |
| **`NFR-006`** | Complainant Data Privacy | Data Serialization & Scoping Service | ADR-003 (RBAC & Security) | `COVERED` | Field-level masking of student personal contact data. |
| **`NFR-007`** | Secure File Handling & Scanning | Storage Security Pipeline | ADR-008 (Attachment Architecture) | `COVERED` | MIME magic-byte validation, file extension whitelisting. |
| **`NFR-008`** | Mobile Responsive Web UI | Responsive Presentation Layer | ADR-001 (Client Architecture) | `COVERED` | Fluid responsive layout supporting viewports down to 360px. |
| **`SEC-001`** | Authenticated Access Boundary | Identity & Session Gateway | ADR-002 (Authentication Strategy) | `COVERED` | HTTP-only secure session cookies / JWT authorization. |
| **`SEC-002`** | Server-Side RBAC Enforcement | API Authorization Interceptor | ADR-003 (RBAC & Security) | `COVERED` | Strict server enforcement; UI flags treated as UX only. |
| **`SEC-003`** | Secure Session & Token Handling | Token Management Subsystem | ADR-002 (Authentication Strategy) | `COVERED` | Standardized token expiry (24h) and revocation handling. |
| **`PRIV-001`** | PII Minimization & Protection | Query Projection Layer | ADR-003 (RBAC & Security) | `COVERED` | Complainant PII excluded from public or cross-dept payloads. |
| **`PRIV-002`** | Dual-Level Comment Isolation | Action History Projection Engine | ADR-009 (Audit Architecture) | `COVERED` | `visibility_level` column partitions `INTERNAL` remarks. |
| **`BR-001`** | Mandatory Complainant ID | Identity Binding Constraint | ADR-002, ADR-004 | `COVERED` | Foreign key `complainant_id` NOT NULL on complaints table. |
| **`BR-019`** | Append-Only Action History | Database Trigger & RLS Policy | ADR-009 (Audit Architecture) | `COVERED` | Immutability strictly enforced at persistence boundary. |

---

## 7. Closure Summary & Phase 01 Status Recommendation

### 7.1 Closure Breakdown
- **Closed Decisions**: 2 (`OD-009`, `OD-010`) — Fully resolved and codified.
- **Resolved by Architecture**: 8 (`OD-001`, `OD-002`, `OD-003`, `OD-004`, `OD-005`, `OD-007`, `OD-011`, `OD-013`) — Definitively solved via architectural design patterns and ADRs.
- **Deferred by Design**: 1 (`OD-012`) — Anonymous complaints formally deferred to post-MVP; does not block core workflow.
- **Requires Institutional Input**: 2 (`OD-006`, `OD-008`) — Architecturally modeled as configurable parameters; requires specific institutional numbers before production go-live.
- **Blocking Items**: **0** — No technical, security, or logical blockers remain that impede architectural completion.
- **MUST Requirement Coverage**: **38 / 38 (100%)** — Zero orphaned requirements.

### 7.2 Phase 01 Status Recommendation
**`FULL PASS READINESS ACHIEVED`**  
All ambiguities and open decisions from the requirements phase have been reconciled, forensically traced, and bound to deterministic architectural mechanisms.
