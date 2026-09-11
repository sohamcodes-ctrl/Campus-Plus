# Phase 08-C: Forensic Frontend Reconnaissance & Repository Baseline Report

**Document Identifier:** `01-RECONNAISSANCE.md`  
**Classification:** Frontend Engineering Architecture & Baseline Audit  
**Phase:** 08-C (Frontend Engineering & Implementation)  
**Authority:** Principal Frontend Architect, Application Security Engineer, QA Lead, DevOps Engineer  
**Timestamp:** 2026-09-11T21:05:00+05:30  
**Repository:** Campus Plus — Campus Complaint & Grievance Resolution System  

---

## 1. Repository State

- **Branch:** `main` (clean working tree relative to remote origin, zero uncommitted production regressions).
- **Node.js Runtime:** `v24.13.0` (LTS baseline).
- **Package Manager:** `pnpm@11.22.0` (corepack enabled).
- **Framework Core:** Next.js `16.3.4` (App Router, Turbopack enabled for development and production builds).
- **UI Runtime:** React `19.2.8` & React-DOM `19.2.8` (Server Actions and React 19 hooks supported).
- **Language:** TypeScript `5.9.3` (`strict: true`, `noEmit: true`, path alias `@/*` -> `./src/*`).
- **Styling Architecture:** Tailwind CSS `v4` in CSS-first configuration (`@import "tailwindcss";` in `src/app/globals.css`, PostCSS `@tailwindcss/postcss`).
- **Database Engine:** Supabase PostgreSQL `17.6` with Row-Level Security active across 6 core domain tables.

---

## 2. Existing Frontend Inventory

A comprehensive inspection of the frontend directory structure reveals the current pre-implementation state:
- **Root Layout:** `src/app/layout.tsx` — minimal HTML shell with Inter font placeholder and global CSS import.
- **Root Page:** `src/app/page.tsx` — simple Phase 03 foundation landing page displaying system status cards and link to `/api/health`.
- **Global Styles:** `src/app/globals.css` — containing only `@import "tailwindcss";` (23 bytes). No custom design tokens, CSS variables, or themes.
- **Components:** Single existing component `src/presentation/components/Card.tsx` (587 bytes).
- **Client State / Stores:** None.
- **Client Hooks:** None.
- **Routing:** No client pages exist outside of root `/`. All route files under `src/app/api/` are backend route handlers (`route.ts`).

---

## 3. Existing Backend Inventory

- **API Routes (18 Route Files, 19 Operations):**
  1. `GET /api/health` — Decoupled system liveness and health status.
  2. `GET /api/v1/auth/me` — Authenticated actor identity, role derivation, and department context.
  3. `GET /api/v1/complaints` — Paginated list of complaints filtered by actor role, department, and RLS.
  4. `POST /api/v1/complaints` — New grievance intake with Zod validation and idempotency support.
  5. `GET /api/v1/complaints/[id]` — Role-scoped complaint detail projection.
  6. `GET /api/v1/complaints/[id]/timeline` — Chronological action history events.
  7. `POST /api/v1/complaints/[id]/review` — HOD/Supervisor initial triage review.
  8. `POST /api/v1/complaints/[id]/assign` — HOD technician assignment.
  9. `POST /api/v1/complaints/[id]/progress` — Handler progress initiation.
  10. `POST /api/v1/complaints/[id]/forward` — Inter-departmental forwarding with rationale.
  11. `POST /api/v1/complaints/[id]/escalate` — Tiered escalation trigger.
  12. `POST /api/v1/complaints/[id]/resolve` — Formal service resolution with proof.
  13. `POST /api/v1/complaints/[id]/verify` — Complainant resolution sign-off.
  14. `POST /api/v1/complaints/[id]/dispute` — Complainant dispute and re-opening.
  15. `POST /api/v1/complaints/[id]/close` — Administrative terminal closure.
  16. `POST /api/v1/complaints/[id]/reject` — HOD rejection with justification.
  17. `POST /api/v1/complaints/[id]/duplicate` — Linking redundant complaint to master ticket.
  18. `POST /api/v1/complaints/[id]/cancel` — Pre-triage complainant cancellation.
  19. `POST /api/v1/attachments/presign-upload` — Presigned S3 URL issuance for attachments.
