# Multi-Layered Authorization & BOLA/IDOR Defense

## 1. Multi-Layered Defense-in-Depth

Campus Plus enforces authorization at four distinct architectural layers:

```
[Layer 1: Presentation Scoping]  Auto-filters query parameters to actor's own jurisdiction
                ↓
[Layer 2: Application Use Case]  Validates actor context before triggering aggregate operations
                ↓
[Layer 3: Domain Core Policy]    AuthorizationPolicy.canExecute(actor, operation, resource)
                ↓
[Layer 4: PostgreSQL RLS]       Row-Level Security policies active at the database engine level
```

## 2. Broken Object Level Authorization (BOLA / IDOR) Defense

### Complainant Isolation
A student or faculty member can ONLY view or interact with complaints where `complainant_id = actor.userId`.
Any attempt to query another user's complaint by UUID or tracking code fails at both:
- Application Layer: `GetComplaintUseCase` evaluates `DomainOperation.VIEW`. If `actor.userId !== resource.complainantId`, `UnauthorizedOperationError` (403 Forbidden) is thrown.
- Read List Query: `ListComplaintsUseCase` forcibly sets `filter.complainantId = actor.userId`. Client-supplied user filters are ignored.

### Departmental Jurisdictional Isolation
Handlers and Department Heads are strictly scoped to their owning department:
- A Handler of Department A cannot view or act upon complaints assigned to Department B.
- Any attempt to assign, progress, resolve, or forward across departments throws `DepartmentScopeViolationError` (403 Forbidden).

## 3. Privilege Escalation Defense

| Operation | Permitted Roles | Forbidden Roles | Error Response |
|---|---|---|---|
| `SUBMIT` | `ROLE_STUDENT`, `ROLE_FACULTY`, `ROLE_ADMIN` | - | 401 / 403 |
| `VIEW` (Own Ticket) | Owner Student, Owning Staff, Admin | Other Students | 403 Forbidden |
| `REVIEW` | `ROLE_DEPT_HEAD`, `ROLE_ADMIN` | `ROLE_STUDENT`, `ROLE_HANDLER` | 403 Forbidden |
| `ASSIGN` | `ROLE_DEPT_HEAD`, `ROLE_ADMIN` | `ROLE_STUDENT`, `ROLE_HANDLER` | 403 Forbidden |
| `START_PROGRESS` | Assigned `ROLE_HANDLER`, `ROLE_ADMIN` | `ROLE_STUDENT`, Unassigned Staff | 403 Forbidden |
| `RESOLVE` | Assigned `ROLE_HANDLER`, `ROLE_DEPT_HEAD`, `ROLE_ADMIN` | `ROLE_STUDENT` | 403 Forbidden |
| `ESCALATE` | `ROLE_DEPT_HEAD`, `ROLE_ADMIN` | `ROLE_STUDENT`, `ROLE_HANDLER` | 403 Forbidden |
| `DISPUTE / REOPEN`| Owner `ROLE_STUDENT`, `ROLE_ADMIN` | Non-owner, Staff | 403 Forbidden |
| `CLOSE` (Verify) | Owner `ROLE_STUDENT` | Non-owner, Staff | 403 Forbidden |
| `CLOSE` (Admin) | `ROLE_ADMIN`, `ROLE_MANAGEMENT` | `ROLE_STUDENT`, `ROLE_HANDLER` | 403 Forbidden |
