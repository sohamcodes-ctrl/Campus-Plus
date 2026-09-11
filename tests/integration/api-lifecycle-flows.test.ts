import { describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { resetTestDatabase } from "@/infrastructure/database/pool";
import { resetContainer } from "@/infrastructure/container";
import { POST as submitHandler } from "@/app/api/v1/complaints/route";
import { GET as getComplaintHandler } from "@/app/api/v1/complaints/[id]/route";
import { GET as getTimelineHandler } from "@/app/api/v1/complaints/[id]/timeline/route";
import { POST as reviewHandler } from "@/app/api/v1/complaints/[id]/review/route";
import { POST as assignHandler } from "@/app/api/v1/complaints/[id]/assign/route";
import { POST as progressHandler } from "@/app/api/v1/complaints/[id]/progress/route";
import { POST as forwardHandler } from "@/app/api/v1/complaints/[id]/forward/route";
import { POST as resolveHandler } from "@/app/api/v1/complaints/[id]/resolve/route";
import { POST as verifyHandler } from "@/app/api/v1/complaints/[id]/verify/route";
import { POST as disputeHandler } from "@/app/api/v1/complaints/[id]/dispute/route";
import { POST as closeHandler } from "@/app/api/v1/complaints/[id]/close/route";

const FIXTURES = {
  studentA: "00000000-0000-0000-0000-000000001001",
  itHandler: "00000000-0000-0000-0000-000000001003",
  hodIt: "00000000-0000-0000-0000-000000001005",
  admin: "00000000-0000-0000-0000-000000001007",
  deptIt: "00000000-0000-0000-0000-000000000010",
  deptHostel: "00000000-0000-0000-0000-000000000020",
  deptMaint: "00000000-0000-0000-0000-000000000030",
  categoryWifi: "00000000-0000-0000-0000-000000000101",
};

describe("Phase 06 Full Lifecycle Workflows & FSM Transitions", () => {
  beforeEach(async () => {
    resetContainer();
    await resetTestDatabase();
  });

  it("Flow 1: Standard Resolution Flow with Student Verification (SUBMIT -> REVIEW -> ASSIGN -> PROGRESS -> RESOLVE -> VERIFY -> CLOSED)", async () => {
    // 1. Submit Complaint (Student A)
    const submitReq = new NextRequest("http://localhost/api/v1/complaints", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-actor-id": FIXTURES.studentA },
      body: JSON.stringify({
        title: "DNS resolution failure in CS Lab",
        description: "Domain names fail to resolve on student desktop workstations.",
        departmentId: FIXTURES.deptIt,
        categoryId: FIXTURES.categoryWifi,
        locationDetails: "CS Lab 102",
      }),
    });
    const submitRes = await submitHandler(submitReq);
    expect(submitRes.status).toBe(201);
    const { complaintId } = (await submitRes.json()).data;

    // 2. Review Complaint (HOD IT)
    const reviewReq = new NextRequest(`http://localhost/api/v1/complaints/${complaintId}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-actor-id": FIXTURES.hodIt },
      body: JSON.stringify({ expectedVersion: 1 }),
    });
    const reviewRes = await reviewHandler(reviewReq, { params: Promise.resolve({ id: complaintId }) });
    expect(reviewRes.status).toBe(200);

    // 3. Assign Handler (HOD IT)
    const assignReq = new NextRequest(`http://localhost/api/v1/complaints/${complaintId}/assign`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-actor-id": FIXTURES.hodIt },
      body: JSON.stringify({ handlerId: FIXTURES.itHandler, reason: "Assigned to network engineer", expectedVersion: 2 }),
    });
    const assignRes = await assignHandler(assignReq, { params: Promise.resolve({ id: complaintId }) });
    expect(assignRes.status).toBe(200);

    // 4. Start Progress (Handler IT)
    const progressReq = new NextRequest(`http://localhost/api/v1/complaints/${complaintId}/progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-actor-id": FIXTURES.itHandler },
      body: JSON.stringify({ expectedVersion: 3 }),
    });
    const progressRes = await progressHandler(progressReq, { params: Promise.resolve({ id: complaintId }) });
    expect(progressRes.status).toBe(200);

    // 5. Resolve Complaint (Handler IT)
    const resolveReq = new NextRequest(`http://localhost/api/v1/complaints/${complaintId}/resolve`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-actor-id": FIXTURES.itHandler },
      body: JSON.stringify({
        resolutionSummary: "Flushed local bind DNS cache and configured secondary forwarder upstream.",
        expectedVersion: 4,
      }),
    });
    const resolveRes = await resolveHandler(resolveReq, { params: Promise.resolve({ id: complaintId }) });
    expect(resolveRes.status).toBe(200);

    // 6. Verify and Close (Student A)
    const verifyReq = new NextRequest(`http://localhost/api/v1/complaints/${complaintId}/verify`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-actor-id": FIXTURES.studentA },
      body: JSON.stringify({ expectedVersion: 5 }),
    });
    const verifyRes = await verifyHandler(verifyReq, { params: Promise.resolve({ id: complaintId }) });
    expect(verifyRes.status).toBe(200);

    // 7. Verify Final Aggregate State
    const getReq = new NextRequest(`http://localhost/api/v1/complaints/${complaintId}`, {
      method: "GET",
      headers: { "x-actor-id": FIXTURES.studentA },
    });
    const getRes = await getComplaintHandler(getReq, { params: Promise.resolve({ id: complaintId }) });
    expect(getRes.status).toBe(200);
    const complaintData = (await getRes.json()).data;
    expect(complaintData.status).toBe("CLOSED");
    expect(complaintData.version).toBe(6);
    expect(complaintData.resolution.studentVerified).toBe(true);

    // 8. Verify Complete Audit History
    const timeReq = new NextRequest(`http://localhost/api/v1/complaints/${complaintId}/timeline`, {
      method: "GET",
      headers: { "x-actor-id": FIXTURES.studentA },
    });
    const timeRes = await getTimelineHandler(timeReq, { params: Promise.resolve({ id: complaintId }) });
    expect(timeRes.status).toBe(200);
    const events = (await timeRes.json()).data;
    expect(events.length).toBe(6); // SUBMIT, REVIEW, ASSIGN, START_PROGRESS, RESOLVE, CLOSE_VERIFIED
  });

  it("Flow 2: Dispute and Reopen Lifecycle (RESOLVE -> DISPUTE -> UNDER_REVIEW -> RESOLVE -> ADMIN CLOSE)", async () => {
    // 1. Submit
    const submitReq = new NextRequest("http://localhost/api/v1/complaints", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-actor-id": FIXTURES.studentA },
      body: JSON.stringify({
        title: "Campus portal login times out repeatedly",
        description: "Student dashboard portal times out when fetching examination timetables.",
        departmentId: FIXTURES.deptIt,
        categoryId: FIXTURES.categoryWifi,
        locationDetails: "Campus Wide",
      }),
    });
    const submitRes = await submitHandler(submitReq);
    const { complaintId } = (await submitRes.json()).data;

    // Fast-track progression to RESOLVED via Admin
    await reviewHandler(
      new NextRequest(`http://localhost/api/v1/complaints/${complaintId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-actor-id": FIXTURES.admin },
        body: JSON.stringify({ expectedVersion: 1 }),
      }),
      { params: Promise.resolve({ id: complaintId }) }
    );

    await assignHandler(
      new NextRequest(`http://localhost/api/v1/complaints/${complaintId}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-actor-id": FIXTURES.admin },
        body: JSON.stringify({ handlerId: FIXTURES.itHandler, expectedVersion: 2 }),
      }),
      { params: Promise.resolve({ id: complaintId }) }
    );

    await progressHandler(
      new NextRequest(`http://localhost/api/v1/complaints/${complaintId}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-actor-id": FIXTURES.itHandler },
        body: JSON.stringify({ expectedVersion: 3 }),
      }),
      { params: Promise.resolve({ id: complaintId }) }
    );

    await resolveHandler(
      new NextRequest(`http://localhost/api/v1/complaints/${complaintId}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-actor-id": FIXTURES.itHandler },
        body: JSON.stringify({
          resolutionSummary: "Adjusted gateway timeout parameter to 60 seconds.",
          expectedVersion: 4,
        }),
      }),
      { params: Promise.resolve({ id: complaintId }) }
    );

    // 2. Student Disputes Resolution
    const disputeReq = new NextRequest(`http://localhost/api/v1/complaints/${complaintId}/dispute`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-actor-id": FIXTURES.studentA },
      body: JSON.stringify({
        disputeReason: "Gateway timeout still occurs when accessing timetables on mobile network.",
        expectedVersion: 5,
      }),
    });
    const disputeRes = await disputeHandler(disputeReq, { params: Promise.resolve({ id: complaintId }) });
    expect(disputeRes.status).toBe(200);

    // Verify complaint transitioned back to UNDER_REVIEW
    const getReq = new NextRequest(`http://localhost/api/v1/complaints/${complaintId}`, {
      method: "GET",
      headers: { "x-actor-id": FIXTURES.studentA },
    });
    const getRes = await getComplaintHandler(getReq, { params: Promise.resolve({ id: complaintId }) });
    const complaintData = (await getRes.json()).data;
    expect(complaintData.status).toBe("REOPENED");
    expect(complaintData.version).toBe(6);

    // 3. Handler re-works the complaint (IN_PROGRESS)
    const prog2Res = await progressHandler(
      new NextRequest(`http://localhost/api/v1/complaints/${complaintId}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-actor-id": FIXTURES.itHandler },
        body: JSON.stringify({ expectedVersion: 6 }),
      }),
      { params: Promise.resolve({ id: complaintId }) }
    );
    expect(prog2Res.status).toBe(200);

    // 4. Handler re-resolves the complaint
    const res2Res = await resolveHandler(
      new NextRequest(`http://localhost/api/v1/complaints/${complaintId}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-actor-id": FIXTURES.itHandler },
        body: JSON.stringify({
          resolutionSummary: "Updated DNS and cellular routing policies on external campus firewall.",
          expectedVersion: 7,
        }),
      }),
      { params: Promise.resolve({ id: complaintId }) }
    );
    expect(res2Res.status).toBe(200);

    // 5. Administrative closure after resolution
    const closeReq = new NextRequest(`http://localhost/api/v1/complaints/${complaintId}/close`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-actor-id": FIXTURES.admin },
      body: JSON.stringify({
        reason: "Administrative intervention: mobile network configuration ratified institution-wide.",
        expectedVersion: 8,
      }),
    });
    const closeRes = await closeHandler(closeReq, { params: Promise.resolve({ id: complaintId }) });
    expect(closeRes.status).toBe(200);
  });

  it("Flow 3: Anti-Deadlock Forwarding Trigger (3 transfers -> auto-escalates to TIER_3_MANAGEMENT)", async () => {
    // 1. Submit
    const submitReq = new NextRequest("http://localhost/api/v1/complaints", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-actor-id": FIXTURES.studentA },
      body: JSON.stringify({
        title: "Inter-department jurisdictional boundary dispute ticket",
        description: "Apparatus failure spans across IT and Hostel infrastructure boundaries.",
        departmentId: FIXTURES.deptIt,
        categoryId: FIXTURES.categoryWifi,
        locationDetails: "Hostel Block 4",
      }),
    });
    const submitRes = await submitHandler(submitReq);
    const { complaintId } = (await submitRes.json()).data;

    // Review to UNDER_REVIEW
    await reviewHandler(
      new NextRequest(`http://localhost/api/v1/complaints/${complaintId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-actor-id": FIXTURES.admin },
        body: JSON.stringify({ expectedVersion: 1 }),
      }),
      { params: Promise.resolve({ id: complaintId }) }
    );

    // Forward 1: IT -> Hostel
    const fwd1Req = new NextRequest(`http://localhost/api/v1/complaints/${complaintId}/forward`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-actor-id": FIXTURES.admin },
      body: JSON.stringify({
        targetDepartmentId: FIXTURES.deptHostel,
        rationale: "Physical router is mounted inside hostel warden private enclosure.",
        expectedVersion: 2,
      }),
    });
    const fwd1Res = await forwardHandler(fwd1Req, { params: Promise.resolve({ id: complaintId }) });
    expect(fwd1Res.status).toBe(200);

    // Receiving Department (Hostel) Reviews Complaint
    const rev2Res = await reviewHandler(
      new NextRequest(`http://localhost/api/v1/complaints/${complaintId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-actor-id": FIXTURES.admin },
        body: JSON.stringify({ expectedVersion: 3 }),
      }),
      { params: Promise.resolve({ id: complaintId }) }
    );
    expect(rev2Res.status).toBe(200);

    // Forward 2: Hostel -> Maintenance
    const fwd2Req = new NextRequest(`http://localhost/api/v1/complaints/${complaintId}/forward`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-actor-id": FIXTURES.admin },
      body: JSON.stringify({
        targetDepartmentId: FIXTURES.deptMaint,
        rationale: "Wiring ducting is damaged inside civil wall conduit structure.",
        expectedVersion: 4,
      }),
    });
    const fwd2Res = await forwardHandler(fwd2Req, { params: Promise.resolve({ id: complaintId }) });
    expect(fwd2Res.status).toBe(200);

    // Receiving Department (Maintenance) Reviews Complaint
    const rev3Res = await reviewHandler(
      new NextRequest(`http://localhost/api/v1/complaints/${complaintId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-actor-id": FIXTURES.admin },
        body: JSON.stringify({ expectedVersion: 5 }),
      }),
      { params: Promise.resolve({ id: complaintId }) }
    );
    expect(rev3Res.status).toBe(200);

    // Forward 3: Maintenance -> IT (Triggers anti-deadlock!)
    const fwd3Req = new NextRequest(`http://localhost/api/v1/complaints/${complaintId}/forward`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-actor-id": FIXTURES.admin },
      body: JSON.stringify({
        targetDepartmentId: FIXTURES.deptIt,
        rationale: "Civil conduit intact; problem traced to optical network termination unit.",
        expectedVersion: 6,
      }),
    });
    const fwd3Res = await forwardHandler(fwd3Req, { params: Promise.resolve({ id: complaintId }) });
    expect(fwd3Res.status).toBe(200);

    // Verify complaint auto-escalated to TIER_3_MANAGEMENT
    const getReq = new NextRequest(`http://localhost/api/v1/complaints/${complaintId}`, {
      method: "GET",
      headers: { "x-actor-id": FIXTURES.admin },
    });
    const getRes = await getComplaintHandler(getReq, { params: Promise.resolve({ id: complaintId }) });
    expect(getRes.status).toBe(200);
    const complaintData = (await getRes.json()).data;
    expect(complaintData.status).toBe("ESCALATED");
    expect(complaintData.escalationTier).toBe("TIER_3_MANAGEMENT");
    expect(complaintData.isEscalated).toBe(true);
    expect(complaintData.forwards.length).toBe(3);
    expect(complaintData.escalations.length).toBe(1);
    expect(complaintData.escalations[0].isAutomated).toBe(true);
  });
});
