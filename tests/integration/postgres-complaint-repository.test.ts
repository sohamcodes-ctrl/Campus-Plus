import { describe, it, expect, beforeEach } from "vitest";
import { resetTestDatabase, getDatabaseClient, executeTransaction } from "@/infrastructure/database/pool";
import { PostgresComplaintRepository } from "@/infrastructure/database/PostgresComplaintRepository";
import {
  Complaint,
  UserId,
  ActorContext,
  UserRole,
  ResolutionSummary,
  StaleVersionConflictError,
} from "@/domain/complaint";
import { AuthorizationError } from "@/shared/errors/AppError";

const FIXTURES = {
  studentA: "00000000-0000-0000-0000-000000001001",
  studentB: "00000000-0000-0000-0000-000000001002",
  itHandler: "00000000-0000-0000-0000-000000001003",
  hodIt: "00000000-0000-0000-0000-000000001005",
  deptIt: "00000000-0000-0000-0000-000000000010",
  categoryWifi: "00000000-0000-0000-0000-000000000101",
};

describe("Phase 06 PostgresComplaintRepository Transactional Persistence Suite", () => {
  beforeEach(async () => {
    await resetTestDatabase();
  });

  it("persists aggregate, child entities, audit logs, and outbox events atomically", async () => {
    const db = await getDatabaseClient();
    const repo = new PostgresComplaintRepository(db);

    const complaintResult = Complaint.create({
      refId: "CP-2026-09999",
      title: "Core Aggregation Switch Link Down in Rack 4",
      description: "Fiber patch connection severed during cabling maintenance operations.",
      complainantId: FIXTURES.studentA,
      departmentId: FIXTURES.deptIt,
      categoryId: FIXTURES.categoryWifi,
      locationDetails: "Data Center Room 1",
    });

    expect(complaintResult.isSuccess).toBe(true);
    if (complaintResult.isFailure) throw new Error("Creation failed");
    const complaint = complaintResult.value;

    // 1. Initial Save
    await repo.save(complaint);

    // Verify aggregate row exists
    const dbComplaint = await repo.findById(complaint.id);
    expect(dbComplaint).not.toBeNull();
    expect(dbComplaint?.title.toString()).toBe("Core Aggregation Switch Link Down in Rack 4");
    expect(dbComplaint?.status).toBe("SUBMITTED");

    // Verify transactional audit log in action_history
    const auditRes = await db.query<{ action_type: string }>(
      "SELECT action_type FROM action_history WHERE complaint_id = $1;",
      [complaint.id.toString()]
    );
    expect(auditRes.rows.length).toBeGreaterThan(0);
    expect(auditRes.rows[0].action_type).toBe("COMPLAINT_SUBMITTED");

    // Verify transactional outbox event in outbox_events
    const outboxRes = await db.query<{ event_type: string; status: string }>(
      "SELECT event_type, status FROM outbox_events WHERE aggregate_id = $1;",
      [complaint.id.toString()]
    );
    expect(outboxRes.rows.length).toBeGreaterThan(0);
    expect(outboxRes.rows[0].event_type).toBe("COMPLAINT_SUBMITTED");
    expect(outboxRes.rows[0].status).toBe("PENDING");

    // 2. Perform state transition: Review -> Assign -> Resolve
    const hodActor: ActorContext = {
      userId: FIXTURES.hodIt,
      role: UserRole.ROLE_DEPT_HEAD,
      departmentId: FIXTURES.deptIt,
    };
    complaint.review(hodActor);

    const assignRes = complaint.assignHandler(new UserId(FIXTURES.itHandler), hodActor, "Immediate network repair");
    expect(assignRes.isSuccess).toBe(true);

    const handlerActor: ActorContext = {
      userId: FIXTURES.itHandler,
      role: UserRole.ROLE_HANDLER,
      departmentId: FIXTURES.deptIt,
    };
    complaint.startProgress(handlerActor);

    const resolveRes = complaint.resolve(
      handlerActor,
      new ResolutionSummary("Replaced optical LC-LC jumper cable and verified link light operational.")
    );
    expect(resolveRes.isSuccess).toBe(true);

    // Save updated aggregate
    await repo.save(complaint, 1);

    // Rehydrate and verify all child entities
    const rehydrated = await repo.findById(complaint.id);
    expect(rehydrated).not.toBeNull();
    expect(rehydrated?.status).toBe("RESOLVED");
    expect(rehydrated?.version.toNumber()).toBe(5);
    expect(rehydrated?.assignments.length).toBe(1);
    expect(rehydrated?.assignments[0].handlerId).toBe(FIXTURES.itHandler);
    expect(rehydrated?.resolution).toBeDefined();
    expect(rehydrated?.resolution?.resolvedById).toBe(FIXTURES.itHandler);

    // Verify audit logs accumulated
    const finalAuditRes = await db.query<{ count: string }>(
      "SELECT count(*) as count FROM action_history WHERE complaint_id = $1;",
      [complaint.id.toString()]
    );
    expect(parseInt(finalAuditRes.rows[0].count, 10)).toBe(5); // SUBMIT, REVIEW, ASSIGN, START_PROGRESS, RESOLVE
  });

  it("rejects a stale aggregate update even when the caller omits expectedVersion", async () => {
    const db = await getDatabaseClient();
    const repo = new PostgresComplaintRepository(db);
    const created = Complaint.create({
      refId: "CP-2026-07991",
      title: "Concurrent department review update",
      description: "Two reviewers load the same complaint and attempt the same transition concurrently.",
      complainantId: FIXTURES.studentA,
      departmentId: FIXTURES.deptIt,
      categoryId: FIXTURES.categoryWifi,
      locationDetails: "Computer Lab 3",
    });
    if (created.isFailure) throw new Error("Creation failed");
    await repo.save(created.value);

    const first = await repo.findById(created.value.id);
    const stale = await repo.findById(created.value.id);
    if (!first || !stale) throw new Error("Complaint was not persisted");
    const reviewer: ActorContext = {
      userId: FIXTURES.hodIt,
      role: UserRole.ROLE_DEPT_HEAD,
      departmentId: FIXTURES.deptIt,
    };
    expect(first.review(reviewer).isSuccess).toBe(true);
    expect(stale.review(reviewer).isSuccess).toBe(true);

    await repo.save(first);
    await expect(repo.save(stale)).rejects.toBeInstanceOf(StaleVersionConflictError);

    const stored = await repo.findById(created.value.id);
    expect(stored?.status).toBe("REVIEWED");
    expect(stored?.version.toNumber()).toBe(2);
  });

  it("rolls back aggregate, audit, and outbox writes when a related insert fails", async () => {
    const db = await getDatabaseClient();
    const repo = new PostgresComplaintRepository(db);
    const created = Complaint.create({
      refId: "CP-2026-07992",
      title: "Failed handler assignment remains uncommitted",
      description: "An invalid handler foreign key must not leave a partial complaint or journal entry.",
      complainantId: FIXTURES.studentA,
      departmentId: FIXTURES.deptIt,
      categoryId: FIXTURES.categoryWifi,
      locationDetails: "Computer Lab 3",
    });
    if (created.isFailure) throw new Error("Creation failed");
    const complaint = created.value;
    const reviewer: ActorContext = {
      userId: FIXTURES.hodIt,
      role: UserRole.ROLE_DEPT_HEAD,
      departmentId: FIXTURES.deptIt,
    };
    expect(complaint.review(reviewer).isSuccess).toBe(true);
    expect(
      complaint.assignHandler(new UserId("00000000-0000-0000-0000-000000009999"), reviewer, "Invalid handler")
        .isSuccess
    ).toBe(true);

    await expect(repo.save(complaint)).rejects.toThrow();
    const complaintCount = await db.query<{ count: string }>(
      "SELECT count(*) AS count FROM complaints WHERE id = $1;",
      [complaint.id.toString()]
    );
    const auditCount = await db.query<{ count: string }>(
      "SELECT count(*) AS count FROM action_history WHERE complaint_id = $1;",
      [complaint.id.toString()]
    );
    const outboxCount = await db.query<{ count: string }>(
      "SELECT count(*) AS count FROM outbox_events WHERE aggregate_id = $1;",
      [complaint.id.toString()]
    );
    expect(Number(complaintCount.rows[0].count)).toBe(0);
    expect(Number(auditCount.rows[0].count)).toBe(0);
    expect(Number(outboxCount.rows[0].count)).toBe(0);
  });

  it("accepts only the owner's matching unexpired temporary uploads and consumes them atomically", async () => {
    const db = await getDatabaseClient();
    const repo = new PostgresComplaintRepository(db);
    const storageKey = "complaints/temp/owned-evidence.pdf";
    const attachment = {
      storageKey,
      originalFilename: "evidence.pdf",
      mimeType: "application/pdf",
      fileSizeBytes: 2048,
      attachmentType: "INITIAL_EVIDENCE" as const,
    };
    const created = Complaint.create({
      refId: "CP-2026-07993",
      title: "Complaint with verified evidence upload",
      description: "The temporary upload must match the submitting account and stored file metadata.",
      complainantId: FIXTURES.studentA,
      departmentId: FIXTURES.deptIt,
      categoryId: FIXTURES.categoryWifi,
      locationDetails: "Computer Lab 3",
    });
    if (created.isFailure) throw new Error("Creation failed");

    await db.query(
      `INSERT INTO temporary_attachment_uploads
        (storage_key, uploaded_by_id, original_filename, mime_type, file_size_bytes, expires_at)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP + INTERVAL '1 hour');`,
      [storageKey, FIXTURES.studentA, attachment.originalFilename, attachment.mimeType, attachment.fileSizeBytes]
    );

    await repo.saveWithAttachments(created.value, [attachment]);

    const storedAttachment = await db.query<{ storage_key: string }>(
      "SELECT storage_key FROM attachments WHERE complaint_id = $1;",
      [created.value.id.toString()]
    );
    const remainingUpload = await db.query<{ storage_key: string }>(
      "SELECT storage_key FROM temporary_attachment_uploads WHERE storage_key = $1;",
      [storageKey]
    );
    expect(storedAttachment.rows).toEqual([{ storage_key: storageKey }]);
    expect(remainingUpload.rows).toHaveLength(0);
  });

  it("rejects an attachment owned by another user without persisting the complaint", async () => {
    const db = await getDatabaseClient();
    const repo = new PostgresComplaintRepository(db);
    const storageKey = "complaints/temp/other-users-evidence.pdf";
    const created = Complaint.create({
      refId: "CP-2026-07994",
      title: "Complaint with another user's evidence",
      description: "A temporary upload created by another account cannot be attached to this complaint.",
      complainantId: FIXTURES.studentA,
      departmentId: FIXTURES.deptIt,
      categoryId: FIXTURES.categoryWifi,
      locationDetails: "Computer Lab 3",
    });
    if (created.isFailure) throw new Error("Creation failed");
    await db.query(
      `INSERT INTO temporary_attachment_uploads
        (storage_key, uploaded_by_id, original_filename, mime_type, file_size_bytes, expires_at)
       VALUES ($1, $2, 'evidence.pdf', 'application/pdf', 2048, CURRENT_TIMESTAMP + INTERVAL '1 hour');`,
      [storageKey, FIXTURES.studentB]
    );

    await expect(
      repo.saveWithAttachments(created.value, [{
        storageKey,
        originalFilename: "evidence.pdf",
        mimeType: "application/pdf",
        fileSizeBytes: 2048,
      }])
    ).rejects.toBeInstanceOf(AuthorizationError);

    const complaintCount = await db.query<{ count: string }>(
      "SELECT count(*) AS count FROM complaints WHERE id = $1;",
      [created.value.id.toString()]
    );
    expect(Number(complaintCount.rows[0].count)).toBe(0);
  });

  it("rejects expired uploads and uploads whose submitted metadata was altered", async () => {
    const db = await getDatabaseClient();
    const repo = new PostgresComplaintRepository(db);
    const scenarios = [
      {
        refId: "CP-2026-07995",
        storageKey: "complaints/temp/expired-evidence.pdf",
        expires: "CURRENT_TIMESTAMP - INTERVAL '1 minute'",
        filename: "evidence.pdf",
      },
      {
        refId: "CP-2026-07996",
        storageKey: "complaints/temp/altered-metadata.pdf",
        expires: "CURRENT_TIMESTAMP + INTERVAL '1 hour'",
        filename: "evidence.pdf",
      },
    ];

    for (const [index, scenario] of scenarios.entries()) {
      const created = Complaint.create({
        refId: scenario.refId,
        title: `Complaint attachment validation case ${index + 1}`,
        description: "Temporary evidence must be current and match the server-recorded upload metadata.",
        complainantId: FIXTURES.studentA,
        departmentId: FIXTURES.deptIt,
        categoryId: FIXTURES.categoryWifi,
        locationDetails: "Computer Lab 3",
      });
      if (created.isFailure) throw new Error("Creation failed");
      await db.query(
        `INSERT INTO temporary_attachment_uploads
          (storage_key, uploaded_by_id, original_filename, mime_type, file_size_bytes, expires_at)
         VALUES ($1, $2, 'evidence.pdf', 'application/pdf', 2048, ${scenario.expires});`,
        [scenario.storageKey, FIXTURES.studentA]
      );

      await expect(
        repo.saveWithAttachments(created.value, [{
          storageKey: scenario.storageKey,
          originalFilename: index === 0 ? scenario.filename : "client-renamed.pdf",
          mimeType: "application/pdf",
          fileSizeBytes: 2048,
        }])
      ).rejects.toBeInstanceOf(AuthorizationError);
    }
  });

  it("rolls back all changes when transaction aborts, preventing partial or orphan writes", async () => {
    const db = await getDatabaseClient();

    // Attempt transactional insertion that throws an error mid-transaction
    await expect(
      executeTransaction(async (tx) => {
        const repo = new PostgresComplaintRepository(tx, true);
        const complaintResult = Complaint.create({
          refId: "CP-2026-08888",
          title: "Temporary Aborted Ticket For Rollback Verification",
          description: "This ticket must never be committed to permanent storage.",
          complainantId: FIXTURES.studentA,
          departmentId: FIXTURES.deptIt,
          categoryId: FIXTURES.categoryWifi,
          locationDetails: "Test Area",
        });

        if (complaintResult.isFailure) throw new Error("Creation failed");
        const complaint = complaintResult.value;
        await repo.save(complaint);

        // Force intentional transaction abortion
        throw new Error("Intentional transaction failure for rollback verification");
      })
    ).rejects.toThrow("Intentional transaction failure for rollback verification");

    // Verify complaint record was rolled back
    const checkRes = await db.query<{ count: string }>(
      "SELECT count(*) as count FROM complaints WHERE ref_id = 'CP-2026-08888';"
    );
    expect(parseInt(checkRes.rows[0].count, 10)).toBe(0);

    // Verify no orphan audit records
    const auditRes = await db.query<{ count: string }>(
      "SELECT count(*) as count FROM action_history WHERE remarks LIKE '%Temporary Aborted%';"
    );
    expect(parseInt(auditRes.rows[0].count, 10)).toBe(0);
  });
});
