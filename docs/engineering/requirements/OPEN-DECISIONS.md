# Campus Plus — Open Decisions, Assumptions & Proposed Capabilities

**Phase**: Phase 01 — Requirements Engineering & Problem Intelligence  
**Document**: OPEN-DECISIONS.md  
**Version**: 0.1  
**Status**: Draft / Conditional  
**Classification Standards**: SOURCE | DECISION | INFERENCE | PROPOSED | ASSUMPTION | UNKNOWN  

---

## 1. Executive Summary

This document registers all unresolved organizational decisions (`OD-*`), foundational engineering assumptions (`ASM-*`), and candidate future/proposed enhancements (`PROP-*`). In accordance with the Anti-Hallucination rule of this protocol, unresolved facts are formally captured here rather than assumed or invented.

---

## 2. Open Decisions Register (`OD-*`)

| Decision ID | Decision Title | Decision Scope | Alternative Options | Impact on Architecture & Implementation | Recommended Default | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`OD-001`** | **Departmental Ownership Model** | Organizational Hierarchy | **Option A**: Single primary owning department.<br>**Option B**: Multi-departmental joint ownership. | Single ownership simplifies state machine, access control, and SLA accountability. Multi-ownership requires complex matrix assignment. | **Option A** (Single primary owning department with inter-department forwarding). | **OPEN DECISION** |
| **`OD-002`** | **Escalation Hierarchy Path** | Workflow / Escalation | **Option A**: Strict vertical hierarchy (Handler → Dept Head → Grievance Cell / Principal).<br>**Option B**: Category-based routing directly to specialized institutional committees (e.g., Anti-Ragging, Women's Cell). | Affects notification routing, access rules, and state machine escalation handlers. | **Option A** for general complaints, with direct committee category routing for statutory categories. | **OPEN DECISION** |
| **`OD-003`** | **Cross-Department Forwarding Acceptance** | Workflow / Routing | **Option A**: Instant transfer upon forwarding.<br>**Option B**: Receiving department head must formally accept or dispute transfer. | Option A prevents complaints getting stuck in transfer limbo. Option B prevents departments from dumping tickets on each other. | **Option B** (Receiving department must accept within 24 hours, otherwise escalated to Admin). | **OPEN DECISION** |
| **`OD-004`** | **Authentication Provider Strategy** | Security / Identity | **Option A**: Institutional Google Workspace / Microsoft Entra SSO.<br>**Option B**: Institution-managed email domain validation with OTP / Magic Link.<br>**Option C**: Standard Email/Password with email confirmation. | Directly influences Phase 02/03 security architecture and database user schema. | **Option B** (Domain-restricted institutional email) with option to bridge SSO. | **OPEN DECISION** |
| **`OD-005`** | **Target Deployment & Hosting Model** | DevOps / Infrastructure | **Option A**: Managed serverless / PaaS (e.g., Vercel / Cloudflare).<br>**Option B**: Containerized cloud VM (Docker on AWS/DigitalOcean).<br>**Option C**: On-premise institutional server. | Dictates CI/CD, database selection, local development dependencies (Docker on Windows). | **Option A** or **Option B** pending institutional hosting policy. | **OPEN DECISION** |
| **`OD-006`** | **Numeric SLA & Auto-Escalation Thresholds** | Quality / Process | **Option A**: Strict default hours (Urgent: 24h, High: 48h, Medium: 5d, Low: 10d).<br>**Option B**: Configurable per department and category.<br>**Option C**: Advisory guidelines without automated state transition. | Determines whether automated background cron/worker is required for SLA timeouts. | **Option B** with sensible defaults. | **OPEN DECISION** |
| **`OD-007`** | **Mandatory Resolution Proof** | Quality / Resolution | **Option A**: Image/file proof mandatory for physical categories (Infrastructure, Hostel).<br>**Option B**: Text resolution summary mandatory; attachments optional. | Affects storage requirements, mobile camera upload UX, and validation logic. | **Option A** for infrastructure categories, Option B for academic/administrative. | **OPEN DECISION** |
| **`OD-008`** | **Complainant Verification & Reopen Window** | Lifecycle / Closure | **Option A**: 3 calendar days.<br>**Option B**: 5 business days.<br>**Option C**: 7 calendar days. | Controls ticket auto-close timers and dispute lifecycle. | **Option B** (5 business days). | **OPEN DECISION** |
| **`OD-009`** | **Closed Complaint Reopening Policy** | Lifecycle / State Machine | **Option A**: Closed tickets are strictly immutable; complainant must log a new ticket referencing the old ID.<br>**Option B**: System Administrator can manually reopen closed tickets upon formal appeal. | Affects terminal state immutability in database and audit logs. | **Option A** (Immutable terminal state; new ticket with backward reference). | **OPEN DECISION** |
| **`OD-010`** | **Attachment Size & Quota Constraints** | Storage / Security | **Option A**: Max 5 MB per file, up to 3 files per complaint.<br>**Option B**: Max 10 MB per file, up to 5 files per complaint.<br>**Option C**: Max 2 MB per file, single file. | Influences storage costs, virus scanning requirements, and mobile upload latency. | **Option A** (Max 5 MB, up to 3 files; JPG/PNG/PDF). | **OPEN DECISION** |
| **`OD-011`** | **Notification Channel Scope** | Integrations / UX | **Option A**: In-app notifications only (MVP).<br>**Option B**: In-app + Transactional Email (Resend/SendGrid/SMTP).<br>**Option C**: In-app + Email + WhatsApp/SMS. | Affects third-party API dependencies, cost, and reliability. | **Option B** (In-app + Transactional Email). | **OPEN DECISION** |
| **`OD-012`** | **Anonymous Complaint Support** | Privacy / Policy | **Option A**: Disallowed; all complaints require authenticated student identity.<br>**Option B**: Allowed for sensitive categories (e.g., Harassment/Ragging) where identity is cryptographically hidden from handlers. | Complex privacy and legal implications. | **Option A** for general MVP, with Option B flagged for specialized privacy review. | **OPEN DECISION** |
| **`OD-013`** | **Recurring Complaint Identification Formula** | Intelligence / Analytics | **Option A**: Exact rule-based match (same category + location + department within 30 days).<br>**Option B**: Statistical threshold (>5 complaints in same category/location per week).<br>**Option C**: Text similarity / embedding-based clustering (Post-MVP). | Determines complexity of analytics queries vs. background data processing. | **Option A** for MVP rule-based intelligence. | **OPEN DECISION** |

---

## 3. Foundational Assumptions (`ASM-*`)

| Assumption ID | Title | Rationale & Justification | Risk if Invalid |
| :--- | :--- | :--- | :--- |
| **`ASM-001`** | **English as Primary Operational Language** | The academic synopsis and institutional communications are conducted in English. Initial UI labels, statuses, categories, and notifications will be standardized in English. | If local language (e.g., Marathi/Hindi) is mandated, i18n localization must be introduced into UI requirements. |
| **`ASM-002`** | **Representative Institutional Context** | The initial model context is R. C. Patel Institute of Technology (RCPIT), Shirpur (autonomous engineering institute with academic, hostel, and infrastructure wings). | Minimal risk; architecture will remain generalized and configurable for any tertiary educational institution. |
| **`ASM-003`** | **Web-First Accessibility** | Users (students, staff, administrators) have access to modern responsive web browsers (Chrome, Edge, Safari, Firefox) on desktop or smartphone devices. | If dedicated native mobile apps (Android/iOS) are strictly required, mobile API requirements would expand. |
| **`ASM-004`** | **Standard Institutional Working Calendar** | Resolution timeframes and SLA calculations operate primarily on institutional working days (excluding Sundays and official public holidays). | If 24/7 continuous SLA is assumed for all categories, escalation timers will fire inappropriately during weekends. |
| **`ASM-005`** | **Authenticated Identity Verification** | The institution maintains or can provision a list of authorized students and staff with verifiable institutional email addresses. | If no institutional directory exists, external verification (e.g., student ID card photo upload) would be required. |

---

## 4. Proposed Capabilities & Post-MVP Enhancements (`PROP-*`)

| Capability ID | Title | Classification | Description | Justification for Post-MVP Deferral |
| :--- | :--- | :--- | :--- | :--- |
| **`PROP-001`** | **Complainant Resolution Satisfaction Rating** | **PROPOSED** | Enable students to rate resolution quality (1 to 5 stars) and submit feedback upon closing a ticket. | Valuable for KPI metrics, but not strictly required for the core submission-to-resolution lifecycle. |
| **`PROP-002`** | **Pre-Submission Duplicate Warning** | **PROPOSED** | When a student types a complaint, the system surfaces existing open complaints in the same location/category to prevent duplicate filings. | Enhances operational efficiency; requires search indexing infrastructure. |
| **`PROP-003`** | **AI-Assisted Categorization & Triage** | **PROPOSED** | Utilize NLP / LLM models to analyze complaint text and suggest optimal category, department, and priority. | Explicitly out of scope for Phase 01/MVP; must be built on top of a proven deterministic workflow. |
| **`PROP-004`** | **Field Handler Offline Support / PWA** | **PROPOSED** | Progressive Web App capabilities for maintenance staff working in campus basements or areas with poor cellular connectivity. | Optimizes field operations; secondary to primary responsive web interface. |
| **`PROP-005`** | **Multi-Lingual Localization (i18n)** | **PROPOSED** | Support for Marathi, Hindi, and English UI localization. | Adds translation bundle overhead; recommended after core English workflow is validated. |
| **`PROP-006`** | **Public Campus Transparency Noticeboard** | **PROPOSED** | A sanitized public dashboard displaying non-confidential resolved grievances and institutional improvements to build community trust. | Requires strict privacy sanitization controls to avoid accidental disclosure of personal grievances. |

---

## 5. Verification Checklist

- [x] All open organizational and technical ambiguities captured as `OD-001` through `OD-013`.
- [x] Clear option comparisons and recommended defaults articulated for every open decision.
- [x] Foundational project assumptions documented as `ASM-001` through `ASM-005`.
- [x] Future and candidate features isolated as `PROP-001` through `PROP-006` to protect MVP boundaries.
