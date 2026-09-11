# Campus Plus — Domain Model Architecture (Phase 05)

## 1. Architectural Philosophy & Isolation

Campus Plus adheres to a strict **Hexagonal / Clean Domain-Driven Architecture**. The Domain Core (`src/domain/`) represents the authoritative business brain of the institutional grievance system.

```
       +-------------------------------------------------------------+
       |                     Application Layer                       |
       |  (Use Cases, Commands, Port Contracts, Orchestration)      |
       |                                                             |
       |       +---------------------------------------------+       |
       |       |                 Domain Core                 |       |
       |       |  - Aggregate Root: Complaint                |       |
       |       |  - Entities: Assignment, Forward,           |       |
       |       |              Escalation, Resolution         |       |
       |       |  - Value Objects: Title, Description,       |       |
       |       |                   TrackingCode, etc.        |       |
       |       |  - Policies: Authorization, Reopen, Evidence|       |
       |       |  - Invariants: INV-001 through INV-013      |       |
       |       |  - Events: Typed Domain Event Catalog       |       |
       |       +---------------------------------------------+       |
       +-------------------------------------------------------------+
                                      ^
                                      | Implements Ports
       +-------------------------------------------------------------+
       |                    Infrastructure Layer                     |
       |  (PostgreSQL, Supabase RLS, Audit Logging, HTTP, Workers)   |
       +-------------------------------------------------------------+
```

### 1.1 Non-Negotiable Isolation Constraints
1. **Zero External Framework Dependencies**: The domain core contains no imports from `next`, React, UI libraries, or HTTP frameworks.
2. **Zero Database Driver Leakage**: No imports from `pg`, `@electric-sql/pglite`, `@supabase/supabase-js`, or Supabase SDKs.
3. **Purity of Logic**: Pure TypeScript with functional `Result<T, E>` pattern; all side-effects are inverted through port contracts in `src/application/ports/`.
4. **Automated Verification**: Boundary enforcement is verified continuously via `tests/unit/architecture-boundaries.test.ts` (39 automated boundary assertions).

---

## 2. Directory Structure & Organization

```
src/
├── domain/
│   ├── common/
│   │   ├── Result.ts                # Functional Result pattern (ok, err)
│   │   └── ValueObject.ts           # Immutable base class with deep equality
│   └── complaint/
│       ├── BusinessInvariants.ts    # Central validator for INV-001..INV-013
│       ├── Complaint.ts             # Central Aggregate Root
│       ├── ComplaintStatus.ts       # Canonical 13-state FSM & transition matrix
│       ├── ComplaintTypes.ts        # Reconciled taxonomy, priorities, tiers, SLA
│       ├── DomainErrors.ts          # Strongly typed AppError domain hierarchy
│       ├── DomainEvents.ts          # Typed domain event definitions & factory
│       ├── Entities.ts              # Child entities (Assignment, Forward, etc.)
│       ├── ValueObjects.ts          # Validated, immutable value objects
│       ├── index.ts                 # Clean barrel export
│       └── policies/
│           ├── AuthorizationPolicy.ts       # 4-dimensional domain authorization engine
│           ├── IReopenPolicy.ts             # Working calendar reopen window contract
│           └── IResolutionEvidencePolicy.ts # Category resolution proof contract
└── application/
    ├── common/
    │   └── UseCase.ts               # Base UseCase<TInput, TOutput> contract
    ├── ports/
    │   ├── IComplaintRepository.ts      # Persistence port with OCC support
    │   ├── IDepartmentMembershipPort.ts # Cross-department jurisdictional boundary
    │   ├── IIdempotencyPort.ts          # Request deduplication token port
    │   ├── ISLAPolicyPort.ts            # Calendar SLA computation port
    │   ├── ITrackingCodeGeneratorPort.ts# Unique tracking code generation port
    │   └── IWorkingCalendarPort.ts      # Campus working days computation port
    └── use-cases/
        ├── AssignComplaintUseCase.ts
        ├── CloseComplaintUseCase.ts
        ├── EscalateComplaintUseCase.ts
        ├── ForwardComplaintUseCase.ts
        ├── RejectComplaintUseCase.ts
        ├── ReopenComplaintUseCase.ts
        ├── ResolveComplaintUseCase.ts
        ├── ReviewComplaintUseCase.ts
        ├── StartProgressUseCase.ts
        ├── SubmitComplaintUseCase.ts
        └── index.ts
```

