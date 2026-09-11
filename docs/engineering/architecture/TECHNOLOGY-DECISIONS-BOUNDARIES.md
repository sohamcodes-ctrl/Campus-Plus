# Campus Plus — Technology Decision Matrix, Dependency Boundaries & Anti-Pattern Audit

**Project**: Campus Plus — Campus Complaint and Grievance Resolution System  
**Phase**: Phase 02 — Architecture Definition & Technical Blueprint  
**Document**: TECHNOLOGY-DECISIONS-BOUNDARIES.md  
**Version**: 1.0  
**Status**: Formal Architectural Blueprint  
**Authors**: Principal Architect, Lead Software Architect  

---

## 1. Executive Summary

This document establishes the formal **Technology Decision Matrix**, **Package & Module Dependency Direction Rules**, **Feature Flag Strategy**, and an exhaustive **Architectural Anti-Pattern Audit** for Campus Plus. 

Every technology evaluated is selected based on explicit engineering requirements and operational host reality (Windows 11 host with Node.js 24, Git 2.54, Vercel CLI, and Docker absent on PATH). Unjustified complexity, premature microservices, ungrounded AI models, and premature caching infrastructure are explicitly rejected.

---

## 2. Technology Decision Matrix

| Architectural Dimension | Considered Alternatives | Evaluated Tradeoffs & Project Fit | Formal Selection | Architectural Justification & Governing ADR |
| :--- | :--- | :--- | :---: | :--- |
| **Full-Stack Runtime & Framework** | - Next.js (App Router / TypeScript)<br>- React + Vite + Express REST<br>- NestJS + Angular<br>- Python Django | - React + Vite + Express requires maintaining 2 separate repositories/servers.<br>- Django introduces Python runtime friction on Windows.<br>- Next.js (App Router / TypeScript) provides unified full-stack modular monolith, native server-actions, server-side RBAC, and zero-config deployment to Vercel. | **Next.js (App Router) + TypeScript** | Enables unified full-stack TypeScript domain modeling, sub-second SSR dashboard rendering, and seamless deployment ([ADR-001](file:///d:/Deparment%20Project/department%20project/docs/engineering/architecture/decisions/ADR-001-ARCHITECTURE-STYLE.md), [ADR-011](file:///d:/Deparment%20Project/department%20project/docs/engineering/architecture/decisions/ADR-011-DEPLOYMENT-HOSTING-STRATEGY.md)). |
| **Relational Database Engine** | - PostgreSQL 15+<br>- MySQL 8<br>- MongoDB<br>- SQLite | - MongoDB lacks ACID relational foreign keys and native RLS.<br>- MySQL has weaker RLS and complex triggers.<br>- PostgreSQL 15+ is the gold standard for relational integrity, JSON queries, and native kernel Row-Level Security. | **PostgreSQL 15+** | Native kernel Row-Level Security (`ADR-003`), relational integrity, and standard SQL portability ([ADR-012](file:///d:/Deparment%20Project/department%20project/docs/engineering/architecture/decisions/ADR-012-SUPABASE-EVALUATION-DECISION.md)). |
| **Database & Auth Platform** | - Supabase Managed Cloud<br>- Self-Hosted PostgreSQL on Local Docker<br>- Prisma with SQLite<br>- AWS RDS + Cognito | - Local Docker is NOT installed on host PATH (Phase 00 finding).<br>- SQLite lacks multi-user concurrent RLS.<br>- AWS RDS + Cognito introduces excessive operational overhead.<br>- Supabase provides managed Postgres, Auth, and Storage with zero Docker dependency on Windows host. | **Supabase (ADOPT WITH CONSTRAINTS)** | Solves the local Docker blocker while preserving 100% vanilla PostgreSQL DDL portability ([ADR-012](file:///d:/Deparment%20Project/department%20project/docs/engineering/architecture/decisions/ADR-012-SUPABASE-EVALUATION-DECISION.md)). |
| **Data Access & Schema Mapping** | - Drizzle ORM<br>- Prisma ORM<br>- Raw SQL (pg driver)<br>- TypeORM | - TypeORM is heavy and prone to N+1 leaks.<br>- Prisma generates large client binaries and complex query engine abstractions.<br>- Drizzle ORM provides lightweight, type-safe SQL queries, zero runtime overhead, and direct compatibility with PostgreSQL RLS. | **Drizzle ORM + PostgreSQL DDL** | Clean SQL query mapping with zero binary overhead; keeps domain models decoupled from proprietary SDKs. |
| **Schema Validation Library** | - Zod<br>- Yup<br>- Joi<br>- Valibot | - Yup and Joi lack native TypeScript type inference.<br>- Zod provides first-class TypeScript inference, composable schemas, and seamless integration across API request guards and domain boundaries. | **Zod** | Enforces input boundaries (character lengths, MIME types, enum constraints) before domain execution (`SEC-004`). |
| **CSS & Design System** | - Tailwind CSS + Radix UI (shadcn/ui)<br>- Material UI (MUI)<br>- Bootstrap 5<br>- Plain CSS Modules | - MUI is heavy and opinionated.<br>- Bootstrap lacks modern headless accessibility.<br>- Tailwind CSS + Radix primitives provides accessible, responsive, zero-runtime utility styling supporting viewports $\ge$ 360px (`NFR-008`). | **Tailwind CSS + Radix UI Primitives** | Fully responsive, WCAG 2.1 AA accessible, lightweight design system without heavy JavaScript bundles. |
| **Testing Framework Suite** | - Vitest + Playwright<br>- Jest + Cypress<br>- Mocha + Chai | - Jest is slow in modern ESM/TypeScript environments.<br>- Vitest provides instant ESM execution and shared Vite/TypeScript configuration.<br>- Playwright delivers reliable multi-role browser E2E scenario testing. | **Vitest (Unit/Integration) + Playwright (E2E)** | Fast, deterministic testing of domain FSM transitions, RLS policies, and role-based workflows. |
| **Caching Infrastructure** | - Redis (Upstash / Local)<br>- In-Memory Cache<br>- No External Cache (Database Indexes) | - Introducing Redis adds network latency, cache invalidation bugs, and extra operational infrastructure.<br>- Campus scale (~1,000 daily users) is handled effortlessly by PostgreSQL B-tree indexes (<50ms query latency). | **NO EXTERNAL CACHE (Rejected Complexity)** | Explicitly rejected. Standard PostgreSQL indexed queries satisfy `<800ms` target natively (`NFR-001`). |

---

## 3. Package & Module Dependency Direction Blueprint

To prevent architectural decay into a "Big Ball of Mud", the codebase enforces strict acyclic dependency rules. Dependencies may ONLY point inward toward the core domain:

```text
       ┌─────────────────────────────────────────────────────────────┐
       │                      Presentation Layer                     │
       │           (Web Pages, UI Components, Form Actions)          │
       └──────────────────────────────┬──────────────────────────────┘
                                      │ depends on
                                      ▼
       ┌─────────────────────────────────────────────────────────────┐
       │                  Application Services Layer                 │
       │              (Use Cases, Commands, Query Handlers)          │
       └──────────────────────────────┬──────────────────────────────┘
                                      │ depends on
                                      ▼
       ┌─────────────────────────────────────────────────────────────┐
       │                      Core Domain Layer                      │
       │      (Entities, FSM Engine, Domain Events, Business Rules)  │
       │               *** ZERO OUTWARD DEPENDENCIES ***             │
       └──────────────────────────────▲──────────────────────────────┘
                                      │ implemented by
       ┌──────────────────────────────┴──────────────────────────────┐
       │                Infrastructure / Adapters Layer              │
       │          (Drizzle Repositories, Supabase Storage, Auth)     │
       └─────────────────────────────────────────────────────────────┘
```

### Invariant Rules:
1. **Rule 1**: The `Core Domain Layer` MUST NOT import anything from `Presentation`, `Application`, or `Infrastructure`. It is written in pure TypeScript.
2. **Rule 2**: The `Presentation Layer` MUST NOT import database drivers, Drizzle schemas, or SQL client objects directly. All mutations must pass through `Application Services`.
3. **Rule 3**: Zero circular dependencies across domain modules.

---

## 4. Feature Flag Strategy

In accordance with Section 50 of the protocol, feature flags are evaluated to prevent scope contamination while providing clean runtime toggles:

| Feature Flag Identifier | Associated Capability | Evaluated Status | Justification |
| :--- | :--- | :---: | :--- |
| `FEATURE_IN_APP_NOTIFICATIONS` | In-app notification inbox | **REQUIRED (ACTIVE)** | Core MVP requirement (`FR-020`, `ADR-007`). |
| `FEATURE_EMAIL_NOTIFICATIONS` | Transactional email alerts | **OPTIONAL (INACTIVE DEFAULT)** | Post-MVP; enabled when campus SMTP credentials are provisioned (`OD-011`). |
| `FEATURE_ANONYMOUS_COMPLAINTS` | Whistleblower grievance mode | **NOT JUSTIFIED YET (DEFERRED)** | Requires specialized legal/statutory policy input (`OD-012`). |
| `FEATURE_AI_TRIAGE_ASSISTANCE` | NLP-assisted category suggestion | **NOT JUSTIFIED YET (DEFERRED)** | Explicitly out of scope for initial deployment (`PROP-003`). |
| `FEATURE_MULTILINGUAL_UI` | Marathi / Hindi language switch | **OPTIONAL (DEFERRED)** | Isolated UI string bundles ready for post-MVP activation (`PROP-005`). |

---

## 5. Architectural Anti-Pattern Audit

The proposed architecture was subjected to a rigorous audit against 18 classic software architecture anti-patterns:

| Anti-Pattern Checked | Audit Result | Architectural Proof & Defensive Mechanism |
| :--- | :---: | :--- |
| **1. God Module / God Controller** | **ABSENT** | Bounded contexts cleanly partition Intake, Triage, Forwarding, Escalation, and Audit into independent single-responsibility services. |
| **2. Fat Frontend** | **ABSENT** | Client UI is purely a presentation projection; all business rules, invariants, and transitions are validated server-side. |
| **3. Duplicated Authorization Logic**| **ABSENT** | Centralized server-side `@Authorize` guards combined with single-source PostgreSQL RLS policies. |
| **4. Database-as-Business-Logic** | **ABSENT** | State machine transitions and business validations execute in TypeScript domain entities, not in complex procedural stored procedures. |
| **5. Business Logic Hidden in UI** | **ABSENT** | Hiding UI buttons is treated strictly as UX convenience; server rejects unauthorized operations regardless of client state. |
| **6. Direct Public Storage Access** | **ABSENT** | Object storage buckets are 100% private; all access requires 15-minute time-limited presigned URLs. |
| **7. Unbounded Admin Privileges** | **ABSENT** | Administrators cannot delete complaints or tamper with action history records due to database `REVOKE` constraints. |
| **8. Event Spaghetti** | **ABSENT** | Domain events are strictly point-to-point asynchronous notifications; no recursive chained event storms. |
| **9. Premature Microservices** | **ABSENT** | Explicitly rejected in favor of a Modular Monolith ([ADR-001](file:///d:/Deparment%20Project/department%20project/docs/engineering/architecture/decisions/ADR-001-ARCHITECTURE-STYLE.md)). |
| **10. Premature Redis Caching** | **ABSENT** | Explicitly rejected; PostgreSQL composite B-tree indexes deliver sub-50ms query times without distributed cache invalidation bugs. |
| **11. Premature AI / Hallucination** | **ABSENT** | Explicitly rejected; recurring issue detection uses deterministic 30-day relational aggregation ([ADR-010](file:///d:/Deparment%20Project/department%20project/docs/engineering/architecture/decisions/ADR-010-RECURRING-ISSUE-DETECTION.md)). |
| **12. Hard-Coded Institutional Policy**| **ABSENT** | SLA hours, categories, departments, and verification windows reside in configurable database tables, not source code. |
| **13. Fake Scalability** | **ABSENT** | System sized realistically for campus scale (~1,000 daily users) without unneeded Kubernetes clusters. |
| **14. Missing Audit Boundaries** | **ABSENT** | Dedicated append-only `action_history` journal physically protected against UPDATE and DELETE. |
| **15. Weak Data Scope Boundaries** | **ABSENT** | Strict `Role + Action + Resource + Scope + Condition` matrix enforced at both API and database RLS layers. |
| **16. Security by UI Hiding** | **ABSENT** | Client controls never trusted; all security boundaries enforced on the server. |
| **17. "Big Ball of Mud" Monolith** | **ABSENT** | Hexagonal architecture with strict acyclic module boundaries enforced by compile-time rules. |
| **18. Vendor Lock-In Trap** | **ABSENT** | DDL and queries written in standard portable PostgreSQL; database can migrate to any vanilla campus server with zero code rewrite. |

---

## 6. Architecture Verification Summary

- [x] Full-Stack Next.js + TypeScript + PostgreSQL (Supabase) stack selected with explicit engineering rationale.
- [x] Redis and premature microservices explicitly challenged and rejected as unnecessary complexity.
- [x] Inward dependency direction rules guarantee that domain logic remains 100% pure and decoupled.
- [x] Feature flag boundaries isolate MVP capabilities from deferred enhancements.
- [x] All 18 architectural anti-patterns audited and proven absent from the design.
