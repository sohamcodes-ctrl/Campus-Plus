import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { getDatabaseClient, resetTestDatabase } from "@/infrastructure/database/pool";
import { getContainer, resetContainer } from "@/infrastructure/container";
import { POST as submitComplaintHandler } from "@/app/api/v1/complaints/route";
import { GET as getComplaintHandler } from "@/app/api/v1/complaints/[id]/route";
import { GET as getTimelineHandler } from "@/app/api/v1/complaints/[id]/timeline/route";
import { POST as reviewHandler } from "@/app/api/v1/complaints/[id]/review/route";
import { POST as assignHandler } from "@/app/api/v1/complaints/[id]/assign/route";
import { POST as resolveHandler } from "@/app/api/v1/complaints/[id]/resolve/route";
import { POST as escalateHandler } from "@/app/api/v1/complaints/[id]/escalate/route";
import { POST as cancelHandler } from "@/app/api/v1/complaints/[id]/cancel/route";
import { GET as getAttachmentHandler } from "@/app/api/v1/complaints/[id]/attachments/[attachmentId]/route";
import { POST as approveRegistrationHandler } from "@/app/api/v1/admin/registration-requests/[id]/approve/route";

const FIXTURES = {
  studentA: "00000000-0000-0000-0000-000000001001",
  studentB: "00000000-0000-0000-0000-000000001002",
  itHandler: "00000000-0000-0000-0000-000000001003",
  hostelHandler: "00000000-0000-0000-0000-000000001004",
  admin: "00000000-0000-0000-0000-000000001007",
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

  it("does not grant same-department faculty access to another user's attachment", async () => {
    const db = await getDatabaseClient();
    const container = await getContainer();
    await db.query(
      "INSERT INTO roles (id, description) VALUES ('ROLE_FACULTY', 'Faculty complainant role') ON CONFLICT (id) DO NOTHING;"
    );
    await db.query("DELETE FROM user_roles WHERE user_id = $1;", [FIXTURES.studentB]);
    await db.query("INSERT INTO user_roles (user_id, role_id) VALUES ($1, 'ROLE_FACULTY');", [FIXTURES.studentB]);
    await db.query("DELETE FROM department_memberships WHERE user_id = $1;", [FIXTURES.studentB]);
    await db.query(
      "INSERT INTO department_memberships (user_id, department_id) VALUES ($1, $2);",
      [FIXTURES.studentB, FIXTURES.deptIt]
    );

    const upload = await container.storageAdapter.generateUploadUrl({
      filename: "private-evidence.pdf",
      contentType: "application/pdf",
      sizeBytes: 1024,
    });
    const attachment = await db.query<{ id: string }>(
      `INSERT INTO attachments
        (complaint_id, storage_key, original_filename, mime_type, file_size_bytes, attachment_type, uploaded_by_id)
       VALUES ($1, $2, 'private-evidence.pdf', 'application/pdf', 1024, 'INITIAL_EVIDENCE', $3)
       RETURNING id;`,
      [FIXTURES.existingComplaintId, upload.fileKey, FIXTURES.studentA]
    );

    const req = new NextRequest(
      `http://localhost/api/v1/complaints/${FIXTURES.existingComplaintId}/attachments/${attachment.rows[0].id}`,
      { method: "GET", headers: { "x-actor-id": FIXTURES.studentB } }
    );
    const res = await getAttachmentHandler(req, {
      params: Promise.resolve({ id: FIXTURES.existingComplaintId, attachmentId: attachment.rows[0].id }),
    });

    expect(res.status).toBe(403);
    expect((await res.json()).error.code).toBe("FORBIDDEN");
  });

  it("rejects a complaint submission that claims another user's temporary upload", async () => {
    const db = await getDatabaseClient();
    const storageKey = "complaints/temp/student-b-evidence.pdf";
    await db.query(
      `INSERT INTO temporary_attachment_uploads
        (storage_key, uploaded_by_id, original_filename, mime_type, file_size_bytes, expires_at)
       VALUES ($1, $2, 'evidence.pdf', 'application/pdf', 1024, CURRENT_TIMESTAMP + INTERVAL '1 hour');`,
      [storageKey, FIXTURES.studentB]
    );
    const req = new NextRequest("http://localhost/api/v1/complaints", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-actor-id": FIXTURES.studentA,
      },
      body: JSON.stringify({
        title: "Complaint with forged attachment ownership",
        description: "The submitting student must not be able to attach a file uploaded by another account.",
        departmentId: FIXTURES.deptIt,
        categoryId: FIXTURES.categoryWifi,
        locationDetails: "Computer Lab 3",
        attachments: [{
          storageKey,
          originalFilename: "evidence.pdf",
          mimeType: "application/pdf",
          fileSizeBytes: 1024,
        }],
      }),
    });

    const res = await submitComplaintHandler(req);
    expect(res.status).toBe(403);
    expect((await res.json()).error.code).toBe("FORBIDDEN");
    const complaints = await db.query<{ count: string }>(
      "SELECT count(*) AS count FROM complaints WHERE title = $1;",
      ["Complaint with forged attachment ownership"]
    );
    expect(Number(complaints.rows[0].count)).toBe(0);
  });

  it("grants the role explicitly approved by an admin instead of the applicant's requested role", async () => {
    const db = await getDatabaseClient();
    const requestId = "00000000-0000-0000-0000-000000008001";
    const authUserId = "00000000-0000-0000-0000-000000008002";
    await db.query(
      `INSERT INTO registration_requests
        (id, email, full_name, requested_role, auth_user_id, status)
       VALUES ($1, 'pending.admin@campus.example', 'Pending Applicant', 'ROLE_ADMIN', $2, 'PENDING_VERIFICATION');`,
      [requestId, authUserId]
    );

    const req = new NextRequest(
      `http://localhost/api/v1/admin/registration-requests/${requestId}/approve`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-actor-id": FIXTURES.admin,
        },
        body: JSON.stringify({ approvedRole: "ROLE_STUDENT" }),
      }
    );
    const res = await approveRegistrationHandler(req, { params: Promise.resolve({ id: requestId }) });
    expect(res.status).toBe(200);

    const roles = await db.query<{ role_id: string }>(
      "SELECT role_id FROM user_roles WHERE user_id = $1;",
      [authUserId]
    );
    expect(roles.rows).toEqual([{ role_id: "ROLE_STUDENT" }]);
  });

  it("requires an approved department before granting a department staff role", async () => {
    const req = new NextRequest(
      "http://localhost/api/v1/admin/registration-requests/00000000-0000-0000-0000-000000008003/approve",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-actor-id": FIXTURES.admin,
        },
        body: JSON.stringify({ approvedRole: "ROLE_HANDLER" }),
      }
    );
    const res = await approveRegistrationHandler(req, {
      params: Promise.resolve({ id: "00000000-0000-0000-0000-000000008003" }),
    });

    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe("VALIDATION_FAILED");
  });

  it("rejects a non-admin attempting to approve a privileged registration role", async () => {
    const requestId = "00000000-0000-0000-0000-000000008004";
    const req = new NextRequest(
      `http://localhost/api/v1/admin/registration-requests/${requestId}/approve`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-actor-id": FIXTURES.studentA,
        },
        body: JSON.stringify({ approvedRole: "ROLE_ADMIN" }),
      }
    );

    const res = await approveRegistrationHandler(req, { params: Promise.resolve({ id: requestId }) });
    expect(res.status).toBe(403);
    expect((await res.json()).error.code).toBe("FORBIDDEN");
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
