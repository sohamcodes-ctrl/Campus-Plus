# 12. Security Audit Report & OWASP API Security Assessment

## 1. Executive Summary

Campus Plus is an institutional complaint and grievance resolution system designed to manage sensitive student disputes, disciplinary reports, infrastructure incidents, and institutional governance workflows.

The application boundary implemented in **Phase 06** establishes an exhaustive defense-in-depth architecture. Security controls are not merely applied as outer HTTP middleware; they are enforced across presentation schemas, application authorization policies, domain state machine invariants, and transactional database constraints.

This audit evaluates the Phase 06 implementation against the **OWASP API Security Top 10 (2023)** and verifies specific institutional threat vectors including BOLA/IDOR, cross-department data leakage, privilege escalation, mass assignment, and audit evasion.

---

## 2. OWASP API Security Top 10 (2023) Assessment

| OWASP Vulnerability | Risk Rating | Status | Mitigation & Architectural Evidence |
| :--- | :--- | :--- | :--- |
| **API1:2023 Broken Object Level Authorization (BOLA/IDOR)** | Critical | **DEFENDED** | Multi-dimensional authorization in `ComplaintPolicy` (`canView`, `canAct`, `canVerifyOrDispute`). Aggregates load fully and evaluate ownership against the verified `ActorContext`. A student cannot access tickets they did not submit; a department officer cannot access tickets belonging to other departments. |
| **API2:2023 Broken Authentication** | Critical | **DEFENDED** | `AuthenticationAdapter` strictly resolves actors via Supabase JWT or database profile lookup. Test fixture headers (`x-actor-id`) are **hardcoded to be rejected in production** (`process.env.NODE_ENV === 'production'`). Unauthenticated requests reject deterministically with HTTP 401. |
| **API3:2023 Broken Object Property Level Authorization** | High | **DEFENDED** | **Inbound**: All Zod schemas enforce `.strict()` to reject mass-assignment attempts (e.g. attempting to inject `status`, `version`, or `departmentId` on creation).<br>**Outbound**: DTO projections (`StudentComplaintDTO` vs `StaffComplaintDTO`) ensure internal operational details, forwarding history notes, and SLA deadlines are stripped before returning data to students. |
| **API4:2023 Unrestricted Resource Consumption** | Medium | **DEFENDED** | Query repositories clamp pagination (`limit = Math.min(Math.max(1, limit), 100)`). Body sizes are bounded by Next.js defaults. Database operations execute via indexed queries on `(department_id, status)` and `created_by`. |
| **API5:2023 Broken Function Level Authorization (BFLA)** | High | **DEFENDED** | Action routes enforce granular role and capability gates before invoking use cases. For instance, `/assign` and `/reject` require staff role and department membership; `/escalate` requires escalation capability; `/verify` is strictly restricted to the ticket's complainant. |
| **API6:2023 Unrestricted Access to Sensitive Business Flows** | High | **DEFENDED** | Complaint state transitions are governed by an immutable finite state machine (`ComplaintStateMachine`). State manipulation via direct parameter patching is impossible. Critical command endpoints require mandatory `Idempotency-Key` headers backed by PostgreSQL transactional locks. |
| **API7:2023 Server-Side Request Forgery (SSRF)** | Low | **DEFENDED** | No API endpoints accept arbitrary outbound URLs or trigger server-initiated network requests. File uploads use presigned storage keys and direct client-to-storage architecture. |
| **API8:2023 Security Misconfiguration** | Medium | **DEFENDED** | Explicit Next.js Route Handlers. Default deny policies. Sanitized error responses prevent database exception leakage in production. Strict TypeScript typechecking with no `any` leaks. |
| **API9:2023 Improper Inventory Management** | Low | **DEFENDED** | Strict API versioning under `/api/v1/...`. All 18 endpoints are cataloged in `ENDPOINT-APPROVAL-MATRIX.md`. Unapproved routes do not exist. Legacy test mocks are isolated in `/tests`. |
| **API10:2023 Unsafe Consumption of APIs** | Low | **DEFENDED** | No untrusted third-party API consumption. Database integration operates via parameterized queries through PGlite/PostgreSQL pool adapters preventing SQL injection. |

