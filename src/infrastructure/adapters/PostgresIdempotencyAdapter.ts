import { IIdempotencyPort } from "@/application/ports/IIdempotencyPort";
import { IdempotencyConflictError } from "@/domain/complaint/DomainErrors";
import { DatabaseQueryInterface } from "../database/migrator";

interface IdempotencyRow {
  key: string;
  request_hash: string;
  response_code: number | null;
  response_body: unknown;
  expires_at: string;
}

/**
 * PostgreSQL Persistent Idempotency Adapter.
 * Backed by 'idempotency_keys' table to safely prevent duplicated executions,
 * concurrent execution races, and payload-tampered replay attacks.
 */
export class PostgresIdempotencyAdapter implements IIdempotencyPort {
  constructor(private readonly db: DatabaseQueryInterface) {}

  public async acquireKey(key: string, requestHash: string): Promise<boolean> {
    // 1. Check if key already exists
    const existing = await this.db.query<IdempotencyRow>(
      "SELECT key, request_hash, response_code, response_body, expires_at FROM idempotency_keys WHERE key = $1;",
      [key]
    );

    if (existing.rows.length > 0) {
      const row = existing.rows[0];

      // If payload hashes do not match, reject as conflict
      if (row.request_hash !== requestHash) {
        throw new IdempotencyConflictError(key);
      }

      // If response is still null, another request with same key is currently processing
      if (row.response_code === null) {
        throw new IdempotencyConflictError(key);
      }

      // Already completed with identical hash -> returns false to trigger replay of cached response
      return false;
    }

    // 2. Attempt atomic insertion with default 24h expiration
    const insertRes = await this.db.query<IdempotencyRow>(
      `INSERT INTO idempotency_keys (key, request_hash, expires_at)
       VALUES ($1, $2, CURRENT_TIMESTAMP + INTERVAL '24 hours')
       ON CONFLICT (key) DO NOTHING
       RETURNING key;`,
      [key, requestHash]
    );

    if (insertRes.rows.length > 0) {
      return true; // Successfully acquired
    }

    // Concurrent race caught by ON CONFLICT
    throw new IdempotencyConflictError(key);
  }

  public async completeKey(
    key: string,
    responseCode: number,
    responseBody: unknown
  ): Promise<void> {
    const serializedBody = JSON.stringify(responseBody);
    await this.db.query(
      `UPDATE idempotency_keys 
       SET response_code = $2, response_body = $3::jsonb 
       WHERE key = $1;`,
      [key, responseCode, serializedBody]
    );
  }

  public async getExistingResponse(
    key: string
  ): Promise<{ responseCode: number; responseBody: unknown } | null> {
    const res = await this.db.query<IdempotencyRow>(
      "SELECT response_code, response_body FROM idempotency_keys WHERE key = $1 AND response_code IS NOT NULL;",
      [key]
    );

    if (res.rows.length === 0 || res.rows[0].response_code === null) {
      return null;
    }

    return {
      responseCode: res.rows[0].response_code,
      responseBody: res.rows[0].response_body,
    };
  }
}
