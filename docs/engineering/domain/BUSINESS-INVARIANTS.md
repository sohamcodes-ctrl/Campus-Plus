# Campus Plus — Business Invariants Specification

## 1. Traceability Overview

Every business constraint implemented in Phase 05 is strictly derived from authoritative sources in the repository: Phase 01 Requirements, Phase 01 Closure Decisions, Phase 02 Architecture ADRs, and Phase 04 Database Schema constraints.

```
Phase 01 Requirements (FR / BR / EDGE)
        ↓
Phase 01 Closure Register (OD / ASM)
        ↓
Phase 02 Architecture ADRs
        ↓
Phase 04 Database DDL & Constraints
        ↓
Phase 05 Domain Core Invariants (INV-001 through INV-013)
```

---

## 2. Invariants Catalog & Formal Proofs

### INV-001: Single Primary Owning Department
- **Rule**: Every complaint must be bound to exactly one active primary department throughout its entire lifecycle.
- **Authoritative Source**: Phase 01 `BR-005`, `BR-008`; Phase 04 DB `complaints.department_id NOT NULL REFERENCES departments(id)`.
- **Enforcement**: `BusinessInvariants.validatePrimaryDepartment(complaint)` asserts presence and validity of `DepartmentId`. Complaint factory and repository save reject orphaned or multi-department ownership.

### INV-002: Department Routing & Anti-Self-Forwarding
- **Rule**: A complaint cannot be forwarded to its current owning department.
- **Authoritative Source**: Phase 01 `BR-010`; Phase 04 DB CHECK constraint `chk_forward_diff_dept` (`CHECK (from_department_id != to_department_id)`).
- **Enforcement**: `BusinessInvariants.validateForwardingTarget(currentDept, targetDept)` throws `SelfForwardingError`.

### INV-003: Terminal Closed State Immutability
- **Rule**: Once a complaint reaches `CLOSED`, `REJECTED`, `DUPLICATE`, or `CANCELLED`, all ordinary mutation operations are permanently forbidden.
- **Authoritative Source**: Phase 01 `COMPLAINT-LIFECYCLE.md`, `BR-016`; Phase 04 FSM constraints.
- **Enforcement**: `BusinessInvariants.validateNotClosed(complaint, op)` throws `ComplaintClosedError`.

### INV-004: State Transition Legality
- **Rule**: State mutations must strictly follow the canonical 13-state transition graph. Arbitrary jumps are forbidden.
- **Authoritative Source**: Phase 01 `COMPLAINT-LIFECYCLE.md`, Phase 02 State Model, Phase 04 DB `complaint_status_enum` + trigger guards.
- **Enforcement**: `BusinessInvariants.validateTransition(from, to)` throws `InvalidStateTransitionError`.

### INV-005: Mandatory Resolution Summary Length
- **Rule**: Transitioning to `RESOLVED` mandates an objective resolution summary with length $\ge 20$ characters.
- **Authoritative Source**: Phase 01 `BR-015`; Phase 04 DB CHECK constraint `chk_resolution_summary_len` (`CHECK (char_length(trim(both from summary)) >= 20)`).
- **Enforcement**: `ResolutionSummary` value object and `BusinessInvariants.validateResolutionSummary(summary)` throw `MissingResolutionSummaryError`.

### INV-006: Category-Specific Resolution Proof Requirements
- **Rule**: Complaints in designated categories (e.g., physical infrastructure, electrical, plumbing) require at least one proof attachment (`RESOLUTION_PROOF`) before resolution can complete.
- **Authoritative Source**: Phase 01 `BR-007`, `FR-016`.
- **Enforcement**: `IResolutionEvidencePolicy.validateResolutionProof(categoryId, attachments)` throws `MissingRequiredProofError`. Callers cannot bypass via arbitrary flags.

### INV-007: Jurisdictional Assignment Scope
- **Rule**: A staff member can only be assigned as the handler for a complaint if they belong to the department currently owning the ticket.
- **Authoritative Source**: Phase 01 `BR-008`, `BR-009`; Phase 02 ADR-004.
- **Enforcement**: `BusinessInvariants.validateHandlerJurisdiction(handlerDept, complaintDept)` throws `DepartmentScopeViolationError`.

### INV-008: Multi-Dimensional Domain Authorization
- **Rule**: Operations are evaluated across 4 dimensions: Actor Role + Resource Ownership + Department Scope + State.
- **Authoritative Source**: Phase 01 `FR-001`, `FR-002`, `FR-023`; Phase 02 ADR-004.
- **Enforcement**: `AuthorizationPolicy.canExecute(actor, operation, resource)` enforces strict BOLA/IDOR protection for students and departmental isolation for handlers.

### INV-009: Optimistic Concurrency Control (OCC)
- **Rule**: Concurrent updates must detect and reject stale modifications without silent overwrites.
- **Authoritative Source**: Phase 01 `NFR-004`; Phase 02 ADR-003; Phase 04 DB `version INT NOT NULL DEFAULT 1`.
- **Enforcement**: `BusinessInvariants.validateConcurrency(currentVersion, expectedVersion)` throws `StaleVersionConflictError`. Aggregate monotonically increments version on each change.

### INV-010: Sequential Forwarding History & Anti-Deadlock Rule (EDGE-004)
- **Rule**: Every departmental transfer records an incremented sequence. When transfer count reaches 3 (`nextSequence >= 3`), circular forwarding deadlock is detected, and the ticket is automatically elevated to `ESCALATED` at `TIER_3_MANAGEMENT` with handler cleared.
- **Authoritative Source**: Phase 01 `FR-010`, `EDGE-004`; Phase 04 DB `forward_sequence INT NOT NULL`.
- **Enforcement**: Automated in `Complaint.forwardDepartment()` and verified in `BusinessInvariants.isAntiDeadlockTriggered()`.

### INV-011: Append-Only Audit Trail Integrity
- **Rule**: Every lifecycle transition must emit a domain event recording the actor, action, previous status, new status, and timestamp.
- **Authoritative Source**: Phase 01 `BR-019`, `FR-019`; Phase 02 ADR-008; Phase 04 DB `audit_events` immutability trigger.
- **Enforcement**: Aggregate appends typed domain events to `_uncommittedEvents` on every mutation; verified by `BusinessInvariants.validateAuditEmission()`.

### INV-012: Internal Notes Secrecy Boundary
- **Rule**: Internal staff notes and communications must never be exposed or visible to student complainants.
- **Authoritative Source**: Phase 01 `BR-020`, `FR-011`; Phase 02 ADR-009.
- **Enforcement**: `BusinessInvariants.validateInternalNoteAccess(isComplainant, isInternal)` throws `UnauthorizedOperationError` if a student requests access to internal notes.

### INV-013: Command Idempotency Protocol
- **Rule**: Duplicate or retried commands bearing the same idempotency key must not execute duplicate aggregate logic, generate duplicate tracking numbers, or produce conflicting side-effects.
- **Authoritative Source**: Phase 01 `NFR-003`; Phase 02 ADR-006.
- **Enforcement**: `IIdempotencyPort` with atomic claim (`acquireKey`), duplicate suppression (`completeKey`), and payload hash verification.
