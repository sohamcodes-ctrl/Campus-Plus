# Phase 08-B: Consolidated UX Risk & Technical Debt Register

**Document Identifier:** `29-phase-08b-risk-and-debt-register.md`  
**Classification:** Implementation-Grade UI / Wireframe / High-Fidelity Product Design Specification  
**Standard:** Tracks operational risks, architectural limitations, and deferred UX technical debt.

---

## 1. Consolidated Operational Risk Register

| Risk ID | Severity | Title | Description | Mitigation Strategy in Phase 08-B Design |
| :--- | :---: | :--- | :--- | :--- |
| **RISK-001** | **P2** | Storage Orphan File Accumulation | Files uploaded via presigned URL remain in `complaints/temp/` if user abandons form before submit. | Documented in `17-complaint-submission-ui-specification.md`; UI warns before navigating away; backend lifecycle cron cleans temp bucket. |
| **RISK-002** | **P2** | Concurrency Collision in Triage | Multiple HODs or handlers opening the same ticket simultaneously can cause 409 collisions. | Explicit OCC Conflict Modal (`CMP-FEED-08`) with "Review Changes" and "Copy Draft" actions. |
| **RISK-003** | **P2** | Missing Notification API Endpoint | `GET /api/v1/notifications` does not exist in backend yet (`GAP-001`). | Fallback contract and mock state defined in `20-notification-ui.md` for Phase 08-C. |
| **RISK-004** | **P3** | Mobile Viewport Data Density | High-density tables overflow on narrow viewports (360px). | Automatic transformation to stacked cards on viewports `< 768px` (`22-responsive-design-specification.md`). |
| **RISK-005** | **P3** | Cross-Department Forwarding Loop | Misrouted complaints forwarded repeatedly between departments. | Anti-deadlock UI displays warning at 2 forwards; triggers Management escalation at 3 (`INV-010`). |
| **RISK-006** | **P3** | Direct S3 Upload Failures | Flaky mobile networks interrupting 5MB file uploads. | Chunked upload progress bars and individual file retry triggers (`CMP-FORM-06`). |
| **RISK-007** | **P3** | Accidental Student PII Exposure | Staff views displaying student phone numbers or personal emails. | Masked student metadata in UI (`24-security-and-privacy-ui-specification.md`); enforced by RLS. |
| **RISK-008** | **P4** | Stale Client Role Token | User demoted or reassigned on server while client JWT remains active. | Server returns HTTP 403; UI forces token revalidation and redirects to role dashboard. |

---

## 2. UX Technical Debt Register (Deferred by Design)

| Debt ID | Title | Rationale for Deferral | Target Phase |
| :--- | :--- | :--- | :--- |
| **UXDEBT-001** | Real-time WebSocket Live Feed | Supabase Realtime adds connection overhead; polling is sufficient for MVP. | Phase 09 |
| **UXDEBT-002** | Rich Text / Markdown Editor | Plain text textarea with character counters eliminates XSS and sanitization overhead. | Phase 09 |
| **UXDEBT-003** | Multi-Language / i18n Support | English is the institutional instruction standard for MVP. | Post-MVP |
| **UXDEBT-004** | Advanced Drag-and-Drop Kanban | Standard worklists and tables are more accessible and mobile-friendly. | Phase 09 |
| **UXDEBT-005** | Native Push Notifications | In-app bell drawer satisfies `FR-020` for MVP; web push requires service workers. | Phase 09 |
| **UXDEBT-006** | Dark Mode Theme Tokens | Institutional calm light palette meets all WCAG AAA requirements. | Post-MVP |
| **UXDEBT-007** | Custom Analytics Dashboard Builder | Fixed management KPI views (`MGT-001`) meet core reporting needs. | Phase 09 |
| **UXDEBT-008** | Automated Voice / Audio Notes | Audio file handling deferred to maintain strict 5MB attachment limits. | Post-MVP |
| **UXDEBT-009** | Bulk Action Triage Bar | Single-item actions minimize operational misdirection during MVP. | Phase 09 |
| **UXDEBT-010** | Custom Branding per Department | Unified institutional brand enforces centralized authority. | Post-MVP |
