# Phase 08-A UX Architecture: 01 Reconnaissance (Repository Baseline)

**Document Type:** REPOSITORY BASELINE DOCUMENT
**Phase:** 08-A UX Architecture
**Target System:** Campus Plus (Campus Complaint and Grievance Resolution System)

## 1. Repository State

* **[SOURCE-DERIVED]** Branch: `main`, Commit: `9c9e05722747631a12b3b5600f1e13b4dbdba434`
* **[SOURCE-DERIVED]** Stack: Node.js 24.13.0, pnpm 11.22.0, Next.js 16.3.4, React 19.2.8, TypeScript 5.9.3, Vitest 5.0.0, Tailwind CSS v4, PostgreSQL 17.6 (Supabase)
* **[SOURCE-DERIVED]** Test Suite: 223 tests passing, 23 test files.

## 2. Existing Frontend State

* **[SOURCE-DERIVED]** Only 2 page files exist: `src/app/layout.tsx` (root layout) and `src/app/page.tsx` (foundation landing page).
* **[SOURCE-DERIVED]** Single UI component exists: `src/presentation/components/Card.tsx`.
* **[SOURCE-DERIVED]** CSS configuration: `src/app/globals.css` with only `@import "tailwindcss";`.
* **[SOURCE-DERIVED]** Missing core config files: No `middleware.ts`, no `tailwind.config.ts` (v4 CSS-first mode).
* **[SOURCE-DERIVED]** Missing frontend infrastructure: No icon library, no component library, no form library, no data-fetching library.
* **[SOURCE-DERIVED]** Missing styling setup: No design tokens, no theme files, no custom CSS variables.

## 3. Existing API Capabilities (20 Endpoints)

* **[SOURCE-DERIVED]** `GET/POST /api/v1/complaints` (list + submit)
* **[SOURCE-DERIVED]** `GET /api/v1/complaints/[id]` (detail)
* **[SOURCE-DERIVED]** `GET /api/v1/complaints/[id]/timeline`
* **[SOURCE-DERIVED]** `POST /api/v1/complaints/[id]/review`
* **[SOURCE-DERIVED]** `POST /api/v1/complaints/[id]/assign`
* **[SOURCE-DERIVED]** `POST /api/v1/complaints/[id]/progress`
* **[SOURCE-DERIVED]** `POST /api/v1/complaints/[id]/forward`
* **[SOURCE-DERIVED]** `POST /api/v1/complaints/[id]/escalate`
* **[SOURCE-DERIVED]** `POST /api/v1/complaints/[id]/resolve`
* **[SOURCE-DERIVED]** `POST /api/v1/complaints/[id]/verify`
* **[SOURCE-DERIVED]** `POST /api/v1/complaints/[id]/dispute`
* **[SOURCE-DERIVED]** `POST /api/v1/complaints/[id]/close`
* **[SOURCE-DERIVED]** `POST /api/v1/complaints/[id]/reject`
* **[SOURCE-DERIVED]** `POST /api/v1/complaints/[id]/duplicate`
* **[SOURCE-DERIVED]** `POST /api/v1/complaints/[id]/cancel`
* **[SOURCE-DERIVED]** `POST /api/v1/attachments/presign-upload`
* **[SOURCE-DERIVED]** `GET /api/v1/auth/me`
* **[SOURCE-DERIVED]** `GET /api/health`

## 4. Existing Roles and Permissions

* **[SOURCE-DERIVED]** Roles (from domain code): `ROLE_STUDENT`, `ROLE_FACULTY`, `ROLE_HANDLER`, `ROLE_DEPT_HEAD`, `ROLE_MANAGEMENT`, `ROLE_ADMIN`.
* **[SOURCE-DERIVED]** Authorization Policy enforces 4-dimensional checks: Actor Role + Resource Ownership + Department Scope + State.
* **[SOURCE-DERIVED]** **Admin/Management**: Broad cross-department purview.
* **[SOURCE-DERIVED]** **Students**: VIEW own complaints, SUBMIT, VERIFY_RESOLUTION, DISPUTE_REOPEN, CANCEL (own, pre-triage only).
* **[SOURCE-DERIVED]** **Handlers**: VIEW (dept), START_PROGRESS (if assigned), RESOLVE (if assigned), FORWARD, ESCALATE.
* **[SOURCE-DERIVED]** **Dept Head**: VIEW, REVIEW, ASSIGN, FORWARD, ESCALATE, RESOLVE, CLOSE, REJECT, MARK_DUPLICATE.

## 5. Existing Lifecycle and Domain Capabilities

