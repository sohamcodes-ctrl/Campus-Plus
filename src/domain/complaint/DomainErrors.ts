import { AppError } from "@/shared/errors/AppError";
import { ErrorCodes } from "@/shared/errors/ErrorCodes";

export class InvalidStateTransitionError extends AppError {
  constructor(fromStatus: string, toStatus: string, reason?: string) {
    super({
      message: `Illegal state transition from '${fromStatus}' to '${toStatus}'.${reason ? ` Reason: ${reason}` : ""}`,
      code: ErrorCodes.STATE_TRANSITION_INVALID,
      statusCode: 422,
      details: { fromStatus, toStatus, reason },
    });
  }
}

export class UnauthorizedOperationError extends AppError {
  constructor(action: string, actorRole: string, reason?: string) {
    super({
      message: `Unauthorized operation '${action}' for role '${actorRole}'.${reason ? ` ${reason}` : ""}`,
      code: ErrorCodes.FORBIDDEN,
      statusCode: 403,
      details: { action, actorRole, reason },
    });
  }
}

export class DepartmentScopeViolationError extends AppError {
  constructor(actorDeptId: string, resourceDeptId: string, message?: string) {
    super({
      message: message ?? `Actor department '${actorDeptId}' does not match complaint department '${resourceDeptId}'.`,
      code: ErrorCodes.FORBIDDEN,
      statusCode: 403,
      details: { actorDeptId, resourceDeptId },
    });
  }
}

export class ComplaintClosedError extends AppError {
  constructor(complaintId: string, attemptedOperation: string) {
    super({
      message: `Cannot execute operation '${attemptedOperation}' on complaint '${complaintId}' because it is in terminal CLOSED status (INV-003).`,
      code: ErrorCodes.STATE_TRANSITION_INVALID,
      statusCode: 409,
      details: { complaintId, attemptedOperation },
    });
  }
}

export class MissingResolutionSummaryError extends AppError {
  constructor(length: number, requiredLength: number) {
    super({
      message: `Resolution summary length of ${length} is insufficient. Minimum required length is ${requiredLength} characters (BR-015, chk_resolution_summary_len).`,
      code: ErrorCodes.VALIDATION_FAILED,
      statusCode: 400,
      details: { currentLength: length, requiredLength },
    });
  }
}

export class MissingRequiredProofError extends AppError {
  constructor(categoryId: string) {
    super({
      message: `Category '${categoryId}' mandates objective resolution proof (INV-006 / BR-007). At least one attachment of type 'RESOLUTION_PROOF' is required.`,
      code: ErrorCodes.PRECONDITION_FAILED,
      statusCode: 422,
      details: { categoryId },
    });
  }
}

export class SelfForwardingError extends AppError {
  constructor(departmentId: string) {
    super({
      message: `Cannot forward complaint to the same department '${departmentId}' (INV-002 / BR-010 / chk_forward_diff_dept).`,
      code: ErrorCodes.VALIDATION_FAILED,
      statusCode: 400,
      details: { departmentId },
    });
  }
}

export class AntiDeadlockLimitReachedError extends AppError {
  constructor(forwardCount: number) {
    super({
      message: `Anti-deadlock limit reached with ${forwardCount} transfers (EDGE-004 / INV-010). Direct forwarding is blocked; ticket is elevated to Management.`,
      code: ErrorCodes.CONFLICT,
      statusCode: 409,
      details: { forwardCount },
    });
  }
}

export class StaleVersionConflictError extends AppError {
  constructor(currentVersion: number, expectedVersion: number) {
    super({
      message: `Optimistic Concurrency Conflict: Expected complaint version ${expectedVersion}, but current database version is ${currentVersion} (INV-009 / NFR-004).`,
      code: ErrorCodes.CONFLICT,
      statusCode: 409,
      details: { currentVersion, expectedVersion },
    });
  }
}

export class IdempotencyConflictError extends AppError {
  constructor(key: string) {
    super({
      message: `A request with idempotency key '${key}' is currently in-flight or payload hash mismatch (INV-013 / NFR-003).`,
      code: ErrorCodes.CONFLICT,
      statusCode: 409,
      details: { idempotencyKey: key },
    });
  }
}

export class ReopenWindowExpiredError extends AppError {
  constructor(resolvedAt: string, windowDays: number) {
    super({
      message: `Reopen verification window of ${windowDays} business days has expired since resolution at ${resolvedAt} (BR-016 / OD-008).`,
      code: ErrorCodes.PRECONDITION_FAILED,
      statusCode: 422,
      details: { resolvedAt, windowDays },
    });
  }
}

export class ComplaintNotFoundError extends AppError {
  constructor(identifier: string) {
    super({
      message: `Complaint with identifier '${identifier}' was not found.`,
      code: ErrorCodes.NOT_FOUND,
      statusCode: 404,
      details: { identifier },
    });
  }
}

export class InvalidValueObjectError extends AppError {
  constructor(valueObjectName: string, reason: string) {
    super({
      message: `Invalid value for ${valueObjectName}: ${reason}`,
      code: ErrorCodes.VALIDATION_FAILED,
      statusCode: 400,
      details: { valueObjectName, reason },
    });
  }
}
