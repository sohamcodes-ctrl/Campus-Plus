# Phase 08-A: UX Decision Records (UXDR)

**Document Identifier:** `24-ux-decision-records.md`  
**Classification:** Enterprise UX / Product Experience Blueprint  
**Standard:** Codifies formal architectural decisions governing the Campus Plus user experience.

---

## UXDR Index

- **`UXDR-001`**: Locked Institutional Role-Themed Color Palettes
- **`UXDR-002`**: Zero-Trust Server-Authoritative UI Actions
- **`UXDR-003`**: Single Canonical Complaint Route (`/complaints/[id]`)
- **`UXDR-004`**: In-App Notification Center as MVP Core (Email Deferred)
- **`UXDR-005`**: 5-Business-Day Dispute & Reopen Verification Window
- **`UXDR-006`**: Deterministic Multi-Attribute Recurrence Clustering over AI
- **`UXDR-007`**: Strict 5MB / 3-File Boundary with Pre-Signed Direct Upload
- **`UXDR-008`**: Dual-Level Timeline Segregation for Public vs Internal Notes
- **`UXDR-009`**: Strictly Terminal Immutable Closed State
- **`UXDR-010`**: Anti-Deadlock 3-Forward Cycle Management Escalation

---

### `UXDR-001`: Locked Institutional Role-Themed Color Palettes
- **Status:** **ADOPTED / LOCKED** (Section 14)
- **Context:** Campus Plus serves 5 distinct stakeholder tiers. Users switching between roles or technicians handling multiple responsibilities need instant cognitive orientation.
- **Decision:** Lock role color schemes verbatim: Student (`#7FA8D9`), Handler (`#7FC4B2`), HOD (`#B39DDB`), Admin (`#9FB4C7`), Management (`#E3A6AE`).
- **Consequences:** Role identity is immediately recognizable through top header accent bars, active nav pills, and primary action buttons. Contrast ratios strictly satisfy WCAG AA (>= 4.5:1).

---

### `UXDR-002`: Zero-Trust Server-Authoritative UI Actions
- **Status:** **ADOPTED** (`SEC-002`)
- **Context:** Frontend button hiding or disabling can be bypassed via browser developer tools.
- **Decision:** Client-side button hiding is treated strictly as a convenience feature. Every state mutation is validated server-side against `AuthorizationPolicy.ts` checking Actor Role + Resource Ownership + Department Scope + State.
- **Consequences:** Unauthorized requests return HTTP 403/422 regardless of client state.

---

### `UXDR-003`: Single Canonical Complaint Route (`/complaints/[id]`)
- **Status:** **ADOPTED**
- **Context:** Avoid fragmenting URLs into `/student/complaints/1`, `/handler/complaints/1`, `/admin/complaints/1`.
- **Decision:** A single canonical route `/complaints/[id]` dynamically renders either `StudentComplaintDTO` or `StaffComplaintDTO` based on the authenticated session.
- **Consequences:** Clean URLs, simplified deep-links, data minimization enforced at the DTO layer.

---

### `UXDR-004`: In-App Notification Center as MVP Core (Email Deferred)
- **Status:** **ADOPTED** (`OD-011`)
- **Context:** Setting up production SMTP/Resend/SendGrid introduces third-party deliverability failure modes and operational costs during initial testing.
- **Decision:** Focus MVP strictly on an in-app notification drawer (`SHR-001`) backed by the PostgreSQL `notifications` table. Transactional email is formally deferred to Post-MVP.
- **Consequences:** 100% reliable local and staging verification without external email credentials.

---

### `UXDR-005`: 5-Business-Day Dispute & Reopen Verification Window
- **Status:** **ADOPTED** (`OD-008`, `BR-016`)
- **Context:** Complainants must be granted reasonable time to verify repairs while preventing complaints from lingering open indefinitely.
- **Decision:** Grant students a 5-business-day window upon resolution. If no dispute occurs within 5 working days, an automated job transitions the ticket to `CLOSED` (`AUTO_CLOSED_NO_DISPUTE`).
- **Consequences:** Fair student oversight with guaranteed operational closure.

---

### `UXDR-006`: Deterministic Multi-Attribute Recurrence Clustering over AI
- **Status:** **ADOPTED** (`ADR-010`, `BR-023`, `OD-013`)
- **Context:** Prematurely introducing LLM embeddings or vector clusters introduces latency, hallucinated clusters, and GPU hosting overhead.
- **Decision:** Use deterministic relational aggregation (`recurring_complaint_clusters` view): `>=3` matching complaints with same category, department, and location within rolling 30 days.
- **Consequences:** Sub-second queries, 100% predictable clustering, zero AI hallucination.

---

### `UXDR-007`: Strict 5MB / 3-File Boundary with Pre-Signed Direct Upload
- **Status:** **ADOPTED** (`OD-010`, `BR-022`)
- **Context:** Campus servers should not act as multi-gigabyte document proxies.
- **Decision:** Limit attachments to 5.0 MB per file, max 3 files per complaint, restricted to JPEG/PNG/PDF. Uploads occur directly from browser to private storage via pre-signed URLs.
- **Consequences:** Prevents server memory exhaustion; robust security scanning boundaries.

---

### `UXDR-008`: Dual-Level Timeline Segregation for Public vs Internal Notes
- **Status:** **ADOPTED** (`BR-020`, `INV-012`)
- **Context:** Technicians need to debate technical solutions and logistics without alarming students.
- **Decision:** Segregate public timeline events from internal staff notes. Student DTOs completely omit internal notes.
- **Consequences:** Safe, candid internal collaboration with full external transparency.

---

### `UXDR-009`: Strictly Terminal Immutable Closed State
- **Status:** **ADOPTED** (`INV-003`, `OD-009`)
- **Context:** Reopening closed complaints indefinitely destroys historical audit trails and distorts resolution metrics.
- **Decision:** `CLOSED` is an immutable terminal state. Once closed, tickets cannot be mutated. If an issue recurs, a new complaint is filed with a reference to the previous tracking code.
- **Consequences:** Guaranteed data integrity and tamper-proof archival records.

---

### `UXDR-010`: Anti-Deadlock 3-Forward Cycle Management Escalation
- **Status:** **ADOPTED** (`INV-010`, `EDGE-004`)
- **Context:** Bureaucratic "hot-potato" where departments repeatedly forward tickets back and forth to avoid responsibility.
- **Decision:** Upon reaching 3 forward transfers, lateral forwarding is blocked and the ticket is elevated directly to `TIER_3_MANAGEMENT`.
- **Consequences:** Eliminates infinite forwarding loops; enforces institutional accountability.
