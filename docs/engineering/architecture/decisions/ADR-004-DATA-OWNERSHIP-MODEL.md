# ADR-004: Complaint Data Ownership & Relational Boundary Model

**Status**: Accepted  
**Date**: 2026-09-10  
**Context Phase**: Phase 02 — Architecture & Technical Design  
**Deciders**: Lead Software Architect, Systems Analyst  
**Traceability**: Resolves `OD-001`, `OD-003`, satisfies `FR-005`, `FR-008`, `FR-010`, `BR-001`, `BR-008`, `BR-010`  

---

## 1. Context & Problem Statement

Complaints require a deterministic data structure that establishes:
- Who owns a complaint upon creation?
- Can one complaint belong to multiple departments concurrently (`OD-001`)?
- How is jurisdictional responsibility transferred during inter-department forwarding (`OD-003`)?
- What happens if a complaint is filed under an unmapped or obsolete category?
- Can executive management override departmental ownership?

We must define the relational domain entity model and ownership boundaries to guarantee clear accountability without data anomalies.

---

## 2. Considered Options

1. **Option 1: Multi-Department Joint Ownership**:
   - Complaint has a many-to-many relationship with departments.
   - *Flaw*: Unclear SLA ownership, concurrent conflicting resolutions by different departments, complex state coordination.
2. **Option 2: Single Primary Owning Department with Sequential Forwarding**:
   - Complaint has exactly one foreign key reference to an owning department (`department_id`).
   - If misdirected or requiring external action, ownership is atomically transferred via a `FORWARD` action with mandatory documented rationale.
   - Prior department context is preserved in the immutable action history.

---

## 3. Decision

We **adopt Option 2: Single Primary Owning Department with Sequential Forwarding**.

### 3.1 Relational Entity Architecture

```text
       ┌──────────────────────┐              ┌──────────────────────┐
       │     departments      │              │      categories      │
       ├──────────────────────┤              ├──────────────────────┤
       │ id (PK, UUID)        │              │ id (PK, UUID)        │
       │ name (VARCHAR)       │1            1│ name (VARCHAR)       │
       │ code (VARCHAR, UNIQUE│              │ default_dept_id (FK) ├─┐
       │ is_active (BOOLEAN)  │              │ is_active (BOOLEAN)  │ │
       └──────────┬───────────┘              │ requires_proof (BOOL)│ │
                  │                          └──────────┬───────────┘ │
                  │                                     │             │
                  │1                                    │1            │
                  │        ┌──────────────────┐         │             │
                  └───────>│    complaints    │<────────┘             │
                  ┌───────>│ (Core Aggregate) │                       │
                  │        ├──────────────────┤                       │
                  │        │ id (PK, UUID)    │                       │
                  │        │ ref_id (UNIQUE)  │                       │
                  │        │ title (VARCHAR)  │                       │
                  │        │ complainant_id   ├─┐                     │
                  │        │ department_id    │ │                     │
                  │        │ category_id      │ │                     │
                  │        │ handler_id (NULL)│ │                     │
                  │        │ status (ENUM)    │ │                     │
                  │        │ priority (ENUM)  │ │                     │
                  │        │ location_details │ │                     │
                  │        │ created_at (UTC) │ │                     │
                  │        └────────┬─────────┘ │                     │
                  │                 │           │                     │
                  │1                │1          │1                    │
                  │                 │           │                     │
       ┌──────────┴───────────┐     │     ┌─────▼──────────────┐      │
       │    action_history    │<────┘     │       users        │      │
       ├──────────────────────┤           ├────────────────────┤      │
       │ id (PK, UUID)        │           │ id (PK, UUID)      │      │
       │ complaint_id (FK)    │           │ email (UNIQUE)     │      │
       │ actor_id (FK)        │           │ full_name          │      │
       │ action_type (ENUM)   │           │ role (ENUM)        │      │
       │ from_department_id   │           │ department_id (FK) ├──────┘
       │ to_department_id     │           │ is_active (BOOLEAN)│
       │ remarks (TEXT)       │           └────────────────────┘
       │ created_at (UTC)     │
       └──────────────────────┘
```

### 3.2 Ownership Invariants
1. **Single Point of Contact**: At any instant, `complaints.department_id` points to exactly one active department.
2. **Atomic Forwarding**: A forward action atomically updates `complaints.department_id = new_dept_id`, sets `complaints.handler_id = NULL`, sets `complaints.status = 'FORWARDED'`, and writes an audit record in `action_history` capturing `from_dept`, `to_dept`, `actor_id`, and `forwarding_reason`.
3. **Category Default Routing**: Each category specifies a `default_dept_id`. Upon initial submission, the complaint defaults to this department unless explicitly overridden by the complainant's specific sub-selection.
4. **Management Override**: Management (`ROLE_MANAGEMENT`) and System Administrators (`ROLE_ADMIN`) have institutional authority to reassign ownership if a dispute or deadlock occurs (`BR-009`).

---

## 4. Consequences

### Positive
- Strict, unambiguous operational responsibility.
- State machine remains deterministic and free of multi-tenant distributed locks.
- Clean database indexing on `(department_id, status)` for sub-second dashboard rendering (`NFR-001`).

### Negative / Tradeoffs
- Cross-functional complaints spanning two departments simultaneously must be handled by one primary department consulting the other via internal remarks, rather than split tickets.

---

## 5. Phase Isolation
No database migrations or SQL tables are created in Phase 02.
