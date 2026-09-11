import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

export interface DatabaseQueryInterface {
  query<T = unknown>(sql: string, params?: unknown[]): Promise<{ rows: T[] }>;
  exec?(sql: string): Promise<unknown>;
}

export interface MigrationFile {
  version: string;
  name: string;
  filename: string;
  fullPath: string;
  sql: string;
  checksum: string;
}

export class DatabaseMigrator {
  private migrationsDir: string;
  private db: DatabaseQueryInterface;

  constructor(db: DatabaseQueryInterface, migrationsDir?: string) {
    this.db = db;
    this.migrationsDir =
      migrationsDir || path.resolve(process.cwd(), "migrations");
  }

  public loadMigrationFiles(): MigrationFile[] {
    if (!fs.existsSync(this.migrationsDir)) {
      throw new Error(`Migrations directory '${this.migrationsDir}' does not exist.`);
    }

    const files = fs
      .readdirSync(this.migrationsDir)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    return files.map((filename) => {
      const fullPath = path.join(this.migrationsDir, filename);
      const sql = fs.readFileSync(fullPath, "utf-8");
      const checksum = crypto.createHash("sha256").update(sql, "utf-8").digest("hex");
      const parts = filename.split("_");
      const version = parts[0] || filename;
      const name = filename.replace(/\.sql$/, "");

      return {
        version,
        name,
        filename,
        fullPath,
        sql,
        checksum,
      };
    });
  }

  public async initLedger(): Promise<void> {
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS _schema_migrations (
          version VARCHAR(255) PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          checksum VARCHAR(64) NOT NULL,
          applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  public async getAppliedMigrations(): Promise<Map<string, { name: string; checksum: string }>> {
    await this.initLedger();
    const res = await this.db.query<{ version: string; name: string; checksum: string }>(
      "SELECT version, name, checksum FROM _schema_migrations ORDER BY version ASC;"
    );
    const map = new Map<string, { name: string; checksum: string }>();
    for (const row of res.rows) {
      map.set(row.version, { name: row.name, checksum: row.checksum });
    }
    return map;
  }

  public async migrate(): Promise<{ applied: string[]; verified: string[] }> {
    const files = this.loadMigrationFiles();
    const appliedMap = await this.getAppliedMigrations();

    const applied: string[] = [];
    const verified: string[] = [];

    for (const file of files) {
      if (appliedMap.has(file.version)) {
        const existing = appliedMap.get(file.version)!;
        if (existing.checksum !== file.checksum) {
          throw new Error(
            `SCHEMA DRIFT DETECTED: Migration '${file.filename}' checksum mismatch. ` +
            `Expected ${existing.checksum}, calculated ${file.checksum}. ` +
            `Migrations must be immutable.`
          );
        }
        verified.push(file.filename);
      } else {
        // Execute new migration in transaction
        await this.db.query("BEGIN;");
        try {
          if (typeof this.db.exec === "function") {
            await this.db.exec(file.sql);
          } else {
            await this.db.query(file.sql);
          }
          await this.db.query(
            "INSERT INTO _schema_migrations (version, name, checksum) VALUES ($1, $2, $3);",
            [file.version, file.name, file.checksum]
          );
          await this.db.query("COMMIT;");
          applied.push(file.filename);
        } catch (err) {
          await this.db.query("ROLLBACK;");
          throw new Error(`Migration '${file.filename}' failed: ${err instanceof Error ? err.message : String(err)}`);
        }
      }
    }

    return { applied, verified };
  }

  public async applySeed(seedPath: string): Promise<void> {
    if (!fs.existsSync(seedPath)) {
      throw new Error(`Seed file '${seedPath}' does not exist.`);
    }
    const sql = fs.readFileSync(seedPath, "utf-8");
    if (typeof this.db.exec === "function") {
      await this.db.exec(sql);
    } else {
      await this.db.query(sql);
    }
  }
}