* **[SOURCE-DERIVED]** **Lifecycle (13 states)**: DRAFT, SUBMITTED, REVIEWED, ASSIGNED, IN_PROGRESS, FORWARDED, ESCALATED, RESOLVED, CLOSED, REOPENED, REJECTED, DUPLICATE, CANCELLED.
* **[SOURCE-DERIVED]** **Terminal state**: CLOSED only.
* **[SOURCE-DERIVED]** **Value Objects**: ComplaintTitle (10-120 chars), ComplaintDescription (>=30 chars), Priority (LOW/MEDIUM/HIGH/URGENT), ResolutionSummary (>=20 chars), ForwardingRationale (>=10 chars), TrackingCode (CP-YYYY-XXXXX), ComplaintVersion (>=1).
* **[SOURCE-DERIVED]** **Categories**: NETWORK_WIFI, HOSTEL_MAINTENANCE, CLASSROOM_INFRASTRUCTURE, ACADEMIC_EVALUATION, CAMPUS_SANITATION, OTHER.
* **[SOURCE-DERIVED]** **Escalation Tiers**: TIER_1_HANDLER, TIER_2_DEPARTMENT_HEAD, TIER_3_MANAGEMENT.
* **[SOURCE-DERIVED]** **Attachment Types**: INITIAL_EVIDENCE, RESOLUTION_PROOF.
* **[SOURCE-DERIVED]** **Anti-deadlock**: 3 forward threshold triggers management escalation.
* **[SOURCE-DERIVED]** **Concurrency**: OCC via version field, Idempotency via key+hash.

## 6. Existing UX and Design Artifacts

* **[SOURCE-DERIVED]** **UX Artifacts**: NONE (no wireframes, mockups, Figma, or design documents exist). Dashboard specs exist in [docs/engineering/architecture/SUBSYSTEM-ARCHITECTURES.md](file:///d:/Deparment%20Project/department%20project/docs/engineering/architecture/SUBSYSTEM-ARCHITECTURES.md) Section 8.2.
* **[SOURCE-DERIVED]** **Design Artifacts**: NONE.

## 7. Existing Gaps (API vs. UX Needs)

1. **[ARCHITECTURE-DERIVED]** No notification retrieval API (FR-020 requires in-app notifications but no `GET /notifications` endpoint exists).
2. **[ARCHITECTURE-DERIVED]** No dashboard aggregate API (individual role dashboards need aggregated counts/summaries).
3. **[ARCHITECTURE-DERIVED]** No department list API (forwarding needs department selection).
4. **[ARCHITECTURE-DERIVED]** No category list API (submission needs category selection).
5. **[ARCHITECTURE-DERIVED]** No user/handler list API (assignment needs handler selection within department).
6. **[ARCHITECTURE-DERIVED]** No profile update API.
7. **[ARCHITECTURE-DERIVED]** No SLA configuration API.
8. **[ARCHITECTURE-DERIVED]** No recurring complaint detection API.
9. **[ARCHITECTURE-DERIVED]** No analytics/reporting aggregate API.
10. **[ARCHITECTURE-DERIVED]** No notification mark-read/dismiss API.

## 8. Potential Contradictions and UX Decisions

* **[UX INFERENCE]** `ROLE_FACULTY` exists in code but is not in the Phase 01 stakeholder model ([STAKEHOLDER-MODEL.md](file:///d:/Deparment%20Project/department%20project/docs/engineering/requirements/STAKEHOLDER-MODEL.md) mentions only Student, Handler, Dept Head, Admin, Management). **UX Decision:** Treat `ROLE_FACULTY` as equivalent to `ROLE_STUDENT` for UX purposes (both are complainants).
* **[ARCHITECTURE-DERIVED]** OD-003 (Cross-Department Forwarding Acceptance) remains OPEN DECISION. Recommended Option B (acceptance required) but code implements instant transfer. **UX Requirement:** UX must handle whichever behavior the backend implements.

## 9. Unknowns

* **[UNKNOWN]** Exact institutional department taxonomy.
* **[UNKNOWN]** Exact SLA numeric thresholds (provisional defaults exist but are not ratified).
* **[UNKNOWN]** Working calendar / holiday definitions.
* **[UNKNOWN]** Email notification integration timeline.
* **[UNKNOWN]** Authentication provider (OD-004 still open).

## 10. Risks

* **[ARCHITECTURE-DERIVED]** P2: Temporary attachment orphan accumulation (presigned uploads without complaint binding).
* **[UX INFERENCE]** API gaps may block certain UX flows without composition or new endpoints.
* **[ARCHITECTURE-DERIVED]** No real-time/WebSocket support for live notifications.

## Evidence References

* **[SOURCE-DERIVED]** All findings sourced from repository inspection at commit `9c9e0572...`.
* **[ARCHITECTURE-DERIVED]** Phase 01: [docs/engineering/requirements/](file:///d:/Deparment%20Project/department%20project/docs/engineering/requirements/)
* **[ARCHITECTURE-DERIVED]** Phase 02: [docs/engineering/architecture/](file:///d:/Deparment%20Project/department%20project/docs/engineering/architecture/)
* **[SOURCE-DERIVED]** Phase 05: [src/domain/complaint/](file:///d:/Deparment%20Project/department%20project/src/domain/complaint/)
* **[SOURCE-DERIVED]** Phase 06: [src/app/api/](file:///d:/Deparment%20Project/department%20project/src/app/api/), [src/presentation/](file:///d:/Deparment%20Project/department%20project/src/presentation/)
* **[ARCHITECTURE-DERIVED]** Phase 07-B: [docs/engineering/infrastructure/](file:///d:/Deparment%20Project/department%20project/docs/engineering/infrastructure/)
