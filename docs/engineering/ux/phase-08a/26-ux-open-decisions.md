# Phase 08-A: UX Open Decision Register (`OD-*`)

**Document Identifier:** `26-ux-open-decisions.md`  
**Classification:** Enterprise UX / Product Experience Blueprint  
**Standard:** Tracks the status, institutional options, and UX architectural impact of all foundational open decisions.

---

## Master Open Decision Register

| Decision ID | Decision Title | Status | Options Under Consideration | UX Architecture Resolution / Recommended Default |
| :--- | :--- | :---: | :--- | :--- |
| **`OD-001`** | **Departmental Ownership Model** | **RESOLVED FOR MVP** | Option A: Single primary department.<br>Option B: Joint multi-department ownership. | **Option A Adopted:** Single primary department at all times (`INV-001`). Simplifies UI status banners and single technician assignment. |
| **`OD-002`** | **Escalation Hierarchy Path** | **RESOLVED FOR MVP** | Option A: Vertical (Handler -> HOD -> Management).<br>Option B: Category committee routing. | **Option A Adopted:** Strict 3-tier hierarchy (`TIER_1_HANDLER`, `TIER_2_DEPARTMENT_HEAD`, `TIER_3_MANAGEMENT`). |
| **`OD-003`** | **Forwarding Transfer Acceptance** | **OPEN DECISION** | Option A: Instant transfer upon submit.<br>Option B: Receiving HOD must accept transfer. | **Recommended Option B; Code implements Option A.** UX handles instant transfer while displaying transfer history banner in receiving queue. |
| **`OD-004`** | **Authentication Provider Strategy** | **RESOLVED FOR MVP** | Option A: Google Workspace SSO.<br>Option B: Institutional email + password.<br>Option C: Magic link OTP. | **Option B Adopted for MVP:** Supabase Auth with institutional email domain validation. SSO bridged in Post-MVP. |
| **`OD-005`** | **Target Deployment & Hosting Model** | **RESOLVED FOR MVP** | Option A: Managed PaaS (Vercel).<br>Option B: Containerized Docker VM. | **Option A Adopted:** Next.js hosted on managed PaaS connecting to Supabase PostgreSQL. |
| **`OD-006`** | **Numeric SLA & Threshold Hours** | **PROVISIONAL** | Option A: Strict defaults (12h, 24h, 72h, 168h).<br>Option B: Configurable per category in DB. | **Option B Implemented:** `sla_policies` table supports per-category configuration. UI shows provisional defaults with "TARGET" tag. |
| **`OD-007`** | **Mandatory Resolution Proof** | **RESOLVED FOR MVP** | Option A: Proof mandatory for physical repairs.<br>Option B: Proof optional everywhere. | **Option A Adopted:** Evaluated via `categories.requires_resolution_proof`. UI enforces proof upload only when category mandates it (`INV-006`). |
| **`OD-008`** | **Complainant Verification Window** | **RESOLVED FOR MVP** | Option A: 3 days.<br>Option B: 5 business days.<br>Option C: 7 days. | **Option B Adopted:** Exactly 5 business days enforced via `CalendarReopenPolicyAdapter`. UI shows active countdown banner. |
| **`OD-009`** | **Closed Complaint Reopening Policy** | **RESOLVED FOR MVP** | Option A: Closed is strictly terminal.<br>Option B: Admin can reopen closed tickets. | **Option A Adopted:** `CLOSED` is strictly terminal (`INV-003`). If issue recurs, student files new complaint referencing old code. |
| **`OD-010`** | **Attachment Size & Quota** | **RESOLVED FOR MVP** | Option A: Max 5MB, up to 3 files.<br>Option B: Max 10MB, up to 5 files. | **Option A Adopted:** Exactly 5MB per file, max 3 files, JPEG/PNG/PDF (`BR-022`, `chk_attachment_size_limit`). |
| **`OD-011`** | **Notification Channel Scope** | **RESOLVED FOR MVP** | Option A: In-app notifications only.<br>Option B: In-app + Email.<br>Option C: In-app + Email + WhatsApp. | **Option A Adopted for MVP:** In-app notification drawer only (`SHR-001`). Email and WhatsApp formally deferred to Post-MVP. |
| **`OD-012`** | **Anonymous Complaint Support** | **RESOLVED FOR MVP** | Option A: Disallowed (Authenticated only).<br>Option B: Allowed for sensitive categories. | **Option A Adopted for MVP:** Submissions require authenticated student identity (`BR-001`). Option B deferred for statutory review. |
| **`OD-013`** | **Recurring Complaint Identification**| **RESOLVED FOR MVP** | Option A: Relational rule (>=3 in 30 days).<br>Option B: AI vector embedding clustering. | **Option A Adopted:** Relational clustering via `recurring_complaint_clusters` view (`ADR-010`). AI clustering deferred. |
