# Campus Plus — Phase 08-C-D: Application Architecture & Shell Topology

**Authority:** Principal Frontend Architect, Frontend Platform Lead  
**Stage:** 08-C-D  
**Status:** COMPLETED & VERIFIED  

---

## 1. Application Shell Topology

The Campus Plus frontend follows a layered modular architecture with strict server/client boundaries:

```
[ Root Layout (Server) — src/app/layout.tsx ]
         │
         ▼
[ AuthProvider (Client) — src/presentation/context/AuthContext.tsx ]
         │
         ├── AuthState Machine (9 explicit states)
         ├── Token Provider Configuration
         └── Authoritative Actor Resolution (GET /api/v1/auth/me)
         │
         ▼
[ ProtectedRoute Boundary (Client) — src/presentation/components/auth/ProtectedRoute.tsx ]
         │
         ├── Unauthenticated ──► Redirect /login?redirect=...
         ├── Forbidden ────────► ForbiddenState (403 UX)
         ├── Error ────────────► ShellError
         └── Authenticated ────► AppShell
                                    │
                                    ├── TopBar (3px Brand Bar, Role Badge, Drawer)
                                    ├── Sidebar (Desktop Role-Filtered Navigation)
                                    ├── Breadcrumbs (Semantic Navigation Hierarchy)
                                    ├── Main Content Workspace (<main id="main-content">)
                                    └── MobileNav (Bottom Bar, 44px Tap Targets)
```

---

## 2. Server vs Client Component Boundary Matrix

| Component / Route | Classification | Rationale |
| :--- | :--- | :--- |
| `src/app/layout.tsx` | **SERVER COMPONENT** | Root HTML scaffolding, metadata export, static asset injection. |
| `src/app/login/page.tsx` | **CLIENT COMPONENT** | Interactive form inputs, credential submission, query param reading. |
| `src/app/dashboard/page.tsx` | **CLIENT COMPONENT** | Session verification, client data fetching, role-aware card rendering. |
| `src/app/complaints/new/page.tsx` | **CLIENT COMPONENT** | Role-restricted route wrapper, prepares for multi-step form interactivity. |
| `src/app/complaints/[id]/page.tsx` | **CLIENT COMPONENT** | Parameter parsing, BOLA-aware client API fetching, timeline rendering. |
| `AppShell.tsx` | **CLIENT COMPONENT** | Dynamic role theme styling, interactive drawers, user dropdown menu. |
| `TopBar.tsx`, `Sidebar.tsx` | **CLIENT COMPONENT** | Pathname tracking, active route highlighting, role badge display. |
