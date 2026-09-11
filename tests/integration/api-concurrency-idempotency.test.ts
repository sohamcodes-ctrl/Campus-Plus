import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { resetTestDatabase, getDatabaseClient } from "@/infrastructure/database/pool";
import { resetContainer } from "@/infrastructure/container";
import { POST as submitComplaintHandler } from "@/app/api/v1/complaints/route";
import { POST as resolveHandler } from "@/app/api/v1/complaints/[id]/resolve/route";

const FIXTURES = {
  studentA: "00000000-0000-0000-0000-000000001001",
  itHandler: "00000000-0000-0000-0000-000000001003",
  deptIt: "00000000-0000-0000-0000-000000000010",
  categoryWifi: "00000000-0000-0000-0000-000000000101",
  existingComplaintId: "00000000-0000-0000-0000-000000002001", // Version: 2, Status: IN_PROGRESS
};

describe("Phase 06 API Concurrency & Idempotency Integration Suite", () => {
  beforeEach(async () => {
    resetContainer();
    await resetTestDatabase();
  });

  describe("Optimistic Concurrency Control (OCC) Protection", () => {
    it("rejects state transition when stale expectedVersion is supplied with 409 Conflict", async () => {
      // Existing complaint is at version 2. Attempting mutation with expectedVersion: 1 must fail with 409.
      const req = new NextRequest(`http://localhost/api/v1/complaints/${FIXTURES.existingComplaintId}/resolve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-actor-id": FIXTURES.itHandler,
        },
        body: JSON.stringify({
          resolutionSummary: "Replaced faulty wireless access point and verified SNR.",
          expectedVersion: 1, // Stale version! Actual is 2
        }),
      });

      const res = await resolveHandler(req, {
        params: Promise.resolve({ id: FIXTURES.existingComplaintId }),
      });

      expect(res.status).toBe(409);
      const json = await res.json();
      expect(json.success).toBe(false);
      expect(json.error.code).toBe("CONFLICT");
      expect(json.error.details.currentVersion).toBe(2);
      expect(json.error.details.expectedVersion).toBe(1);
    });

    it("accepts state transition when correct expectedVersion is supplied and updates version", async () => {
      // Existing complaint is at version 2. Supplying expectedVersion: 2 must succeed.
      const req = new NextRequest(`http://localhost/api/v1/complaints/${FIXTURES.existingComplaintId}/resolve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-actor-id": FIXTURES.itHandler,
        },
        body: JSON.stringify({
          resolutionSummary: "Replaced faulty wireless access point and verified SNR.",
          expectedVersion: 2, // Correct version
        }),
      });

      const res = await resolveHandler(req, {
        params: Promise.resolve({ id: FIXTURES.existingComplaintId }),
      });

      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);

      // Verify version in database has incremented to 3
      const db = await getDatabaseClient();
      const dbRes = await db.query<{ version: number; status: string }>(
        "SELECT version, status FROM complaints WHERE id = $1;",
        [FIXTURES.existingComplaintId]
      );
      expect(dbRes.rows[0].version).toBe(3);
      expect(dbRes.rows[0].status).toBe("RESOLVED");
    });
  });

  describe("Persistent Idempotency Boundary (BR-004)", () => {
    it("replays identical request without re-executing or creating duplicate records", async () => {
      const idempotencyKey = "idemp-unique-key-999";
      const payload = {
        title: "Intermittent packet loss on gateway switch",
        description: "Severe packet drops observed during high throughput laboratory experiments.",
        departmentId: FIXTURES.deptIt,
        categoryId: FIXTURES.categoryWifi,
        locationDetails: "Server Room B",
      };

      // 1. Initial Submission
      const req1 = new NextRequest("http://localhost/api/v1/complaints", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-actor-id": FIXTURES.studentA,
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify(payload),
      });

      const res1 = await submitComplaintHandler(req1);
      expect(res1.status).toBe(201);
      const json1 = await res1.json();
      const firstComplaintId = json1.data.complaintId;
      const firstTrackingCode = json1.data.trackingCode;

      // 2. Replay with identical payload and same key
      const req2 = new NextRequest("http://localhost/api/v1/complaints", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-actor-id": FIXTURES.studentA,
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify(payload),
      });

      const res2 = await submitComplaintHandler(req2);
      expect(res2.status).toBe(201);
      const json2 = await res2.json();
      expect(json2.data.complaintId).toBe(firstComplaintId);
      expect(json2.data.trackingCode).toBe(firstTrackingCode);

      // 3. Verify exactly one database record exists
      const db = await getDatabaseClient();
      const countRes = await db.query<{ count: string }>(
        "SELECT count(*) as count FROM complaints WHERE title = $1;",
        [payload.title]
      );
      expect(parseInt(countRes.rows[0].count, 10)).toBe(1);
    });

    it("rejects request reusing same idempotency key with altered payload with 409 Conflict", async () => {
      const idempotencyKey = "idemp-unique-key-mismatch-888";
      const initialPayload = {
        title: "Router overheating in telecommunications closet",
        description: "Elevated temperature alarms triggering continuously in closet rack.",
        departmentId: FIXTURES.deptIt,
        categoryId: FIXTURES.categoryWifi,
        locationDetails: "Closet 1",
      };

      // 1. Initial Submission
      const req1 = new NextRequest("http://localhost/api/v1/complaints", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-actor-id": FIXTURES.studentA,
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify(initialPayload),
      });

      const res1 = await submitComplaintHandler(req1);
      expect(res1.status).toBe(201);

      // 2. Altered Payload with same Idempotency Key
      const alteredPayload = {
        ...initialPayload,
        title: "Different altered title trying to reuse previous key",
      };

      const req2 = new NextRequest("http://localhost/api/v1/complaints", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-actor-id": FIXTURES.studentA,
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify(alteredPayload),
      });

      const res2 = await submitComplaintHandler(req2);
      expect(res2.status).toBe(409);
      const json2 = await res2.json();
      expect(json2.success).toBe(false);
      expect(json2.error.code).toBe("CONFLICT");
    });
  });
});
