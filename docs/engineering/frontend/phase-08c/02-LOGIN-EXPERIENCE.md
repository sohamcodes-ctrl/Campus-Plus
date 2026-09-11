# Campus Plus — Phase 08-C: Login Experience Architecture & Specification

**Document Classification:** Frontend Engineering Specification  
**Route:** `/login`  
**Component:** `src/app/login/page.tsx`  
**Authority:** Senior UX Engineer, Application Security Engineer  
**Status:** 100% IMPLEMENTED & VERIFIED  

---

## 1. Architectural Architecture & Design System Alignment

The `/login` route serves as the primary authentication gate for all institutional actors in Campus Plus. It adheres strictly to the approved design tokens and enterprise shell guidelines:

- **Two-Column Institutional Layout:** 
  - **Left Editorial / Value Proposition Pane (Hidden on mobile < 1024px):** Displays institutional branding (`Campus Plus`), mission statement ("Fair, transparent, and auditable grievance redressal for higher education institutions"), institutional feature callouts, and institutional provenance badges.
  - **Right Authentication Pane:** Contains institutional header, primary authentication form, security boundary indicators, and the staging demonstration access helper.
- **Form Component Hierarchy:**
  - `TextInput` for Institutional Email (with `autoComplete="email"`, email format validation, and clear error states).
  - `TextInput` for Password (with `type="password"`, `autoComplete="current-password"`, and accessible label).
  - `Button` for Submission (`variant="primary"`, with full-width rendering and accessible loading spinner).
  - `AlertBanner` for authentication error feedback (maps server error codes deterministically without leaking system internals).

---

## 2. Authentication State Machine Integration

The login form interfaces directly with `AuthContext` via `useAuth().signIn(email, password)`:
1. `UNINITIALIZED` -> `CHECKING_SESSION` -> `UNAUTHENTICATED` (Form renders empty with inputs enabled).
2. User submits credentials -> Transitions to `AUTHENTICATING` (Button disabled, `isLoading={true}`).
3. Supabase Auth signs in -> JWT issued -> Background `/api/v1/auth/me` verifies actor claims.
4. Actor verified -> `AUTHENTICATED` state reached -> Next.js router automatically redirects user to target URL (`?redirect=...`) or default `/dashboard`.

---

## 3. Security Boundaries & Zero-Credential Policy

- **No Hardcoded Production Secrets:** Login inputs are initialized with empty strings (`""`).
- **No Client-Side Role Spoofing:** Selecting a staging persona populates email/password fields in the client state; authentication must still complete a real cryptographic round-trip via Supabase Auth and `/api/v1/auth/me`.
- **Open-Redirect Defense:** Safe redirection utility `sanitizeRedirectUrl` ensures redirect parameters cannot target third-party domains or protocol schemes.\n