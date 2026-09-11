# Phase 08-C: Frontend Architecture Specification

**Document Identifier:** `02-FRONTEND-ARCHITECTURE.md`  
**Classification:** Frontend Engineering Architecture  
**Phase:** 08-C (Frontend Engineering & Implementation)  
**Stage:** 08-C-B (Architecture Foundation, Tokens & API Client)  

---

## 1. Architectural Principles & Boundaries

The Campus Plus frontend follows a modular, layer-segregated architecture designed for high maintainability, strict security boundaries, and deterministic state:

```text
src/
├── app/                  # Next.js App Router (Layouts, Server Pages, Route Wrappers, globals.css)
└── presentation/         # Frontend Presentation Architecture
    ├── components/       # Reusable Design System Primitives & Domain Widgets
    ├── context/          # React State Providers (AuthContext, Role Context)
    ├── dtos/             # Typed Frontend Projection Interfaces
    ├── hooks/            # Ergonomic Client Hooks (useAuth, useToast)
    ├── schemas/          # Client-side Validation Schemas (Zod)
    ├── services/         # Centralized Typed API Client (apiClient.ts)
    └── utils/            # Envelope Parsers & Error Normalizers
```

### Key Architectural Decisions:
1. **Zero Client Trust:** Identity claims and roles are never trusted from client-supplied state. The client authenticates via Supabase Auth, passes Bearer JWT to the backend, and resolves its trusted role via `GET /api/v1/auth/me`.
2. **Centralized Service Boundary:** Components never call `fetch()` directly. All HTTP interactions flow through `ApiClient`, standardizing error envelopes, correlation IDs, and concurrency tokens.
3. **Reactive Role Styling:** The active institutional role theme is dynamically injected at the root DOM level (`:root`) by `AuthContext`, propagating role accents seamlessly without prop drilling.
