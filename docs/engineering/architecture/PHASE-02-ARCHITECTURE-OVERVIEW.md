# Campus Plus — Phase 02 Architecture Overview & System Blueprint

**Project**: Campus Plus — Campus Complaint and Grievance Resolution System  
**Phase**: Phase 02 — Architecture Definition & Technical Blueprint  
**Document**: PHASE-02-ARCHITECTURE-OVERVIEW.md  
**Version**: 1.0  
**Status**: Formal Architectural Blueprint  
**Authors**: Lead Software Architect, Enterprise Systems Architect  

---

## 1. Architectural Mission & Philosophy

Campus Plus is not a prototype or demonstration utility; it is designed as a **production-grade institutional grievance management platform**. 

The core engineering objective is to replace fragmented, informal, unaccountable complaint handling with a deterministic, auditable, and transparent digital workflow:
$$\text{Submission} \longrightarrow \text{Categorization} \longrightarrow \text{Priority} \longrightarrow \text{Assignment} \longrightarrow \text{Tracking} \longrightarrow \text{Forwarding / Escalation} \longrightarrow \text{Resolution} \longrightarrow \text{Verification} \longrightarrow \text{Action History} \longrightarrow \text{Institutional Insight}$$

### Guiding Principles:
1. **Evidence Over Assumption**: Architectural decisions must trace to verified requirements or explicit constraints, never speculative hype.
2. **Deterministic State Evolution**: Complaint lifecycles are governed by finite state machines with verifiable pre-conditions, post-conditions, and invariant guards.
3. **Defense-in-Depth Security**: Access control is enforced at both the API application boundary (RBAC) and the data storage layer (PostgreSQL Row-Level Security).
4. **Physical Audit Immutability**: Historical records are strictly append-only, protected against updates or deletions even by administrators.
5. **Operational Pragmatism**: Zero premature complexity—no microservices, no premature caching/Redis, no ungrounded AI—while maintaining clean extension interfaces for future capabilities.

---

## 2. Architectural Drivers & Quality Attributes

The system architecture is shaped and prioritized by 15 foundational engineering drivers:

