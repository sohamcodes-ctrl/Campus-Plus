# Phase 08-C-E: Architecture, Security & Role Model Forensic Reconciliation
**Project:** Campus Plus — Campus Complaint & Grievance Resolution System  
**Phase:** 08-C-E — Student Experience + Product Experience Reconstruction  
**Document Type:** Architectural & Security Reconciliation Record  
**Status:** RATIFIED & COMPLETED  

---

## 1. Executive Summary

During the initialization of Phase 08-C-E, an independent forensic audit of the repository identified two critical security/integrity issues and one architectural domain discrepancy:
1. **Critical Security Defect DEF-08CE-01 (Client-Side Credentials in Source & Bundles):** The component `StagingAccountHelper.tsx` and `src/app/login/page.tsx` contained hardcoded plaintext demonstration passwords (`password: "[REDACTED_STAGING_PASSWORD]"`), which were bundled into client-side JavaScript assets.
2. **Critical Integrity Defect DEF-08CE-02 (Fabricated Metrics in Management Dashboard):** `ManagementDashboard.tsx` hardcoded a `"100%"` SLA compliance metric, violating the core system principle that UI must strictly reflect authoritative data or honestly communicate service pending status.
3. **Role Model Discrepancy (6 Domain Roles vs. 5 Product Experiences):** Domain layer defines `ROLE_STUDENT`, `ROLE_FACULTY`, `ROLE_HANDLER`, `ROLE_DEPT_HEAD`, `ROLE_MANAGEMENT`, and `ROLE_ADMIN`, whereas product requirements specify 5 user experiences.

All items have been forensically investigated, reconciled, and remediated with zero regressions.

---

## 2. Forensic Resolution of ROLE_FACULTY

### 2.1 Codebase Evidence
- `src/domain/complaint/policies/AuthorizationPolicy.ts` (L57): `ROLE_STUDENT` and `ROLE_FACULTY` are grouped under `isComplainant(role)` and share identical policy permissions (only view own, submit, verify, dispute, cancel).
- `src/application/use-cases/ListComplaintsUseCase.ts` (L41): If actor role is `ROLE_STUDENT` or `ROLE_FACULTY`, queries are strictly filtered by `complainantId = actor.userId`.
- `src/application/use-cases/GetTimelineUseCase.ts` (L61): `ROLE_FACULTY` is treated identically to `ROLE_STUDENT`, hiding internal notes and staff-only metadata.
- `seeds/002_synthetic_dev_seed.sql`: Contains seeded users for both student and faculty personas with complainant privileges.

### 2.2 Reconciled Architectural Decision
`ROLE_FACULTY` is conclusively classified as a **Secondary Complainant Persona**. It is an institutional role alias sharing the Complainant product experience. It does not require a separate 6th navigation structure or handler powers. The UI appropriately displays `"Faculty Complainant"` or `"Complainant"` badge and provides the full complainant lifecycle workflow.

---

## 3. Security Remediation: Elimination of Client-Side Credentials

### 3.1 Defect Scope
- File `src/presentation/components/auth/StagingAccountHelper.tsx` defined client-clickable buttons that automatically populated user credentials with hardcoded plaintext passwords.
- Bundle analysis indicated this exposed credentials to all clients loading the `/login` route.

### 3.2 Corrective Action Taken
1. Completely deleted `src/presentation/components/auth/StagingAccountHelper.tsx`.
2. Removed all references and handler callbacks from `src/app/login/page.tsx`.
3. Updated `scripts/provision-staging-accounts.js` to strictly require `STAGING_USER_PASSWORD` from environment variables, eliminating hardcoded fallback strings.
4. Cleaned documentation files (`03-STAGING-ACCESS-STRATEGY.md`, `walkthrough.md`) to remove exposed secrets.
5. Automated grep scan verified **zero occurrences of the previous staging password** in any `src/` or `scripts/` file.

---

## 4. Integrity Remediation: Management Dashboard Metrics

### 4.1 Defect Scope
- In `ManagementDashboard.tsx`, an SLA compliance metric was rendered as `<p className="text-2xl font-extrabold text-slate-700">100%</p>`.

### 4.2 Corrective Action Taken
- Replaced the hardcoded percentage with an honest data-backed state:
  - Text: `"Audit metrics unavailable"`
  - Subtext: `"Backend telemetry pending"`
- Updated test suite (`role-dashboards.test.ts`) to ensure `100%` is absent and honest state is verified.
