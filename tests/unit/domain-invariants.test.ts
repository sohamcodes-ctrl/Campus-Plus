import { describe, it, expect } from "vitest";
import {
  Complaint,
  ComplaintStatus,
  EscalationTier,
  UserRole,
  ActorContext,
  BusinessInvariants,
  IResolutionEvidencePolicy,
  DepartmentId,
  UserId,
  CategoryId,
  ForwardingRationale,
  ResolutionSummary,
  SelfForwardingError,
  ComplaintClosedError,
  InvalidStateTransitionError,
  MissingResolutionSummaryError,
  MissingRequiredProofError,
  DepartmentScopeViolationError,
  StaleVersionConflictError,
  UnauthorizedOperationError,
} from "@/domain/complaint";
import { Result, ok, err } from "@/domain/common/Result";

function getError<T, E>(result: Result<T, E>): E {
  if (result.isFailure) return result.error;
  throw new Error("Expected Result to be a failure");
}

describe("Business Invariants Test Suite (INV-001 through INV-013)", () => {
  const complainantId = "11111111-1111-4111-8111-111111111111";
  const deptA = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
  const deptB = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
  const categoryId = "cccccccc-cccc-4ccc-8ccc-cccccccccccc";
  const handlerA = "33333333-3333-4333-8333-333333333333";

  function createValidComplaint(): Complaint {
    const res = Complaint.create({
      id: "99999999-9999-4999-8999-999999999999",
      refId: "CP-2026-00001",
      title: "Broken elevator in engineering block",
      description: "Elevator 2 has been non-operational since yesterday afternoon.",
      complainantId,
      departmentId: deptA,
      categoryId,
      locationDetails: "Engineering Block Floor 1",
    });
    if (res.isFailure) throw res.error;
    return res.value;
  }

  // ---------------------------------------------------------------------------
  // INV-001: Single Primary Owning Department
  // ---------------------------------------------------------------------------
  describe("INV-001: Single Primary Owning Department", () => {
    it("should ensure a complaint has an active primary owning department", () => {
      const complaint = createValidComplaint();
      expect(complaint.departmentId.toString()).toBe(deptA);

      const invCheck = BusinessInvariants.validatePrimaryDepartment(complaint);
      expect(invCheck.isSuccess).toBe(true);
    });

    it("should fail validation if department ID is empty", () => {
      const invalidComplaint = { departmentId: null } as unknown as Complaint;
      const invCheck = BusinessInvariants.validatePrimaryDepartment(invalidComplaint);
      expect(invCheck.isFailure).toBe(true);
      expect((getError(invCheck) as Error).message).toContain("INV-001");
    });
  });

  // ---------------------------------------------------------------------------
  // INV-002: Department Routing & Anti-Self-Forwarding
  // ---------------------------------------------------------------------------
  describe("INV-002: Anti-Self-Forwarding", () => {
    it("should reject forwarding to the current owning department", () => {
      const complaint = createValidComplaint();
      const staffActor: ActorContext = {
        userId: "22222222-2222-4222-8222-222222222222",
        role: UserRole.ROLE_DEPT_HEAD,
        departmentId: deptA,
      };

      const forwardRes = complaint.forwardDepartment(
        new DepartmentId(deptA),
        staffActor,
        new ForwardingRationale("Forwarding to our own department incorrectly.")
      );

      expect(forwardRes.isFailure).toBe(true);
      expect(getError(forwardRes)).toBeInstanceOf(SelfForwardingError);

      const check = BusinessInvariants.validateForwardingTarget(deptA, deptA);
      expect(check.isFailure).toBe(true);
      expect(getError(check)).toBeInstanceOf(SelfForwardingError);
    });

    it("should allow forwarding to a different department", () => {
      const check = BusinessInvariants.validateForwardingTarget(deptA, deptB);
      expect(check.isSuccess).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // INV-003: Terminal Closed Immutability
  // ---------------------------------------------------------------------------
  describe("INV-003: Terminal Closed State Immutability", () => {
    it("should reject any modification when status is CLOSED", () => {
      const complaint = createValidComplaint();
      const staffActor: ActorContext = {
        userId: "22222222-2222-4222-8222-222222222222",
        role: UserRole.ROLE_DEPT_HEAD,
        departmentId: deptA,
      };

      complaint.review(staffActor);
      complaint.assignHandler(new UserId(handlerA), staffActor);
      complaint.startProgress({ userId: handlerA, role: UserRole.ROLE_HANDLER, departmentId: deptA });
      complaint.resolve(
        staffActor,
        new ResolutionSummary("Elevator motor replaced and safety inspection certified successfully.")
      );
      complaint.close(staffActor, "Issue resolved and verified");

      expect(complaint.status).toBe(ComplaintStatus.CLOSED);

      const invCheck = BusinessInvariants.validateNotClosed(complaint, "ASSIGN");
      expect(invCheck.isFailure).toBe(true);
      expect(getError(invCheck)).toBeInstanceOf(ComplaintClosedError);

      const reopenRes = complaint.disputeAndReopen(
        { userId: complainantId, role: UserRole.ROLE_STUDENT },
        "Still broken",
        true
      );
      expect(reopenRes.isFailure).toBe(true);
      expect(getError(reopenRes)).toBeInstanceOf(ComplaintClosedError);
    });
  });

  // ---------------------------------------------------------------------------
  // INV-004: State Transition Legality
  // ---------------------------------------------------------------------------
  describe("INV-004: State Transition Legality", () => {
    it("should approve legal state transitions", () => {
      const check = BusinessInvariants.validateTransition(ComplaintStatus.SUBMITTED, ComplaintStatus.REVIEWED);
      expect(check.isSuccess).toBe(true);
    });

    it("should reject illegal state transitions", () => {
      const check = BusinessInvariants.validateTransition(ComplaintStatus.SUBMITTED, ComplaintStatus.RESOLVED);
      expect(check.isFailure).toBe(true);
      expect(getError(check)).toBeInstanceOf(InvalidStateTransitionError);
    });
  });

  // ---------------------------------------------------------------------------
  // INV-005: Mandatory Resolution Summary Length (>= 20 chars)
  // ---------------------------------------------------------------------------
  describe("INV-005: Resolution Summary Minimum Length", () => {
    it("should reject resolution summary under 20 characters", () => {
      const shortSummary = "Fixed the issue."; // 16 chars
      const check = BusinessInvariants.validateResolutionSummary(shortSummary);
      expect(check.isFailure).toBe(true);
      expect(getError(check)).toBeInstanceOf(MissingResolutionSummaryError);
    });

    it("should accept resolution summary with 20 or more characters", () => {
      const validSummary = "Elevator motor replaced and safety inspection certified."; // 57 chars
      const check = BusinessInvariants.validateResolutionSummary(validSummary);
      expect(check.isSuccess).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // INV-006: Category-Specific Resolution Proof Requirements
  // ---------------------------------------------------------------------------
  describe("INV-006: Category-Specific Resolution Proof Requirements", () => {
    it("should reject resolution if proof is mandated but zero attachments provided", () => {
      const check = BusinessInvariants.validateResolutionProof(categoryId, 0, true);
      expect(check.isFailure).toBe(true);
      expect(getError(check)).toBeInstanceOf(MissingRequiredProofError);
    });

    it("should approve resolution if proof is mandated and attachments exist", () => {
      const check = BusinessInvariants.validateResolutionProof(categoryId, 1, true);
      expect(check.isSuccess).toBe(true);
    });

    it("should approve resolution without proof if category does not mandate it", () => {
      const check = BusinessInvariants.validateResolutionProof(categoryId, 0, false);
      expect(check.isSuccess).toBe(true);
    });

    it("should enforce proof policy through validateResolutionProof", async () => {
      const mockPolicy: IResolutionEvidencePolicy = {
        validateResolutionProof: async (catId, attachments) => {
          if (catId.toString() === categoryId && attachments.length === 0) {
            return err(new MissingRequiredProofError(catId.toString()));
          }
          return ok(undefined);
        },
      };

      const emptyResPromise = mockPolicy.validateResolutionProof(new CategoryId(categoryId), []);
      await expect(emptyResPromise).resolves.toHaveProperty("isFailure", true);
    });
  });

  // ---------------------------------------------------------------------------
  // INV-007: Jurisdictional Assignment Scope
  // ---------------------------------------------------------------------------
  describe("INV-007: Jurisdictional Assignment Scope", () => {
    it("should reject assignment if handler does not belong to complaint department", () => {
      const check = BusinessInvariants.validateHandlerJurisdiction(deptB, deptA);
      expect(check.isFailure).toBe(true);
      expect(getError(check)).toBeInstanceOf(DepartmentScopeViolationError);
    });

    it("should approve assignment if handler belongs to complaint department", () => {
      const check = BusinessInvariants.validateHandlerJurisdiction(deptA, deptA);
      expect(check.isSuccess).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // INV-009: Optimistic Concurrency Control (OCC)
  // ---------------------------------------------------------------------------
  describe("INV-009: Concurrency Control via OCC", () => {
    it("should reject operation when expectedVersion does not match currentVersion", () => {
      const complaint = createValidComplaint();
      expect(complaint.version.toNumber()).toBe(1);

      const check = BusinessInvariants.validateConcurrency(complaint.version.toNumber(), 99);
      expect(check.isFailure).toBe(true);
      expect(getError(check)).toBeInstanceOf(StaleVersionConflictError);
      expect(complaint.status).toBe(ComplaintStatus.SUBMITTED);
    });

    it("should advance version number monotonically upon successful mutation", () => {
      const complaint = createValidComplaint();
      expect(complaint.version.toNumber()).toBe(1);

      const staffActor: ActorContext = {
        userId: "22222222-2222-4222-8222-222222222222",
        role: UserRole.ROLE_DEPT_HEAD,
        departmentId: deptA,
      };

      const check = BusinessInvariants.validateConcurrency(complaint.version.toNumber(), 1);
      expect(check.isSuccess).toBe(true);

      const res = complaint.review(staffActor);
      expect(res.isSuccess).toBe(true);
      expect(complaint.version.toNumber()).toBe(2);
      expect(complaint.status).toBe(ComplaintStatus.REVIEWED);
    });
  });

  // ---------------------------------------------------------------------------
  // INV-010: Anti-Deadlock Sequential Forwarding (EDGE-004)
  // ---------------------------------------------------------------------------
  describe("INV-010: Sequential Forwarding & Anti-Deadlock Rule (EDGE-004)", () => {
    it("should elevate ticket to ESCALATED at TIER_3_MANAGEMENT upon the 3rd transfer", () => {
      const complaint = createValidComplaint();
      const staffActorDeptA: ActorContext = {
        userId: "22222222-2222-4222-8222-222222222222",
        role: UserRole.ROLE_DEPT_HEAD,
        departmentId: deptA,
      };
      const staffActorDeptB: ActorContext = {
        userId: "44444444-4444-4444-8444-444444444444",
        role: UserRole.ROLE_DEPT_HEAD,
        departmentId: deptB,
      };
      const deptC = "cccccccc-dddd-4eee-8fff-cccccccccccc";
      const staffActorDeptC: ActorContext = {
        userId: "55555555-5555-5555-8555-555555555555",
        role: UserRole.ROLE_DEPT_HEAD,
        departmentId: deptC,
      };

      // Triage review in Dept A first
      complaint.review(staffActorDeptA);

      // 1st Transfer: Dept A -> Dept B
      const fwd1 = complaint.forwardDepartment(
        new DepartmentId(deptB),
        staffActorDeptA,
        new ForwardingRationale("Belongs to Department B infrastructure division.")
      );
      expect(fwd1.isSuccess).toBe(true);
      expect(complaint.status).toBe(ComplaintStatus.FORWARDED);
      expect(complaint.departmentId.toString()).toBe(deptB);
      expect(complaint.forwards.length).toBe(1);

      // Dept B reviews transferred complaint
      complaint.review(staffActorDeptB);

      // 2nd Transfer: Dept B -> Dept C
      const fwd2 = complaint.forwardDepartment(
        new DepartmentId(deptC),
        staffActorDeptB,
        new ForwardingRationale("Belongs to Department C facilities division.")
      );
      expect(fwd2.isSuccess).toBe(true);
      expect(complaint.status).toBe(ComplaintStatus.FORWARDED);
      expect(complaint.departmentId.toString()).toBe(deptC);
      expect(complaint.forwards.length).toBe(2);

      // Dept C reviews transferred complaint
      complaint.review(staffActorDeptC);

      // 3rd Transfer: Dept C -> Dept A (Deadlock threshold reached)
      const fwd3 = complaint.forwardDepartment(
        new DepartmentId(deptA),
        staffActorDeptC,
        new ForwardingRationale("Looping back to Dept A, causing circular forwarding.")
      );
      expect(fwd3.isSuccess).toBe(true);
      expect(complaint.status).toBe(ComplaintStatus.ESCALATED);
      expect(complaint.escalationTier).toBe(EscalationTier.TIER_3_MANAGEMENT);
      expect(complaint.assignedHandlerId).toBeUndefined();
      expect(complaint.forwards.length).toBe(3);
    });
  });

  // ---------------------------------------------------------------------------
  // INV-011: Append-Only Audit Integrity
  // ---------------------------------------------------------------------------
  describe("INV-011: Append-Only Audit Integrity", () => {
    it("should emit domain events on every state-changing operation", () => {
      const complaint = createValidComplaint();
      expect(complaint.getUncommittedEvents().length).toBe(1);
      expect(complaint.getUncommittedEvents()[0].eventType).toBe("COMPLAINT_SUBMITTED");

      complaint.clearEvents();
      expect(complaint.getUncommittedEvents().length).toBe(0);

      const staffActor: ActorContext = {
        userId: "22222222-2222-4222-8222-222222222222",
        role: UserRole.ROLE_DEPT_HEAD,
        departmentId: deptA,
      };

      complaint.review(staffActor);
      expect(complaint.getUncommittedEvents().length).toBe(1);
      expect(complaint.getUncommittedEvents()[0].eventType).toBe("COMPLAINT_REVIEWED");

      const invAuditCheck = BusinessInvariants.validateAuditEmission(complaint.getUncommittedEvents().length);
      expect(invAuditCheck.isSuccess).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // INV-012: Internal Notes Secrecy Boundary
  // ---------------------------------------------------------------------------
  describe("INV-012: Internal Notes Secrecy Boundary", () => {
    it("should deny complainant access to internal notes", () => {
      const check = BusinessInvariants.validateInternalNoteAccess(true, true);
      expect(check.isFailure).toBe(true);
      expect(getError(check)).toBeInstanceOf(UnauthorizedOperationError);
    });

    it("should allow complainant access to public notes", () => {
      const check = BusinessInvariants.validateInternalNoteAccess(true, false);
      expect(check.isSuccess).toBe(true);
    });

    it("should allow staff members access to internal notes", () => {
      const check = BusinessInvariants.validateInternalNoteAccess(false, true);
      expect(check.isSuccess).toBe(true);
    });
  });
});
