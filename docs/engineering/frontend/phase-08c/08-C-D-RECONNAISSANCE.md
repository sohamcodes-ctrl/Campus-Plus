# Campus Plus — Phase 08-C-D: Forensic Reconnaissance & Repository Baseline

**Stage:** 08-C-D (Application Shell, Routing, Authentication & Navigation)  
**Authority:** Principal Frontend Architect, Application Security Engineer  
**Status:** COMPLETED & VERIFIED  

---

## 1. Executive Summary

Prior to modifying or creating any shell code, a complete forensic inspection of the Campus Plus repository was conducted at commit baseline `9c9e0572...`.

The baseline state established:
1. **Repository & Dependencies:** Node.js 24, pnpm 11.22.0, Next.js 16.3.4 (App Router, Turbopack), React 19.2.8, TypeScript 5.9.3, Tailwind CSS v4. Zero component or UI libraries installed (strict 0-dependency constraint).
2. **Backend Contracts & Database:** 10 migrations applied cleanly, Supabase PostgreSQL v17.6 engine, 18 API route files supporting 19 verified route operations. All backend code (`src/domain/`, `src/application/`, `src/infrastructure/`) is verified and locked under the **Strict Backend Immutability Rule**.
3. **Stage 08-C-C Component Baseline:** 18 enterprise components, 1 utility (`cn.ts`), 53 passing frontend tests.
4. **Current Route Footprint:**
   - Previous state: only `/` and `/_not-found`.
   - Required routes: `/login`, `/dashboard`, `/complaints/new`, `/complaints/[id]`, `/not-found`, `/error`.
5. **Security Reality:** Authentication must remain strictly server-authoritative. Client state (`localStorage`, query parameters, React state) is untrusted. Authorization is established solely via Bearer JWT and verified server actor context from `GET /api/v1/auth/me`.

---

## 2. Reconnaissance Inventory

| Dimension | Ground Truth Findings | Authority Reference |
| :--- | :--- | :--- |
| **Framework** | Next.js 16.3.4 App Router (`src/app/`) | `package.json`, `next.config.ts` |
| **Styling** | Tailwind CSS v4 CSS-first mode (`@theme` in `globals.css`) | `src/app/globals.css` |
| **Design Tokens** | 5 institutional role palettes, 13 FSM status tokens, AA contrast tokens | `src/app/globals.css`, `08-C-B` |
| **Component Primitives** | 18 production components (`Button`, `Modal`, `Drawer`, `StatusPill`, etc.) | `src/presentation/components/` |
| **API Client** | 19 typed operations, Bearer JWT injection, correlation ID, OCC error handling | `src/presentation/services/apiClient.ts` |
| **Auth Adapter** | Supabase Auth browser client + server actor resolution (`GET /api/v1/auth/me`) | `src/presentation/context/AuthContext.tsx` |
| **Test Infrastructure** | Vitest 5.0.0, Node environment, 287 baseline passing tests | `vitest.config.mts`, `tests/` |
