# Phase 08-B: Design Decision Records (UXDR-08B-001 to UXDR-08B-015)

**Document Identifier:** `28-phase-08b-design-decision-records.md`  
**Classification:** Implementation-Grade UI / Wireframe / High-Fidelity Product Design Specification  
**Standard:** Canonical architectural records for all user experience, design system, and frontend decisions.

---

## Master UX Decision Register

| UXDR ID | Decision Title | Scope | Context & Rationale | Status |
| :--- | :--- | :--- | :--- | :--- |
| **UXDR-08B-001** | Tailwind v4 `@theme` Variable Mapping | Styling | Map all institutional colors and status tokens directly into `src/app/globals.css` using CSS-first `@theme` block. | **RATIFIED** |
| **UXDR-08B-002** | System Font Hierarchy | Typography | Use system sans font stack (Inter fallback) for body and JetBrains Mono for tracking codes (`CP-YYYY-XXXXX`). | **RATIFIED** |
| **UXDR-08B-003** | 3px Top Border Role Accent Bar | Branding | Render a fixed `h-[3px]` role-colored bar across the top of all authenticated pages for instant role recognition. | **RATIFIED** |
| **UXDR-08B-004** | 18-State Component Architecture | States | Codify 18 interactive and lifecycle states (idle to conflict/offline) across all design system components. | **RATIFIED** |
| **UXDR-08B-005** | 44px Mobile Touch Target Standard | Mobile UX | Enforce minimum `44px x 44px` hitbox for all clickable elements on viewports `< 768px` per WCAG 2.5.5. | **RATIFIED** |
| **UXDR-08B-006** | Strict Internal Notes Segregation | Privacy | Internal staff notes (`is_internal = true`) are strictly stripped by backend RLS and hidden from DOM (`INV-012`). | **RATIFIED** |
| **UXDR-08B-007** | Zero Trust Client Authorization | Security | Client-side UI checks (hiding buttons) are purely ergonomic; server-side policies strictly govern operations. | **RATIFIED** |
| **UXDR-08B-008** | Presigned Attachment Upload Protocol | Storage | Files upload directly to Supabase storage via presigned URLs with 5MB limit and JPEG/PNG/PDF validation. | **RATIFIED** |
| **UXDR-08B-009** | Client-Generated Idempotency Header | Network | Form submissions generate a UUID (`crypto.randomUUID()`) passed in `Idempotency-Key` header. | **RATIFIED** |
| **UXDR-08B-010** | Concurrency Conflict Modal (OCC 409) | Concurrency | On HTTP 409, display non-blocking modal allowing user to review latest data or copy unsaved input. | **RATIFIED** |
| **UXDR-08B-011** | Non-Blocking Offline Warning Bar | Resilience | Display top banner when network is lost; lock submission buttons to prevent failed requests. | **RATIFIED** |
| **UXDR-08B-012** | Slide-Over Notification Drawer | Navigation | Notifications render in a slide-over panel with fallback mock state for missing endpoint `GAP-001`. | **RATIFIED** |
| **UXDR-08B-013** | Department-Constrained Staff Select | Business Rule | HOD handler assignment dropdown is strictly filtered to handlers belonging to the same department (`INV-007`). | **RATIFIED** |
| **UXDR-08B-014** | Responsive Table-to-Card Stack | Layout | Data tables automatically transform into stacked cards on mobile viewports `< 768px`. | **RATIFIED** |
| **UXDR-08B-015** | Anti-Deadlock Warning UI | Routing | Forwarding modal displays prominent alert when `forward_count >= 2`, warning of Tier-3 escalation (`INV-010`). | **RATIFIED** |
