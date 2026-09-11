import { describe, it, expect, beforeAll } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { DatabaseMigrator } from "@/infrastructure/database/migrator";
import path from "node:path";

describe("Database FSM Transitions & Concurrency Suite", () => {
  let db: PGlite;

  beforeAll(async () => {
    db = new PGlite();
    const migrator = new DatabaseMigrator(db);
    await migrator.migrate();
    await migrator.applySeed(path.resolve(process.cwd(), "seeds", "001_reference_seed.sql"));
    await migrator.applySeed(path.resolve(process.cwd(), "seeds", "002_synthetic_dev_seed.sql"));
  });

  it("should permit valid lifecycle state progression and update timestamps", async () => {
    // Current status in seed is IN_PROGRESS, version is 2
    const updateRes = await db.query(`
      UPDATE complaints
      SET status = 'RESOLVED',
          resolved_at = CURRENT_TIMESTAMP,
          version = version + 1
      WHERE id = '00000000-0000-0000-0000-000000002001' AND version = 2
      RETURNING status, version, resolved_at;
    `);

    expect(updateRes.rows.length).toBe(1);
    const updated = updateRes.rows[0] as { status: string; version: number; resolved_at: string };
    expect(updated.status).toBe("RESOLVED");
    expect(updated.version).toBe(3);
    expect(updated.resolved_at).toBeDefined();
  });

  it("should enforce optimistic concurrency control when version is stale", async () => {
    // Concurrent update simulation: query specifies version 1, but row version is now 3
    const res = await db.query(`
      UPDATE complaints
      SET status = 'RESOLVED',
          version = version + 1
      WHERE id = '00000000-0000-0000-0000-000000002001' AND version = 1;
    `);

    // Affected rows must be 0
    expect(res.rows.length).toBe(0);

    // Verify row was NOT updated
    const check = await db.query(`
      SELECT status, version FROM complaints WHERE id = '00000000-0000-0000-0000-000000002001';
    `);
    expect((check.rows[0] as { status: string; version: number }).status).toBe("RESOLVED");
    expect((check.rows[0] as { status: string; version: number }).version).toBe(3);
  });

  it("should reject invalid status string outside the PostgreSQL enum", async () => {
    await expect(
      db.query(`
        UPDATE complaints
        SET status = 'SUPER_RESOLVED'
        WHERE id = '00000000-0000-0000-0000-000000002001';
      `)
    ).rejects.toThrow();
  });

  it("should record formal resolution details with summary length check", async () => {
    const res = await db.query(`
      INSERT INTO resolutions (
        complaint_id, resolved_by_id, resolution_summary
      ) VALUES (
        '00000000-0000-0000-0000-000000002001',
        '00000000-0000-0000-0000-000000001003',
        'Replaced faulty Cisco AP transceiver on 2nd floor East Wing. Network latency restored to <5ms.'
      ) RETURNING id, resolved_at;
    `);

    expect(res.rows.length).toBe(1);
    expect((res.rows[0] as { id: string }).id).toBeDefined();

    // Rejecting resolution with summary < 20 chars
    await expect(
      db.query(`
        INSERT INTO resolutions (
          complaint_id, resolved_by_id, resolution_summary
        ) VALUES (
          '00000000-0000-0000-0000-000000002001',
          '00000000-0000-0000-0000-000000001003',
          'Fixed it'
        );
      `)
    ).rejects.toThrow();
  });
});
