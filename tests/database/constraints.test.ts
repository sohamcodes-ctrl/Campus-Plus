import { describe, it, expect, beforeAll } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { DatabaseMigrator } from "@/infrastructure/database/migrator";
import path from "node:path";

describe("Database Constraints & Invariants Suite", () => {
  let db: PGlite;

  beforeAll(async () => {
    db = new PGlite();
    const migrator = new DatabaseMigrator(db);
    await migrator.migrate();
    await migrator.applySeed(path.resolve(process.cwd(), "seeds", "001_reference_seed.sql"));
    await migrator.applySeed(path.resolve(process.cwd(), "seeds", "002_synthetic_dev_seed.sql"));
  });

  it("should reject a complaint with title length less than 10 characters", async () => {
    await expect(
      db.query(`
        INSERT INTO complaints (
          ref_id, title, description, complainant_id, department_id, category_id, location_details
        ) VALUES (
          'CP-2026-99991', 'Short', 'This is a sufficiently long description explaining the grievance.',
          '00000000-0000-0000-0000-000000001001', '00000000-0000-0000-0000-000000000010',
          '00000000-0000-0000-0000-000000000101', 'Room 101'
        );
      `)
    ).rejects.toThrow(/chk_complaint_title_len/);
  });

  it("should reject a complaint with description length less than 30 characters", async () => {
    await expect(
      db.query(`
        INSERT INTO complaints (
          ref_id, title, description, complainant_id, department_id, category_id, location_details
        ) VALUES (
          'CP-2026-99992', 'Valid Title Here', 'Too short desc',
          '00000000-0000-0000-0000-000000001001', '00000000-0000-0000-0000-000000000010',
          '00000000-0000-0000-0000-000000000101', 'Room 101'
        );
      `)
    ).rejects.toThrow(/chk_complaint_desc_len/);
  });

  it("should reject a duplicate public tracking reference number", async () => {
    await expect(
      db.query(`
        INSERT INTO complaints (
          ref_id, title, description, complainant_id, department_id, category_id, location_details
        ) VALUES (
          'CP-2026-00001', 'Duplicate Reference Test', 'This is a sufficiently long description explaining the duplicate.',
          '00000000-0000-0000-0000-000000001001', '00000000-0000-0000-0000-000000000010',
          '00000000-0000-0000-0000-000000000101', 'Room 101'
        );
      `)
    ).rejects.toThrow();
  });

  it("should reject an attachment exceeding 5 MB (5,242,880 bytes)", async () => {
    await expect(
      db.query(`
        INSERT INTO attachments (
          complaint_id, storage_key, original_filename, mime_type, file_size_bytes, uploaded_by_id
        ) VALUES (
          '00000000-0000-0000-0000-000000002001', 'complaints/001/giant.pdf', 'giant.pdf',
          'application/pdf', 6000000, '00000000-0000-0000-0000-000000001001'
        );
      `)
    ).rejects.toThrow(/chk_attachment_size_limit/);
  });

  it("should reject an attachment with non-whitelisted MIME type", async () => {
    await expect(
      db.query(`
        INSERT INTO attachments (
          complaint_id, storage_key, original_filename, mime_type, file_size_bytes, uploaded_by_id
        ) VALUES (
          '00000000-0000-0000-0000-000000002001', 'complaints/001/malicious.exe', 'malicious.exe',
          'application/x-msdownload', 1024, '00000000-0000-0000-0000-000000001001'
        );
      `)
    ).rejects.toThrow(/chk_attachment_mime_whitelist/);
  });

  it("should reject a forwarding transfer to the same department", async () => {
    await expect(
      db.query(`
        INSERT INTO complaint_forwards (
          complaint_id, from_department_id, to_department_id, forwarded_by_id, rationale
        ) VALUES (
          '00000000-0000-0000-0000-000000002001',
          '00000000-0000-0000-0000-000000000010',
          '00000000-0000-0000-0000-000000000010',
          '00000000-0000-0000-0000-000000001005',
          'Transferring within the same department is invalid.'
        );
      `)
    ).rejects.toThrow(/chk_forward_diff_dept/);
  });
});
