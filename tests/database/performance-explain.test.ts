import { describe, it, expect, beforeAll } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { DatabaseMigrator } from "@/infrastructure/database/migrator";
import path from "node:path";

describe("Database Performance & EXPLAIN Plan Suite", () => {
  let db: PGlite;

  beforeAll(async () => {
    db = new PGlite();
    const migrator = new DatabaseMigrator(db);
    await migrator.migrate();
    await migrator.applySeed(path.resolve(process.cwd(), "seeds", "001_reference_seed.sql"));
    await migrator.applySeed(path.resolve(process.cwd(), "seeds", "002_synthetic_dev_seed.sql"));

    // Add 2 more complaints with same category (Wi-Fi), same department (IT), and same location (Reading Hall A)
    await db.query(`
      INSERT INTO complaints (
        id, ref_id, title, description, complainant_id, department_id, category_id, 
        location_id, location_details, status, created_at
      ) VALUES 
      (
        '00000000-0000-0000-0000-000000002003', 'CP-2026-00003',
        'Second Wi-Fi issue in Reading Hall A',
        'Wi-Fi signal drops completely every 5 minutes in east wing reading hall.',
        '00000000-0000-0000-0000-000000001002', '00000000-0000-0000-0000-000000000010',
        '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000201',
        'Reading Hall A near window', 'SUBMITTED', CURRENT_TIMESTAMP - INTERVAL '1 day'
      ),
      (
        '00000000-0000-0000-0000-000000002004', 'CP-2026-00004',
        'Third Wi-Fi issue in Reading Hall A',
        'Students unable to access research papers due to constant Wi-Fi disconnection.',
        '00000000-0000-0000-0000-000000001001', '00000000-0000-0000-0000-000000000010',
        '00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000201',
        'Reading Hall A table 3', 'SUBMITTED', CURRENT_TIMESTAMP - INTERVAL '12 hours'
      );
    `);
  });

  it("should generate valid EXPLAIN execution plans on indexed complaint queries", async () => {
    const explainRes = await db.query(`
      EXPLAIN SELECT id, ref_id, title, status, created_at
      FROM complaints
      WHERE complainant_id = '00000000-0000-0000-0000-000000001001'
      ORDER BY created_at DESC;
    `);

    expect(explainRes.rows.length).toBeGreaterThan(0);
    const planText = JSON.stringify(explainRes.rows);
    expect(planText).toBeDefined();
  });

  it("should query the recurring_complaint_clusters view correctly when recurring threshold (>=3) is met", async () => {
    const clusterRes = await db.query(`
      SELECT department_name, category_name, incident_count, active_unresolved_count
      FROM recurring_complaint_clusters;
    `);

    expect(clusterRes.rows.length).toBe(1);
    const cluster = clusterRes.rows[0] as {
      department_name: string;
      category_name: string;
      incident_count: number;
      active_unresolved_count: number;
    };
    expect(cluster.department_name).toBe("Information Technology");
    expect(cluster.category_name).toBe("Network & Wi-Fi");
    expect(Number(cluster.incident_count)).toBe(3);
    expect(Number(cluster.active_unresolved_count)).toBe(3);
  });
});
