import type { PGlite as PGliteClient } from "@electric-sql/pglite";
import { Pool as PgPool, PoolClient } from "pg";
import type { PoolConfig } from "pg";
import { DatabaseMigrator, DatabaseQueryInterface } from "./migrator";
import path from "node:path";

let globalDb: PGliteClient | null = null;
let liveDbPool: PgPool | null = null;
let initialized = false;
let initPromise: Promise<DatabaseQueryInterface> | null = null;

class PostgresLiveQueryAdapter implements DatabaseQueryInterface {
  constructor(private readonly pool: PgPool) {}

  async query<T = unknown>(sql: string, params?: unknown[]): Promise<{ rows: T[] }> {
    const res = await this.pool.query(sql, params);
    return { rows: res.rows as T[] };
  }

  async exec(sql: string): Promise<unknown> {
    return await this.pool.query(sql);
  }
}

class PostgresClientQueryAdapter implements DatabaseQueryInterface {
  constructor(private readonly client: PoolClient) {}

  async query<T = unknown>(sql: string, params?: unknown[]): Promise<{ rows: T[] }> {
    const res = await this.client.query(sql, params);
    return { rows: res.rows as T[] };
  }

  async exec(sql: string): Promise<unknown> {
    return await this.client.query(sql);
  }
}

export function buildPostgresPoolConfig(connectionString: string): PoolConfig {
  const connectionUrl = new URL(connectionString);
  const configuredHost = connectionUrl.searchParams.getAll("host").at(-1);
  const hosts = (configuredHost || connectionUrl.hostname)
    .split(",")
    .map((host) => host.replace(/^\[|\]$/g, "").trim().toLowerCase());
  const isLocalhost =
    hosts.length > 0 && hosts.every((host) => host.startsWith("/") || ["localhost", "127.0.0.1", "::1"].includes(host));

  const requestedSslModes = [
    connectionUrl.searchParams.getAll("ssl").at(-1),
    connectionUrl.searchParams.getAll("sslmode").at(-1),
  ].map((value) => value?.toLowerCase());
  const usesLibpqCompatibility = connectionUrl.searchParams.getAll("uselibpqcompat").at(-1) === "true";
  const requestedSslMode = connectionUrl.searchParams.getAll("sslmode").at(-1)?.toLowerCase();
  const explicitlyDisablesVerifiedTls = requestedSslModes.some(
    (mode) => mode === "disable" || mode === "no-verify" || mode === "false" || mode === "0"
  );
  const compatibilityModeDisablesVerification =
    usesLibpqCompatibility && ["prefer", "require", "verify-ca"].includes(requestedSslMode ?? "");
  if (!isLocalhost && (explicitlyDisablesVerifiedTls || compatibilityModeDisablesVerification)) {
    throw new Error("Remote PostgreSQL connections must use TLS with certificate verification enabled.");
  }

  return {
    connectionString,
    ssl: isLocalhost ? false : { rejectUnauthorized: true },
    connectionTimeoutMillis: 2000,
  };
}

/**
 * Initializes and provides the database connection.
 * If DATABASE_URL is configured, connects directly to live PostgreSQL (Supabase).
 * If DATABASE_URL is not set, falls back to embedded PGlite for local/testing.
 * 
 * STRICT ARCHITECTURAL INVARIANTS:
 * 1. NO SILENT FALLBACK: If DATABASE_URL is set and fails, throws an explicit error.
 * 2. NO RUNTIME DDL: ordinary runtime startup never issues CREATE TABLE/SEQUENCE/INDEX.
 */
