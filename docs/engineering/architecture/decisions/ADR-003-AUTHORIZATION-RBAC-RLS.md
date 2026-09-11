# ADR-003: Authorization & Multi-Tier Access Control (RBAC & RLS)

**Status**: Accepted  
**Date**: 2026-09-10  
**Context Phase**: Phase 02 — Architecture & Technical Design  
**Deciders**: Security Engineer, Lead Software Architect  
**Traceability**: Satisfies `SEC-002`, `NFR-005`, `PRIV-001`, `PRIV-002`, `STAKEHOLDER-MODEL.md`  

---

## 1. Context & Problem Statement

Campus Plus manages grievances containing sensitive student personal data, disciplinary matters, staff performance notes, and administrative deliberations. The system supports 5 distinct stakeholder roles:
1. `ROLE_STUDENT` (Complainant)
2. `ROLE_HANDLER` (Staff / Assigned Authority)
3. `ROLE_DEPT_HEAD` (Department-Level Authority)
4. `ROLE_ADMIN` (System Administrator)
5. `ROLE_MANAGEMENT` (Institutional Executive)

Requirements mandate:
- Strict server-side authorization enforcement (`SEC-002`, `NFR-005`).
- Student visibility limited strictly to their own submitted complaints (`PRIV-001`).
- Segregation of internal staff remarks from student-visible timelines (`PRIV-002`).
- Department-level scoped visibility for handlers and department heads.

---

## 2. Considered Options

1. **Option 1: Application-Only Authorization Guards**:
   - Permission checks executed solely in API controllers/services.
   - Vulnerable to accidental data leakage if an API endpoint forgets a filter clause.
2. **Option 2: Pure Database Row-Level Security (RLS)**:
   - All rules implemented inside PostgreSQL policies.
   - Difficult to maintain complex business validation (e.g., transition state machines) inside pure SQL policies.
3. **Option 3: Defense-in-Depth (Application RBAC + Database RLS)**:
   - Application Gateway enforces coarse and fine-grained business permission guards before invoking domain services.
   - PostgreSQL Row-Level Security (RLS) acts as an impermeable underlying backstop guaranteeing that database queries physically cannot return unauthorized tenant/user rows.

---

## 3. Decision

We **adopt Option 3: Defense-in-Depth Multi-Tier Authorization**.

### 3.1 Tier 1: Application-Level RBAC Guards
- Every API route and server action is protected by a declarative permission interceptor:
  ```typescript
  @Authorize([Role.DEPT_HEAD, Role.ADMIN])
  async assignHandler(complaintId: string, handlerId: string) { ... }
  ```
- Rejects unauthorized invocations at the boundary with HTTP 403 Forbidden.

### 3.2 Tier 2: Database Row-Level Security (RLS)
The database enforces row filtering at the SQL engine level based on authenticated session claims:
- **`complaints` Table**:
  - `ROLE_STUDENT`: `SELECT` allowed ONLY WHERE `complainant_id = auth.uid()`.
  - `ROLE_HANDLER`: `SELECT` allowed WHERE `assigned_handler_id = auth.uid()` OR `department_id = auth.department_id()`.
  - `ROLE_DEPT_HEAD`: `SELECT` allowed WHERE `department_id = auth.department_id()`.
  - `ROLE_MANAGEMENT` / `ROLE_ADMIN`: `SELECT` allowed across all institution complaints.
- **`action_history` Table**:
  - Complainants can only read records where `visibility_level = 'PUBLIC'`.
  - Records where `visibility_level = 'INTERNAL'` are inaccessible to `ROLE_STUDENT` via RLS policy.

---

## 4. Consequences

### Positive
- **Guaranteed Zero Data Leakage**: Even if a developer writes `SELECT * FROM complaints` without a `WHERE` clause, the database engine automatically restricts rows to what the authenticated user is permitted to see.
- **Strict Compliance**: Fully satisfies `SEC-002`, `PRIV-001`, and `PRIV-002`.
- **Auditable Security Model**: Security rules are declarative, testable in isolation, and verifiable via automated regression tests.

### Negative / Tradeoffs
- Requires passing authenticated user context down to database connection sessions.

---

## 5. Phase Isolation
No SQL migrations, policies, or database triggers are created in Phase 02.
