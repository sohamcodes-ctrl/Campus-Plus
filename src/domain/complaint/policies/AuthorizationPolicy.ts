import { UserRole, UserRoleType } from "../ComplaintTypes";
import { ComplaintStatus, ComplaintStatusType } from "../ComplaintStatus";
import { UnauthorizedOperationError, DepartmentScopeViolationError } from "../DomainErrors";
import { Result, ok, err } from "@/domain/common/Result";

export interface ActorContext {
  readonly userId: string;
  readonly role: UserRoleType;
  readonly departmentId?: string; // Optional for students / faculty without department assignment
}

export interface ComplaintResourceContext {
  readonly complainantId: string;
  readonly departmentId: string;
  readonly assignedHandlerId?: string;
  readonly status: ComplaintStatusType;
}

export const DomainOperation = {
  SUBMIT: "SUBMIT",
  VIEW: "VIEW",
  REVIEW: "REVIEW",
  ASSIGN: "ASSIGN",
  START_PROGRESS: "START_PROGRESS",
  FORWARD: "FORWARD",
  ESCALATE: "ESCALATE",
  RESOLVE: "RESOLVE",
  VERIFY_RESOLUTION: "VERIFY_RESOLUTION",
  DISPUTE_REOPEN: "DISPUTE_REOPEN",
  CLOSE: "CLOSE",
  REJECT: "REJECT",
  MARK_DUPLICATE: "MARK_DUPLICATE",
  CANCEL: "CANCEL",
} as const;

export type DomainOperationType = (typeof DomainOperation)[keyof typeof DomainOperation];

/**
 * Domain Authorization Engine (INV-008).
 * Evaluates authorization across 4 dimensions: Actor Role + Resource Ownership + Department Scope + State.
 */
export class AuthorizationPolicy {
  public static canExecute(
    actor: ActorContext,
    operation: DomainOperationType,
    resource: ComplaintResourceContext
  ): Result<void, UnauthorizedOperationError | DepartmentScopeViolationError> {
    const { role, userId, departmentId: actorDeptId } = actor;
    const { complainantId, departmentId: resourceDeptId, assignedHandlerId, status } = resource;

    // 1. Management & Admin have broad administrative purview across departments
    if (role === UserRole.ROLE_ADMIN || role === UserRole.ROLE_MANAGEMENT) {
      return ok(undefined);
    }

    // 2. Complainant (Student / Faculty) Boundaries
    if (role === UserRole.ROLE_STUDENT || role === UserRole.ROLE_FACULTY) {
      switch (operation) {
        case DomainOperation.SUBMIT:
          return ok(undefined);

        case DomainOperation.VIEW:
          if (userId === complainantId) return ok(undefined);
          return err(new UnauthorizedOperationError(operation, role, "Students can only view their own complaints (BOLA/IDOR protection)."));

        case DomainOperation.VERIFY_RESOLUTION:
        case DomainOperation.DISPUTE_REOPEN:
          if (userId !== complainantId) {
            return err(new UnauthorizedOperationError(operation, role, "Only the original complainant can verify or dispute a resolution."));
          }
          if (status !== ComplaintStatus.RESOLVED) {
            return err(new UnauthorizedOperationError(operation, role, "Can only verify or dispute a complaint in RESOLVED status."));
          }
          return ok(undefined);

        case DomainOperation.CANCEL:
          if (userId !== complainantId) {
            return err(new UnauthorizedOperationError(operation, role, "Only the original complainant can cancel a complaint."));
          }
          if (status !== ComplaintStatus.SUBMITTED && status !== ComplaintStatus.DRAFT) {
            return err(new UnauthorizedOperationError(operation, role, "Complainant can only cancel un-triaged complaints."));
          }
          return ok(undefined);

        default:
          return err(new UnauthorizedOperationError(operation, role, "Students are not authorized to perform staff triage or handling operations."));
      }
    }

    // 3. Departmental Staff Scope Check (Handlers & Department Heads)
    if (role === UserRole.ROLE_HANDLER || role === UserRole.ROLE_DEPT_HEAD) {
      // Must belong to the department owning the complaint
      if (!actorDeptId || actorDeptId !== resourceDeptId) {
        return err(
          new DepartmentScopeViolationError(
            actorDeptId ?? "NONE",
            resourceDeptId,
            `Staff member from department '${actorDeptId}' cannot access complaint belonging to department '${resourceDeptId}'.`
          )
        );
      }

      // Department Head Specific Operations
      if (role === UserRole.ROLE_DEPT_HEAD) {
        switch (operation) {
          case DomainOperation.VIEW:
          case DomainOperation.REVIEW:
          case DomainOperation.ASSIGN:
          case DomainOperation.FORWARD:
          case DomainOperation.ESCALATE:
          case DomainOperation.RESOLVE:
          case DomainOperation.CLOSE:
          case DomainOperation.REJECT:
          case DomainOperation.MARK_DUPLICATE:
            return ok(undefined);
          default:
            return err(new UnauthorizedOperationError(operation, role));
        }
      }

      // Handler Specific Operations
      if (role === UserRole.ROLE_HANDLER) {
        switch (operation) {
          case DomainOperation.VIEW:
            return ok(undefined);

          case DomainOperation.START_PROGRESS:
          case DomainOperation.RESOLVE:
            if (assignedHandlerId && assignedHandlerId !== userId) {
              return err(
                new UnauthorizedOperationError(
                  operation,
                  role,
                  `Handler '${userId}' is not the assigned handler '${assignedHandlerId}' for this complaint.`
                )
              );
            }
            return ok(undefined);

          case DomainOperation.FORWARD:
          case DomainOperation.ESCALATE:
            return ok(undefined); // Handlers may initiate/propose transfer or escalation for their department

          default:
            return err(
              new UnauthorizedOperationError(
                operation,
                role,
                `Handlers do not have permission to execute '${operation}'. Requires Department Head or Administrator.`
              )
            );
        }
      }
    }

    return err(new UnauthorizedOperationError(operation, role, "Unrecognized role or permission boundary."));
  }
}
