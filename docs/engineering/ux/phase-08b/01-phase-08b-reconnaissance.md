# Phase 08-B: Design Architecture Reconnaissance & Upstream Audit

**Document Identifier:** `01-phase-08b-reconnaissance.md`  
**Classification:** Implementation-Grade UI / Wireframe / High-Fidelity Product Design Specification  
**Phase:** 08-B  
**Mode:** DESIGN ARCHITECTURE + UI SPECIFICATION ONLY (Implementation Mode: OFF)  

---

## 1. Upstream Phase 08-A Forensic Inspection

A comprehensive forensic audit of all 29 upstream deliverables in `docs/engineering/ux/phase-08a/` was conducted to establish verified design inputs.

### 1.1 Verified Upstream Counts & Parity Check
| Artifact Dimension | Phase 08-A Reported | Independent Codebase Audit | Reconciliation Status | Source of Truth Notes |
| :--- | :---: | :---: | :---: | :--- |
| **Cataloged Screens / Surfaces** | 24 | 24 | **100% RECONCILED** | 20 screen views + 4 shared system components (`SHR-001` to `SHR-004`). |
| **Active Next.js Route Files** | 18 | 18 | **100% RECONCILED** | 18 `route.ts` files under `src/app/api/`. |
| **Distinct HTTP Route Operations** | 19 | 19 | **100% RECONCILED** | 18 route files yielding 19 operations (`complaints/route.ts` has GET + POST). |
| **Identified API Gaps** | 12 | 12 | **100% RECONCILED** | 6 Missing MVP, 3 Available via View/Composition, 3 Post-MVP. |
| **Open Decisions Tracked** | 13 | 13 | **100% RECONCILED** | `OD-001` to `OD-013` (11 resolved for MVP, 1 provisional SLA, 1 code variance). |
| **Cataloged UX / Operational Risks** | 8 | 8 | **100% RECONCILED** | `RISK-001` (P2 attachment orphan) to `RISK-008` (OCC queue collision). |
| **UX Debt Items** | 10 | 10 | **100% RECONCILED** | `UXDEBT-001` to `UXDEBT-010` (all marked "Deferred by Design"). |
| **Documented Contradictions** | 2 | 2 | **100% RECONCILED** | `ROLE_FACULTY` scoping; `OD-003` forwarding instant vs acceptance. |
| **Formal MUST Requirements** | 38 | 38 | **100% RECONCILED** | All 38 MUST requirements traced with zero untraced blockers. |

---

## 2. Technical Stack Baseline & Constraints

The UI specification must directly map to the production infrastructure verified in Phase 07-B:
- **Framework:** Next.js 16.3.4 (App Router), React 19.2.8, TypeScript 5.9.3.
- **Styling Architecture:** Tailwind CSS v4 in CSS-first configuration (`@import "tailwindcss";` in `src/app/globals.css`).
- **Authentication:** Supabase Auth via JWT Bearer token resolution (`AuthenticationAdapter.ts`). Zero client trust; server derives role from database.
- **Database Engine:** Supabase PostgreSQL 17.6 with Row-Level Security (`migrations/00008`) active on 6 tables.
- **Storage Infrastructure:** Supabase Private Storage (`campus-plus-attachments` bucket) utilizing signed upload/download URLs.
- **Test Baseline:** 223/223 tests passing across 23 test files; typecheck and ESLint clean.

---

## 3. The Implementation-Mode Prohibition (Guardrail Checklist)

Before beginning UI specifications, Phase 08-B explicitly reaffirms non-negotiable boundaries:
- [x] **Zero React Components Written / Modified** (0 `.tsx` / `.jsx` files)
- [x] **Zero CSS Code Written / Modified** (0 `.css` files)
- [x] **Zero Tailwind Config Modifications**
- [x] **Zero UI / Icon Package Installations** (`package.json` immutable)
- [x] **Zero API Route Changes** (`src/app/api/` immutable)
- [x] **Zero Database / Migration Changes** (`migrations/` immutable)
- [x] **Zero Supabase Changes**
- [x] **Zero Deployment Actions**

---

## 4. Phase 08-B Design Objectives
1. **Design System Specification:** Translate abstract tokens into concrete pixel/rem scales, hex codes, and component anatomies.
2. **Master Registries:** Author canonical registries for Screens (24), Components (35+), States (18), and Actions (12).
3. **Screen-by-Screen Wireframes:** Produce structured, responsive ASCII wireframes for all 24 screens.
4. **Role Surface Specifications:** Detail complete layout, data bindings, and interaction states for Student, Handler, HOD, Management, and Admin.
5. **Implementation Readiness:** Provide frontend engineers with precise CSS variable names, Tailwind v4 class compositions, Zod schema mappings, and Gherkin acceptance criteria.