| Driver # | Architectural Driver | Source Requirement | Quality Attribute | Architectural Consequence & Mechanism | Verification Method |
| :- | :--- | :--- | :--- | :--- | :--- |
| **D-01** | **Complaint Integrity** | `FR-001`, `FR-005`, `BR-002`, `BR-003` | Data Integrity | Immutable unique tracking ID (`CP-YYYY-XXXXX`); strict relational schema constraints; NOT NULL foreign keys. | Schema invariant unit tests. |
| **D-02** | **Accountability** | `FR-008`, `BR-008`, `BR-011` | Non-Repudiation | Exactly one primary assigned handler at any active state; assignor, assignee, timestamp, and notes permanently logged. | Assignment workflow integration tests. |
| **D-03** | **Authorization Correctness** | `SEC-002`, `NFR-005`, `ADR-003` | Security | Defense-in-depth: Server-side RBAC guards intercept requests; PostgreSQL RLS policies enforce row isolation at database engine level. | Automated security regression test suite. |
| **D-04** | **Complainant Privacy** | `PRIV-001`, `PRIV-002`, `NFR-006` | Confidentiality | Student PII masked from public view; internal staff remarks strictly segregated from complainant-facing timeline. | API projection & RLS privacy tests. |
| **D-05** | **Audit Immutability** | `FR-019`, `BR-019`, `SEC-006`, `NFR-003` | Auditability | Dedicated `action_history` journal; SQL database permissions explicitly `REVOKE UPDATE, DELETE, TRUNCATE`. | Database constraint & tamper penetration tests. |
| **D-06** | **Lifecycle Determinism** | `FR-007` to `FR-018`, `ADR-005` | Correctness | Formal transition table finite state machine; invalid transitions rejected with domain exceptions; terminal state `CLOSED` immutable. | State machine transition matrix unit tests. |
| **D-07** | **Escalation Correctness** | `FR-013`, `FR-014`, `BR-012`, `ADR-006` | Reliability | Tiered escalation (Tiers 1 to 3); dual manual and automated SLA triggers; preserves handler context without ticket orphaning. | Escalation scenario simulation tests. |
| **D-08** | **Bidirectional Traceability** | `S-01` to `S-14`, `UR-001` to `UR-004` | Traceability | Every source statement maps to a requirement, domain rule, architectural subsystem, and test method. | Requirements Traceability Matrix audit. |
| **D-09** | **Attachment Security** | `FR-004`, `BR-021`, `BR-022`, `SEC-005` | Security | Private object storage buckets; 5MB file size limit; strict MIME-type whitelisting; 15-minute time-limited presigned view URLs. | File upload security penetration tests. |
| **D-10** | **Institutional Configurability** | `OD-006`, `OD-008`, `ASM-002`, `ASM-004` | Modifiability | SLA thresholds, category lists, departments, and verification windows stored in relational configuration tables, not hardcoded code. | Multi-tenant configuration tests. |
| **D-11** | **Maintainability & Modularity** | `NFR-012`, `ADR-001` | Maintainability | Modular Monolith with hexagonal/clean layered boundaries; zero circular dependencies; domain logic isolated from external SDKs. | Dependency boundary linting & static analysis. |
| **D-12** | **Availability & Uptime** | `NFR-002`, `ADR-011` | Availability | Stateless application tier; managed database with automated failover; target 99.5% uptime during academic semesters. | Uptime monitoring & health check probes. |
| **D-13** | **System Observability** | `NFR-009` | Observability | Structured JSON logging with correlation IDs; separate operational logs from business audit journal; zero PII in logs. | Structured log parsing & tracing audit. |
| **D-14** | **Sub-Second Performance** | `NFR-001`, `ADR-004` | Performance | B-tree indexing on foreign keys and compound status filters; sub-800ms 95th percentile response times under standard load. | Automated k6/load testing benchmarks. |
| **D-15** | **Future Extensibility** | `PROP-001` to `PROP-006`, `OD-004`, `OD-011` | Extensibility | Abstract provider interfaces for Identity (`IdentityProvider`), Notifications (`NotificationChannel`), and SLA (`CalendarProvider`). | Architecture review & mock adapter tests. |

---

## 3. System Architecture Style Evaluation

### 3.1 Comparison of Architectural Candidates

| Evaluation Criteria | Option 1: Microservices | Option 2: Serverless Functions | Option 3: Traditional Layered Monolith | Option 4: Modular Monolith (ADR-001) |
| :--- | :--- | :--- | :--- | :--- |
| **Team Size & Operational Burden** | High operational burden; requires service mesh, Docker, distributed tracing. Unsuitable for academic team. | Low server management, but cold-start latency and fragmented domain logic across lambdas. | Easy to build initially, but high risk of degenerating into an unmaintainable "Big Ball of Mud". | **Optimal**: Unified operational footprint with strict internal compile-time module isolation. |
| **Data Consistency & Transactions** | Eventual consistency; complex Saga patterns for state + audit + assignment. High failure risk. | Distributed database connections; connection exhaustion under burst loads. | ACID transactional guarantees via single relational database. | **Optimal**: ACID transactional guarantees across complaint mutations and audit logging within a single transaction. |
| **Host Environment Alignment** | Incompatible with greenfield Windows host lacking Docker on PATH (Phase 00). | Compatible, but complex local debugging. | Fully compatible with local Node.js environment. | **Optimal**: Runs natively on Windows host with Node 24 and pnpm; zero local container requirements. |
| **Security & Boundary Enforcement** | Complex inter-service authentication (mTLS, JWT propagation). | Function-level IAM policies; difficult to maintain unified RLS policies. | Monolithic database connections often bypass fine-grained database RLS. | **Optimal**: Application RBAC combined with PostgreSQL Row-Level Security in a single database connection session. |
| **Deployment Simplicity** | Requires multi-container Kubernetes or ECS cluster. | Cloud vendor lock-in (AWS API Gateway / Lambda). | Single server deployment (PM2 / VPS). | **Optimal**: Deployable to Vercel PaaS or single containerized Linux VPS without code modification (ADR-011). |