export async function getDatabaseClient(): Promise<DatabaseQueryInterface> {
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl && process.env.NODE_ENV === "production") {
    throw new Error("CRITICAL INFRASTRUCTURE FAILURE: DATABASE_URL is required in production.");
  }

  // 1. Live PostgreSQL Mode (Supabase / Production / Staging)
  if (dbUrl) {
    if (liveDbPool && initialized) {
      return new PostgresLiveQueryAdapter(liveDbPool);
    }

    if (initPromise) {
      return initPromise;
    }

    initPromise = (async () => {
      try {
        liveDbPool = new PgPool(buildPostgresPoolConfig(dbUrl));

        // Test connection with a harmless query (Section 12 verification)
        const testRes = await liveDbPool.query("SELECT 1 as connected;");
        if (!testRes || testRes.rows.length === 0) {
          throw new Error("Connection health probe returned empty result.");
        }

        initialized = true;
        return new PostgresLiveQueryAdapter(liveDbPool);
      } catch (error) {
        liveDbPool = null;
        initialized = false;
        initPromise = null;
        // SECTION 51: NO SILENT FALLBACK
        throw new Error(
          `CRITICAL INFRASTRUCTURE FAILURE: Failed to connect to live PostgreSQL at DATABASE_URL: ${
            error instanceof Error ? error.message : String(error)
          }. Silent fallback to local PGlite is strictly forbidden.`
        );
      }
    })();

    return initPromise;
  }

  // 2. Embedded PGlite Mode (Local Dev & Unit/Offline Testing)
  if (globalDb && initialized) {
    return globalDb;
  }

  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    if (!globalDb) {
      const { PGlite } = await import("@electric-sql/pglite");
      globalDb = new PGlite();
    }

    const migrator = new DatabaseMigrator(globalDb);
    const applied = await migrator.getAppliedMigrations();

    // If migrations have not been applied yet in this PGlite instance, run them
    if (applied.size === 0) {
      await migrator.migrate();

      // Apply master seeds in dev/test
      const refSeed = path.resolve(process.cwd(), "seeds", "001_reference_seed.sql");
      const devSeed = path.resolve(process.cwd(), "seeds", "002_synthetic_dev_seed.sql");
      await migrator.applySeed(refSeed);
      await migrator.applySeed(devSeed);
    }

    // Synchronize sequence with existing complaints so new complaints do not collide with seeds
    // Sequence itself is created by migration 00010_tracking_code_sequence.sql (NO RUNTIME DDL)
    const maxRes = await globalDb.query<{ max_seq: number }>(`
      SELECT COALESCE(MAX(CAST(SUBSTRING(ref_id FROM 9) AS INTEGER)), 0) as max_seq FROM complaints;
    `);
    const maxSeq = Number(maxRes.rows[0]?.max_seq ?? 0);
    if (maxSeq > 0) {
      await globalDb.query(`SELECT setval('tracking_code_seq', $1, true);`, [maxSeq]);
    } else {
      await globalDb.query(`SELECT setval('tracking_code_seq', 1, false);`);
    }

    initialized = true;
    return globalDb;
  })();

  return initPromise;
}

/**
 * Helper to execute a callback within an ACID transactional context.
 * In live PostgreSQL, checks out a dedicated client from pool with BEGIN/COMMIT/ROLLBACK.
 * In PGlite, uses transaction or BEGIN/COMMIT/ROLLBACK.
 */
export async function executeTransaction<T>(
  callback: (tx: DatabaseQueryInterface) => Promise<T>
): Promise<T> {
  const dbUrl = process.env.DATABASE_URL;

  // Live PostgreSQL transaction execution
  if (dbUrl && liveDbPool) {
    const client = await liveDbPool.connect();
    try {
      await client.query("BEGIN;");
      const txAdapter = new PostgresClientQueryAdapter(client);
      const result = await callback(txAdapter);
      await client.query("COMMIT;");
      return result;
    } catch (error) {
      await client.query("ROLLBACK;");
      throw error;
    } finally {
      client.release();
    }
  }

  // PGlite transaction execution
  const db = (await getDatabaseClient()) as PGliteClient;

  if (typeof db.transaction === "function") {
    return (await db.transaction(async (tx) => {
      return await callback(tx as DatabaseQueryInterface);
    })) as T;
  }

  await db.query("BEGIN;");
  try {
    const result = await callback(db);
    await db.query("COMMIT;");
    return result;
  } catch (error) {
    await db.query("ROLLBACK;");
    throw error;
  }
}

/**
 * Resets the database state (Used exclusively in automated tests).
 */
export async function resetTestDatabase(): Promise<DatabaseQueryInterface> {
  if (liveDbPool) {
    await liveDbPool.end();
    liveDbPool = null;
  }
  const { PGlite } = await import("@electric-sql/pglite");
  globalDb = new PGlite();
  initialized = false;
  initPromise = null;
  return await getDatabaseClient();
}
