# ADR-001: Architecture Style & System Decomposition

**Status**: Accepted  
**Date**: 2026-09-10  
**Context Phase**: Phase 02 — Architecture & Technical Design  
**Deciders**: Lead Software Architect, Systems Analyst  

---

## 1. Context & Problem Statement

Campus Plus requires a robust, maintainable system architecture capable of supporting authenticated complaint submission, departmental routing, state machine transitions, escalation, audit logging, notifications, and analytics. The deployment environment is an educational institution (model: RCPIT Shirpur). Development is greenfield on a Windows host environment without local Docker tooling, targeting web-first multi-device usage.

We must select an architectural style that delivers high developer velocity, testability, strong domain invariants, and straightforward maintainability without premature operational complexity.

---

## 2. Decision Drivers

- **Requirement Traceability**: Direct mapping to `UR-001` through `UR-004` and `FR-001` through `FR-026`.
- **Operational Simplicity**: Avoid distributed microservices overhead (distributed transactions, service meshes, complex tracing) that would overwhelm academic IT infrastructure.
- **Strict Domain Invariants**: Complaint lifecycle and audit logging require strong ACID transactional guarantees across state changes and audit journal writes.
- **Modularity & Independence**: Domain logic must remain independent of specific web frameworks or UI components (`NFR-012`).

---

## 3. Considered Options

1. **Option 1: Microservices Architecture**: Decomposing into separate services (Auth Service, Complaint Service, Notification Service, Analytics Service).
2. **Option 2: Distributed Serverless Functions**: Independent cloud functions per API endpoint.
3. **Option 3: Layered / Modular Monolith**: A unified codebase partitioned into strictly isolated domain modules (Complaints, Assignments, Escalations, Auditing, Notifications, Analytics) with shared relational transactional boundaries.

---

## 4. Decision

We **adopt Option 3: Modular Monolith** with Clean / Hexagonal Layered Boundaries.

The system will be organized into decoupled logical modules:
- **Core Domain Layer**: Pure business entities, lifecycle state machine, validation rules, domain events (zero external dependencies).
- **Application Services Layer**: Use-case orchestrators (SubmitComplaint, AssignHandler, ForwardComplaint, EscalateComplaint, ResolveComplaint).
- **Infrastructure / Persistence Adapters**: Relational database repositories, storage adapters, notification dispatchers.
- **Presentation Layer**: Responsive web views, API controllers, role-based view projections.

```text
       ┌──────────────────────────────────────────────────────────┐
       │                    Presentation Layer                    │
       │         (Responsive Web Views / HTTP Controllers)        │
       └─────────────────────────────┬────────────────────────────┘
                                     │
       ┌─────────────────────────────▼────────────────────────────┐
       │                 Application Service Layer                │
       │  (Use Cases: Intake, Assignment, Escalation, Resolution) │
       └─────────────────────────────┬────────────────────────────┘
                                     │
       ┌─────────────────────────────▼────────────────────────────┐
       │                    Core Domain Layer                     │
       │    (Entities, Lifecycle State Machine, Business Rules)   │
       └─────────────────────────────┬────────────────────────────┘
                                     │
       ┌─────────────────────────────▼────────────────────────────┐
       │               Infrastructure / Adapters Layer            │
       │       (PostgreSQL / RLS, Object Storage, Notifications)  │
       └──────────────────────────────────────────────────────────┘
```

---

## 5. Consequences

### Positive
- **Transactional Integrity**: Single relational database enables atomic multi-table transactions (updating complaint status + appending audit journal + queuing notification within one ACID transaction).
- **Development & Testing Velocity**: Can be run and tested locally with zero multi-service orchestration overhead.
- **Maintainability**: Clear module boundaries prevent spaghetti code while avoiding network latency between services.

### Negative / Tradeoffs
- Requires strict linting and module import boundary rules to prevent accidental tight coupling across domain layers.
- Horizontal scaling scales the entire monolith rather than individual high-load modules (acceptable given campus scale of ~1,000 daily active users).

---

## 6. Compliance with Phase Rules
No code, dependencies, or framework installations are performed in this phase.
