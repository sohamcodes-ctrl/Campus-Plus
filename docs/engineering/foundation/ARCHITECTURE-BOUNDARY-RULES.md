# Architectural Boundary & Dependency Rules

## 1. Clean Architecture Dependency Inversion Principle

Campus Plus follows **Clean Architecture** (Hexagonal / Onion style) with strict unidirectional dependencies:

```
[ Presentation Layer (App Router / UI Components) ]
                      │
                      ▼
[ Application Layer (Use Cases / DTOs / Ports) ]
                      │
                      ▼
[ Domain Layer (Entities / Invariants / State Machines) ]
                      ▲
                      │
[ Infrastructure Layer (DB / Storage / Log / External) ]
```

---

## 2. Layer Permissibility Matrix

| Layer | Permitted Outgoing Imports | Strictly Forbidden Outgoing Imports |
| :--- | :--- | :--- |
| **`domain/`** | `shared/` | `application/`, `infrastructure/`, `presentation/`, `app/`, third-party database or web frameworks (`next`, `react`, `@supabase/*`). |
| **`application/`**| `domain/`, `shared/` | `infrastructure/`, `presentation/`, `app/`. Application layer must communicate with external systems exclusively via port interfaces (`src/application/ports/`). |
| **`infrastructure/`** | `application/ports/`, `domain/`, `shared/`, external libraries (`zod`, client SDKs) | Direct couplings to `presentation/` or `app/` routes. |
| **`presentation/`** | `application/`, `domain/`, `shared/`, UI libraries (`react`, `tailwindcss`) | Direct persistence queries or bypass of application use cases. |
| **`app/`** | `presentation/`, `application/`, `infrastructure/`, `config/`, `shared/` | Direct database manipulation inside React server components without going through application ports. |

---

## 3. Boundary Rules Verification

1. **Pure Domain Logic**:
   - The domain package (`src/domain/`) contains pure TypeScript code. It must never perform network calls, read environment variables, or import React components.
2. **Port Interfaces over Concrete Implementations**:
   - Application use-cases must depend solely on interfaces defined in `src/application/ports/` (e.g. `ComplaintRepositoryPort`, `AuditLogRepositoryPort`, `StoragePort`).
3. **Configuration Isolation**:
   - Environment variables must be accessed solely via `src/config/env.ts`. No file in `src/domain/` or `src/application/` may read `process.env` directly.
