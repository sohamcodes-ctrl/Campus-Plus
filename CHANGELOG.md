# Changelog

All notable changes to the **Campus Plus** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.0] - Phase 03 Engineering Foundation - 2026-09-10

### Added
- **Repository Toolchain**: Configured Next.js 16.3.4 (App Router + Turbopack), React 19.2.8, TypeScript 5.9.3, and pnpm 11.22.0.
- **Testing Foundation**: Vitest 5.0.0 test harness with path alias support (`@/*`) and 30 passing unit tests.
- **Domain Modeling**:
  - `Result` functional monad (`ok`, `err`) for exception-free domain error handling.
  - Domain `Entity` base class and `DomainEvent` contract interface.
  - `ComplaintStatus` finite state machine and transition validation matrix (`canTransition`, `ALLOWED_STATUS_TRANSITIONS`).
  - Complaint taxonomy (`ComplaintCategory`, `ComplaintPriority`, `ComplaintSeverity`, `ResolutionSLAHours`).
- **Application Layer Contracts**:
  - `UseCase` interface for application orchestrators.
  - Port interfaces: `ComplaintRepositoryPort`, `AuditLogRepositoryPort`, `StoragePort`, and `NotificationPort`.
- **Infrastructure Stubs**:
  - `DatabaseClient` placeholder ensuring zero external connections during Phase 03.
  - `InMemoryStorageAdapter` implementing `StoragePort` for local execution.
  - Structured `Logger` supporting JSON streaming, correlation IDs, and PII sanitization.
- **Cross-Cutting Utilities**:
  - Standardized error taxonomy (`AppError`, `ValidationError`, `NotFoundError`, `ConflictError`, `InvalidStateTransitionError`, `InternalServerError`).
  - Correlation ID and complaint reference generators.
  - PII masking utilities (`maskEmail`, `maskPhone`, `sanitizeLogData`).
- **Configuration & Environment**:
  - Zod-based environment variable schema with strict server/client boundary enforcement in `src/config/env.ts`.
  - Comprehensive `.env.example` template with zero committed secrets.
  - Repository normalization: `.gitignore`, `.gitattributes`, `.editorconfig`, `.npmrc`.
- **Observability**:
  - `/api/health` endpoint supporting liveness and readiness probes with runtime memory statistics.
- **Quality Pipeline**:
  - Integrated verification script (`pnpm verify`) running typecheck, lint, test, and build.

---

## [0.0.3] - Phase 02 Architecture Definition - 2026-09-10

### Added
- Comprehensive architecture blueprint (`docs/engineering/architecture/ARCHITECTURE-BLUEPRINT.md`).
- 12 Architecture Decision Records (`ADR-001` through `ADR-012`).
- 16 architectural specifications covering state machine, data model, security, audit logging, and scaling.

---

## [0.0.2] - Phase 01 Requirements Engineering - 2026-09-10

### Added
- Formalized requirements baseline (`docs/engineering/requirements/PHASE-01-REQUIREMENTS-BASELINE.md`) with 38 MUST requirements.
- Stakeholder model, complaint lifecycle specification, business rules catalog, traceability matrix, and open decisions log.

---

## [0.0.1] - Phase 00 Forensic Reconnaissance - 2026-09-10

### Added
- Workspace inspection and forensic audit report (`docs/engineering/reconnaissance/PHASE-00-RECONNAISSANCE.md`).
