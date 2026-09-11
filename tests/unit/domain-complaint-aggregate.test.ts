import { describe, it, expect } from "vitest";
import {
  Complaint,
  ComplaintStatus,
  ComplaintPriority,
  EscalationTier,
  UserRole,
  ActorContext,
  UserId,
  DepartmentId,
  ResolutionSummary,
  ForwardingRationale,
  ComplaintClosedError,
  SelfForwardingError,
  ReopenWindowExpiredError,
  InvalidValueObjectError,
} from "@/domain/complaint";
import { Result } from "@/domain/common/Result";

function getError<T, E>(result: Result<T, E>): E {
  if (result.isFailure) return result.error;
  throw new Error("Expected Result to be a failure");
}

describe("Complaint Aggregate Root & Lifecycle Suite", () => {
  const studentActor: ActorContext = {
    userId: "11111111-1111-4111-8111-111111111111",
    role: UserRole.ROLE_STUDENT,
  };

  const deptHeadActor: ActorContext = {
    userId: "22222222-2222-4222-8222-222222222222",
    role: UserRole.ROLE_DEPT_HEAD,
    departmentId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  };

  const handlerActor: ActorContext = {
    userId: "33333333-3333-4333-8333-333333333333",
    role: UserRole.ROLE_HANDLER,
    departmentId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
  };

  const alternateDeptHeadActor: ActorContext = {
    userId: "44444444-4444-4444-8444-444444444444",
    role: UserRole.ROLE_DEPT_HEAD,
    departmentId: "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",
  };

  function createValidComplaint(): Complaint {
    const res = Complaint.create({
      id: "99999999-9999-4999-8999-999999999999",
      refId: "CP-2026-00001",
      title: "Broken window in library reading hall",
      description: "Window glass cracked heavily and presents immediate hazard to reading hall patrons.",
      complainantId: studentActor.userId,
      departmentId: deptHeadActor.departmentId!,
      categoryId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
      locationDetails: "Library 2nd floor East Wing",
    });

    if (res.isFailure) {
      throw res.error;
    }
    return res.value;
  }

  describe("Creation & Initial Invariants", () => {
    it("should instantiate complaint with SUBMITTED status and version 1", () => {
      const complaint = createValidComplaint();

      expect(complaint.id.toString()).toBe("99999999-9999-4999-8999-999999999999");
      expect(complaint.refId.toString()).toBe("CP-2026-00001");
      expect(complaint.status).toBe(ComplaintStatus.SUBMITTED);
      expect(complaint.version.toNumber()).toBe(1);
      expect(complaint.suggestedPriority.toString()).toBe(ComplaintPriority.MEDIUM);
      expect(complaint.officialPriority.toString()).toBe(ComplaintPriority.MEDIUM);
      expect(complaint.isEscalated).toBe(false);
      expect(complaint.assignedHandlerId).toBeUndefined();

      // Check uncommitted event
      const events = complaint.getUncommittedEvents();
      expect(events.length).toBe(1);
      expect(events[0].eventType).toBe("COMPLAINT_SUBMITTED");
    });

    it("should reject invalid title length (< 10 or > 120 chars)", () => {
      const res = Complaint.create({
        refId: "CP-2026-00002",
        title: "Short",
        description: "Valid description explaining the grievance with plenty of detail.",
        complainantId: studentActor.userId,
        departmentId: deptHeadActor.departmentId!,
        categoryId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
        locationDetails: "Room 101",
      });
      expect(res.isFailure).toBe(true);
      expect(getError(res)).toBeInstanceOf(InvalidValueObjectError);
    });

    it("should reject invalid description length (< 30 chars)", () => {
      const res = Complaint.create({
        refId: "CP-2026-00002",
        title: "Valid title here",
        description: "Too short",
        complainantId: studentActor.userId,
        departmentId: deptHeadActor.departmentId!,
        categoryId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
        locationDetails: "Room 101",
      });
      expect(res.isFailure).toBe(true);
      expect(getError(res)).toBeInstanceOf(InvalidValueObjectError);
    });
  });

  describe("Triage Review & Assignment Progression", () => {
    it("should allow Department Head to review complaint", () => {
      const complaint = createValidComplaint();
      const res = complaint.review(deptHeadActor);

      expect(res.isSuccess).toBe(true);
      expect(complaint.status).toBe(ComplaintStatus.REVIEWED);
      expect(complaint.version.toNumber()).toBe(2);
    });

    it("should allow assigning handler and recording assignment tenure", () => {
      const complaint = createValidComplaint();
      complaint.review(deptHeadActor);

      const handlerId = new UserId(handlerActor.userId);
      const res = complaint.assignHandler(handlerId, deptHeadActor, "Routine electrical work");

      expect(res.isSuccess).toBe(true);
      expect(complaint.status).toBe(ComplaintStatus.ASSIGNED);
      expect(complaint.assignedHandlerId?.toString()).toBe(handlerActor.userId);
      expect(complaint.assignments.length).toBe(1);
      expect(complaint.assignments[0].isCurrent).toBe(true);
      expect(complaint.version.toNumber()).toBe(3);
    });

    it("should end prior assignment when reassigning within the same department", () => {
      const complaint = createValidComplaint();
      complaint.review(deptHeadActor);
      const handlerId1 = new UserId(handlerActor.userId);
      complaint.assignHandler(handlerId1, deptHeadActor, "First handler");

      const handlerId2 = new UserId("55555555-5555-4555-8555-555555555555");
      complaint.assignHandler(handlerId2, deptHeadActor, "Reassigned to specialist");

      expect(complaint.assignments.length).toBe(2);
      expect(complaint.assignments[0].isCurrent).toBe(false);
      expect(complaint.assignments[0].unassignedAt).toBeDefined();
      expect(complaint.assignments[1].isCurrent).toBe(true);
      expect(complaint.assignedHandlerId?.toString()).toBe("55555555-5555-4555-8555-555555555555");
    });

    it("should allow assigned handler to start progress", () => {
      const complaint = createValidComplaint();
      complaint.review(deptHeadActor);
      complaint.assignHandler(new UserId(handlerActor.userId), deptHeadActor);

      const res = complaint.startProgress(handlerActor);
      expect(res.isSuccess).toBe(true);
      expect(complaint.status).toBe(ComplaintStatus.IN_PROGRESS);
    });
  });

  describe("Forwarding & Anti-Deadlock (EDGE-004 / INV-010)", () => {
    it("should reject self-forwarding to the same department (INV-002)", () => {
      const complaint = createValidComplaint();
      complaint.review(deptHeadActor);

      const sameDeptId = new DepartmentId(deptHeadActor.departmentId!);
      const rationale = new ForwardingRationale("Transferring to same department is invalid");
      const res = complaint.forwardDepartment(sameDeptId, deptHeadActor, rationale);

      expect(res.isFailure).toBe(true);
      expect(getError(res)).toBeInstanceOf(SelfForwardingError);
    });

    it("should forward complaint across departments and clear assigned handler", () => {
      const complaint = createValidComplaint();
      complaint.review(deptHeadActor);
      complaint.assignHandler(new UserId(handlerActor.userId), deptHeadActor);

      const targetDeptId = new DepartmentId(alternateDeptHeadActor.departmentId!);
      const rationale = new ForwardingRationale("Issue belongs to hostel department maintenance wing");
      const res = complaint.forwardDepartment(targetDeptId, deptHeadActor, rationale);

      expect(res.isSuccess).toBe(true);
      expect(complaint.status).toBe(ComplaintStatus.FORWARDED);
      expect(complaint.departmentId.toString()).toBe(alternateDeptHeadActor.departmentId);
      expect(complaint.assignedHandlerId).toBeUndefined();
      expect(complaint.forwards.length).toBe(1);
      expect(complaint.forwards[0].forwardSequence).toBe(1);
    });

    it("should trigger automatic anti-deadlock escalation on 3rd transfer (EDGE-004)", () => {
      const complaint = createValidComplaint();
      const deptA = new DepartmentId(deptHeadActor.departmentId!);
      const deptB = new DepartmentId(alternateDeptHeadActor.departmentId!);

      // 1st transfer: A -> B
      complaint.review(deptHeadActor);
      complaint.forwardDepartment(deptB, deptHeadActor, new ForwardingRationale("Transfer 1: Needs Hostel inspection"));
      expect(complaint.status).toBe(ComplaintStatus.FORWARDED);

      // 2nd transfer: B -> A
      complaint.review(alternateDeptHeadActor);
      complaint.forwardDepartment(deptA, alternateDeptHeadActor, new ForwardingRationale("Transfer 2: Disputed, belongs to IT"));
      expect(complaint.status).toBe(ComplaintStatus.FORWARDED);

      // 3rd transfer: A -> B (Triggers EDGE-004 anti-deadlock)
      complaint.review(deptHeadActor);
      complaint.forwardDepartment(deptB, deptHeadActor, new ForwardingRationale("Transfer 3: Disputed again by IT"));

      expect(complaint.status).toBe(ComplaintStatus.ESCALATED);
      expect(complaint.escalationTier).toBe(EscalationTier.TIER_3_MANAGEMENT);
      expect(complaint.isEscalated).toBe(true);
      expect(complaint.assignedHandlerId).toBeUndefined();
      expect(complaint.escalations.length).toBe(1);
      expect(complaint.escalations[0].isAutomated).toBe(true);
      expect(complaint.escalations[0].toTier).toBe(EscalationTier.TIER_3_MANAGEMENT);
    });
  });

  describe("Resolution & Verification Lifecycle", () => {
    it("should reject resolution summary less than 20 characters (INV-005)", () => {
      expect(() => new ResolutionSummary("Fixed.")).toThrow(InvalidValueObjectError);
    });

    it("should successfully resolve with compliant summary >= 20 characters", () => {
      const complaint = createValidComplaint();
      complaint.review(deptHeadActor);
      complaint.assignHandler(new UserId(handlerActor.userId), deptHeadActor);
      complaint.startProgress(handlerActor);

      const summary = new ResolutionSummary("Replaced faulty switch port 12 on distribution rack in East Wing.");
      const res = complaint.resolve(handlerActor, summary);

      expect(res.isSuccess).toBe(true);
      expect(complaint.status).toBe(ComplaintStatus.RESOLVED);
      expect(complaint.resolvedAt).toBeDefined();
      expect(complaint.resolution?.summary).toBe(summary.toString());
    });

    it("should allow complainant to verify resolution and transition to CLOSED", () => {
      const complaint = createValidComplaint();
      complaint.review(deptHeadActor);
      complaint.assignHandler(new UserId(handlerActor.userId), deptHeadActor);
      complaint.startProgress(handlerActor);
      complaint.resolve(handlerActor, new ResolutionSummary("Replaced faulty switch port 12 on distribution rack in East Wing."));

      const verifyRes = complaint.verifyResolution(studentActor);
      expect(verifyRes.isSuccess).toBe(true);
      expect(complaint.status).toBe(ComplaintStatus.CLOSED);
      expect(complaint.closedAt).toBeDefined();
      expect(complaint.resolution?.studentVerified).toBe(true);
    });

    it("should allow complainant to dispute resolution and reopen if eligible", () => {
      const complaint = createValidComplaint();
      complaint.review(deptHeadActor);
      complaint.assignHandler(new UserId(handlerActor.userId), deptHeadActor);
      complaint.startProgress(handlerActor);
      complaint.resolve(handlerActor, new ResolutionSummary("Replaced faulty switch port 12 on distribution rack in East Wing."));

      const disputeRes = complaint.disputeAndReopen(studentActor, "Wi-Fi still dropping every 5 minutes in reading hall.", true);
      expect(disputeRes.isSuccess).toBe(true);
      expect(complaint.status).toBe(ComplaintStatus.REOPENED);
      expect(complaint.resolution?.studentVerified).toBe(false);
      expect(complaint.resolution?.disputeReason).toContain("Wi-Fi still dropping");
    });

    it("should reject dispute if reopen policy determines verification window has expired", () => {
      const complaint = createValidComplaint();
      complaint.review(deptHeadActor);
      complaint.assignHandler(new UserId(handlerActor.userId), deptHeadActor);
      complaint.startProgress(handlerActor);
      complaint.resolve(handlerActor, new ResolutionSummary("Replaced faulty switch port 12 on distribution rack in East Wing."));

      const disputeRes = complaint.disputeAndReopen(studentActor, "Late dispute attempt", false);
      expect(disputeRes.isFailure).toBe(true);
      expect(getError(disputeRes)).toBeInstanceOf(ReopenWindowExpiredError);
    });
  });

  describe("Terminal CLOSED State Protection (INV-003)", () => {
    it("should reject all ordinary mutations on CLOSED complaint", () => {
      const complaint = createValidComplaint();
      complaint.review(deptHeadActor);
      complaint.assignHandler(new UserId(handlerActor.userId), deptHeadActor);
      complaint.startProgress(handlerActor);
      complaint.resolve(handlerActor, new ResolutionSummary("Replaced faulty switch port 12 on distribution rack in East Wing."));
      complaint.verifyResolution(studentActor);

      expect(complaint.status).toBe(ComplaintStatus.CLOSED);

      // Attempt ordinary operations
      const reviewRes = complaint.review(deptHeadActor);
      expect(reviewRes.isFailure).toBe(true);
      expect(getError(reviewRes)).toBeInstanceOf(ComplaintClosedError);

      const assignRes = complaint.assignHandler(new UserId(handlerActor.userId), deptHeadActor);
      expect(assignRes.isFailure).toBe(true);
      expect(getError(assignRes)).toBeInstanceOf(ComplaintClosedError);

      const forwardRes = complaint.forwardDepartment(
        new DepartmentId(alternateDeptHeadActor.departmentId!),
        deptHeadActor,
        new ForwardingRationale("Attempting forward on closed complaint")
      );
      expect(forwardRes.isFailure).toBe(true);
      expect(getError(forwardRes)).toBeInstanceOf(ComplaintClosedError);

      const escalateRes = complaint.manualEscalate(deptHeadActor, EscalationTier.TIER_2_DEPARTMENT_HEAD, "Escalate closed");
      expect(escalateRes.isFailure).toBe(true);
      expect(getError(escalateRes)).toBeInstanceOf(ComplaintClosedError);
    });
  });
});