- **Domain Aggregates & Invariants:**
  - `Complaint` aggregate root enforcing 13 FSM lifecycle states, OCC version checking, idempotency keys, and 4D authorization policies (`AuthorizationPolicy.ts`).

---

## 4. Existing Dependencies

### Production Dependencies (`package.json`):
- `@supabase/supabase-js: ^2.116.0` — Official Supabase client for Auth, Database queries, and Storage.
- `next: 16.3.4` — Web application framework.
- `pg: ^8.23.0` — PostgreSQL client driver for Node.js.
- `react: 19.2.8` — React UI library.
- `react-dom: 19.2.8` — React DOM renderer.
- `zod: ^4.5.4` — Schema declaration and validation library.

### Dev Dependencies:
- `@electric-sql/pglite: ^0.5.8` — Lightweight in-memory WASM Postgres for isolated unit/integration tests.
- `@tailwindcss/postcss: ^4` — Tailwind CSS v4 PostCSS plugin.
- `@types/node: ^20`, `@types/pg: ^8.23.1`, `@types/react: ^19`, `@types/react-dom: ^19` — TypeScript type definitions.
- `eslint: ^9`, `eslint-config-next: 16.3.4` — Next.js ESLint configuration.
- `tailwindcss: ^4` — Utility-first styling engine.
- `typescript: ^5` — TypeScript compiler.
- `vitest: ^5.0.0` — Fast unit and integration test runner.

---

## 5. Existing Testing Infrastructure

- **Runner:** Vitest `5.0.0` configured via `vitest.config.mts`.
- **Test Locations:** `tests/` directory with 23 test suites spanning database migrations, FSM transitions, OCC concurrency, idempotency, BOLA/IDOR security, and live Supabase staging verification.
- **Current Baseline Status:** **223 passed tests / 23 test suites (100% pass rate)**.
- **TypeScript Typecheck:** `tsc --noEmit` exits with code 0 (clean).
- **ESLint:** `eslint` exits with code 0 (clean).

---

## 6. Existing Routing Architecture

- **App Router:** `src/app/` using Next.js 16 App Router.
- **Server vs Client Components:** Currently, all existing components (`layout.tsx`, `page.tsx`, `Card.tsx`) are React Server Components or server-rendered.
- **Dynamic API Routes:** All API routes enforce `export const dynamic = "force-dynamic";`.
- **Route Envelopes:**
  - Success: `ApiSuccessEnvelope<T>` (`{ success: true, data: T, meta: ApiResponseMeta }`).
  - Error: `ApiErrorEnvelope` (`{ success: false, error: { code, message, correlation_id, details } }`).

---

## 7. Existing Authentication Architecture

- **Server-Side Authority:** `AuthenticationAdapter.ts` resolves Bearer JWT tokens against Supabase Auth service.
- **Zero Client Trust:** Identity claims, user roles (`ROLE_STUDENT`, `ROLE_HANDLER`, etc.), and department memberships are derived directly from the PostgreSQL `users`, `user_roles`, and `department_memberships` tables.
- **Test Bypasses Blocked:** Test headers (e.g. `x-actor-id`) are strictly rejected in production environments.

---

## 8. Existing API Integration

- Currently, there is **no centralized client-side API client**. The existing landing page performs simple anchor links.
- Phase 08-C must build a robust, typed client-side API client (`src/presentation/services/apiClient.ts`) that standardizes Bearer token inclusion, correlation tracking, error normalization, and idempotency key handling.

---

## 9. Existing Design-System Code

- **Status:** **Zero design tokens exist in code**.
- Phase 08-B defined the complete CSS variable and `@theme` mapping in `docs/engineering/ux/phase-08b/03-design-token-system.md`.
- Phase 08-C will implement these tokens directly in `src/app/globals.css`.

