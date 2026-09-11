# Contributing to Campus Plus

Thank you for contributing to **Campus Plus — Campus Complaint & Grievance Resolution System**.

Campus Plus enforces strict production-oriented software engineering standards. All contributors must follow the guidelines detailed below.

---

## 1. Code Architecture & Layer Boundaries

Campus Plus uses a **Domain-Centric Clean Architecture**. Strictly adhere to dependency inversion:

1. **Domain Layer (`src/domain/`)**:
   - Zero external dependencies.
   - Contains business entities, domain events, value objects, and pure state machine logic.
   - Must NEVER import from `@/application`, `@/infrastructure`, `@/presentation`, or `@/app`.

2. **Application Layer (`src/application/`)**:
   - Contains use-case orchestrators and port interfaces (repositories, notification gateways).
   - Only imports from `@/domain` and `@/shared`.
   - Must NEVER import from `@/infrastructure`, `@/presentation`, or `@/app`.

3. **Infrastructure Layer (`src/infrastructure/`)**:
   - Implements ports defined in `@/application/ports/`.
   - Houses database adapters, external clients, storage connectors, and logging engines.

4. **Presentation Layer (`src/presentation/` & `src/app/`)**:
   - Contains UI components, layouts, and Next.js App Router route handlers.
   - Interacts with application use-cases via Dependency Injection.

5. **Shared Layer (`src/shared/`)**:
   - Cross-cutting errors, generic types, and utilities.
   - Free of domain business logic.

---

## 2. Branching & Commit Conventions

- Work must be performed on feature or fix branches branched from `master`:
  - `feat/<feature-name>` (e.g. `feat/complaint-submission`)
  - `fix/<issue-name>` (e.g. `fix/sla-calculation`)
  - `docs/<doc-name>` (e.g. `docs/api-spec`)
  - `refactor/<scope>` (e.g. `refactor/logger-pipeline`)

- Follow [Conventional Commits](https://www.conventionalcommits.org/):
  - `feat(domain): add reopened complaint state transition`
  - `fix(logger): mask auth tokens in nested request payload`
  - `test(fsm): verify terminal state invariants for closed status`
  - `docs(foundation): document environment variable validation`

---

## 3. Pull Request Quality Checklist

Before submitting a PR for review, you MUST run and pass the full quality verification suite:

```bash
pnpm verify
```

Every PR must satisfy:
1. **Zero TypeScript Errors**: `pnpm typecheck` exits with code 0.
2. **Zero ESLint Errors or Warnings**: `pnpm lint` exits with code 0.
3. **100% Test Pass Rate**: `pnpm test` executes cleanly without skipped or broken tests.
4. **Successful Production Build**: `pnpm build` creates an optimized build without warnings.
5. **No Committed Secrets**: No live API keys, tokens, or environment secrets in diffs.
6. **PII Protection**: Any logged output must use `@/shared/utils/pii` sanitization.

---

## 4. Testing Standards

- All new domain invariants and business rules must be covered with Vitest unit tests in `tests/unit/`.
- Edge cases (null values, illegal transitions, unauthorized access, missing inputs) must be explicitly asserted.
- Tests must execute deterministically without relying on external network resources or live databases.
