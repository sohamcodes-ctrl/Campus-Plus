import { describe, it, expect } from "vitest";
import {
  AuthorizationPolicy,
  DomainOperation,
  ActorContext,
  ComplaintResourceContext,
  UserRole,
  ComplaintStatus,
  UnauthorizedOperationError,
  DepartmentScopeViolationError,
} from "@/domain/complaint";
import { Result } from "@/domain/common/Result";

function getError<T, E>(result: Result<T, E>): E {
  if (result.isFailure) return result.error;
  throw new Error("Expected Result to be a failure");
}

describe("Domain Authorization Engine Suite (INV-008 & Security Boundaries)", () => {
  const studentA: ActorContext = {
    userId: "11111111-1111-4111-8111-111111111111",
    role: UserRole.ROLE_STUDENT,
  };

  const studentB: ActorContext = {
    userId: "22222222-2222-4222-8222-222222222222",
    role: UserRole.ROLE_STUDENT,
  };

  const dept1 = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
  const dept2 = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";

  const handler1Dept1: ActorContext = {
    userId: "33333333-3333-4333-8333-333333333333",
    role: UserRole.ROLE_HANDLER,
    departmentId: dept1,
  };

  const handler2Dept1: ActorContext = {
    userId: "44444444-4444-4444-8444-444444444444",
    role: UserRole.ROLE_HANDLER,
    departmentId: dept1,
  };

  const headDept1: ActorContext = {
    userId: "55555555-5555-4555-8555-555555555555",
    role: UserRole.ROLE_DEPT_HEAD,
    departmentId: dept1,
  };

  const headDept2: ActorContext = {
    userId: "66666666-6666-4666-8666-666666666666",
    role: UserRole.ROLE_DEPT_HEAD,
    departmentId: dept2,
  };

  const adminActor: ActorContext = {
    userId: "77777777-7777-4777-8777-777777777777",
    role: UserRole.ROLE_ADMIN,
  };

  const managementActor: ActorContext = {
    userId: "88888888-8888-4888-8888-888888888888",
    role: UserRole.ROLE_MANAGEMENT,
  };

  const baseResource: ComplaintResourceContext = {
    complainantId: studentA.userId,
    departmentId: dept1,
    assignedHandlerId: handler1Dept1.userId,
    status: ComplaintStatus.ASSIGNED,
  };

  // ---------------------------------------------------------------------------
  // 1. Complainant (Student) Boundary & IDOR / BOLA Protections
  // ---------------------------------------------------------------------------
  describe("Complainant (Student) Authorization & Anti-BOLA/IDOR", () => {
    it("should allow student to submit a complaint", () => {
      const res = AuthorizationPolicy.canExecute(studentA, DomainOperation.SUBMIT, baseResource);
      expect(res.isSuccess).toBe(true);
    });

    it("should allow student to view their own complaint", () => {
      const res = AuthorizationPolicy.canExecute(studentA, DomainOperation.VIEW, baseResource);
      expect(res.isSuccess).toBe(true);
    });

    it("should reject student viewing another student's complaint (IDOR/BOLA)", () => {
      const res = AuthorizationPolicy.canExecute(studentB, DomainOperation.VIEW, baseResource);
      expect(res.isFailure).toBe(true);
      expect(getError(res)).toBeInstanceOf(UnauthorizedOperationError);
      expect((getError(res) as UnauthorizedOperationError).message).toContain("BOLA/IDOR");
    });

    it("should reject student attempting staff operations (review, assign, forward, resolve)", () => {
      const operations = [
        DomainOperation.REVIEW,
        DomainOperation.ASSIGN,
        DomainOperation.FORWARD,
        DomainOperation.RESOLVE,
        DomainOperation.REJECT,
      ];

      for (const op of operations) {
        const res = AuthorizationPolicy.canExecute(studentA, op, baseResource);
        expect(res.isFailure).toBe(true);
        expect(getError(res)).toBeInstanceOf(UnauthorizedOperationError);
      }
    });

    it("should allow complainant to cancel their own complaint in SUBMITTED status", () => {
      const submittedResource: ComplaintResourceContext = {
        ...baseResource,
        status: ComplaintStatus.SUBMITTED,
      };
      const res = AuthorizationPolicy.canExecute(studentA, DomainOperation.CANCEL, submittedResource);
      expect(res.isSuccess).toBe(true);
    });

    it("should reject complainant cancelling their own complaint once triaged/assigned", () => {
      const res = AuthorizationPolicy.canExecute(studentA, DomainOperation.CANCEL, baseResource);
      expect(res.isFailure).toBe(true);
      expect(getError(res)).toBeInstanceOf(UnauthorizedOperationError);
    });

    it("should reject another student cancelling a complaint", () => {
      const submittedResource: ComplaintResourceContext = {
        ...baseResource,
        status: ComplaintStatus.SUBMITTED,
      };
      const res = AuthorizationPolicy.canExecute(studentB, DomainOperation.CANCEL, submittedResource);
      expect(res.isFailure).toBe(true);
      expect(getError(res)).toBeInstanceOf(UnauthorizedOperationError);
    });

    it("should allow complainant to verify or dispute resolution when status is RESOLVED", () => {
      const resolvedResource: ComplaintResourceContext = {
        ...baseResource,
        status: ComplaintStatus.RESOLVED,
      };

      const verifyRes = AuthorizationPolicy.canExecute(studentA, DomainOperation.VERIFY_RESOLUTION, resolvedResource);
      expect(verifyRes.isSuccess).toBe(true);

      const disputeRes = AuthorizationPolicy.canExecute(studentA, DomainOperation.DISPUTE_REOPEN, resolvedResource);
      expect(disputeRes.isSuccess).toBe(true);
    });

    it("should reject complainant disputing resolution when status is NOT RESOLVED", () => {
      const res = AuthorizationPolicy.canExecute(studentA, DomainOperation.DISPUTE_REOPEN, baseResource);
      expect(res.isFailure).toBe(true);
      expect(getError(res)).toBeInstanceOf(UnauthorizedOperationError);
    });

    it("should reject non-complainant student verifying or disputing resolution", () => {
      const resolvedResource: ComplaintResourceContext = {
        ...baseResource,
        status: ComplaintStatus.RESOLVED,
      };

      const verifyRes = AuthorizationPolicy.canExecute(studentB, DomainOperation.VERIFY_RESOLUTION, resolvedResource);
      expect(verifyRes.isFailure).toBe(true);
      expect(getError(verifyRes)).toBeInstanceOf(UnauthorizedOperationError);

      const disputeRes = AuthorizationPolicy.canExecute(studentB, DomainOperation.DISPUTE_REOPEN, resolvedResource);
      expect(disputeRes.isFailure).toBe(true);
      expect(getError(disputeRes)).toBeInstanceOf(UnauthorizedOperationError);
    });
  });

  // ---------------------------------------------------------------------------
  // 2. Department Handler Boundaries
  // ---------------------------------------------------------------------------
  describe("Department Handler Authorization & Scope", () => {
    it("should allow handler to view complaints in their own department", () => {
      const res = AuthorizationPolicy.canExecute(handler1Dept1, DomainOperation.VIEW, baseResource);
      expect(res.isSuccess).toBe(true);
    });

    it("should reject handler accessing complaints in a different department", () => {
      const handlerDept2: ActorContext = {
        userId: "99999999-9999-4999-8999-999999999999",
        role: UserRole.ROLE_HANDLER,
        departmentId: dept2,
      };

      const res = AuthorizationPolicy.canExecute(handlerDept2, DomainOperation.VIEW, baseResource);
      expect(res.isFailure).toBe(true);
      expect(getError(res)).toBeInstanceOf(DepartmentScopeViolationError);
    });

    it("should allow assigned handler to start progress and resolve", () => {
      const startRes = AuthorizationPolicy.canExecute(handler1Dept1, DomainOperation.START_PROGRESS, baseResource);
      expect(startRes.isSuccess).toBe(true);

      const resolveRes = AuthorizationPolicy.canExecute(handler1Dept1, DomainOperation.RESOLVE, baseResource);
      expect(resolveRes.isSuccess).toBe(true);
    });

    it("should reject a non-assigned handler starting progress or resolving when assigned to another handler", () => {
      const startRes = AuthorizationPolicy.canExecute(handler2Dept1, DomainOperation.START_PROGRESS, baseResource);
      expect(startRes.isFailure).toBe(true);
      expect(getError(startRes)).toBeInstanceOf(UnauthorizedOperationError);

      const resolveRes = AuthorizationPolicy.canExecute(handler2Dept1, DomainOperation.RESOLVE, baseResource);
      expect(resolveRes.isFailure).toBe(true);
      expect(getError(resolveRes)).toBeInstanceOf(UnauthorizedOperationError);
    });

    it("should reject handler performing administrative operations (assign, reject, duplicate, close)", () => {
      const ops = [
        DomainOperation.ASSIGN,
        DomainOperation.REJECT,
        DomainOperation.MARK_DUPLICATE,
        DomainOperation.CLOSE,
      ];

      for (const op of ops) {
        const res = AuthorizationPolicy.canExecute(handler1Dept1, op, baseResource);
        expect(res.isFailure).toBe(true);
        expect(getError(res)).toBeInstanceOf(UnauthorizedOperationError);
      }
    });
  });

  // ---------------------------------------------------------------------------
  // 3. Department Head Boundaries
  // ---------------------------------------------------------------------------
  describe("Department Head Authorization & Departmental Boundary", () => {
    it("should allow department head full management operations on tickets within their department", () => {
      const headOps = [
        DomainOperation.VIEW,
        DomainOperation.REVIEW,
        DomainOperation.ASSIGN,
        DomainOperation.FORWARD,
        DomainOperation.ESCALATE,
        DomainOperation.RESOLVE,
        DomainOperation.REJECT,
        DomainOperation.MARK_DUPLICATE,
        DomainOperation.CLOSE,
      ];

      for (const op of headOps) {
        const res = AuthorizationPolicy.canExecute(headDept1, op, baseResource);
        expect(res.isSuccess).toBe(true);
      }
    });

    it("should reject department head attempting operations on tickets in a different department", () => {
      const res = AuthorizationPolicy.canExecute(headDept2, DomainOperation.REVIEW, baseResource);
      expect(res.isFailure).toBe(true);
      expect(getError(res)).toBeInstanceOf(DepartmentScopeViolationError);
    });
  });

  // ---------------------------------------------------------------------------
  // 4. Admin & Management Administrative Purview
  // ---------------------------------------------------------------------------
  describe("Admin & Management System-Wide Purview", () => {
    it("should permit Admin to perform any operation across any department", () => {
      const res = AuthorizationPolicy.canExecute(adminActor, DomainOperation.ASSIGN, baseResource);
      expect(res.isSuccess).toBe(true);

      const resolveRes = AuthorizationPolicy.canExecute(adminActor, DomainOperation.RESOLVE, baseResource);
      expect(resolveRes.isSuccess).toBe(true);
    });

    it("should permit Management to perform operations across any department", () => {
      const res = AuthorizationPolicy.canExecute(managementActor, DomainOperation.ESCALATE, baseResource);
      expect(res.isSuccess).toBe(true);
    });
  });
});