---

## 3. Detailed Threat Vector Analysis

### 3.1 BOLA / IDOR Defense Verification
- **Vulnerability Scenario**: An attacker signs in as Student A and attempts to access or modify `/api/v1/complaints/[id]` belonging to Student B.
- **Enforcement Mechanism**:
  1. `GetComplaintUseCase` resolves the complaint aggregate.
  2. `ComplaintPolicy.canView(complaint, actor)` evaluates:
     - Is actor `STUDENT`? Complainant ID must strictly equal `actor.userId`.
     - Is actor `STAFF`? Ticket `departmentId` must match one of the actor's authorized departments.
  3. If false, the use case throws `AppError(FORBIDDEN)`.
  4. Response returns HTTP 403.
- **Verification Evidence**: Tested and confirmed in `tests/integration/api-security-negative.test.ts` (Test: *Student B cannot view Student A complaint*).

### 3.2 Mass Assignment & Parameter Tampering Defense
- **Vulnerability Scenario**: An attacker submits a complaint creation payload containing `"status": "RESOLVED"`, `"slaDeadline": "2099-01-01"`, or `"departmentId": "admin_dept"`.
- **Enforcement Mechanism**:
  1. `submitComplaintSchema` uses `z.object({ ... }).strict()`.
  2. Any unrecognized keys trigger a Zod validation error.
  3. Validated input is mapped into strongly typed domain Value Objects (`ComplaintCategory`, `Title`, `Description`).
  4. Initial status is hardcoded in the domain aggregate factory (`Complaint.submit()` sets `SUBMITTED`, version `1`, zero initial assignments).
- **Verification Evidence**: Tested and confirmed in `tests/integration/api-contracts.test.ts` (Test: *Mass assignment rejection on extra payload keys*).

### 3.3 Privilege Escalation & Institutional Roles
- **Vulnerability Scenario**: A student sends a request to `/api/v1/complaints/[id]/assign` or `/api/v1/complaints/[id]/resolve`.
- **Enforcement Mechanism**:
  1. Route handler extracts actor context: `actor.role === 'STUDENT'`.
  2. Handler evaluates: `if (actor.role !== 'DEPT_OFFICER' && actor.role !== 'SUPER_ADMIN') throw AppError.forbidden(...)`.
  3. State machine and domain aggregate also verify that the actor has staff authority.
- **Verification Evidence**: Tested and confirmed in `tests/integration/api-security-negative.test.ts` (Test: *Student cannot assign officer* and *Student cannot resolve ticket*).

### 3.4 Cross-Department Leakage Defense
- **Vulnerability Scenario**: An officer belonging to Department 1 (e.g. IT Services) attempts to view or process a grievance filed under Department 2 (e.g. Hostel Administration).
- **Enforcement Mechanism**:
  1. `ComplaintPolicy.canAct(complaint, actor)` inspects `actor.departmentIds`.
  2. If `complaint.departmentId` is not in `actor.departmentIds` (and actor is not a `SUPER_ADMIN`), the operation is rejected with HTTP 403.
- **Verification Evidence**: Tested and confirmed in `tests/integration/api-security-negative.test.ts` (Test: *Cross-department officer cannot assign or resolve tickets*).

### 3.5 Tamper-Evident Audit & Outbox Logging
- Every state change triggers an atomic PostgreSQL transaction that writes to:
  - `complaints`: Updates state and version.
  - `action_history`: Appends immutable audit trail (`performed_by`, `action_type`, `old_status`, `new_status`, `reason`).
  - `outbox_events`: Enqueues domain event for asynchronous delivery.
- If any log insertion fails, the entire transaction rolls back, guaranteeing zero untracked state mutations.

---

## 4. Security Audit Conclusion

The Phase 06 Application and API layer satisfies all institutional security requirements. The codebase exhibits zero critical, high, or medium security vulnerabilities within its evaluated scope.
