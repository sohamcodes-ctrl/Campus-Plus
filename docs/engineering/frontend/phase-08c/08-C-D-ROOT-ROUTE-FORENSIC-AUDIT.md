# Phase 08-C-D: Root Route Forensic Audit & Causality Analysis

**Audit Authority:** Principal Frontend Architect, Senior Next.js App Router Engineer, Application Security Engineer  
**Stage:** 08-C-D Defect Investigation  
**Date:** 2026-09-11  
**Target URL:** `/` (`src/app/page.tsx`)  
**Defect Classification:** DEF-08CD-06 (Obsolete Foundation Scaffold Exposed to End Users)  

---

## 1. Executive Summary & Root Cause Determination

### Forensic Finding:
When navigating to the root URL `http://localhost:3000/`, the browser displayed:
```
Campus Plus
Campus Complaint & Grievance Resolution System — Engineering Foundation
Phase 03 — Engineering Foundation & Project Initialization
Architecture: Modular Monolith | Framework: Next.js (App Router) | Language: TypeScript 5.x | Package Manager: pnpm
Inspect /api/health ->
Phase 03 Foundation Active
```

### Exact Root Cause:
1. **Historical Origin:** The file `src/app/page.tsx` was created in commit `9c9e0572` during Phase 03 as a temporary bootstrap landing page to confirm Next.js App Router compilation, Tailwind CSS styling, and `/api/health` connectivity.
2. **Phase 08-C-D Gap:** When Stage 08-C-D implemented the application shell, authentication state machine, and child routes (`/login`, `/dashboard`, `/complaints/new`, `/complaints/[id]`), the implementation team created `08-C-D-ROUTING-MATRIX.md` with an entry documenting `/` as `"Public / Landing | None | Public | Static page"`.
3. **Scaffolding Left in Place:** The developers failed to replace `src/app/page.tsx` with an authentication-state-aware entry controller. Because Next.js App Router serves `src/app/page.tsx` for the `/` route by default, the obsolete Phase-03 engineering scaffold remained publicly exposed.
4. **Source of Truth Contradiction:** Review of the approved UX Architecture (`docs/engineering/ux/phase-08a/18-frontend-routing-ux.md`) confirms that Campus Plus **has no public marketing or engineering homepage**. The approved entry flow specifies:
   - Unauthenticated visitor -> `/login`
   - Authenticated user -> `/dashboard` (role-scoped)

---

## 2. Forensic Codebase Inspection

| Target Inspected | Status | Finding |
|---|---|---|
| `src/app/page.tsx` | Obsolete | Contained hardcoded strings: "Engineering Foundation", "Phase 03", "Modular Monolith". |
| `src/app/layout.tsx` | Verified | Already mounts `<AuthProvider>` wrapping `{children}`, making `useAuth()` available at the root. |
| `src/app/login/page.tsx` | Verified | Institutional login screen with open redirect sanitization. |
| `src/app/dashboard/page.tsx` | Verified | Role-scoped complaint worklist wrapped in `<ProtectedRoute>`. |
| `src/presentation/context/AuthContext.tsx` | Verified | 9-state authentication finite state machine. |
| `middleware.ts` | Absent | Routing is managed cleanly via App Router client controllers without edge middleware. |
| Other "Phase 03" references in `src/` | Verified | Only a historical code comment in `src/infrastructure/database/DatabaseClient.ts` (unmodified). |

---

## 3. Security Implications of the Defect

1. **Information Leakage (CWE-200):** While the Phase-03 scaffold did not expose confidential student or complaint data, it exposed internal architectural details ("Modular Monolith", "Phase 03 Project Initialization", internal health check links) to normal students and unauthorized visitors.
2. **Zero Trust UI Principle Violation:** The application entry point failed to participate in the authoritative 9-state authentication machine, creating a disconnect between the shell foundation and the root entry point.
3. **Absence of Authorization Bypass:** The defect did **not** allow unauthorized access to complaint records, as all backend routes (`/api/v1/complaints/*`) independently enforce RLS and `AuthorizationPolicy.ts`.

---

## 4. Required Resolution Strategy

1. Replace `src/app/page.tsx` with a state-aware client entry component (`RootPage`).
2. Integrate with `useAuth()` to evaluate the 9-state machine:
   - `AUTHENTICATED` -> `router.replace("/dashboard")`
   - `UNAUTHENTICATED` -> `router.replace("/login")`
   - `INITIALIZING` / `AUTHENTICATING` / `PENDING` -> `<ShellLoading />`
   - `FORBIDDEN` -> `<ForbiddenState />` inside `<AppShell>`
   - `ERROR` -> `<ShellError />` with retry
3. Ensure zero content flash and complete removal of all Phase-03 engineering strings.
