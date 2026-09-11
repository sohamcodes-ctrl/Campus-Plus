# Repository Structure Specification

## 1. Directory Tree Layout

The Campus Plus codebase is structured to preserve Clean Architecture and Domain-Driven Design boundaries:

```
campus-plus/
├── .editorconfig                       # Cross-editor formatting consistency
├── .gitattributes                      # Git line-ending normalization (LF)
├── .gitignore                          # Strict secret exclusion (.env*) & build artifacts
├── .npmrc                              # pnpm non-interactive configuration
├── .env.example                        # Template environment variables (safe dummy values)
├── CHANGELOG.md                        # SemVer release and milestone log
├── CONTRIBUTING.md                     # Contribution guidelines and architecture rules
├── eslint.config.mjs                   # ESLint 9 configuration with Next.js rules
├── next.config.ts                      # Next.js framework configuration
├── package.json                        # Manifest, dependencies, and quality scripts
├── pnpm-lock.yaml                      # Deterministic dependency tree lockfile
├── README.md                           # Project documentation and developer quickstart
├── SECURITY.md                         # Security policy, vulnerability disclosures, PII rules
├── tsconfig.json                       # TypeScript compiler options and @/* path mappings
├── vitest.config.mts                   # Vitest 5 configuration
│
├── docs/                               # Engineering documentation suite
│   └── engineering/
│       ├── reconnaissance/             # Phase 00 Reconnaissance
│       ├── requirements/               # Phase 01 Requirements Baseline
│       ├── architecture/               # Phase 02 Architecture Blueprint & ADRs
│       ├── foundation/                 # Phase 03 Foundation Specifications
│       └── reports/                    # Phase Reports & Closure Gates
│
├── src/                                # Application Source Code
│   ├── app/                            # Next.js App Router (Pages, Layouts, API Routes)
│   │   ├── api/
│   │   │   └── health/
│   │   │       └── route.ts            # Liveness and readiness health check endpoint
│   │   ├── globals.css                 # Global CSS and Tailwind directives
│   │   ├── layout.tsx                  # Root HTML document layout & metadata
│   │   └── page.tsx                    # System foundation landing page
│   │
│   ├── config/                         # Configuration Management Layer
│   │   └── env.ts                      # Zod-validated environment schema & client boundary guard
│   │
│   ├── domain/                         # Domain Layer (Enterprise Business Rules)
│   │   ├── common/
│   │   │   ├── DomainEvent.ts          # Domain event contract interface
│   │   │   ├── Entity.ts               # Abstract entity base class
│   │   │   └── Result.ts               # Discriminated union Result monad (ok / err)
│   │   └── complaint/
│   │       ├── ComplaintStatus.ts      # Canonical FSM states and transition matrix
│   │       ├── ComplaintTypes.ts       # Categories, priorities, severities, and SLAs
│   │       └── index.ts                # Domain public exports
│   │
│   ├── application/                    # Application Layer (Use Cases & Contracts)
│   │   ├── common/
│   │   │   └── UseCase.ts              # Generic use-case execution interface
│   │   └── ports/
│   │       ├── AuditLogRepository.port.ts # Immutable audit log port interface
│   │       ├── ComplaintRepository.port.ts# Complaint aggregate repository interface
│   │       └── ExternalPorts.ts        # Storage and Notification port interfaces
│   │
│   ├── infrastructure/                 # Infrastructure Layer (Adapters & External Clients)
│   │   ├── database/
│   │   │   └── DatabaseClient.ts       # Database client singleton placeholder
│   │   ├── logging/
│   │   │   └── Logger.ts               # Structured logger with correlation ID & PII filter
│   │   └── storage/
│   │       └── StorageAdapter.ts       # In-memory storage adapter for tests
│   │
│   ├── presentation/                   # Presentation Layer (UI Primitives)
│   │   └── components/
│   │       └── Card.tsx                # Base card container primitive
│   │
│   └── shared/                         # Cross-Cutting Shared Layer
│       ├── errors/
│       │   ├── AppError.ts             # Domain & application error hierarchy
│       │   ├── ErrorCodes.ts           # Standardized machine-readable error codes
│       │   └── index.ts                # Error exports
│       ├── types/
│       │   └── common.ts               # Common types (Pagination, Sorting, Nullable)
│       └── utils/
│           ├── id.ts                   # UUID correlation and reference number generators
│           └── pii.ts                  # PII masking (email, phone) and deep log sanitizer
│
└── tests/                              # Automated Test Suite
    └── unit/
        ├── domain-fsm.test.ts          # State machine and transition matrix tests
        ├── env.test.ts                 # Environment variable validation tests
        ├── errors.test.ts              # Error taxonomy and serialization tests
        ├── pii-and-logger.test.ts      # PII masking and logger context tests
        └── smoke.test.ts               # Runtime and Result monad smoke tests
```
