# Multi-Dimensional Domain Authorization Engine (`AuthorizationPolicy`)

## 1. Security Architecture & Threat Model

Campus Plus enforces authorization at the Domain Core boundary (`INV-008`). Authorization is not merely checked in UI routes or middleware; the Domain Model evaluates permission boundaries independently of the delivery mechanism to protect against:

1. **BOLA (Broken Object Level Authorization) / IDOR**: Prevent malicious students from enumerating or viewing other students' complaints by manipulating complaint IDs.
2. **Horizontal Privilege Escalation**: Prevent staff in Department A from viewing, reassigning, resolving, or modifying complaints belonging to Department B.
3. **Vertical Privilege Escalation**: Prevent general handlers from executing administrative actions (e.g., ticket rejection, marking duplicates, assigning other staff) that belong strictly to Department Heads or Administrators.
4. **Lifecycle Tampering**: Prevent complainants from cancelling complaints that are already under active investigation or resolution.

---

## 2. The 4 Evaluation Dimensions

```
+-------------------+      +-----------------------+
|    Actor Role     |      |  Resource Ownership   |
| (Student, Handler,|  x   | (Complainant ID vs.   |
|  Head, Admin)     |      |  Actor User ID)       |
+-------------------+      +-----------------------+
          x                            x
+-------------------+      +-----------------------+
| Department Scope  |      |    Aggregate State    |
| (Actor Dept ID vs.|  x   | (Status must permit   |
|  Complaint Dept)  |      |  requested action)    |
+-------------------+      +-----------------------+
          |
          v
Authorization Decision: ok(void) OR err(DomainError)
```

---

## 3. Authorization Matrix by Role

| Role | Operation | Required Conditions | Failure Error |
| :--- | :--- | :--- | :--- |
| **Student / Faculty** | `SUBMIT` | Authenticated user | `UnauthorizedOperationError` |
| | `VIEW` | `actor.userId === resource.complainantId` | `UnauthorizedOperationError` (BOLA Protection) |
| | `CANCEL` | `actor.userId === resource.complainantId` AND `status IN (DRAFT, SUBMITTED)` | `UnauthorizedOperationError` |
| | `VERIFY_RESOLUTION` | `actor.userId === resource.complainantId` AND `status === RESOLVED` | `UnauthorizedOperationError` |
| | `DISPUTE_REOPEN` | `actor.userId === resource.complainantId` AND `status === RESOLVED` | `UnauthorizedOperationError` |
| | *Staff Ops* (`REVIEW`, `ASSIGN`, `FORWARD`, `RESOLVE`, `REJECT`) | **FORBIDDEN** | `UnauthorizedOperationError` |
| **Department Handler** | `VIEW` | `actor.departmentId === resource.departmentId` | `DepartmentScopeViolationError` |
| | `START_PROGRESS` | `actor.departmentId === resource.departmentId` AND (`assignedHandlerId === actor.userId` OR `assignedHandlerId IS NULL`) | `UnauthorizedOperationError` |
| | `RESOLVE` | `actor.departmentId === resource.departmentId` AND `assignedHandlerId === actor.userId` | `UnauthorizedOperationError` |
| | `FORWARD` / `ESCALATE` | `actor.departmentId === resource.departmentId` | `DepartmentScopeViolationError` |
| | `ASSIGN` / `REJECT` / `DUPLICATE` / `CLOSE` | **FORBIDDEN** (Head or Admin only) | `UnauthorizedOperationError` |
| **Department Head** | `VIEW`, `REVIEW`, `ASSIGN`, `FORWARD`, `ESCALATE`, `RESOLVE`, `REJECT`, `DUPLICATE`, `CLOSE` | `actor.departmentId === resource.departmentId` | `DepartmentScopeViolationError` |
| **Admin / Management** | *All Operations* | System-wide purview across all departments | None |

---

## 4. Code Implementation Highlights

Implemented in `src/domain/complaint/policies/AuthorizationPolicy.ts`:

```typescript
export class AuthorizationPolicy {
  public static canExecute(
    actor: ActorContext,
    operation: DomainOperationType,
    resource: ComplaintResourceContext
  ): Result<void, UnauthorizedOperationError | DepartmentScopeViolationError> {
    const { role, userId, departmentId: actorDeptId } = actor;
    const { complainantId, departmentId: resourceDeptId, assignedHandlerId, status } = resource;

    // 1. Broad administrative purview
    if (role === UserRole.ROLE_ADMIN || role === UserRole.ROLE_MANAGEMENT) {
      return ok(undefined);
    }

    // 2. Complainant Boundaries
    if (role === UserRole.ROLE_STUDENT || role === UserRole.ROLE_FACULTY) {
      ...
    }

    // 3. Departmental Staff Boundaries
    if (role === UserRole.ROLE_HANDLER || role === UserRole.ROLE_DEPT_HEAD) {
      if (!actorDeptId || actorDeptId !== resourceDeptId) {
        return err(new DepartmentScopeViolationError(actorDeptId ?? "NONE", resourceDeptId));
      }
      ...
    }
    ...
  }
}
```

---

## 5. Automated Security Test Suite

The policy is tested against 19 adversarial unit test cases in `tests/unit/domain-authorization.test.ts`:
- Attempted BOLA access by students on other students' complaints is confirmed blocked with 403 Forbidden.
- Cross-department operations by handlers and department heads are confirmed blocked with `DepartmentScopeViolationError`.
- Staff operation attempts by students are rejected.
- Premature or invalid cancellations/reopen disputes are rejected.
