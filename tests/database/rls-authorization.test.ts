import { describe, it, expect, beforeAll } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { DatabaseMigrator } from "@/infrastructure/database/migrator";
import path from "node:path";

describe("Database Row-Level Security (RLS) & Authorization Suite", () => {
  let db: PGlite;

  beforeAll(async () => {
    db = new PGlite();
    const migrator = new DatabaseMigrator(db);
    await migrator.migrate();
    await migrator.applySeed(path.resolve(process.cwd(), "seeds", "001_reference_seed.sql"));
    await migrator.applySeed(path.resolve(process.cwd(), "seeds", "002_synthetic_dev_seed.sql"));

    // Add Complaint 00002 owned by Student B
    await db.query(`
      INSERT INTO complaints (
        id, ref_id, title, description, complainant_id, department_id, category_id, location_details
      ) VALUES (
        '00000000-0000-0000-0000-000000002002',
        'CP-2026-00002',
        'Water leakage in Hostel Block 4 Room 312',
        'Pipe leaking heavily under the bathroom sink since morning, causing water accumulation.',
        '00000000-0000-0000-0000-000000001002', -- Student B
        '00000000-0000-0000-0000-000000000020', -- Hostel Dept
        '00000000-0000-0000-0000-000000000102',
        'Hostel Block 4 Room 312'
      );
    `);

    // Add an internal note to Complaint 00001
    await db.query(`
      INSERT INTO internal_notes (
        complaint_id, author_id, author_role, note
      ) VALUES (
        '00000000-0000-0000-0000-000000002001',
        '00000000-0000-0000-0000-000000001005',
        'ROLE_DEPT_HEAD',
        'Private note: Handler should check switch port 12 on distribution rack.'
      );
    `);

    // Configure standard unprivileged application role to test non-superuser RLS
    await db.exec(`
      CREATE ROLE app_user;
      GRANT USAGE ON SCHEMA public TO app_user;
      GRANT ALL ON ALL TABLES IN SCHEMA public TO app_user;
      GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO app_user;
      GRANT ALL ON SCHEMA auth TO app_user;
      GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO app_user;
      GRANT ALL ON ALL FUNCTIONS IN SCHEMA auth TO app_user;
    `);

    // Switch to unprivileged role subject to RLS
    await db.exec("SET ROLE app_user;");
  });

  it("should isolate complaints so Student A cannot view Student B complaints under RLS", async () => {
    await db.exec("SET app.current_user_id = '00000000-0000-0000-0000-000000001001';");

    const res = await db.query("SELECT id, ref_id FROM complaints;");
    // Student A must only see their own complaint (Complaint 00001)
    expect(res.rows.length).toBe(1);
    expect((res.rows[0] as { ref_id: string }).ref_id).toBe("CP-2026-00001");
  });

  it("should isolate complaints so Student B cannot view Student A complaints under RLS", async () => {
    await db.exec("SET app.current_user_id = '00000000-0000-0000-0000-000000001002';");

    const res = await db.query("SELECT id, ref_id FROM complaints;");
    // Student B must only see Complaint 00002
    expect(res.rows.length).toBe(1);
    expect((res.rows[0] as { ref_id: string }).ref_id).toBe("CP-2026-00002");
  });

  it("should prevent Student A from reading internal staff notes (Zero Leakage)", async () => {
    await db.exec("SET app.current_user_id = '00000000-0000-0000-0000-000000001001';");

    const res = await db.query("SELECT * FROM internal_notes;");
    // Must return zero rows for students
    expect(res.rows.length).toBe(0);
  });

  it("should allow IT staff to read internal notes for IT department complaints", async () => {
    await db.exec("SET app.current_user_id = '00000000-0000-0000-0000-000000001005';");

    const res = await db.query("SELECT * FROM internal_notes;");
    expect(res.rows.length).toBe(1);
    expect((res.rows[0] as { note: string }).note).toContain("Private note: Handler should check switch port 12");
  });

  it("should return zero complaints for unauthenticated / anonymous users", async () => {
    await db.exec("SET app.current_user_id = '';");

    const res = await db.query("SELECT * FROM complaints;");
    expect(res.rows.length).toBe(0);
  });
});