### 3.2 Verdict & Modularity Enforcement
We confirm **Option 4: Modular Monolith** as the governing architecture style ([ADR-001](file:///d:/Deparment%20Project/department%20project/docs/engineering/architecture/decisions/ADR-001-ARCHITECTURE-STYLE.md)).

To ensure the Modular Monolith does not degrade into a "Big Ball of Mud":
1. **Strict Hexagonal / Onion Layering**:
   - `Core Domain` has zero dependencies on frameworks, databases, or third-party SDKs.
   - `Application Services` orchestrate use cases by interacting with domain models and repository interfaces.
   - `Infrastructure Adapters` implement repository and gateway interfaces using PostgreSQL and Supabase.
   - `Presentation` handles HTTP requests, input validation, and view rendering.
2. **Explicit Public Module Contracts**: Modules communicate across boundaries strictly through typed domain service interfaces and domain events, never by reaching directly into another module's internal database tables or internal utilities.
3. **Compile-Time Boundary Linting**: Architectural dependency rules will be enforced via linting configurations in Phase 03 to fail builds if a presentation layer imports persistence internals directly.

---

## 4. Architectural Blueprint & Layer Topology

```text
══════════════════════════════════════════════════════════════════════════════════════════════════════
                                  PRESENTATION LAYER (Web Client & HTTP Controllers)
  • Responsive Web Client (Desktop / Mobile viewports >= 360px)
  • Role-Based Views: Student Portal, Handler Worklist, Dept Head Triage, Management Dashboard
  • Input Validation Interceptors (Zod schema validation, MIME & size boundary checks)
══════════════════════════════════════════════════════════════════════════════════════════════════════
                                                 │
                                                 ▼
══════════════════════════════════════════════════════════════════════════════════════════════════════
                                 APPLICATION SERVICES LAYER (Use Case Orchestration)
  • ComplaintIntakeService          • AssignmentService              • ForwardingService
  • EscalationService               • ResolutionService              • NotificationDispatcher
  • IssueIntelligenceService        • AuditQueryService              • DashboardAggregationService
══════════════════════════════════════════════════════════════════════════════════════════════════════
                                                 │
                                                 ▼
══════════════════════════════════════════════════════════════════════════════════════════════════════
                                    CORE DOMAIN LAYER (Pure Business Logic)
  • Entities & Value Objects: Complaint, Category, Department, User, Assignment, ActionEvent
  • State Machine Transition Engine: Deterministic FSM, pre/post-conditions, invariant validation
  • Domain Events: ComplaintSubmitted, Assigned, Forwarded, Escalated, Resolved, Reopened
  • Business Rules: BR-001 through BR-024
══════════════════════════════════════════════════════════════════════════════════════════════════════
                                                 │
                                                 ▼
══════════════════════════════════════════════════════════════════════════════════════════════════════
                              INFRASTRUCTURE & PERSISTENCE ADAPTERS LAYER
  • PostgreSQL Repositories: DDL, B-Tree Indexes, Composite Views, Foreign Keys
  • Row-Level Security (RLS) Engine: Database-enforced tenant and role isolation
  • Append-Only Audit Engine: REVOKE UPDATE/DELETE triggers on action_history
  • Storage Adapter: Private S3-compatible Object Storage, Presigned URL generator
  • Notification Adapters: Native In-App Inbox (MVP), Pluggable Transactional Email Adapter
══════════════════════════════════════════════════════════════════════════════════════════════════════
```

---

## 5. Architectural Consistency & Verification Summary

This architecture overview guarantees that:
- Every driver is satisfied by an explicit architectural mechanism.
- The Modular Monolith provides clean physical boundaries without premature distributed systems debt.
- All subsequent detailed specifications (C4 models, state machines, RBAC, data models, threat analysis) align directly with these core principles.
