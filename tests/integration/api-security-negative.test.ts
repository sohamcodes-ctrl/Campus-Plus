import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { resetTestDatabase } from "@/infrastructure/database/pool";
import { resetContainer } from "@/infrastructure/container";
import { POST as submitComplaintHandler } from "@/app/api/v1/complaints/route";
import { GET as getComplaintHandler } from "@/app/api/v1/complaints/[id]/route";
import { GET as getTimelineHandler } from "@/app/api/v1/complaints/[id]/timeline/route";
import { POST as reviewHandler } from "@/app/api/v1/complaints/[id]/review/route";
import { POST as assignHandler } from "@/app/api/v1/complaints/[id]/assign/route";
import { POST as resolveHandler } from "@/app/api/v1/complaints/[id]/resolve/route";
import { POST as escalateHandler } from "@/app/api/v1/complaints/[id]/escalate/route";
import { POST as cancelHandler } from "@/app/api/v1/complaints/[id]/cancel/route";

const FIXTURES = {
  studentA: "00000000-0000-0000-0000-000000001001",
  studentB: "00000000-0000-0000-0000-000000001002",
  itHandler: "00000000-0000-0000-0000-000000001003",
  hostelHandler: "00000000-0000-0000-0000-000000001004",
  deptIt: "00000000-0000-0000-0000-000000000010",
  categoryWifi: "00000000-0000-0000-0000-000000000101",
  existingComplaintId: "00000000-0000-0000-0000-000000002001", // Owned by Student A, Dept IT
};

describe("Phase 06 API Security & Negative Attack Suites", () => {
  beforeEach(async () => {
    resetContainer();
    await resetTestDatabase();
  });

  describe("BOLA / IDOR Access Control Vectors", () => {
    it("rejects unauthorized student B from viewing student A's complaint with 403", async () => {
      const req = new NextRequest(`http://localhost/api/v1/complaints/${FIXTURES.existingComplaintId}`, {
        method: "GET",
        headers: {
          "x-actor-id": FIXTURES.studentB, // Student B attempting to view Student A's ticket
        },
      });

      const res = await getComplaintHandler(req, {
        params: Promise.resolve({ id: FIXTURES.existingComplaintId }),
      });

      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("FORBIDDEN");
    });

    it("rejects unauthorized student B from viewing student A's timeline with 403", async () => {
      const req = new NextRequest(`http://localhost/api/v1/complaints/${FIXTURES.existingComplaintId}/timeline`, {
        method: "GET",
        headers: {
          "x-actor-id": FIXTURES.studentB,
        },
      });

      const res = await getTimelineHandler(req, {
        params: Promise.resolve({ id: FIXTURES.existingComplaintId }),
      });

      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("FORBIDDEN");
    });

    it("rejects student B from cancelling student A's complaint with 403", async () => {
      const req = new NextRequest(`http://localhost/api/v1/complaints/${FIXTURES.existingComplaintId}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-actor-id": FIXTURES.studentB,
        },
        body: JSON.stringify({
          reason: "Malicious cancellation attempt by another student",
        }),
      });

      const res = await cancelHandler(req, {
        params: Promise.resolve({ id: FIXTURES.existingComplaintId }),
      });

      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("FORBIDDEN");
    });
  });

  describe("Vertical Privilege Escalation Vectors", () => {
    it("rejects student attempting to invoke review endpoint with 403", async () => {
      const req = new NextRequest(`http://localhost/api/v1/complaints/${FIXTURES.existingComplaintId}/review`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-actor-id": FIXTURES.studentA,
        },
        body: JSON.stringify({}),
      });

      const res = await reviewHandler(req, {
        params: Promise.resolve({ id: FIXTURES.existingComplaintId }),
      });

      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("FORBIDDEN");
    });

    it("rejects student attempting to assign handler with 403", async () => {
      const req = new NextRequest(`http://localhost/api/v1/complaints/${FIXTURES.existingComplaintId}/assign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-actor-id": FIXTURES.studentA,
        },
        body: JSON.stringify({
          handlerId: FIXTURES.itHandler,
        }),
      });

      const res = await assignHandler(req, {
        params: Promise.resolve({ id: FIXTURES.existingComplaintId }),
      });

      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("FORBIDDEN");
    });

    it("rejects student attempting to resolve complaint with 403", async () => {
      const req = new NextRequest(`http://localhost/api/v1/complaints/${FIXTURES.existingComplaintId}/resolve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-actor-id": FIXTURES.studentA,
        },
        body: JSON.stringify({
          resolutionSummary: "Attempting student self-resolution without authorization",
        }),
      });

      const res = await resolveHandler(req, {
        params: Promise.resolve({ id: FIXTURES.existingComplaintId }),
      });

      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("FORBIDDEN");
    });

    it("rejects student attempting to escalate complaint with 403", async () => {
      const req = new NextRequest(`http://localhost/api/v1/complaints/${FIXTURES.existingComplaintId}/escalate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-actor-id": FIXTURES.studentA,
        },
        body: JSON.stringify({
          targetTier: "TIER_2_DEPARTMENT_HEAD",
          reason: "Direct student escalation bypass attempt",
        }),
      });

      const res = await escalateHandler(req, {
        params: Promise.resolve({ id: FIXTURES.existingComplaintId }),
      });

      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("FORBIDDEN");
    });
  });

  describe("Horizontal Cross-Department Privilege Escalation", () => {
    it("rejects Hostel Handler from assigning an IT Department complaint with 403", async () => {
      const req = new NextRequest(`http://localhost/api/v1/complaints/${FIXTURES.existingComplaintId}/assign`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-actor-id": FIXTURES.hostelHandler, // Hostel Staff attempting action on IT ticket
        },
        body: JSON.stringify({
          handlerId: FIXTURES.hostelHandler,
        }),
      });

      const res = await assignHandler(req, {
        params: Promise.resolve({ id: FIXTURES.existingComplaintId }),
      });

      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("FORBIDDEN");
    });

    it("rejects Hostel Handler from resolving an IT Department complaint with 403", async () => {
      const req = new NextRequest(`http://localhost/api/v1/complaints/${FIXTURES.existingComplaintId}/resolve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-actor-id": FIXTURES.hostelHandler,
        },
        body: JSON.stringify({
          resolutionSummary: "Cross department unauthorized resolution attempt",
        }),
      });

      const res = await resolveHandler(req, {
        params: Promise.resolve({ id: FIXTURES.existingComplaintId }),
      });

      expect(res.status).toBe(403);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("FORBIDDEN");
    });
  });

  describe("Mass-Assignment & Schema Poisoning Attacks", () => {
    it("rejects submission payload containing unauthorized system fields with 400", async () => {
      const req = new NextRequest("http://localhost/api/v1/complaints", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-actor-id": FIXTURES.studentA,
        },
        body: JSON.stringify({
          title: "Legitimate Title But Containing Injected Fields",
          description: "Adequate description length exceeding thirty characters requirement.",
          departmentId: FIXTURES.deptIt,
          categoryId: FIXTURES.categoryWifi,
          locationDetails: "Room 101",
          // Poisoned / injected properties
          status: "CLOSED",
          escalationTier: "TIER_3_MANAGEMENT",
          officialPriority: "URGENT",
          isEscalated: true,
          version: 100,
        }),
      });

      const res = await submitComplaintHandler(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("VALIDATION_FAILED");
    });
  });
});