---

## 3. Core Aggregate & Child Entities

### 3.1 Complaint Aggregate Root
`Complaint` is the transactional boundary. External callers cannot directly mutate its internal state; all transitions, assignments, transfers, and resolutions must pass through explicit aggregate methods that enforce domain invariants.

### 3.2 Child Entities
- **`ComplaintAssignment`**: Tracks handler assignment tenure, assignment timestamp, assigner user ID, and active status (`isCurrent`). Reassignment automatically terminates the previous active tenure.
- **`ComplaintForward`**: Tracks cross-departmental transfer history with strictly increasing `forwardSequence`, origin department, target department, author user ID, and mandatory rationale.
- **`ComplaintEscalation`**: Records hierarchical escalation events (`TIER_1_HANDLER` -> `TIER_2_DEPARTMENT_HEAD` -> `TIER_3_MANAGEMENT`), tracking whether escalation was automated (SLA/Anti-deadlock) or manual with justification.
- **`Resolution`**: Captures resolution summary (>= 20 characters), resolver user ID, resolution timestamp, student verification flag (`studentVerified`), and dispute reason if reopened.

---

## 4. Value Objects Catalog

All value objects extend `ValueObject<T>` and enforce structural validation at instantiation time:

| Value Object | Type | Validation Rules | Primary Invariant / Requirement |
| :--- | :--- | :--- | :--- |
| `ComplaintId` | UUID v4 string | Standard UUID format (`/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i`) | Identity boundary |
| `TrackingCode` | String | Must match regex `^CP-\d{4}-\d{5}$` (e.g., `CP-2026-00001`) | FR-004 |
| `UserId` | UUID v4 string | Valid UUID format | Actor identification |
| `DepartmentId` | UUID v4 string | Valid UUID format | Single owning department |
| `CategoryId` | UUID v4 string | Valid UUID format | Taxonomy category |
| `LocationId` | UUID v4 string | Valid UUID format | Campus spatial location |
| `ComplaintTitle` | String | Length between 10 and 120 characters inclusive | FR-004 / BR-004 |
| `ComplaintDescription` | String | Minimum 30 characters | FR-004 / BR-004 |
| `Priority` | Enum String | One of: `LOW`, `MEDIUM`, `HIGH`, `URGENT` | Reconciled taxonomy |
| `ResolutionSummary` | String | Minimum 20 characters (trimmed) | BR-015 / DB check |
| `ForwardingRationale` | String | Minimum 10 characters (trimmed) | BR-010 / DB check |
| `ComplaintVersion` | Number | Non-negative integer, monotonically advancing | INV-009 / OCC |

---

## 5. Domain Invariants Summary

The domain core strictly operationalizes 13 canonical invariants (`INV-001` through `INV-013`):
1. `INV-001`: Single Primary Owning Department
2. `INV-002`: Department Routing & Anti-Self-Forwarding
3. `INV-003`: Terminal Closed State Immutability
4. `INV-004`: State Transition Legality
5. `INV-005`: Mandatory Resolution Summary Length (>= 20 chars)
6. `INV-006`: Category-Specific Resolution Proof Requirements
7. `INV-007`: Jurisdictional Assignment Scope
8. `INV-008`: Multi-Dimensional Domain Authorization
9. `INV-009`: Optimistic Concurrency Control (OCC)
10. `INV-010`: Sequential Forwarding History & Anti-Deadlock Rule (EDGE-004)
11. `INV-011`: Append-Only Audit Trail Integrity
12. `INV-012`: Internal Notes Secrecy Boundary
13. `INV-013`: Command Idempotency Protocol