---

## 10. Existing Reusable Components

- Only `src/presentation/components/Card.tsx` currently exists.
- The 36 component primitives codified in `CMP-BASE-01` through `CMP-DOM-04` must be engineered in `src/presentation/components/`.

---

## 11. Existing Technical Debt

- **Missing API Routes (12 Gaps):** Cataloged in `20-frontend-api-gaps.md` (e.g. `GET /api/v1/notifications`, `GET /api/v1/departments`).
- **No Client State Management:** Need lightweight React context or state hooks for active session, notification polling, and draft retention.
- **Single Component Prototype:** Existing `Card.tsx` uses hardcoded Tailwind classes (`border-slate-200`) rather than semantic tokens.

---

## 12. Potentially Conflicting Code

- `src/presentation/components/Card.tsx` currently uses raw slate borders. Must be refactored or superseded by the token-driven design system Card.
- `src/app/page.tsx` is an internal foundation status page. Must be replaced with the institutional entry point or dashboard routing.

---

## 13. Security-Sensitive Files (Strict Governance)

1. `src/infrastructure/auth/AuthenticationAdapter.ts` — Governs identity resolution; MUST NOT be weakened.
2. `src/domain/complaint/policies/AuthorizationPolicy.ts` — 4D authorization matrix; MUST NOT be bypassed.
3. `src/infrastructure/storage/SupabaseStorageAdapter.ts` — Handles signed presigned URLs; MUST NOT expose raw buckets.
4. `src/presentation/utils/errorHandler.ts` — Normalizes exceptions into RFC-aligned error envelopes.

---

## 14. Files that MUST NOT be Modified

- `migrations/*` — Database schema is locked and verified in Phase 07-B.
- `src/domain/*` — Domain entities, value objects, and invariants are locked.
- `src/application/*` — Use cases and ports are locked.
- `src/infrastructure/database/*` — Database queries and connections are locked.

---

## 15. Files Safe to Modify / Implement in Phase 08-C

- `src/app/*` (Layouts, pages, route wrappers, CSS tokens).
- `src/presentation/components/*` (Reusable design system primitives and domain widgets).
- `src/presentation/hooks/*` (Client hooks for auth, notifications, media queries, drafts).
- `src/presentation/services/*` (Typed API client, Supabase client wrapper).
- `src/presentation/context/*` (AuthContext, RoleContext, NotificationContext).
- `tests/frontend/*` (Unit, component, and integration tests for frontend).
- `docs/engineering/frontend/phase-08c/*` (Engineering documentation).

---

## 16. Implementation Risks

- **RISK-001 (P2):** Storage Orphan File Accumulation if user abandons intake form after presign upload.
- **RISK-002 (P2):** Concurrency collisions (OCC 409) under simultaneous triage.
- **RISK-003 (P2):** Notification API gap (`GAP-001`) requires robust frontend fallback/mock state.
- **RISK-004 (P3):** Mobile table overflow on narrow viewports (360px).

---

## 17. Unknowns

- Exact production institutional directory OAuth provider (OD-004 still tracks password vs SSO).
- Ratification date for non-binding provisional SLA hours (OD-006).

---

## 18. Blockers

- **NONE.** All architectural, domain, API, and UX specifications are 100% reconciled and ready for frontend engineering.

---

## 19. Baseline Verification Gate Evidence

```
============================================================
           BASELINE VERIFICATION GATE (PHASE 08-C)
============================================================
TYPECHECK          : PASS (tsc --noEmit: 0 errors)
LINT               : PASS (eslint: 0 warnings, 0 errors)
UNIT TESTS         : PASS (120/120 tests passing)
INTEGRATION TESTS  : PASS (103/103 tests passing)
TOTAL TEST SUITE   : PASS (223/223 tests passing across 23 test suites)
PRODUCTION BUILD   : PASS (next build: 18 routes compiled, 0 errors)
============================================================
```
