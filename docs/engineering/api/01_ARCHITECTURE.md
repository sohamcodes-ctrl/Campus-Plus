# Campus Plus API & Integration Layer Architecture

## 1. System Overview & Architectural Style

The Application / API and Integration Layer of **Campus Plus** provides the authoritative HTTP boundaries connecting authenticated external clients (students, faculty, department handlers, department heads, and system administrators) to the core domain model and transactional persistence.

```
       ┌─────────────────────────────────────────────────────────┐
       │                   Presentation Layer                    │
       │      Next.js App Router Route Handlers (/api/v1/...)     │
       │   [AuthenticationAdapter]  [Zod Schemas]  [DTO Projections]│
       └────────────────────────────┬────────────────────────────┘
                                    │ (Commands & Queries)
                                    ▼
       ┌─────────────────────────────────────────────────────────┐
       │                    Application Layer                    │
       │           Use Cases (Submit, Review, Assign, etc.)       │
       │           Ports (IComplaintRepository, IQueryRepo)       │
       └────────────────────────────┬────────────────────────────┘
                                    │ (Entity Operations)
                                    ▼
       ┌─────────────────────────────────────────────────────────┐
       │                      Domain Core                        │
       │     Complaint Aggregate, State Machine, Invariants      │
       │     Authorization Policy, Resolution Evidence Policy    │
       └────────────────────────────┬────────────────────────────┘
                                    │ (Adapter Implementations)
                                    ▼
       ┌─────────────────────────────────────────────────────────┐
       │                  Infrastructure Layer                   │
       │       PostgresComplaintRepository, PostgresIdempotency  │
       │       PostgresTrackingCodeGenerator, PGlite/PostgreSQL  │
       │       Atomic Action History Audit & Outbox Events       │
       └─────────────────────────────────────────────────────────┘
```

## 2. Inversion of Control & Composition Root

All application dependencies are assembled in a single composition root:
`src/infrastructure/container.ts`

- **Repositories**: `PostgresComplaintRepository` implements both `IComplaintRepository` (aggregate mutations) and `IComplaintQueryRepository` (read projections).
- **Domain Adapters**:
  - `PostgresTrackingCodeGenerator`: Concurrency-safe tracking code sequence generator (`CP-YYYY-XXXXX`).
  - `PostgresIdempotencyAdapter`: Persistent key acquisition and cached response replayer backed by `idempotency_keys`.
  - `PostgresDepartmentMembershipAdapter`: Authoritative jurisdictional checker querying `department_memberships`.
  - `PostgresSLAPolicyAdapter`: Category-and-priority SLA calculator.
  - `CalendarReopenPolicyAdapter`: 5-day calendar dispute eligibility policy.
  - `EvidenceResolutionPolicyAdapter`: Category-driven mandatory resolution proof policy.
- **Security**: `AuthenticationAdapter` strictly derives actor context from database lookups, rejecting client-supplied roles.

## 3. Strict Architectural Boundary Rules

1. **Zero Domain Contamination**: Domain classes (`Complaint`, `TrackingCode`, etc.) have zero dependencies on Next.js, HTTP, or PostgreSQL.
2. **Zero Route Handler Business Logic**: Route Handlers only parse requests, validate via Zod, authenticate, delegate to Use Cases, and project outputs into DTO envelopes.
3. **Zero SQL in Handlers**: All SQL statements reside exclusively within infrastructure adapters (`src/infrastructure/database/PostgresComplaintRepository.ts`).
4. **Zero Client-Supplied Scope**: Role and department parameters in requests cannot override the verified database actor context (`ActorContext`).
