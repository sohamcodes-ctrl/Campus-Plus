import { Complaint } from "./Complaint";
import { ComplaintStatusType, canTransition, isTerminalStatus } from "./ComplaintStatus";
import {
  SelfForwardingError,
  ComplaintClosedError,
  InvalidStateTransitionError,
  MissingResolutionSummaryError,
  StaleVersionConflictError,
  DepartmentScopeViolationError,
  MissingRequiredProofError,
  UnauthorizedOperationError,
} from "./DomainErrors";
import { Result, ok, err } from "@/domain/common/Result";

export class BusinessInvariants {
  /**
   * INV-001: Single Primary Owning Department
   * A complaint must be bound to exactly one active department at all times.
   */
  public static validatePrimaryDepartment(complaint: Complaint): Result<void, Error> {
    if (!complaint.departmentId || !complaint.departmentId.toString()) {
      return err(new Error("INV-001 Violation: Complaint must possess an active primary owning department."));
    }
    return ok(undefined);
  }

  /**
   * INV-002: No Self-Forwarding
   * A complaint cannot be forwarded to its current owning department (chk_forward_diff_dept).
   */
  public static validateForwardingTarget(currentDeptId: string, targetDeptId: string): Result<void, SelfForwardingError> {
    if (currentDeptId.toLowerCase() === targetDeptId.toLowerCase()) {
      return err(new SelfForwardingError(currentDeptId));
    }
    return ok(undefined);
  }

  /**
   * INV-003: Terminal Closed State
   * A complaint in CLOSED status cannot undergo ordinary mutation.
   */
  public static validateNotClosed(complaint: Complaint, operation: string): Result<void, ComplaintClosedError> {
    if (isTerminalStatus(complaint.status)) {
      return err(new ComplaintClosedError(complaint.id.toString(), operation));
    }
    return ok(undefined);
  }

  /**
   * INV-004: State Transition Validity
   * Rejects any transition not explicitly permitted by the canonical 13-state FSM matrix.
   */
  public static validateTransition(from: ComplaintStatusType, to: ComplaintStatusType): Result<void, InvalidStateTransitionError> {
    if (!canTransition(from, to)) {
      return err(new InvalidStateTransitionError(from, to));
    }
    return ok(undefined);
  }

  /**
   * INV-005: Mandatory Resolution Summary
   * Transition to RESOLVED requires a non-empty summary >= 20 characters (BR-015 / chk_resolution_summary_len).
   */
  public static validateResolutionSummary(summary: string): Result<void, MissingResolutionSummaryError> {
    const trimmed = summary?.trim() ?? "";
    if (trimmed.length < 20) {
      return err(new MissingResolutionSummaryError(trimmed.length, 20));
    }
    return ok(undefined);
  }

  /**
   * INV-006: Category-Specific Resolution Proof Requirements
   * Requires proof attachments when category mandates it (BR-007 / FR-016).
   */
  public static validateResolutionProof(
    categoryId: string,
    proofCount: number,
    isMandated: boolean
  ): Result<void, MissingRequiredProofError> {
    if (isMandated && proofCount < 1) {
      return err(new MissingRequiredProofError(categoryId));
    }
    return ok(undefined);
  }

  /**
   * INV-007: Jurisdictional Assignment Scope
   * Handlers can only be assigned to complaints within their active department membership (BR-008 / BR-009).
   */
  public static validateHandlerJurisdiction(
    handlerDepartmentId: string,
    complaintDepartmentId: string
  ): Result<void, DepartmentScopeViolationError> {
    if (handlerDepartmentId.toLowerCase() !== complaintDepartmentId.toLowerCase()) {
      return err(
        new DepartmentScopeViolationError(
          handlerDepartmentId,
          complaintDepartmentId,
          `Handler from department '${handlerDepartmentId}' cannot be assigned to complaint in department '${complaintDepartmentId}' (INV-007).`
        )
      );
    }
    return ok(undefined);
  }

  /**
   * INV-009: Optimistic Concurrency Control
   * Stale version updates are rejected without silent overwrites (NFR-004 / ADR-003).
   */
  public static validateConcurrency(
    currentVersion: number,
    expectedVersion?: number
  ): Result<void, StaleVersionConflictError> {
    if (expectedVersion !== undefined && currentVersion !== expectedVersion) {
      return err(new StaleVersionConflictError(currentVersion, expectedVersion));
    }
    return ok(undefined);
  }

  /**
   * INV-010: Anti-Deadlock Escalation Trigger
   * When forwarding sequence reaches or exceeds threshold (3 transfers), circular forwarding triggers elevation to Management (EDGE-004).
   */
  public static isAntiDeadlockTriggered(forwardCount: number, threshold: number = 3): boolean {
    return forwardCount >= threshold;
  }

  /**
   * INV-011: Append-Only Audit Integrity
   * Every state-changing operation must emit an uncommitted domain event.
   */
  public static validateAuditEmission(eventCount: number): Result<void, Error> {
    if (eventCount < 1) {
      return err(new Error("INV-011 Violation: State mutation occurred without emitting an audit domain event."));
    }
    return ok(undefined);
  }

  /**
   * INV-012: Internal Notes Secrecy Boundary
   * Complainants (students/faculty) must never access internal notes (BR-020 / FR-011 / ADR-009).
   */
  public static validateInternalNoteAccess(
    isComplainant: boolean,
    isInternal: boolean
  ): Result<void, UnauthorizedOperationError> {
    if (isComplainant && isInternal) {
      return err(new UnauthorizedOperationError("VIEW_INTERNAL_NOTE", "ROLE_STUDENT", "Internal departmental notes are hidden from complainant (INV-012)."));
    }
    return ok(undefined);
  }
}

